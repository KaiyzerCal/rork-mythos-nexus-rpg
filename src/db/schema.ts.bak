import { db } from "./db";

/**
 * Core SQLite schema for Mythos/Vantara.
 * Everything can be stored via json_store (compressed JSON).
 * Specialized tables remain for queryable data.
 */
export function initDb() {
  db.execSync(`
    PRAGMA journal_mode = WAL;

    -- Universal compressed JSON store
    CREATE TABLE IF NOT EXISTS json_store (
      scope TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (scope, key)
    );
    CREATE INDEX IF NOT EXISTS idx_json_store_updated ON json_store(updated_at);

    -- Generic KV
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

    -- Prime chat log
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

    -- Council profiles
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

    -- OmniSync snapshots
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
