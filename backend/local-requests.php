<?php
declare(strict_types=1);

// Inspeccion local por terminal; nunca publicar como panel web.
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
$root = dirname(__DIR__);
$state = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'salvacion-local-' . substr(hash('sha256', $root), 0, 12);
$path = $state . DIRECTORY_SEPARATOR . 'requests.sqlite';
if (!is_file($path)) { fwrite(STDERR, "Inicia primero el servidor local.\n"); exit(1); }
$pdo = new PDO('sqlite:' . $path, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
$pdo->exec('PRAGMA query_only = ON');
$rows = $pdo->query('SELECT id, created_at, nombre, email, servicio, privacy_version FROM requests ORDER BY created_at DESC LIMIT 20')->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($rows, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE) . PHP_EOL;
