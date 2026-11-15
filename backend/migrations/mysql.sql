CREATE TABLE IF NOT EXISTS requests (
    id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL PRIMARY KEY,
    created_at DATETIME NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(254) NOT NULL,
    telefono VARCHAR(25) NULL,
    ciudad VARCHAR(100) NULL,
    servicio VARCHAR(32) NOT NULL,
    descripcion VARCHAR(1000) NOT NULL,
    privacy_version VARCHAR(80) NOT NULL,
    consented_at DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'nueva',
    INDEX idx_requests_created_at (created_at),
    INDEX idx_requests_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS request_rate_limits (
    email_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    window_start DATETIME NOT NULL,
    request_count SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (email_hash, window_start),
    INDEX idx_rate_limits_window (window_start)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- H03: límite adicional por red. Se almacena exclusivamente un HMAC,
-- nunca una dirección IP en texto claro. CREATE IF NOT EXISTS permite migrar.
CREATE TABLE IF NOT EXISTS request_network_rate_limits (
    network_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    window_start DATETIME NOT NULL,
    request_count SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (network_hash, window_start),
    INDEX idx_network_rate_limits_window (window_start)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
