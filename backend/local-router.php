<?php
declare(strict_types=1);

// Allowlist: el servidor integrado no interpreta .htaccess.
if (PHP_SAPI !== 'cli-server' || getenv('SALVACION_LOCAL_TEST') !== '1') {
    http_response_code(404); exit;
}
$config = require getenv('SALVACION_CONFIG');
if (!in_array('http://' . ($_SERVER['HTTP_HOST'] ?? ''), $config['allowed_origins'], true)
    || !in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'], true)) {
    http_response_code(403); exit;
}
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/');
$root = dirname(__DIR__);
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
if ($path === '/api/requests.php') { require $root . '/api/requests.php'; exit; }
if ($path === '/' || $path === '/index.html') {
    header('Content-Type: text/html; charset=utf-8');
    $html = file_get_contents($root . '/index.html');
    echo str_replace('<head>', '<head><meta name="salvacion-local-privacy" content="' . htmlspecialchars($config['privacy_notice_version'], ENT_QUOTES, 'UTF-8') . '">', $html);
    exit;
}
if ($path === '/privacidad.html') {
    header('Content-Type: text/html; charset=utf-8'); readfile($root . $path); exit;
}
$file = realpath($root . $path);
$types = ['css' => 'text/css', 'js' => 'text/javascript', 'png' => 'image/png', 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'svg' => 'image/svg+xml', 'webp' => 'image/webp', 'woff2' => 'font/woff2'];
$extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
$allowed = false;
foreach (['assets', 'css', 'js'] as $directory) {
    if ($file !== false && str_starts_with($file, $root . DIRECTORY_SEPARATOR . $directory . DIRECTORY_SEPARATOR)) { $allowed = true; }
}
if (!$allowed || !isset($types[$extension]) || !is_file($file)) { http_response_code(404); exit; }
header('Content-Type: ' . $types[$extension]);
readfile($file);
