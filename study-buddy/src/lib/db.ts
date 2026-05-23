import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (db) return db;

  const dbPath = path.join(process.cwd(), 'data.db');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      tag TEXT DEFAULT '',
      priority TEXT DEFAULT 'medium',
      dueDate TEXT DEFAULT '',
      likes INTEGER NOT NULL DEFAULT 0,
      completed INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS pairs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user1Id INTEGER NOT NULL,
      user2Id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      nudgeAt TEXT DEFAULT '',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user1Id) REFERENCES users(id),
      FOREIGN KEY (user2Id) REFERENCES users(id),
      UNIQUE(user1Id, user2Id)
    );
  `);

  // Add columns if upgrading from older schema
  for (const col of [
    "ALTER TABLE todos ADD COLUMN tag TEXT DEFAULT ''",
    "ALTER TABLE todos ADD COLUMN priority TEXT DEFAULT 'medium'",
    "ALTER TABLE todos ADD COLUMN dueDate TEXT DEFAULT ''",
    "ALTER TABLE todos ADD COLUMN likes INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE pairs ADD COLUMN nudgeAt TEXT DEFAULT ''",
    "ALTER TABLE users ADD COLUMN points INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE users ADD COLUMN level INTEGER NOT NULL DEFAULT 1",
    "ALTER TABLE todos ADD COLUMN sortOrder REAL NOT NULL DEFAULT 0",
  ]) {
    try { db.exec(col); } catch { /* column already exists */ }
  }

  // Backfill sortOrder for existing rows that still have 0
  try {
    db.exec("UPDATE todos SET sortOrder = id WHERE sortOrder = 0");
  } catch { /* noop */ }

  return db;
}

export default getDb;
