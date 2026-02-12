import { jsonStoreGet, jsonStoreSet } from "../db/jsonStore";

const SCOPE = "system";

export async function setSystemMeta<T>(key: string, value: T): Promise<void> {
  await jsonStoreSet(SCOPE, key, value);
}

export async function getSystemMeta<T>(key: string): Promise<T | null> {
  const v = await jsonStoreGet<T>(SCOPE, key);
  return v ?? null;
}

export async function markStorageBackendSqliteAllV1(): Promise<void> {
  await setSystemMeta("storage_backend", "sqlite_all_v1");
}

export async function setLastOmniSync(ts: number): Promise<void> {
  await setSystemMeta("last_omnisync", ts);
}