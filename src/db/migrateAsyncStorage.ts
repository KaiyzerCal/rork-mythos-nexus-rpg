import AsyncStorage from "@react-native-async-storage/async-storage";
import { jsonStoreGet, jsonStoreSet } from "./jsonStore";

/**
 * One-time migration: copy selected AsyncStorage keys into SQLite json_store.
 * - Awaits writes
 * - Writes to correct scopes
 * - Never overwrites existing SQLite values
 * - Only marks migrated when done
 */
export async function migrateAsyncStorageToSqliteOnce() {
  const MIGRATION_KEY = "__migrated_asyncstorage_to_sqlite_v2";

  // Map AsyncStorage keys -> (scope,key) in sqlite
  const map: Array<{ asKey: string; scope: string; key: string }> = [
    { asKey: "mavis_chat_history", scope: "global", key: "mavis_chat_history" },
    { asKey: "mavis_prime_memory", scope: "global", key: "mavis_prime_memory" },

    // If you previously used these names, keep them:
    { asKey: "mavis_conversations", scope: "mavis", key: "mavis_conversation_threads" },
    { asKey: "mavis_conversation_threads", scope: "mavis", key: "mavis_conversation_threads" },
    { asKey: "mavis_memory", scope: "mavis", key: "mavis_memory_items" },
    { asKey: "mavis_memory_items", scope: "mavis", key: "mavis_memory_items" },

    // Your other “prime” stuff (adjust scopes if your app loads them elsewhere)
    { asKey: "mavis_prime_chat_history", scope: "global", key: "mavis_prime_chat_history" },
    { asKey: "mavis_prime_arc_index", scope: "global", key: "mavis_prime_arc_index" },
    { asKey: "mavis_prime_council_profiles", scope: "global", key: "mavis_prime_council_profiles" },
    { asKey: "mavis_prime_system_snapshots", scope: "global", key: "mavis_prime_system_snapshots" },

    // Your custom app blob:
    { asKey: "black_sun_monarch_v3", scope: "global", key: "black_sun_monarch_v3" },
  ];

  try {
    const already = await AsyncStorage.getItem(MIGRATION_KEY);
    if (already === "1") return { ok: true, already: true };

    let moved = 0;
    for (const m of map) {
      const raw = await AsyncStorage.getItem(m.asKey);
      if (!raw) continue;

      // IMPORTANT: don't overwrite sqlite if it already has a value
      const existing = jsonStoreGet<any>(m.scope, m.key, null);
      if (existing !== null && existing !== undefined) continue;

      try {
        const parsed = JSON.parse(raw);
        await jsonStoreSet(m.scope, m.key, parsed);
      } catch {
        await jsonStoreSet(m.scope, m.key, raw);
      }

      moved++;
    }

    await AsyncStorage.setItem(MIGRATION_KEY, "1");
    return { ok: true, already: false, moved };
  } catch (e: any) {
    return { ok: false, error: String(e?.message ?? e) };
  }
}
