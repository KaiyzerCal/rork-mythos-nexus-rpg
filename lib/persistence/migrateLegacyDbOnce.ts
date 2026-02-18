import * as SQLite from "expo-sqlite";

const PRIMARY_DB = "mavis.db";
const LEGACY_DB = "vantara.db";

function open(name: string) {
  return SQLite.openDatabaseSync(name);
}

function tableExists(db: SQLite.SQLiteDatabase, table: string) {
  try {
    const rows = db.getAllSync(
      "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
      [table]
    ) as any[];
    return rows.length > 0;
  } catch {
    return false;
  }
}

function countRows(db: SQLite.SQLiteDatabase, table: string) {
  try {
    const rows = db.getAllSync(`SELECT COUNT(*) as c FROM ${table}`) as any[];
    return Number(rows?.[0]?.c ?? 0);
  } catch {
    return 0;
  }
}

function copyTableRows(src: SQLite.SQLiteDatabase, dst: SQLite.SQLiteDatabase, table: string) {
  const rows = src.getAllSync(`SELECT * FROM ${table}`) as any[];
  if (!rows.length) return 0;

  let copied = 0;
  for (const r of rows) {
    const cols = Object.keys(r);
    const placeholders = cols.map(() => "?").join(",");
    const values = cols.map(k => r[k]);

    dst.runSync(
      `INSERT OR IGNORE INTO ${table} (${cols.join(",")}) VALUES (${placeholders})`,
      values
    );
    copied++;
  }
  return copied;
}

export function migrateLegacyDbOnce() {
  // run once per runtime
  if ((globalThis as any).__migrateLegacyDbOnceDone) return;
  (globalThis as any).__migrateLegacyDbOnceDone = true;

  const primary = open(PRIMARY_DB);
  const legacy = open(LEGACY_DB);

  const legacyHasThreads = tableExists(legacy, "threads") && countRows(legacy, "threads") > 0;
  const legacyHasMessages = tableExists(legacy, "messages") && countRows(legacy, "messages") > 0;
  const legacyHasJson = tableExists(legacy, "json_store") && countRows(legacy, "json_store") > 0;

  if (!legacyHasThreads && !legacyHasMessages && !legacyHasJson) return;

  const primaryHasThreads = tableExists(primary, "threads") && countRows(primary, "threads") > 0;
  const primaryHasMessages = tableExists(primary, "messages") && countRows(primary, "messages") > 0;
  const primaryHasJson = tableExists(primary, "json_store") && countRows(primary, "json_store") > 0;

  // If primary already has data, do not overwrite
  if (primaryHasThreads || primaryHasMessages || primaryHasJson) return;

  // Ensure destination tables exist
  try {
    primary.execSync(`
      CREATE TABLE IF NOT EXISTS threads (id TEXT PRIMARY KEY, title TEXT, createdAt INTEGER);
      CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, threadId TEXT, role TEXT, text TEXT, createdAt INTEGER);
      CREATE TABLE IF NOT EXISTS json_store (scope TEXT NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL, updatedAt INTEGER, PRIMARY KEY (scope, key));
      CREATE TABLE IF NOT EXISTS stream_state (id TEXT PRIMARY KEY, value TEXT, updatedAt INTEGER);
    `);
  } catch {}

  try { if (tableExists(legacy, "threads")) copyTableRows(legacy, primary, "threads"); } catch {}
  try { if (tableExists(legacy, "messages")) copyTableRows(legacy, primary, "messages"); } catch {}
  try { if (tableExists(legacy, "json_store")) copyTableRows(legacy, primary, "json_store"); } catch {}
  try { if (tableExists(legacy, "stream_state")) copyTableRows(legacy, primary, "stream_state"); } catch {}
}
