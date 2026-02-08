import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../db/db";
import { jsonStoreSet } from "../db/jsonStore";

const KV_KEY = "migrated_to_sqlite_v1";

/**
 * Keys you previously used across the app.
 * Add/adjust as needed.
 */
const PAIRS: Array<{ scope: string; key: string }> = [
  // lib/persistence/mavisMemory.ts legacy keys
  { scope: "mavis_memory", key: "mavis_chat_history" },
  { scope: "mavis_memory", key: "mavis_chat_history__CORRUPT_BACKUP" },
  { scope: "mavis_memory", key: "mavis_prime_memory" },
  { scope: "mavis_memory", key: "mavis_prime_memory__CORRUPT_BACKUP" },

  // contexts/MavisMemoryContext.tsx legacy keys (from older code)
  { scope: "mavis", key: "mavis_memory_items" },
  { scope: "mavis", key: "mavis_conversation_threads" },

  // GameContext legacy key
  { scope: "game", key: "black_sun_monarch_v3" },

  // Prime provider legacy keys (from older AsyncStorage version)
  { scope: "prime", key: "mavis_prime_memory_entries" },
  { scope: "prime", key: "mavis_prime_chat_history" },
  { scope: "prime", key: "mavis_prime_arc_index" },
  { scope: "prime", key: "mavis_prime_council_profiles" },
  { scope: "prime", key: "mavis_prime_system_snapshots" },
];

function getKvString(key: string): string | null {
  const row = db.getFirstSync(`SELECT value FROM kv WHERE key = ?`, [key]) as any;
  return row?.value ?? null;
}

function setKvString(key: string, value: string) {
  db.runSync(
    `INSERT OR REPLACE INTO kv (key, value, updated_at) VALUES (?, ?, ?)`,
    [key, value, Date.now()]
  );
}

function safeParse(raw: string) {
  try {
    return { ok: true as const, value: JSON.parse(raw) };
  } catch {
    return { ok: false as const, value: null };
  }
}

/**
 * Migrates AsyncStorage -> SQLite json_store once.
 * Returns { migrated: boolean, moved: number }
 */
export async function migrateAsyncStorageToSqliteOnce(opts?: { wipeAsyncStorage?: boolean }) {
  const already = getKvString(KV_KEY);
  if (already === "1") return { migrated: false, moved: 0 };

  let moved = 0;

  for (const p of PAIRS) {
    const raw = await AsyncStorage.getItem(p.key);
    if (!raw) continue;

    const parsed = safeParse(raw);
    const value = parsed.ok ? parsed.value : raw; // if corrupt json, store raw string

    // Store into SQLite json_store (compressed via jsonStoreSet)
    jsonStoreSet(p.scope, p.key, value);
    moved++;

    if (opts?.wipeAsyncStorage) {
      try { await AsyncStorage.removeItem(p.key); } catch {}
    }
  }

  // Mark migrated
  setKvString(KV_KEY, "1");

  return { migrated: true, moved };
}
