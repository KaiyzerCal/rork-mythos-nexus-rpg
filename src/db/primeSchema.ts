import { db } from "./db";

const PRIME_SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS prime_chat (
    id TEXT PRIMARY KEY NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS prime_arcs (
    id TEXT PRIMARY KEY NOT NULL,
    arcName TEXT NOT NULL,
    status TEXT NOT NULL,
    lastEvent INTEGER NOT NULL,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS prime_council_profiles (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    role TEXT,
    archetype TEXT,
    description TEXT,
    lastUpdated INTEGER NOT NULL,
    payload TEXT
  );

  CREATE TABLE IF NOT EXISTS prime_snapshots (
    id TEXT PRIMARY KEY NOT NULL,
    timestamp INTEGER NOT NULL,
    mode TEXT NOT NULL,
    reason TEXT NOT NULL,
    payload TEXT NOT NULL
  );
`;

let _primeSchemaReady = false;

export function ensurePrimeSchemaSync() {
  if (_primeSchemaReady) return;
  try {
    if (typeof (db as any)?.execSync === "function") {
      (db as any).execSync(PRIME_SCHEMA_SQL);
      _primeSchemaReady = true;
    }
  } catch (e) {}
}
