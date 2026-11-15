<?php
declare(strict_types=1);

$root = dirname(__DIR__);
$temporaryBase = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'salvacion-php-api-' . bin2hex(random_bytes(6));
$publicRoot = $temporaryBase . '/public_html';
$configPath = $temporaryBase . '/private/salvacion.php';
$databasePath = $temporaryBase . '/private/test.sqlite';
$serverLog = $temporaryBase . '.log';
$originalConfig = getenv('SALVACION_CONFIG');
$originalBootstrap = getenv('SALVACION_BACKEND_BOOTSTRAP');
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

function save_config(array $config): void
{
    global $configPath;
    file_put_contents($configPath, '<?php return ' . var_export($config, true) . ';');
    chmod($configPath, 0600);
}

try {
    mkdir($publicRoot . '/api', 0700, true);
    mkdir($temporaryBase . '/private', 0700);
    mkdir($temporaryBase . '/backend/migrations', 0700, true);
    foreach (['api/requests.php', 'backend/bootstrap.php', 'backend/migrate.php', 'backend/migrations/sqlite.sql'] as $file) {
        $destination = str_starts_with($file, 'api/') ? $publicRoot : $temporaryBase;
        copy($root . '/' . $file, $destination . '/' . $file);
    }
    // Exercise the default sibling paths, without inheriting a real configuration.
    putenv('SALVACION_CONFIG');
    putenv('SALVACION_BACKEND_BOOTSTRAP');
    $socket = stream_socket_server('tcp://127.0.0.1:0', $errno, $error);
    if ($socket === false) {
        throw new RuntimeException('Could not reserve a local test port.');
    }
    $address = stream_socket_get_name($socket, false);
    fclose($socket);
    $port = (int) substr((string) $address, strrpos((string) $address, ':') + 1);
    $origin = 'http://127.0.0.1:' . $port;

    $config = [
        'accept_requests' => true,
        'dsn' => 'sqlite:' . $databasePath,
        'db_user' => '',
        'db_password' => '',
        'email_hash_key' => bin2hex(random_bytes(32)),
        'privacy_notice_version' => 'smoke-test-only',
        'allowed_origins' => [$origin],
        'rate_limit_per_hour' => 2,
    ];
    save_config($config);

    $migrationCommand = escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg($temporaryBase . '/backend/migrate.php');
    exec($migrationCommand . ' 2>&1', $migrationOutput, $migrationExit);
    check($migrationExit === 0, 'SQLite migration creates request tables');
    exec($migrationCommand . ' 2>&1', $repeatOutput, $repeatExit);
    check($repeatExit === 0, 'SQLite migration can be repeated safely');

    $descriptors = [0 => ['pipe', 'r'], 1 => ['file', $serverLog, 'a'], 2 => ['file', $serverLog, 'a']];
    $server = proc_open([PHP_BINARY, '-S', '127.0.0.1:' . $port, '-t', $publicRoot], $descriptors, $pipes, $temporaryBase);
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
    foreach (['/backend/bootstrap.php', '/backend/migrations/sqlite.sql', '/private/salvacion.php'] as $privateUrl) {
        check(http_request($origin . $privateUrl)['status'] === 404, 'private file is outside webroot: ' . $privateUrl);
    }
    check(http_request($url, 'POST', '{}')['status'] === 403, 'missing origin is rejected');
    check(http_request($url, 'POST', '{}', api_headers('https://attacker.invalid'))['status'] === 403, 'unapproved origin is rejected');
    check(http_request($url, 'POST', '{}', array_merge(api_headers($origin), ['Content-Type: text/plain']))['status'] === 415, 'non-JSON content type is rejected');
    check(http_request($url, 'POST', '{', api_headers($origin))['status'] === 400, 'malformed JSON is rejected');
    check(http_request($url, 'POST', '[]', api_headers($origin))['status'] === 400, 'JSON arrays are rejected');
    check(http_request($url, 'POST', str_repeat(' ', 16385), api_headers($origin))['status'] === 413, 'oversized body is rejected');
    check(http_request($url, 'POST', '{}', ['Origin: ' . $origin, 'Sec-Fetch-Site: cross-site'])['status'] === 403, 'cross-site fetch is rejected');

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

    foreach (['missing', false, 'true'] as $disabledValue) {
        $disabled = $config;
        if ($disabledValue === 'missing') {
            unset($disabled['accept_requests']);
        } else {
            $disabled['accept_requests'] = $disabledValue;
        }
        save_config($disabled);
        $response = http_request($url, 'POST', $json($valid), api_headers($origin));
        check($response['status'] === 503 && json_decode($response['body'], true)['error'] === 'requests_disabled', 'reception requires explicit boolean true: ' . var_export($disabledValue, true));
    }
    $pdo = new PDO($config['dsn'], '', '', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    check((int) $pdo->query('SELECT COUNT(*) FROM requests')->fetchColumn() === 0 && (int) $pdo->query('SELECT COUNT(*) FROM request_rate_limits')->fetchColumn() === 0, 'disabled reception writes no requests or rate limits');

    $example = $config;
    $example['email_hash_key'] = 'CAMBIAR_POR_64_CARACTERES_ALEATORIOS_MINIMO';
    save_config($example);
    check(http_request($url, 'POST', $json($valid), api_headers($origin))['status'] === 503, 'example secrets are rejected');
    save_config($config);

    // Reject even a configuration reached via a symlink if its real path is public.
    rename($configPath, $publicRoot . '/unsafe-config.php');
    symlink($publicRoot . '/unsafe-config.php', $configPath);
    check(http_request($url, 'POST', $json($valid), api_headers($origin))['status'] === 503, 'configuration inside webroot is rejected');
    unlink($configPath);
    rename($publicRoot . '/unsafe-config.php', $configPath);

    $missingConsent = $valid;
    $missingConsent['consentimiento'] = false;
    check(http_request($url, 'POST', $json($missingConsent), api_headers($origin))['status'] === 422, 'consent is mandatory');
    $oldNotice = $valid;
    $oldNotice['privacy_version'] = 'obsolete';
    check(http_request($url, 'POST', $json($oldNotice), api_headers($origin))['status'] === 422, 'obsolete privacy version is rejected');

    $honeypot = $valid;
    $honeypot['website'] = 'bot-filled';
    check(http_request($url, 'POST', $json($honeypot), api_headers($origin))['status'] === 400, 'honeypot submissions are rejected');
    $honeypot['website'] = (object) ['nested' => 'value'];
    $malformed = http_request($url, 'POST', $json($honeypot), api_headers($origin));
    check($malformed['status'] === 400 && json_decode($malformed['body'], true)['error'] === 'invalid_payload', 'object honeypot returns JSON instead of fatal error');

    $first = http_request($url, 'POST', $json($valid), api_headers($origin));
    check($first['status'] === 201, 'valid request is persisted');
    $firstBody = json_decode($first['body'], true, 16, JSON_THROW_ON_ERROR);
    check(($firstBody['ok'] ?? false) === true && preg_match('/^[0-9a-f-]{36}$/', $firstBody['id'] ?? '') === 1, 'success returns a request id only after persistence');
    check(!str_contains($first['body'], $valid['email']) && !str_contains($first['body'], $valid['descripcion']), 'response does not echo personal data');
    $headers = strtolower(implode("\n", $first['headers']));
    check(str_contains($headers, 'cache-control: no-store, private') && str_contains($headers, 'x-content-type-options: nosniff') && str_contains($headers, 'referrer-policy: no-referrer'), 'API returns privacy and content security headers');

    $pdo = new PDO($config['dsn'], '', '', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    $saved = $pdo->query('SELECT nombre, email, descripcion FROM requests')->fetch(PDO::FETCH_ASSOC);
    check($saved['email'] === $valid['email'] && $saved['descripcion'] === $valid['descripcion'], 'prepared insert preserves submitted text as data');
    $rateEntry = $pdo->query('SELECT email_hash FROM request_rate_limits')->fetchColumn();
    check(is_string($rateEntry) && strlen($rateEntry) === 64 && $rateEntry !== $valid['email'], 'rate limit stores only a keyed email hash');

    check(http_request($url, 'POST', $json($valid), api_headers($origin))['status'] === 201, 'configured hourly request allowance is honored');
    check(http_request($url, 'POST', $json($valid), api_headers($origin))['status'] === 429, 'requests above the hourly allowance are throttled');
    check((int) $pdo->query('SELECT COUNT(*) FROM requests')->fetchColumn() === 2, 'throttled request is not persisted');

    $sqlText = $valid;
    $sqlText['email'] = 'literal@example.invalid';
    $sqlText['descripcion'] = "Texto sintético <script>alert(1)</script> '; DROP TABLE requests; --";
    check(http_request($url, 'POST', $json($sqlText), api_headers($origin))['status'] === 201 && $pdo->query('SELECT descripcion FROM requests WHERE email = \'literal@example.invalid\'')->fetchColumn() === $sqlText['descripcion'], 'SQL and markup remain inert stored text; future CRM must escape output');

    $pdo->exec('DROP TABLE requests');
    $failed = http_request($url, 'POST', $json(array_replace($valid, ['email' => 'failure@example.invalid'])), api_headers($origin));
    check($failed['status'] === 500 && json_decode($failed['body'], true)['error'] === 'persistence_unavailable', 'persistence failure never returns success');
    $failedHash = hash_hmac('sha256', 'failure@example.invalid', $config['email_hash_key']);
    check((int) $pdo->query('SELECT COUNT(*) FROM request_rate_limits WHERE email_hash = ' . $pdo->quote($failedHash))->fetchColumn() === 0, 'failed request rolls back its rate entry');

    unlink($temporaryBase . '/backend/bootstrap.php');
    $missing = http_request($url, 'POST', $json($valid), api_headers($origin));
    check($missing['status'] === 503 && json_decode($missing['body'], true)['error'] === 'service_unavailable' && !str_contains($missing['body'], $temporaryBase), 'missing backend returns JSON without exposing paths');
} finally {
    if (is_resource($server)) {
        proc_terminate($server);
        proc_close($server);
    }
    putenv($originalConfig === false ? 'SALVACION_CONFIG' : 'SALVACION_CONFIG=' . $originalConfig);
    putenv($originalBootstrap === false ? 'SALVACION_BACKEND_BOOTSTRAP' : 'SALVACION_BACKEND_BOOTSTRAP=' . $originalBootstrap);
    $pdo = null;
    if (is_dir($temporaryBase)) {
        $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($temporaryBase, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST);
        foreach ($files as $file) {
            $file->isDir() && !$file->isLink() ? rmdir($file->getPathname()) : unlink($file->getPathname());
        }
        rmdir($temporaryBase);
    }
    @unlink($serverLog);
}

fwrite(STDOUT, 'Passed checks: ' . $passed . PHP_EOL);
