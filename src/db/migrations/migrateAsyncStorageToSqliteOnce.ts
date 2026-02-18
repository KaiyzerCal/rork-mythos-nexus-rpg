import AsyncStorage from "@react-native-async-storage/async-storage";
import { jsonStoreGet, jsonStoreSet } from "../../db/jsonStore";

const FLAG_SCOPE = "system";
const FLAG_KEY   = "migrate_asyncstorage_to_sqlite_once_v1";

// Keys you previously used across the app (AsyncStorage keys)
const KEYS: Array<{ scope: string; key: string }> = [
  // global chat history
  { scope: "global", key: "mavis_chat_history" },
  { scope: "global", key: "mavis_chat_history__CORRUPT_BACKUP" },
  { scope: "global", key: "mavis_prime_memory" },
  { scope: "global", key: "mavis_prime_memory__CORRUPT_BACKUP" },

  // memory context
  { scope: "mavis", key: "mavis_memory_items" },
  { scope: "mavis", key: "mavis_conversation_threads" },

  // game state
  { scope: "game", key: "black_sun_monarch_v3" },

  // prime legacy keys (if they ever existed in AsyncStorage)
  { scope: "prime", key: "mavis_prime_memory_entries" },
  { scope: "prime", key: "mavis_prime_chat_history" },
  { scope: "prime", key: "mavis_prime_arc_index" },
  { scope: "prime", key: "mavis_prime_council_profiles" },
  { scope: "prime", key: "mavis_prime_system_snapshots" },
];

function safeParse(raw: string) {
  try { return { ok: true as const, value: JSON.parse(raw) }; }
  catch { return { ok: false as const, value: raw }; }
}

export async function migrateAsyncStorageToSqliteOnce(opts?: { wipeAsyncStorage?: boolean }) {
  const already = jsonStoreGet<boolean>(FLAG_SCOPE, FLAG_KEY, false);
  if (already) return { ran: false, reason: "already_ran", migratedKeys: 0 };

  let migratedKeys = 0;

  for (const p of KEYS) {
    const raw = await AsyncStorage.getItem(p.key);
    if (!raw) continue;

    const parsed = safeParse(raw);
    await jsonStoreSet(p.scope, p.key, parsed.value);
    migratedKeys++;

    if (opts?.wipeAsyncStorage) {
      try { await AsyncStorage.removeItem(p.key); } catch {}
    }
  }

  await jsonStoreSet(FLAG_SCOPE, FLAG_KEY, true);
  return { ran: true, migratedKeys };
}
