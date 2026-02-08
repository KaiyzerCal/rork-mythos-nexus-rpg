import { db } from "./db";
import { compressToBase64, decompressFromBase64 } from "../utils/compress";

/**
 * json_store: value is either:
 *  - raw JSON string (encoding='json')
 *  - compressed base64 blob (encoding='json+deflate')
 */

export function jsonStoreSet(scope: string, key: string, value: any) {
  const now = Date.now();
  const json = JSON.stringify(value ?? null);

  // compress only if big enough (tune threshold)
  const THRESHOLD = 1500;
  const shouldCompress = json.length >= THRESHOLD;

  const storedValue = shouldCompress ? compressToBase64(json) : json;
  const encoding = shouldCompress ? "json+deflate" : "json";

  db.runSync(
    `INSERT OR REPLACE INTO json_store (scope, key, value, encoding, updated_at)
     VALUES (?, ?, ?, ?, ?)`,
    [scope, key, storedValue, encoding, now]
  );
}

export function jsonStoreGet<T>(scope: string, key: string, fallback: T): T {
  const row = db.getFirstSync(
    `SELECT value, encoding FROM json_store WHERE scope = ? AND key = ?`,
    [scope, key]
  ) as any;

  if (!row?.value) return fallback;

  try {
    const json =
      row.encoding === "json+deflate" ? decompressFromBase64(row.value) : row.value;
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

export function jsonStoreRemove(scope: string, key: string) {
  db.runSync(`DELETE FROM json_store WHERE scope = ? AND key = ?`, [scope, key]);
}
