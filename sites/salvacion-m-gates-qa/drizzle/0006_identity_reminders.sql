CREATE TABLE appointment_reminders (
  id TEXT PRIMARY KEY NOT NULL,
  appointment_id TEXT NOT NULL REFERENCES appointments(id),
  reminder_type TEXT NOT NULL,
  scheduled_for TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempted_at TEXT,
  sent_at TEXT,
  error_code TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (appointment_id, reminder_type)
);
--> statement-breakpoint
CREATE INDEX idx_appointment_reminders_due
ON appointment_reminders(status, scheduled_for);
