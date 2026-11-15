<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/bootstrap.php';

try {
    $config = api_config();
    $pdo = api_database($config);
    $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);

    if (!in_array($driver, ['mysql', 'sqlite'], true)) {
        throw new RuntimeException('Only MySQL and SQLite migrations are provided.');
    }

    $migrationPath = __DIR__ . '/migrations/' . $driver . '.sql';
    if (!is_file($migrationPath) || !is_readable($migrationPath)) {
        throw new RuntimeException("Migration file not found: {$migrationPath}");
    }

    $sql = file_get_contents($migrationPath);
    if ($sql === false) {
        throw new RuntimeException('Migration file could not be read.');
    }

    // Mejor separación de sentencias (aún no perfecta, pero más segura)
    $statements = array_filter(
        array_map('trim', preg_split('/;\s*$/m', $sql)),
        fn($s) => $s !== '' && !str_starts_with($s, '--')
    );

    // MySQL hace commit implicito con DDL; no promete rollback de CREATE TABLE.
    $transactional = $driver === 'sqlite';
    if ($transactional) { $pdo->beginTransaction(); }
    try {
        foreach ($statements as $statement) {
            $pdo->exec($statement);
        }
        if ($transactional) { $pdo->commit(); }
        fwrite(STDOUT, "Migration completed successfully for {$driver}.\n");
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) { $pdo->rollBack(); }
        throw $e;
    }
} catch (Throwable $error) {
    fwrite(STDERR, "Migration failed: {$error->getMessage()}\n");
    exit(1);
}
