CREATE TABLE IF NOT EXISTS requests (
    id TEXT PRIMARY KEY NOT NULL,
    created_at TEXT NOT NULL,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    telefono TEXT NULL,
    ciudad TEXT NULL,
    servicio TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    privacy_version TEXT NOT NULL,
    consented_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'nueva'
);

CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests (created_at);
CREATE INDEX IF NOT EXISTS idx_requests_status_created ON requests (status, created_at);

CREATE TABLE IF NOT EXISTS request_rate_limits (
    email_hash TEXT NOT NULL,
    window_start TEXT NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (email_hash, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON request_rate_limits (window_start);
