CREATE TABLE professional_availability (
  professional TEXT NOT NULL,
  date TEXT NOT NULL,
  start_at TEXT NOT NULL,
  end_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (professional, date),
  CHECK (start_at < end_at)
);
