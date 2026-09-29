CREATE TABLE IF NOT EXISTS crm_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  password_iterations INTEGER NOT NULL DEFAULT 210000,
  role TEXT NOT NULL CHECK (role IN ('ADMIN','ASESOR','LECTURA')),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS crm_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES crm_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  csrf_token TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  absolute_expires_at TEXT NOT NULL,
  revoked_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_crm_sessions_token ON crm_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_crm_sessions_user ON crm_sessions(user_id);
CREATE TABLE IF NOT EXISTS crm_auth_audit (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  email_hint TEXT,
  action TEXT NOT NULL,
  outcome TEXT NOT NULL,
  created_at TEXT NOT NULL
);
