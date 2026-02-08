import { db } from "./db";

/**
 * DB schema (chat/session + long-term memory)
 * - messages / threads / stream_state = clearable
 * - memory_vault = protected LTM (slot-based)
 */
export function initDb() {
  db.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS threads (
      id TEXT PRIMARY KEY NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY NOT NULL,
      thread_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stream_state (
      k TEXT PRIMARY KEY NOT NULL,
      v TEXT
    );

    CREATE TABLE IF NOT EXISTS memory_vault (
      id TEXT PRIMARY KEY NOT NULL,
      slot INTEGER NOT NULL,
      kind TEXT NOT NULL,
      title TEXT,
      content TEXT NOT NULL,
      tags TEXT,
      importance INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_memory_slot ON memory_vault(slot);
    CREATE INDEX IF NOT EXISTS idx_memory_kind ON memory_vault(kind);
    CREATE INDEX IF NOT EXISTS idx_memory_updated ON memory_vault(updated_at);
  `);
}
