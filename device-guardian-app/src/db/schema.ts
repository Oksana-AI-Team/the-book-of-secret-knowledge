export const CREATE_TABLES_SQL = `
  CREATE TABLE IF NOT EXISTS household_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#4A90E2',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL REFERENCES household_members(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'other',
    ecosystem TEXT NOT NULL DEFAULT 'none',
    brand TEXT NOT NULL DEFAULT '',
    model TEXT NOT NULL DEFAULT '',
    serial_number TEXT NOT NULL DEFAULT '',
    imei TEXT,
    photo_path TEXT,
    receipt_photo_path TEXT,
    purchase_date TEXT,
    purchase_price REAL,
    currency TEXT NOT NULL DEFAULT 'AUD',
    notes TEXT NOT NULL DEFAULT '',
    finder_enabled TEXT NOT NULL DEFAULT 'unknown',
    carrier_name TEXT,
    status TEXT NOT NULL DEFAULT 'home',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS loss_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    started_at TEXT NOT NULL DEFAULT (datetime('now')),
    resolved_at TEXT,
    outcome TEXT,
    checklist_state TEXT NOT NULL DEFAULT '{}'
  );
`;
