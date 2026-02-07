import AsyncStorage from '@react-native-async-storage/async-storage';

export const MAVIS_MEMORY_VERSION = 1;

export const KEYS = {
  CHAT: 'mavis_chat_history',
  CHAT_BACKUP: 'mavis_chat_history__CORRUPT_BACKUP',
  PRIME_MEMORY: 'mavis_prime_memory',
  PRIME_MEMORY_BACKUP: 'mavis_prime_memory__CORRUPT_BACKUP',
};

type Migration = (data: any) => any;

const migrations: Record<number, Migration> = {
  // 0 -> 1 example:
  // 0: (d) => ({ ...d, version: 1 }),
};

function safeJsonParse(raw: string | null) {
  if (!raw) return { ok: false as const, value: null, raw: null };
  try {
    return { ok: true as const, value: JSON.parse(raw), raw };
  } catch {
    return { ok: false as const, value: null, raw };
  }
}

async function backupCorrupt(key: string, backupKey: string, reason: string, raw: string | null) {
  try {
    await AsyncStorage.setItem(
      backupKey,
      JSON.stringify({ when: new Date().toISOString(), reason, raw })
    );
  } catch {}
}

function salvageJSONArray(raw: string) {
  // Best-effort salvage for arrays (chat history)
  const last = raw.lastIndexOf(']');
  if (last <= 0) return [];
  const trimmed = raw.slice(0, last + 1);
  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function applyMigrations(obj: any) {
  if (!obj || typeof obj !== 'object') return { version: MAVIS_MEMORY_VERSION, data: obj };
  const v = typeof obj.version === 'number' ? obj.version : 0;

  let next = obj;
  for (let from = v; from < MAVIS_MEMORY_VERSION; from++) {
    const mig = migrations[from];
    if (mig) next = mig(next);
    else next = { ...next, version: from + 1 };
  }
  next.version = MAVIS_MEMORY_VERSION;
  return next;
}

export async function loadJSON<T>(key: string, backupKey?: string): Promise<{ ok: true; value: T } | { ok: false; value: T }> {
  const raw = await AsyncStorage.getItem(key);
  const parsed = safeJsonParse(raw);

  if (parsed.ok) {
    const migrated = applyMigrations(parsed.value);
    return { ok: true, value: migrated as T };
  }

  if (backupKey) await backupCorrupt(key, backupKey, 'parse_error', parsed.raw);

  return { ok: false, value: (null as any) as T };
}

export async function loadChatHistory(): Promise<any[]> {
  const raw = await AsyncStorage.getItem(KEYS.CHAT);
  const parsed = safeJsonParse(raw);
  if (parsed.ok && Array.isArray(parsed.value)) return parsed.value.filter(Boolean);

  if (!parsed.ok && parsed.raw) {
    await backupCorrupt(KEYS.CHAT, KEYS.CHAT_BACKUP, 'parse_error', parsed.raw);
    const salvaged = salvageJSONArray(parsed.raw);
    await AsyncStorage.setItem(KEYS.CHAT, JSON.stringify(salvaged));
    return salvaged;
  }

  return [];
}

export async function saveChatHistory(messages: any[]) {
  await AsyncStorage.setItem(KEYS.CHAT, JSON.stringify(messages ?? []));
}

export async function clearAllMavisStorage() {
  await AsyncStorage.multiRemove([
    KEYS.CHAT,
    KEYS.CHAT_BACKUP,
    KEYS.PRIME_MEMORY,
    KEYS.PRIME_MEMORY_BACKUP,
  ]);
}
