<?php
declare(strict_types=1);

// MySQL integration and concurrent quota test; synthetic data only.
// Requires a disposable MySQL schema, cURL, and four PHP CLI server workers.
$root = dirname(__DIR__);
$base = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'sm-h03-mysql-' . bin2hex(random_bytes(8));
$configPath = $base . '.php';
$logPath = $base . '.log';
$server = null;
$checks = 0;

function h03_check(bool $condition, string $label): void
{
    global $checks;
    if (!$condition) {
        throw new RuntimeException('FAIL: ' . $label);
    }
    $checks++;
    echo 'PASS: ' . $label . PHP_EOL;
}

function h03_http_burst(string $url, string $origin, int $size): array
{
    $multi = curl_multi_init();
    $handles = [];
    for ($i = 0; $i < $size; $i++) {
        $payload = [
            'nombre' => 'Persona Sintetica',
            'email' => sprintf('h03-mysql-%d@example.invalid', $i),
            'telefono' => '',
            'ciudad' => '',
            'servicio' => 'citas',
            'descripcion' => 'Texto sintético de prueba sin datos clínicos personales.',
            'consentimiento' => true,
            'privacy_version' => 'h03-mysql-ci-only',
        ];
        $h = curl_init($url);
        if ($h === false) {
            throw new RuntimeException('Could not initialize cURL.');
        }
        curl_setopt_array($h, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($payload, JSON_THROW_ON_ERROR),
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Origin: ' . $origin,
                'Sec-Fetch-Site: same-origin',
                // Untrusted client-supplied header must not change REMOTE_ADDR.
                'X-Forwarded-For: 203.0.113.' . ($i + 1),
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_CONNECTTIMEOUT => 3,
        ]);
        curl_multi_add_handle($multi, $h);
        $handles[] = $h;
    }

    try {
        do {
            $code = curl_multi_exec($multi, $running);
            if ($code !== CURLM_OK) {
                throw new RuntimeException('cURL multi execution failed.');
            }
            if ($running > 0 && curl_multi_select($multi, 1.0) === -1) {
                usleep(10_000);
            }
        } while ($running > 0);

        $statuses = [];
        foreach ($handles as $h) {
            if (curl_errno($h) !== 0) {
                throw new RuntimeException('HTTP client error: ' . curl_error($h));
            }
            $status = (int) curl_getinfo($h, CURLINFO_HTTP_CODE);
            if (!in_array($status, [201, 429], true)) {
                throw new RuntimeException('Unexpected HTTP ' . $status . ': ' . curl_multi_getcontent($h));
            }
            $statuses[] = $status;
        }
        return $statuses;
    } finally {
        foreach ($handles as $h) {
            curl_multi_remove_handle($multi, $h);
            curl_close($h);
        }
        curl_multi_close($multi);
    }
}

try {
    foreach (['pdo_mysql', 'mbstring', 'curl'] as $module) {
        if (!extension_loaded($module)) {
            throw new RuntimeException('Missing PHP extension: ' . $module);
        }
    }

    $dsn = getenv('H03_TEST_MYSQL_DSN');
    $user = getenv('H03_TEST_MYSQL_USER');
    $password = getenv('H03_TEST_MYSQL_PASSWORD');
    if (!$dsn || !$user || $password === false || !str_starts_with($dsn, 'mysql:')) {
        throw new RuntimeException('Disposable test MySQL settings are required.');
    }

    $socket = stream_socket_server('tcp://127.0.0.1:0', $errno, $error);
    if ($socket === false) {
        throw new RuntimeException('Could not reserve a local port.');
    }
    $address = stream_socket_get_name($socket, false);
    fclose($socket);
    $port = (int) substr((string) $address, strrpos((string) $address, ':') + 1);
    $origin = 'http://127.0.0.1:' . $port;

    $config = [
        'dsn' => $dsn,
        'db_user' => $user,
        'db_password' => $password,
        'email_hash_key' => bin2hex(random_bytes(32)),
        'privacy_notice_version' => 'h03-mysql-ci-only',
        'allowed_origins' => [$origin],
        'rate_limit_per_hour' => 10,
        'network_rate_limit_per_hour' => 4,
    ];
    file_put_contents($configPath, '<?php return ' . var_export($config, true) . ';');
    @chmod($configPath, 0600);
    putenv('SALVACION_CONFIG=' . $configPath);

    $pdo = new PDO($dsn, $user, $password, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    // Never target a production database. The workflow creates a dedicated disposable schema.
    foreach (['requests', 'request_rate_limits', 'request_network_rate_limits'] as $table) {
        $pdo->exec('DROP TABLE IF EXISTS ' . $table);
    }

    $migration = escapeshellarg(PHP_BINARY) . ' '
        . escapeshellarg($root . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . 'migrate.php');
    exec($migration . ' 2>&1', $output, $exitCode);
    h03_check($exitCode === 0, 'MySQL migration completed');

    $env = getenv();
    $env['SALVACION_CONFIG'] = $configPath;
    $env['PHP_CLI_SERVER_WORKERS'] = '4';
    $descriptors = [0 => ['pipe', 'r'], 1 => ['file', $logPath, 'a'], 2 => ['file', $logPath, 'a']];
    $server = proc_open([PHP_BINARY, '-S', '127.0.0.1:' . $port, '-t', $root], $descriptors, $pipes, $root, $env);
    if (!is_resource($server)) {
        throw new RuntimeException('PHP server did not start.');
    }
    fclose($pipes[0]);
    $ready = false;
    for ($attempt = 0; $attempt < 100; $attempt++) {
        $connection = @stream_socket_client('tcp://127.0.0.1:' . $port, $errno, $error, 0.1);
        if ($connection !== false) {
            fclose($connection);
            $ready = true;
            break;
        }
        usleep(100_000);
    }
    h03_check($ready, 'Four-worker PHP server started');
    $statuses = h03_http_burst($origin . '/api/requests.php', $origin, 10);
    sort($statuses);
    $counts = array_count_values($statuses);
    h03_check(($counts[201] ?? 0) === 4 && ($counts[429] ?? 0) === 6, 'Concurrent MySQL quota permits exactly 4 of 10 rotating emails');
    h03_check((int) $pdo->query('SELECT COUNT(*) FROM requests')->fetchColumn() === 4, 'MySQL persisted exactly four accepted requests');
    h03_check((int) $pdo->query('SELECT COUNT(*) FROM request_network_rate_limits')->fetchColumn() === 1, 'Shared REMOTE_ADDR maps all ten requests to one network quota');
    h03_check((int) $pdo->query('SELECT request_count FROM request_network_rate_limits')->fetchColumn() === 10, 'MySQL atomic upsert counted all requests across workers');
    $hash = $pdo->query('SELECT network_hash FROM request_network_rate_limits')->fetchColumn();
    h03_check(is_string($hash) && preg_match('/^[0-9a-f]{64}$/', $hash) === 1, 'Network identifier is stored only as an HMAC');
    echo 'Passed MySQL checks: ' . $checks . PHP_EOL;
} finally {
    if (is_resource($server)) {
        proc_terminate($server);
        proc_close($server);
    }
    putenv('SALVACION_CONFIG');
    @unlink($configPath);
    @unlink($logPath);
}
