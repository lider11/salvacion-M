CREATE TABLE availability_events (
  id TEXT PRIMARY KEY NOT NULL,
  professional TEXT NOT NULL,
  date TEXT NOT NULL,
  actor TEXT NOT NULL,
  previous_value TEXT,
  new_value TEXT NOT NULL,
  created_at TEXT NOT NULL
);
