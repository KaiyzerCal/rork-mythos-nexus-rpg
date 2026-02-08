import AsyncStorage from "@react-native-async-storage/async-storage";
import { jsonStoreSet } from "./jsonStore";

/**
 * One-time migration: copy selected AsyncStorage keys into SQLite json_store.
 * Stores parsed JSON when possible; otherwise stores raw string.
 */
export async function migrateAsyncStorageToSqliteOnce(opts?: { scope?: string }) {
  const scope = opts?.scope ?? "global";
  const MIGRATION_KEY = "__migrated_asyncstorage_to_sqlite_v1";

  try {
    const already = await AsyncStorage.getItem(MIGRATION_KEY);
    if (already === "1") return { ok: true, already: true };

    // Add keys you care about here:
    const keys = [
      "black_sun_monarch_v3",
      "mavis_memory",
      "mavis_conversations",
      "mavis_chat_history",
      "mavis_prime_memory",
      "mavis_prime_chat_history",
      "mavis_prime_arc_index",
      "mavis_prime_council_profiles",
      "mavis_prime_system_snapshots",
    ];

    for (const k of keys) {
      const raw = await AsyncStorage.getItem(k);
      if (!raw) continue;

      // Try JSON parse; if it fails, store raw string
      try {
        const parsed = JSON.parse(raw);
        jsonStoreSet(scope, k, parsed);
      } catch {
        jsonStoreSet(scope, k, raw);
      }
    }

    await AsyncStorage.setItem(MIGRATION_KEY, "1");
    return { ok: true, already: false, moved: keys.length };
  } catch (e: any) {
    return { ok: false, error: String(e?.message ?? e) };
  }
}
