<?php
declare(strict_types=1);

$root = dirname(__DIR__);
$temporaryBase = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'salvacion-php-api-' . bin2hex(random_bytes(6));
$configPath = $temporaryBase . '.php';
$databasePath = $temporaryBase . '.sqlite';
$serverLog = $temporaryBase . '.log';
$server = null;
$passed = 0;

function check(bool $condition, string $name): void
{
    global $passed;
    if (!$condition) {
        throw new RuntimeException('FAIL: ' . $name);
    }
    $passed++;
    fwrite(STDOUT, 'PASS: ' . $name . PHP_EOL);
}

function http_request(string $url, string $method = 'GET', ?string $body = null, array $headers = []): array
{
    $requestHeaders = $headers;
    if ($body !== null && !array_filter($requestHeaders, static fn(string $header): bool => stripos($header, 'Content-Type:') === 0)) {
        $requestHeaders[] = 'Content-Type: application/json';
    }
    $context = stream_context_create(['http' => [
        'method' => $method,
        'header' => implode("\r\n", $requestHeaders),
        'content' => $body ?? '',
        'ignore_errors' => true,
        'timeout' => 3,
        'follow_location' => 0,
    ]]);
    $responseBody = file_get_contents($url, false, $context);
    $responseHeaders = $http_response_header ?? [];
    preg_match('/\s(\d{3})\s/', $responseHeaders[0] ?? '', $matches);
    return ['status' => (int) ($matches[1] ?? 0), 'headers' => $responseHeaders, 'body' => $responseBody === false ? '' : $responseBody];
}

function api_headers(string $origin): array
{
    return ['Origin: ' . $origin, 'Sec-Fetch-Site: same-origin'];
}

try {
    $socket = stream_socket_server('tcp://127.0.0.1:0', $errno, $error);
    if ($socket === false) {
        throw new RuntimeException('Could not reserve a local test port.');
    }
    $address = stream_socket_get_name($socket, false);
    fclose($socket);
    $port = (int) substr((string) $address, strrpos((string) $address, ':') + 1);
    $origin = 'http://127.0.0.1:' . $port;

    $config = [
        'dsn' => 'sqlite:' . $databasePath,
        'db_user' => '',
        'db_password' => '',
        'email_hash_key' => bin2hex(random_bytes(32)),
        'privacy_notice_version' => 'smoke-test-only',
        'allowed_origins' => [$origin],
        'rate_limit_per_hour' => 2,
    ];
    file_put_contents($configPath, '<?php return ' . var_export($config, true) . ';');
    @chmod($configPath, 0600);
    putenv('SALVACION_CONFIG=' . $configPath);

    $migrationCommand = escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg($root . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . 'migrate.php');
    exec($migrationCommand . ' 2>&1', $migrationOutput, $migrationExit);
    check($migrationExit === 0, 'SQLite migration creates request tables');

    $descriptors = [0 => ['pipe', 'r'], 1 => ['file', $serverLog, 'a'], 2 => ['file', $serverLog, 'a']];
    $server = proc_open([PHP_BINARY, '-S', '127.0.0.1:' . $port, '-t', $root], $descriptors, $pipes, $root);
    if (!is_resource($server)) {
        throw new RuntimeException('Could not start PHP built-in server.');
    }
    fclose($pipes[0]);

    $url = $origin . '/api/requests.php';
    $ready = false;
    for ($attempt = 0; $attempt < 50; $attempt++) {
        $probe = @stream_socket_client('tcp://127.0.0.1:' . $port, $errno, $error, 0.1);
        if ($probe !== false) {
            fclose($probe);
            $ready = true;
            break;
        }
        usleep(100_000);
    }
    check($ready, 'PHP built-in server starts for local tests');

    check(http_request($url)['status'] === 405, 'GET is rejected');
    check(http_request($url, 'POST', '{}', api_headers('https://attacker.invalid'))['status'] === 403, 'unapproved origin is rejected');
    check(http_request($url, 'POST', '{}', array_merge(api_headers($origin), ['Content-Type: text/plain']))['status'] === 415, 'non-JSON content type is rejected');
    check(http_request($url, 'POST', '{', api_headers($origin))['status'] === 400, 'malformed JSON is rejected');

    $valid = [
        'nombre' => 'Persona Sintetica',
        'email' => 'qa@example.invalid',
        'telefono' => '+57 300 000 0000',
        'ciudad' => 'Municipio Sintetico',
        'servicio' => 'negacion',
        'descripcion' => 'Texto de prueba sin datos personales ni información clínica.',
        'consentimiento' => true,
        'privacy_version' => 'smoke-test-only',
    ];
    $json = static fn(array $payload): string => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);

    $missingConsent = $valid;
    $missingConsent['consentimiento'] = false;
    check(http_request($url, 'POST', $json($missingConsent), api_headers($origin))['status'] === 422, 'consent is mandatory');

    $honeypot = $valid;
    $honeypot['website'] = 'bot-filled';
    check(http_request($url, 'POST', $json($honeypot), api_headers($origin))['status'] === 400, 'honeypot submissions are rejected');

    $first = http_request($url, 'POST', $json($valid), api_headers($origin));
    check($first['status'] === 201, 'valid request is persisted');
    $firstBody = json_decode($first['body'], true, 16, JSON_THROW_ON_ERROR);
    check(($firstBody['ok'] ?? false) === true && preg_match('/^[0-9a-f-]{36}$/', $firstBody['id'] ?? '') === 1, 'success returns a request id only after persistence');
    check(!str_contains($first['body'], $valid['email']) && !str_contains($first['body'], $valid['descripcion']), 'response does not echo personal data');

    $pdo = new PDO($config['dsn'], '', '', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    $saved = $pdo->query('SELECT nombre, email, descripcion FROM requests')->fetch(PDO::FETCH_ASSOC);
    check($saved['email'] === $valid['email'] && $saved['descripcion'] === $valid['descripcion'], 'prepared insert preserves submitted text as data');
    $rateEntry = $pdo->query('SELECT email_hash FROM request_rate_limits')->fetchColumn();
    check(is_string($rateEntry) && strlen($rateEntry) === 64 && $rateEntry !== $valid['email'], 'rate limit stores only a keyed email hash');

    check(http_request($url, 'POST', $json($valid), api_headers($origin))['status'] === 201, 'configured hourly request allowance is honored');
    check(http_request($url, 'POST', $json($valid), api_headers($origin))['status'] === 429, 'requests above the hourly allowance are throttled');
    check((int) $pdo->query('SELECT COUNT(*) FROM requests')->fetchColumn() === 2, 'throttled request is not persisted');
} finally {
    if (is_resource($server)) {
        proc_terminate($server);
        proc_close($server);
    }
    putenv('SALVACION_CONFIG');
    @unlink($configPath);
    @unlink($databasePath);
    @unlink($databasePath . '-journal');
    @unlink($databasePath . '-wal');
    @unlink($databasePath . '-shm');
    @unlink($serverLog);
}

fwrite(STDOUT, 'Passed checks: ' . $passed . PHP_EOL);
