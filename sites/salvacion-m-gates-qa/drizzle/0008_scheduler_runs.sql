CREATE TABLE scheduler_runs (id TEXT PRIMARY KEY NOT NULL, status TEXT NOT NULL CHECK(status IN ('started','completed','requires_review','unknown_requires_review')), started_at TEXT NOT NULL, finished_at TEXT, result_json TEXT, release_sha TEXT NOT NULL);
--> statement-breakpoint
CREATE INDEX idx_scheduler_runs_started ON scheduler_runs(started_at);
