import { jsonStoreGet, jsonStoreSet, jsonStoreRemove } from "../../src/db/jsonStore";

export const MAVIS_MEMORY_VERSION = 1;

export const KEYS = {
  CHAT: "mavis_chat_history",
  CHAT_BACKUP: "mavis_chat_history__CORRUPT_BACKUP",
  PRIME_MEMORY: "mavis_prime_memory",
  PRIME_MEMORY_BACKUP: "mavis_prime_memory__CORRUPT_BACKUP",
};

export async function loadChatHistory(): Promise<any[]> {
  return jsonStoreGet<any[]>("global", KEYS.CHAT, []);
}

export async function saveChatHistory(messages: any[]) {
  jsonStoreSet("global", KEYS.CHAT, messages ?? []);
}

export async function clearAllMavisStorage() {
  [KEYS.CHAT, KEYS.CHAT_BACKUP, KEYS.PRIME_MEMORY, KEYS.PRIME_MEMORY_BACKUP].forEach(k =>
    jsonStoreRemove("global", k)
  );
}
