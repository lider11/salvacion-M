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
    $mysqlConfig = getenv('SALVACION_SMOKE_MYSQL_CONFIG');
    if ($mysqlConfig !== false && $mysqlConfig !== '') {
        $external = require $mysqlConfig;
        if (!preg_match('/^mysql:host=127\.0\.0\.1;port=\d+;dbname=sm_test_[a-f0-9]+;charset=utf8mb4$/D', $external['dsn'] ?? '')) {
            throw new RuntimeException('Only isolated loopback sm_test databases are accepted.');
        }
        $config = array_replace($config, $external, ['allowed_origins' => [$origin], 'privacy_notice_version' => 'smoke-test-only', 'rate_limit_per_hour' => 2]);
    }
    file_put_contents($configPath, '<?php return ' . var_export($config, true) . ';');
    @chmod($configPath, 0600);
    putenv('SALVACION_CONFIG=' . $configPath);

    if (!$mysqlConfig) {
        $migrationCommand = escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg($root . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . 'migrate.php');
        exec($migrationCommand . ' 2>&1', $migrationOutput, $migrationExit);
        check($migrationExit === 0, 'SQLite migration creates request tables');
    }
    $pdo = new PDO($config['dsn'], $config['db_user'], $config['db_password'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    check((int) $pdo->query('SELECT COUNT(*) FROM requests')->fetchColumn() === 0, 'isolated test database starts empty');

    $descriptors = [0 => ['pipe', 'r'], 1 => ['file', $serverLog, 'a'], 2 => ['file', $serverLog, 'a']];
    $server = proc_open([PHP_BINARY, '-d', 'display_errors=0', '-d', 'display_startup_errors=0', '-d', 'log_errors=1', '-S', '127.0.0.1:' . $port, '-t', $root], $descriptors, $pipes, $root);
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

    foreach ([
        'nombre' => ['x', str_repeat('a', 101), '<script>alert(1)</script>', ['array']],
        'email' => ['invalid', ['array']],
        'telefono' => ['abc1234567', '123', ['array']],
        'ciudad' => ['x', ['array']],
        'servicio' => ['unknown', ['array']],
        'descripcion' => ['short', str_repeat('x', 1001), "Invalid\x01description text here"],
        'privacy_version' => ['wrong-version', ['array']],
        'consentimiento' => ['true', false],
        'website' => [(object) ['unexpected' => 'object']],
    ] as $field => $values) {
        foreach ($values as $index => $value) {
            $payload = array_replace($valid, [$field => $value]);
            $rejected = http_request($url, 'POST', $json($payload), api_headers($origin));
            $body = json_decode($rejected['body'], true);
            check($rejected['status'] === 422 && ($body['ok'] ?? null) === false, "invalid {$field} case {$index} returns JSON 422");
        }
    }
    check(http_request($url, 'POST', '[]', api_headers($origin))['status'] === 400, 'array root is rejected');
    $oversize = http_request($url, 'POST', str_repeat('x', 16_385), api_headers($origin));
    check($oversize['status'] === 413, 'oversize body is rejected');
    check(http_request($url, 'POST', $json($valid), ['Content-Type: application/json'])['status'] === 403, 'missing origin is rejected');
    check(http_request($url, 'POST', $json($valid), ['Origin: ' . $origin, 'Sec-Fetch-Site: cross-site'])['status'] === 403, 'cross-site request is rejected');
    check((int) $pdo->query('SELECT COUNT(*) FROM requests')->fetchColumn() === 0, 'all rejected payloads leave database empty');

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

    $saved = $pdo->query('SELECT id, nombre, email, descripcion, privacy_version, consented_at FROM requests')->fetch(PDO::FETCH_ASSOC);
    check($saved['email'] === $valid['email'] && $saved['descripcion'] === $valid['descripcion'], 'prepared insert preserves submitted text as data');
    check($saved['id'] === $firstBody['id'] && $saved['privacy_version'] === 'smoke-test-only' && $saved['consented_at'] !== '', 'returned ID and consent evidence match persisted row');
    check(in_array('Cache-Control: no-store, private', $first['headers'], true), 'response prevents caching');
    $rateEntry = $pdo->query('SELECT email_hash FROM request_rate_limits')->fetchColumn();
    check(is_string($rateEntry) && strlen($rateEntry) === 64 && $rateEntry !== $valid['email'], 'rate limit stores only a keyed email hash');

    check(http_request($url, 'POST', $json($valid), api_headers($origin))['status'] === 201, 'configured hourly request allowance is honored');
    check(http_request($url, 'POST', $json($valid), api_headers($origin))['status'] === 429, 'requests above the hourly allowance are throttled');
    check((int) $pdo->query('SELECT COUNT(*) FROM requests')->fetchColumn() === 2, 'throttled request is not persisted');
    $injection = array_replace($valid, ['email' => 'sql@example.invalid', 'descripcion' => "Synthetic <script>alert('x')</script> text '); DROP TABLE requests; --"]);
    check(http_request($url, 'POST', $json($injection), api_headers($origin))['status'] === 201, 'SQL and HTML text remain data');
    check((int) $pdo->query('SELECT COUNT(*) FROM requests')->fetchColumn() === 3, 'prepared statements protect table');
    if (!$mysqlConfig) {
        $pdo->exec("CREATE TRIGGER smoke_fail BEFORE INSERT ON requests BEGIN SELECT RAISE(ABORT, 'synthetic failure'); END");
        $failure = array_replace($valid, ['email' => 'failure@example.invalid']);
        check(http_request($url, 'POST', $json($failure), api_headers($origin))['status'] === 500, 'transaction failure returns error');
        check((int) $pdo->query('SELECT COUNT(*) FROM requests')->fetchColumn() === 3, 'transaction failure leaves no partial request');
        $pdo->exec('DROP TRIGGER smoke_fail');
    } else {
        $failure = array_replace($valid, ['email' => 'failure@example.invalid']);
        check(http_request($url, 'POST', $json($failure), api_headers($origin))['status'] === 500, 'MySQL trigger failure returns HTTP 500');
        check((int) $pdo->query('SELECT COUNT(*) FROM requests')->fetchColumn() === 3, 'MySQL trigger failure leaves no partial request');
        $hash = hash_hmac('sha256', $failure['email'], $config['email_hash_key']);
        $count = $pdo->prepare('SELECT COUNT(*) FROM request_rate_limits WHERE email_hash = ?');
        $count->execute([$hash]);
        check((int) $count->fetchColumn() === 0, 'MySQL rollback also reverts rate counter');
        // Runtime has no DDL: testing the real connection error needs no admin rights.
        $unavailable = $config;
        $unavailable['db_password'] = bin2hex(random_bytes(32));
        file_put_contents($configPath, '<?php return ' . var_export($unavailable, true) . ';');
        check(http_request($url, 'POST', $json(array_replace($valid, ['email' => 'failure@example.invalid'])), api_headers($origin))['status'] === 500, 'invalid MySQL credentials return controlled persistence error');
        check((int) $pdo->query('SELECT COUNT(*) FROM requests')->fetchColumn() === 3, 'failed connection cannot create a request');
        file_put_contents($configPath, '<?php return ' . var_export($config, true) . ';');
        try { $pdo->exec('CREATE TABLE forbidden_ddl (id INT)'); $denied = false; } catch (PDOException) { $denied = true; }
        check($denied, 'runtime user has no CREATE privilege');
    }
    rename($configPath, $configPath . '.hold');
    try {
        $missing = http_request($url, 'POST', $json($valid), api_headers($origin));
        check($missing['status'] === 503 && !str_contains($missing['body'], $configPath), 'missing private configuration returns JSON 503 without paths');
    } finally { rename($configPath . '.hold', $configPath); }
    // Segunda instancia HTTP aislada para probar bootstrap ausente sin tocar fuentes.
    proc_terminate($server);
    proc_close($server);
    $server = null;
    putenv('SALVACION_BACKEND_BOOTSTRAP=' . $temporaryBase . '-missing-bootstrap.php');
    $server = proc_open([PHP_BINARY, '-d', 'display_errors=0', '-d', 'display_startup_errors=0', '-S', '127.0.0.1:' . $port, '-t', $root], $descriptors, $pipes, $root);
    if (!is_resource($server)) { throw new RuntimeException('Could not restart isolated test server'); }
    fclose($pipes[0]);
    usleep(200_000);
    $bootstrapMissing = http_request($url, 'POST', $json($valid), api_headers($origin));
    check($bootstrapMissing['status'] === 503 && (json_decode($bootstrapMissing['body'], true)['error'] ?? '') === 'service_unavailable', 'missing bootstrap returns controlled JSON 503');
    $logs = file_get_contents($serverLog);
    check(!str_contains($logs, $valid['email']) && !str_contains($logs, $valid['descripcion']) && !str_contains($logs, $config['email_hash_key']), 'logs exclude payload and secret key');
    $pdo = null;
} finally {
    if (is_resource($server)) {
        proc_terminate($server);
        proc_close($server);
    }
    putenv('SALVACION_CONFIG');
    putenv('SALVACION_BACKEND_BOOTSTRAP');
    @unlink($configPath);
    @unlink($databasePath);
    @unlink($databasePath . '-journal');
    @unlink($databasePath . '-wal');
    @unlink($databasePath . '-shm');
    @unlink($serverLog);
}

fwrite(STDOUT, 'Passed checks: ' . $passed . PHP_EOL);
