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
    $sql = file_get_contents($migrationPath);
    if ($sql === false) {
        throw new RuntimeException('Migration file could not be read.');
    }

    foreach (array_filter(array_map('trim', explode(';', $sql))) as $statement) {
        $pdo->exec($statement);
    }
    fwrite(STDOUT, "Migration completed for {$driver}.\n");
} catch (Throwable $error) {
    fwrite(STDERR, "Migration failed: {$error->getMessage()}\n");
    exit(1);
}
