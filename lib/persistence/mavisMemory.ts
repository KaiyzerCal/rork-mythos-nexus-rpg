import { jsonStoreGet, jsonStoreSet, jsonStoreRemove } from "../../src/db/jsonStore";

export const MAVIS_MEMORY_VERSION = 2;

export const KEYS = {
  CHAT: "mavis_chat_history",
  CHAT_BACKUP: "mavis_chat_history__CORRUPT_BACKUP",
  PRIME_MEMORY: "mavis_prime_memory",
  PRIME_MEMORY_BACKUP: "mavis_prime_memory__CORRUPT_BACKUP",
};

const SCOPE = "mavis_memory";

export async function loadChatHistory(): Promise<any[]> {
  const arr = jsonStoreGet<any[]>(SCOPE, KEYS.CHAT, []);
  return Array.isArray(arr) ? arr.filter(Boolean) : [];
}

export async function saveChatHistory(messages: any[]) {
  jsonStoreSet(SCOPE, KEYS.CHAT, messages ?? []);
}

/**
 * Optional backups retained as keys in SQLite for parity with old logic.
 */
export async function backupCorrupt(raw: any) {
  jsonStoreSet(SCOPE, KEYS.CHAT_BACKUP, { when: new Date().toISOString(), raw });
}

export async function clearAllMavisStorage() {
  jsonStoreRemove(SCOPE, KEYS.CHAT);
  jsonStoreRemove(SCOPE, KEYS.CHAT_BACKUP);
  jsonStoreRemove(SCOPE, KEYS.PRIME_MEMORY);
  jsonStoreRemove(SCOPE, KEYS.PRIME_MEMORY_BACKUP);
}
