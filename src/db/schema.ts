import { db } from "./db";

/**
 * Core SQLite schema for Mythos/Vantara.
 * NOTE: WAL improves concurrency and durability.
 */
export function initDb() {
  db.execSync(`
    PRAGMA journal_mode = WAL;

    -- Generic KV for flags + lightweight settings
    CREATE TABLE IF NOT EXISTS kv (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );

    -- Long-term memory vault (slot-based)
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

    -- Prime chat log (structured, queryable)
    CREATE TABLE IF NOT EXISTS prime_chat (
      id TEXT PRIMARY KEY NOT NULL,
      timestamp INTEGER NOT NULL,
      userMessage TEXT NOT NULL,
      mavisReply TEXT NOT NULL,
      mode TEXT NOT NULL,
      arcTag TEXT,
      sessionId TEXT NOT NULL,
      memoryFlag INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_prime_chat_ts ON prime_chat(timestamp);
    CREATE INDEX IF NOT EXISTS idx_prime_chat_session ON prime_chat(sessionId);

    -- Arcs
    CREATE TABLE IF NOT EXISTS prime_arcs (
      id TEXT PRIMARY KEY NOT NULL,
      arcName TEXT NOT NULL,
      status TEXT NOT NULL,
      lastEvent INTEGER NOT NULL,
      notes TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_prime_arcs_name ON prime_arcs(arcName);

    -- Council profiles (stored as JSON strings)
    CREATE TABLE IF NOT EXISTS prime_council_profiles (
      id TEXT PRIMARY KEY NOT NULL,
      councilId TEXT NOT NULL,
      name TEXT NOT NULL,
      class TEXT NOT NULL,
      episodicMemory TEXT NOT NULL,
      semanticMemory TEXT NOT NULL,
      growthLevel INTEGER NOT NULL,
      lastUpdated INTEGER NOT NULL,
      domainAuthority TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_prime_council_class ON prime_council_profiles(class);

    -- OmniSync snapshots (store payload as TEXT; can compress later)
    CREATE TABLE IF NOT EXISTS prime_snapshots (
      id TEXT PRIMARY KEY NOT NULL,
      timestamp INTEGER NOT NULL,
      mode TEXT NOT NULL,
      reason TEXT,
      payload TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_prime_snapshots_ts ON prime_snapshots(timestamp);
  `);
}
