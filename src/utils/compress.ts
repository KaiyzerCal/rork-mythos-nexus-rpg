import { strToU8, strFromU8, gzipSync, gunzipSync } from "fflate";

/**
 * Compress JSON -> base64 string (gzip).
 * Safe for SQLite TEXT storage.
 */
export function compressJson(value: any): string {
  const json = JSON.stringify(value ?? null);
  const u8 = strToU8(json);
  const gz = gzipSync(u8);
  return Buffer.from(gz).toString("base64");
}

/**
 * Decompress base64 string -> JSON value.
 */
export function decompressJson<T = any>(b64: string | null | undefined, fallback: T): T {
  if (!b64) return fallback;
  try {
    const gz = Buffer.from(b64, "base64");
    const u8 = gunzipSync(new Uint8Array(gz));
    const json = strFromU8(u8);
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}
