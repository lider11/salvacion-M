<?php
declare(strict_types=1);

// Desarrollo exclusivamente en loopback. No subir ni ejecutar como endpoint web.
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
if (!extension_loaded('pdo_sqlite') || !extension_loaded('mbstring')) {
    fwrite(STDERR, "Se requieren pdo_sqlite y mbstring.\n"); exit(1);
}
$port = $argv[1] ?? '8088';
if (!ctype_digit($port) || (int) $port < 1024 || (int) $port > 65535) {
    fwrite(STDERR, "Puerto invalido (1024-65535).\n"); exit(1);
}
$root = dirname(__DIR__);
$state = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'salvacion-local-' . substr(hash('sha256', $root), 0, 12);
if (!is_dir($state) && !mkdir($state, 0700, true)) { throw new RuntimeException('No se pudo crear el directorio privado.'); }
$configPath = $state . DIRECTORY_SEPARATOR . 'config.php';
$previous = is_file($configPath) ? require $configPath : [];
$config = [
    'dsn' => 'sqlite:' . $state . DIRECTORY_SEPARATOR . 'requests.sqlite',
    'db_user' => '', 'db_password' => '',
    'email_hash_key' => $previous['email_hash_key'] ?? bin2hex(random_bytes(32)),
    'privacy_notice_version' => 'local-ficticio-v1',
    'allowed_origins' => ['http://127.0.0.1:' . $port],
    'rate_limit_per_hour' => 5,
];
if (file_put_contents($configPath, '<?php return ' . var_export($config, true) . ';', LOCK_EX) === false) {
    throw new RuntimeException('No se pudo escribir la configuracion privada.');
}
putenv('SALVACION_CONFIG=' . $configPath);
putenv('SALVACION_LOCAL_TEST=1');
require_once __DIR__ . '/bootstrap.php';
$pdo = api_database($config);
$pdo->exec(file_get_contents(__DIR__ . '/migrations/sqlite.sql'));
$pdo = null;
fwrite(STDOUT, "Pruebas locales: http://127.0.0.1:{$port}/#contacto\nSolo datos ficticios. SQLite: {$state}/requests.sqlite\nDetener con Ctrl+C. Los registros se conservan al reiniciar.\n");
$command = escapeshellarg(PHP_BINARY) . ' -d display_errors=0 -d display_startup_errors=0 -d log_errors=1 -S 127.0.0.1:' . $port . ' -t ' . escapeshellarg($root) . ' ' . escapeshellarg(__DIR__ . '/local-router.php');
passthru($command, $exitCode);
exit($exitCode);
