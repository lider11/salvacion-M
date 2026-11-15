<?php
declare(strict_types=1);

function api_config(): array
{
    static $config = null;
    if (is_array($config)) {
        return $config;
    }

    $configPath = getenv('SALVACION_CONFIG') ?: dirname(__DIR__) . DIRECTORY_SEPARATOR . 'private' . DIRECTORY_SEPARATOR . 'salvacion.php';
    $realPath = realpath($configPath);

    if ($realPath === false || !is_file($realPath) || !is_readable($realPath)) {
        throw new RuntimeException('Private API configuration is missing or unreadable.');
    }

    $documentRoot = realpath($_SERVER['DOCUMENT_ROOT'] ?? '');
    if ($documentRoot !== false) {
        $normalizedRoot = rtrim(str_replace('\\', '/', $documentRoot), '/') . '/';
        $normalizedPath = str_replace('\\', '/', $realPath) . '/';
        if (str_starts_with(strtolower($normalizedPath), strtolower($normalizedRoot))) {
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
            throw new RuntimeException("API configuration is missing required key: {$key}");
        }
    }

    if (!is_string($loaded['dsn']) || $loaded['dsn'] === '') {
        throw new RuntimeException('Invalid DSN.');
    }
    if (!is_string($loaded['db_user']) || !is_string($loaded['db_password'])) {
        throw new RuntimeException('Database credentials must be strings.');
    }
    if (!is_string($loaded['email_hash_key']) || strlen($loaded['email_hash_key']) < 32) {
        throw new RuntimeException('email_hash_key must be a string of at least 32 characters.');
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
    $config = $loaded;

    return $config;
}

function api_database(array $config): PDO
{
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::ATTR_STRINGIFY_FETCHES  => false,
    ];

    if (str_starts_with($config['dsn'], 'mysql:')) {
        $options[PDO::ATTR_TIMEOUT] = 5;
    }

    $pdo = new PDO($config['dsn'], $config['db_user'], $config['db_password'], $options);

    $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
    if ($driver === 'mysql') {
        $pdo->exec("SET time_zone = '+00:00'");
    } elseif ($driver === 'sqlite') {
        $pdo->exec('PRAGMA foreign_keys = ON');
        $pdo->exec('PRAGMA journal_mode = WAL');
    }

    return $pdo;
}

function api_respond(int $status, array $body): never
{
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
        header('X-Content-Type-Options: nosniff');
        header('Cache-Control: no-store');
    }

    http_response_code($status);
    echo json_encode(
        $body,
        JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE | JSON_THROW_ON_ERROR
    );
    exit;
}

function api_uuid(): string
{
    $bytes = random_bytes(16);
    $bytes[6] = chr(ord($bytes[6]) & 0x0f | 0x40); // version 4
    $bytes[8] = chr(ord($bytes[8]) & 0x3f | 0x80); // variant RFC 4122

    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($bytes), 4));
}