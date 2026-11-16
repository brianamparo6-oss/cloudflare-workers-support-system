CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  issue TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TEXT NOT NULL
);
