<?php
declare(strict_types=1);

function api_config(): array
{
    static $config = null;
    if (is_array($config)) {
        return $config;
    }

    $configPath = getenv('SALVACION_CONFIG');
    if ($configPath === false || $configPath === '') {
        $configPath = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'private' . DIRECTORY_SEPARATOR . 'salvacion.php';
    }
    $realPath = realpath($configPath);
    if ($realPath === false || !is_file($realPath) || !is_readable($realPath)) {
        throw new RuntimeException('Private API configuration is missing.');
    }

    $documentRoot = realpath($_SERVER['DOCUMENT_ROOT'] ?? '');
    if ($documentRoot !== false) {
        $documentRoot = rtrim($documentRoot, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        $candidate = $realPath . DIRECTORY_SEPARATOR;
        if (stripos($candidate, $documentRoot) === 0) {
            throw new RuntimeException('API configuration must be outside the document root.');
        }
    }

    $loaded = require $realPath;
    if (!is_array($loaded)) {
        throw new RuntimeException('API configuration must return an array.');
    }

    $required = ['dsn', 'db_user', 'db_password', 'email_hash_key', 'privacy_notice_version', 'allowed_origins'];
    foreach ($required as $key) {
        if (!array_key_exists($key, $loaded)) {
            throw new RuntimeException('API configuration is incomplete.');
        }
    }
    if (!is_string($loaded['dsn']) || $loaded['dsn'] === '' || !is_string($loaded['email_hash_key']) || strlen($loaded['email_hash_key']) < 32) {
        throw new RuntimeException('API configuration is invalid.');
    }
    if (!is_string($loaded['privacy_notice_version']) || $loaded['privacy_notice_version'] === '') {
        throw new RuntimeException('A privacy notice version must be configured.');
    }
    if (!is_array($loaded['allowed_origins']) || $loaded['allowed_origins'] === []) {
        throw new RuntimeException('At least one exact allowed origin must be configured.');
    }
    foreach ($loaded['allowed_origins'] as $origin) {
        if (
            !is_string($origin)
            || filter_var($origin, FILTER_VALIDATE_URL) === false
            || !in_array(parse_url($origin, PHP_URL_SCHEME), ['http', 'https'], true)
            || !in_array(parse_url($origin, PHP_URL_PATH), [null, ''], true)
            || parse_url($origin, PHP_URL_QUERY) !== null
            || parse_url($origin, PHP_URL_FRAGMENT) !== null
            || parse_url($origin, PHP_URL_USER) !== null
            || parse_url($origin, PHP_URL_PASS) !== null
        ) {
            throw new RuntimeException('Allowed origins must be exact origins without paths.');
        }
    }

    $loaded['rate_limit_per_hour'] = max(1, min(30, (int) ($loaded['rate_limit_per_hour'] ?? 5)));
    $loaded['network_rate_limit_per_hour'] = max(1, min(240, (int) ($loaded['network_rate_limit_per_hour'] ?? 30)));
    $config = $loaded;
    return $config;
}

function api_database(array $config): PDO
{
    $pdo = new PDO($config['dsn'], $config['db_user'], $config['db_password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    if ($pdo->getAttribute(PDO::ATTR_DRIVER_NAME) === 'mysql') {
        $pdo->exec("SET time_zone = '+00:00'");
    } elseif ($pdo->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite') {
        $pdo->exec('PRAGMA foreign_keys = ON');
    }
    return $pdo;
}

function api_respond(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function api_uuid(): string
{
    $bytes = random_bytes(16);
    $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
    $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);
    $hex = bin2hex($bytes);
    return sprintf('%s-%s-%s-%s-%s', substr($hex, 0, 8), substr($hex, 8, 4), substr($hex, 12, 4), substr($hex, 16, 4), substr($hex, 20));
}

/**
 * Trust only the web server's REMOTE_ADDR, never client-supplied forwarding headers.
 * IPv6 addresses are grouped by /64 so rotating privacy addresses share a quota.
 */
function api_client_network_token(array $server): string
{
    $ip = $server['REMOTE_ADDR'] ?? null;
    if (!is_string($ip) || filter_var($ip, FILTER_VALIDATE_IP) === false) {
        throw new RuntimeException('A reliable client network address is required.');
    }
    $packed = inet_pton($ip);
    if ($packed === false) {
        throw new RuntimeException('Client network address could not be parsed.');
    }
    if (strlen($packed) === 4) {
        return 'v4:' . bin2hex($packed);
    }
    if (substr($packed, 0, 12) === str_repeat("\x00", 10) . "\xff\xff") {
        return 'v4:' . bin2hex(substr($packed, 12));
    }
    return 'v6/64:' . bin2hex(substr($packed, 0, 8));
}

/**
 * Atomically increment a bounded hourly counter. Identifiers are HMACs,
 * never email addresses or raw IP addresses. SQL identifiers are allowlisted.
 */
function api_increment_rate_limit(PDO $pdo, string $kind, string $hash, string $windowStart): int
{
    if ($kind === 'email') {
        $table = 'request_rate_limits';
        $column = 'email_hash';
    } elseif ($kind === 'network') {
        $table = 'request_network_rate_limits';
        $column = 'network_hash';
    } else {
        throw new InvalidArgumentException('Unknown rate-limit kind.');
    }

    $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
    $insert = "INSERT INTO {$table} ({$column}, window_start, request_count) "
        . "VALUES (:hash, :window_start, 1) ";
    if ($driver === 'sqlite') {
        $insert .= "ON CONFLICT({$column}, window_start) DO UPDATE "
            . "SET request_count = MIN(request_count + 1, 32767)";
    } elseif ($driver === 'mysql') {
        $insert .= "ON DUPLICATE KEY UPDATE request_count = LEAST(request_count + 1, 32767)";
    } else {
        throw new RuntimeException('Unsupported rate-limit database driver.');
    }

    $increment = $pdo->prepare($insert);
    $increment->execute(['hash' => $hash, 'window_start' => $windowStart]);

    $select = $pdo->prepare("SELECT request_count FROM {$table} "
        . "WHERE {$column} = :hash AND window_start = :window_start");
    $select->execute(['hash' => $hash, 'window_start' => $windowStart]);
    return (int) $select->fetchColumn();
}
