DROP INDEX IF EXISTS idx_appointments_active_slot;
--> statement-breakpoint
CREATE UNIQUE INDEX idx_appointments_confirmed_slot ON appointments(professional, scheduled_at) WHERE status='confirmed';
