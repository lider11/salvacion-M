<?php
declare(strict_types=1);

$bootstrapPath = getenv('SALVACION_BACKEND_BOOTSTRAP');
if ($bootstrapPath === false || $bootstrapPath === '') {
    $outsideDocumentRoot = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . 'bootstrap.php';
    $localDevelopment = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . 'bootstrap.php';
    $bootstrapPath = is_file($outsideDocumentRoot) ? $outsideDocumentRoot : $localDevelopment;
}
require_once $bootstrapPath;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    api_respond(405, ['ok' => false, 'error' => 'method_not_allowed']);
}

try {
    $config = api_config();
} catch (Throwable) {
    error_log('api_requests configuration unavailable');
    api_respond(503, ['ok' => false, 'error' => 'service_unavailable']);
}
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin === '' || !in_array($origin, $config['allowed_origins'], true)) {
    api_respond(403, ['ok' => false, 'error' => 'origin_not_allowed']);
}

$fetchSite = $_SERVER['HTTP_SEC_FETCH_SITE'] ?? '';
if ($fetchSite !== '' && !in_array($fetchSite, ['same-origin', 'same-site'], true)) {
    api_respond(403, ['ok' => false, 'error' => 'origin_not_allowed']);
}

$contentType = strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]));
if ($contentType !== 'application/json') {
    api_respond(415, ['ok' => false, 'error' => 'content_type_not_supported']);
}

$contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($contentLength > 16_384) {
    api_respond(413, ['ok' => false, 'error' => 'request_too_large']);
}

$rawBody = file_get_contents('php://input');
if ($rawBody === false || strlen($rawBody) > 16_384) {
    api_respond(413, ['ok' => false, 'error' => 'request_too_large']);
}

try {
    $decoded = json_decode($rawBody, false, 32, JSON_THROW_ON_ERROR);
} catch (JsonException) {
    api_respond(400, ['ok' => false, 'error' => 'invalid_json']);
}

if (!$decoded instanceof stdClass) {
    api_respond(400, ['ok' => false, 'error' => 'invalid_payload']);
}

$data = get_object_vars($decoded);
if (trim((string) ($data['website'] ?? '')) !== '') {
    api_respond(400, ['ok' => false, 'error' => 'invalid_payload']);
}

$errors = [];
$name = is_string($data['nombre'] ?? null) ? trim($data['nombre']) : '';
$email = is_string($data['email'] ?? null) ? strtolower(trim($data['email'])) : '';
$phone = is_string($data['telefono'] ?? null) ? trim($data['telefono']) : '';
$city = is_string($data['ciudad'] ?? null) ? trim($data['ciudad']) : '';
$service = is_string($data['servicio'] ?? null) ? $data['servicio'] : '';
$description = is_string($data['descripcion'] ?? null) ? trim($data['descripcion']) : '';
$consent = ($data['consentimiento'] ?? null) === true;
$privacyVersion = is_string($data['privacy_version'] ?? null) ? trim($data['privacy_version']) : '';
$services = ['negacion', 'medicamentos', 'citas', 'incapacidades', 'eps-ips', 'reclamacion'];
$nameLength = mb_strlen($name, 'UTF-8');
$emailLength = strlen($email);
$descriptionLength = mb_strlen($description, 'UTF-8');

