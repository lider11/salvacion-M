-- Las preferencias de horario no son reservas. Solo una cita confirmada
-- bloquea el espacio de un profesional.
DROP INDEX IF EXISTS idx_appointments_active_slot;
CREATE UNIQUE INDEX idx_appointments_confirmed_slot
ON appointments(professional, scheduled_at) WHERE status = 'confirmed';
