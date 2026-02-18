import { jsonStoreGet, jsonStoreSet, jsonStoreRemove } from "../../src/db/jsonStore";

export const MAVIS_MEMORY_VERSION = 1;

export const KEYS = {
  CHAT: "mavis_chat_history",
  CHAT_BACKUP: "mavis_chat_history__CORRUPT_BACKUP",
  PRIME_MEMORY: "mavis_prime_memory",
  PRIME_MEMORY_BACKUP: "mavis_prime_memory__CORRUPT_BACKUP",
};

let didHydrateChat = false;

export async function loadChatHistory(): Promise<any[]> {
  // Primary (current)
  const g = jsonStoreGet<any[]>("global", KEYS.CHAT, []);
  if (Array.isArray(g) && g.length > 0) {
    didHydrateChat = true;
    return g;
  }

  // Fallback (where your migration likely placed it)
  const m = jsonStoreGet<any[]>("mavis_memory", KEYS.CHAT, []);
  didHydrateChat = true;
  return Array.isArray(m) ? m : [];
}

/**
 * Prevent “empty overwrite” on boot:
 * - don’t persist until after loadChatHistory() has run
 * - refuse to overwrite non-empty storage with []
 */
export async function saveChatHistory(messages: any[]) {
  if (!didHydrateChat) return;

  const next = Array.isArray(messages) ? messages : [];

  if (next.length === 0) {
    const existingGlobal = jsonStoreGet<any[]>("global", KEYS.CHAT, []);
    const existingMigr = jsonStoreGet<any[]>("mavis_memory", KEYS.CHAT, []);
    if ((Array.isArray(existingGlobal) && existingGlobal.length > 0) ||
        (Array.isArray(existingMigr) && existingMigr.length > 0)) {
      return;
    }
  }

  // Write to global (your current reader)
  await jsonStoreSet("global", KEYS.CHAT, next);

  // Optional: keep migration scope in sync while stabilizing
  await jsonStoreSet("mavis_memory", KEYS.CHAT, next);
}

export async function clearAllMavisStorage() {
  await Promise.all(
    [KEYS.CHAT, KEYS.CHAT_BACKUP, KEYS.PRIME_MEMORY, KEYS.PRIME_MEMORY_BACKUP].map(k =>
      jsonStoreRemove("global", k)
    )
  );

  // Optional: also clear the migrated scope so you don't “resurrect” old data later
  await Promise.all(
    [KEYS.CHAT, KEYS.CHAT_BACKUP, KEYS.PRIME_MEMORY, KEYS.PRIME_MEMORY_BACKUP].map(k =>
      jsonStoreRemove("mavis_memory", k)
    )
  );
}