if ($nameLength < 3 || $nameLength > 100 || !preg_match('/[\p{L}]/u', $name) || !preg_match('/^[\p{L}\p{M} .’\'\-]+$/u', $name)) {
    $errors['nombre'] = 'Escribe un nombre válido de 3 a 100 caracteres.';
}
if ($emailLength > 254 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    $errors['email'] = 'Escribe un correo electrónico válido.';
}
if ($phone !== '') {
    $digits = preg_replace('/\D/', '', $phone) ?? '';
    if (strlen($phone) > 25 || !preg_match('/^\+?[\d ()\-]+$/D', $phone) || strlen($digits) < 7 || strlen($digits) > 15) {
        $errors['telefono'] = 'El teléfono debe tener entre 7 y 15 dígitos.';
    }
}
if ($city !== '' && (mb_strlen($city, 'UTF-8') > 100 || mb_strlen($city, 'UTF-8') < 2 || !preg_match('/[\p{L}]/u', $city) || !preg_match('/^[\p{L}\p{M} .’\'\-]+$/u', $city))) {
    $errors['ciudad'] = 'Escribe una ciudad válida de hasta 100 caracteres.';
}
if (!in_array($service, $services, true)) {
    $errors['servicio'] = 'Selecciona una categoría de orientación válida.';
}
if ($descriptionLength < 20 || $descriptionLength > 1000 || preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', $description)) {
    $errors['descripcion'] = 'La descripción debe tener entre 20 y 1000 caracteres.';
}
if (!$consent || $privacyVersion === '' || !hash_equals($config['privacy_notice_version'], $privacyVersion)) {
    $errors['consentimiento'] = 'Se requiere autorización bajo la versión vigente del aviso de privacidad.';
}

if ($errors !== []) {
    api_respond(422, ['ok' => false, 'error' => 'validation_failed', 'fields' => $errors]);
}

// Sin una dirección de red confiable el límite global sería evadible.
try {
    $clientNetwork = api_client_network_token($_SERVER);
} catch (RuntimeException) {
    error_log('api_requests reliable client network unavailable');
    api_respond(503, ['ok' => false, 'error' => 'service_unavailable']);
}

$requestId = api_uuid();
try {
    $pdo = api_database($config);
    $pdo->beginTransaction();

    $windowStart = gmdate('Y-m-d H:00:00');
    $emailHash = hash_hmac('sha256', $email, $config['email_hash_key']);
    $networkHash = hash_hmac('sha256', 'remote-network:' . $clientNetwork, $config['email_hash_key']);

    // Ambos límites comparten la misma transacción que guarda la solicitud.
    // El contador por red frena correos rotativos; el de correo sigue vigente.
    $networkCount = api_increment_rate_limit($pdo, 'network', $networkHash, $windowStart);
    $emailCount = api_increment_rate_limit($pdo, 'email', $emailHash, $windowStart);

    $cutoff = gmdate('Y-m-d H:i:s', time() - 86_400);
    foreach (['request_rate_limits', 'request_network_rate_limits'] as $table) {
        $cleanup = $pdo->prepare("DELETE FROM {$table} WHERE window_start < :cutoff");
        $cleanup->execute(['cutoff' => $cutoff]);
    }

    if (
        $emailCount > $config['rate_limit_per_hour']
        || $networkCount > $config['network_rate_limit_per_hour']
    ) {
        // Conservar contadores incluso en bloqueos evita reiniciarlos por rollback.
        $pdo->commit();
        header('Retry-After: 3600');
        api_respond(429, ['ok' => false, 'error' => 'rate_limit_exceeded']);
    }

    $insert = $pdo->prepare(
        'INSERT INTO requests '
        . '(id, created_at, nombre, email, telefono, ciudad, servicio, descripcion, privacy_version, consented_at, status) '
        . 'VALUES (:id, :created_at, :nombre, :email, :telefono, :ciudad, :servicio, :descripcion, :privacy_version, :consented_at, :status)'
    );
    $insert->execute([
        'id' => $requestId,
        'created_at' => gmdate('Y-m-d H:i:s'),
        'nombre' => $name,
        'email' => $email,
        'telefono' => $phone !== '' ? $phone : null,
        'ciudad' => $city !== '' ? $city : null,
        'servicio' => $service,
        'descripcion' => $description,
        'privacy_version' => $privacyVersion,
        'consented_at' => gmdate('Y-m-d H:i:s'),
        'status' => 'nueva',
    ]);
    $pdo->commit();
} catch (Throwable) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('api_requests persistence failure; request_id=' . $requestId);
    api_respond(500, ['ok' => false, 'error' => 'persistence_unavailable']);
}

api_respond(201, [
    'ok' => true,
    'id' => $requestId,
    'message' => 'La solicitud se guardó. Esto no implica aceptación del caso ni garantiza un resultado.',
]);
