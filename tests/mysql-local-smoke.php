<?php
declare(strict_types=1);

// Instancia efimera propia; no usa servicios ni datadir de instalaciones existentes.
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
$binary = getenv('SALVACION_TEST_MYSQLD') ?: 'C:/Program Files/MySQL/MySQL Server 8.0/bin/mysqld.exe';
if (!is_file($binary)) { fwrite(STDERR, "Indica SALVACION_TEST_MYSQLD con la ruta de MySQL 8 mysqld.\n"); exit(1); }
$root = dirname(__DIR__);
$temporary = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'salvacion-mysql-test-' . bin2hex(random_bytes(8));
mkdir($temporary, 0700);
$log = $temporary . '/process.log';
$server = null;
$admin = null;
$exitCode = 1;
function execute(array $command, string $log): int {
    $process = proc_open($command, [0 => ['pipe', 'r'], 1 => ['file', $log, 'a'], 2 => ['file', $log, 'a']], $pipes);
    if (!is_resource($process)) { throw new RuntimeException('Could not start test process'); }
    fclose($pipes[0]);
    return proc_close($process);
}
try {
    $socket = stream_socket_server('tcp://127.0.0.1:0');
    $address = stream_socket_get_name($socket, false);
    $port = (int) substr($address, strrpos($address, ':') + 1);
    fclose($socket);
    $base = dirname(dirname($binary));
    $data = $temporary . '/data';
    $code = execute([$binary, '--no-defaults', '--initialize-insecure', '--basedir=' . $base, '--datadir=' . $data], $log);
    if ($code !== 0) { throw new RuntimeException('MySQL initialization failed; code ' . $code); }
    $server = proc_open([$binary, '--no-defaults', '--basedir=' . $base, '--datadir=' . $data,
        '--bind-address=127.0.0.1', '--port=' . $port, '--mysqlx=0', '--skip-log-bin',
        '--innodb-buffer-pool-size=32M', '--log-error=' . $temporary . '/mysql.log', '--console'],
        [0 => ['pipe', 'r'], 1 => ['file', $log, 'a'], 2 => ['file', $log, 'a']], $pipes);
    if (!is_resource($server)) { throw new RuntimeException('MySQL did not start'); }
    fclose($pipes[0]);
    for ($attempt = 0; $attempt < 150; $attempt++) {
        try {
            $admin = new PDO('mysql:host=127.0.0.1;port=' . $port . ';charset=utf8mb4', 'root', '', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_TIMEOUT => 1]);
            break;
        } catch (PDOException) { usleep(100_000); }
    }
    if (!$admin) { throw new RuntimeException('MySQL loopback connection unavailable'); }
    $adminPassword = bin2hex(random_bytes(32));
    $admin->exec("ALTER USER 'root'@'localhost' IDENTIFIED BY " . $admin->quote($adminPassword));
    $version = $admin->query('SELECT VERSION()')->fetchColumn();
    fwrite(STDOUT, "PASS: isolated MySQL {$version} started on loopback\n");
    $database = 'sm_test_' . bin2hex(random_bytes(6));
    $admin->exec('CREATE DATABASE `' . $database . '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    $config = [
        'dsn' => "mysql:host=127.0.0.1;port={$port};dbname={$database};charset=utf8mb4",
        'db_user' => 'root', 'db_password' => $adminPassword,
        'email_hash_key' => bin2hex(random_bytes(32)), 'privacy_notice_version' => 'smoke-test-only',
        'allowed_origins' => ['http://127.0.0.1:8088'], 'rate_limit_per_hour' => 2,
    ];
    $configPath = $temporary . '/config.php';
    file_put_contents($configPath, '<?php return ' . var_export($config, true) . ';');
    putenv('SALVACION_CONFIG=' . $configPath);
    foreach ([1, 2] as $run) {
        if (execute([PHP_BINARY, $root . '/backend/migrate.php'], $log) !== 0) { throw new RuntimeException('MySQL migration failed'); }
        fwrite(STDOUT, "PASS: MySQL migration run {$run}\n");
    }
    $runtimePassword = bin2hex(random_bytes(32));
    $admin->exec("CREATE USER 'sm_runtime'@'localhost' IDENTIFIED BY " . $admin->quote($runtimePassword));
    foreach (['requests', 'request_rate_limits'] as $table) {
        $admin->exec("GRANT SELECT, INSERT, UPDATE, DELETE ON `{$database}`.`{$table}` TO 'sm_runtime'@'localhost'");
    }
    $config['db_user'] = 'sm_runtime';
    $config['db_password'] = $runtimePassword;
    file_put_contents($configPath, '<?php return ' . var_export($config, true) . ';');
    putenv('SALVACION_SMOKE_MYSQL_CONFIG=' . $configPath);
    $admin->exec("CREATE TRIGGER `{$database}`.smoke_fail BEFORE INSERT ON `{$database}`.requests FOR EACH ROW BEGIN IF NEW.email = 'failure@example.invalid' THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'synthetic failure'; END IF; END");
    passthru(escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg($root . '/tests/php-api-smoke.php'), $suiteExit);
    if ($suiteExit !== 0) { throw new RuntimeException('MySQL HTTP suite failed'); }
    $exitCode = 0;
} catch (Throwable $error) {
    // No imprimir DSN, contrasenas ni errores de conexion sin filtrar.
    fwrite(STDERR, 'FAIL: ' . ($error instanceof PDOException ? 'database operation failed' : $error->getMessage()) . PHP_EOL);
} finally {
    putenv('SALVACION_CONFIG');
    putenv('SALVACION_SMOKE_MYSQL_CONFIG');
    if ($admin) { try { $admin->exec('SHUTDOWN'); } catch (Throwable) {} $admin = null; }
    if (is_resource($server)) {
        for ($attempt = 0; $attempt < 100 && proc_get_status($server)['running']; $attempt++) { usleep(100_000); }
        if (proc_get_status($server)['running']) { proc_terminate($server); usleep(500_000); }
        proc_close($server);
    }
    // Comprobar la ruta resuelta antes de borrar exclusivamente el datadir efimero.
    $resolved = realpath($temporary);
    $tempRoot = realpath(sys_get_temp_dir());
    if ($resolved !== false && $tempRoot !== false && dirname($resolved) === $tempRoot
        && preg_match('/^salvacion-mysql-test-[a-f0-9]{16}$/D', basename($resolved))) {
        $prefix = $resolved . DIRECTORY_SEPARATOR;
        $entries = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($resolved, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST);
        foreach ($entries as $entry) {
            $target = $entry->getPathname();
            if (!str_starts_with($target, $prefix)) { throw new RuntimeException('Unsafe cleanup path'); }
            if ($entry->isDir() && !$entry->isLink()) { rmdir($target); } else { unlink($target); }
        }
        rmdir($resolved);
    }
}
exit($exitCode);
