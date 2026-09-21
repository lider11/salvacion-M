CREATE TABLE clients (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT NOT NULL, created_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE consultations (id TEXT PRIMARY KEY NOT NULL, reference TEXT NOT NULL UNIQUE, request_id TEXT NOT NULL UNIQUE, client_id TEXT NOT NULL REFERENCES clients(id), problem TEXT NOT NULL, entity_type TEXT NOT NULL, has_order TEXT NOT NULL, prior_action TEXT NOT NULL, urgent TEXT NOT NULL, summary TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'new', priority TEXT NOT NULL DEFAULT 'medium', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE consents (id TEXT PRIMARY KEY NOT NULL, client_id TEXT NOT NULL REFERENCES clients(id), consultation_id TEXT NOT NULL REFERENCES consultations(id), policy_version TEXT NOT NULL, purpose TEXT NOT NULL, granted_at TEXT NOT NULL, revoked_at TEXT);
--> statement-breakpoint
CREATE TABLE appointments (id TEXT PRIMARY KEY NOT NULL, consultation_id TEXT NOT NULL REFERENCES consultations(id), scheduled_at TEXT NOT NULL, timezone TEXT NOT NULL DEFAULT 'America/Bogota', status TEXT NOT NULL DEFAULT 'requested', professional TEXT NOT NULL DEFAULT 'Daniel Vergel', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE cases (id TEXT PRIMARY KEY NOT NULL, consultation_id TEXT NOT NULL UNIQUE REFERENCES consultations(id), status TEXT NOT NULL DEFAULT 'new', assigned_role TEXT NOT NULL DEFAULT 'admin', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE activities (id TEXT PRIMARY KEY NOT NULL, consultation_id TEXT NOT NULL REFERENCES consultations(id), actor TEXT NOT NULL, action TEXT NOT NULL, previous_value TEXT, new_value TEXT, created_at TEXT NOT NULL);
--> statement-breakpoint
CREATE INDEX idx_consultations_status_created ON consultations(status, created_at);
--> statement-breakpoint
CREATE INDEX idx_appointments_scheduled ON appointments(scheduled_at, status);
--> statement-breakpoint
CREATE UNIQUE INDEX idx_appointments_active_slot ON appointments(scheduled_at) WHERE status IN ('requested','confirmed','rescheduled');
--> statement-breakpoint
CREATE INDEX idx_activities_consultation ON activities(consultation_id, created_at);
