<?php
declare(strict_types=1);

/*
 * Copia este archivo fuera de public_html en private/salvacion.php,
 * como carpeta hermana de backend/.
 * Rellena los datos en Hostinger; no subas la copia real al repositorio.
 */
return [
    'dsn' => 'mysql:host=localhost;dbname=CAMBIAR_BASE;charset=utf8mb4',
    'db_user' => 'CAMBIAR_USUARIO',
    'db_password' => 'CAMBIAR_PASSWORD',
    'email_hash_key' => 'CAMBIAR_POR_64_CARACTERES_ALEATORIOS_MINIMO',
    // En staging privado, coordinar con data-privacy-version del HTML.
    // El identificador sintético NO constituye aprobación jurídica pública.
    // Solo habilitar datos personales reales tras aprobar jurídicamente el aviso.
    'privacy_notice_version' => 'CAMBIAR_POR_VERSION_APROBADA',
    // Exactos, sin ruta ni barra final. Añade el origen www si realmente se usa.
    'allowed_origins' => [
        'https://darkviolet-hippopotamus-789000.hostingersite.com',
    ],
    'rate_limit_per_hour' => 5,
];
