<?php
declare(strict_types=1);

/*
 * Copia este archivo fuera de public_html en private/salvacion.php,
 * como carpeta hermana de backend/.
 * Rellena los datos en Hostinger; no subas la copia real al repositorio.
 */
return [
    // Cierre por defecto. true solo tras autorización y pruebas de staging.
    'accept_requests' => false,
    'dsn' => 'mysql:host=localhost;dbname=CAMBIAR_BASE;charset=utf8mb4',
    'db_user' => 'CAMBIAR_USUARIO',
    'db_password' => 'CAMBIAR_PASSWORD',
    'email_hash_key' => 'CAMBIAR_POR_64_CARACTERES_ALEATORIOS_MINIMO',
    // Solo habilitar envíos después de aprobar jurídicamente el aviso.
    'privacy_notice_version' => 'CAMBIAR_POR_VERSION_APROBADA',
    // Exactos, sin ruta ni barra final. Añade el origen www si realmente se usa.
    'allowed_origins' => [
        'https://CAMBIAR_DOMINIO',
    ],
    'rate_limit_per_hour' => 5,
];
