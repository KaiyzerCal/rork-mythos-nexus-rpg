import { db } from "./db";

export function initDb() {
  db.execSync(`
    PRAGMA journal_mode = WAL;

    -- Key/Value JSON store (compressed when large)
    CREATE TABLE IF NOT EXISTS json_store (
      scope TEXT NOT NULL,
      key   TEXT NOT NULL,
      value TEXT NOT NULL,
      encoding TEXT NOT NULL DEFAULT 'json',
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (scope, key)
    );
    CREATE INDEX IF NOT EXISTS idx_json_store_updated ON json_store(updated_at);

    -- Long-term memory (slot-based)
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

    -- Optional: prime chat table (if you already use primeChatUpsert)
    CREATE TABLE IF NOT EXISTS prime_chat (
      id TEXT PRIMARY KEY NOT NULL,
      timestamp INTEGER NOT NULL,
      userMessage TEXT NOT NULL,
      mavisReply TEXT NOT NULL,
      mode TEXT,
      arcTag TEXT,
      sessionId TEXT,
      memoryFlag INTEGER DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_prime_chat_time ON prime_chat(timestamp);

    -- Optional: snapshots table
    CREATE TABLE IF NOT EXISTS system_snapshots (
      id TEXT PRIMARY KEY NOT NULL,
      timestamp INTEGER NOT NULL,
      mode TEXT,
      reason TEXT,
      payload TEXT NOT NULL,
      encoding TEXT NOT NULL DEFAULT 'json'
    );
    CREATE INDEX IF NOT EXISTS idx_snapshots_time ON system_snapshots(timestamp);
  `);
}
