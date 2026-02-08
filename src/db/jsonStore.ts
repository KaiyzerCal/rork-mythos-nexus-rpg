import { db } from "./db";
import { compressJson, decompressJson } from "../utils/compress";

export function jsonStoreSet(scope: string, key: string, value: any) {
  const now = Date.now();
  const payload = compressJson(value);
  db.runSync(
    `INSERT OR REPLACE INTO json_store (scope, key, value, updated_at) VALUES (?, ?, ?, ?)`,
    [scope, key, payload, now]
  );
}

export function jsonStoreGet<T = any>(scope: string, key: string, fallback: T): T {
  const row = db.getFirstSync(
    `SELECT value FROM json_store WHERE scope = ? AND key = ?`,
    [scope, key]
  ) as any;

  return decompressJson<T>(row?.value ?? null, fallback);
}

export function jsonStoreRemove(scope: string, key: string) {
  db.runSync(`DELETE FROM json_store WHERE scope = ? AND key = ?`, [scope, key]);
}

export function jsonStoreClearScope(scope: string) {
  db.runSync(`DELETE FROM json_store WHERE scope = ?`, [scope]);
}
