import { strToU8, strFromU8, compressSync, decompressSync } from "fflate";

// Base64 helpers (RN-safe)
function toBase64(bytes: Uint8Array) {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  // eslint-disable-next-line no-undef
  return globalThis.btoa(binary);
}

function fromBase64(b64: string) {
  // eslint-disable-next-line no-undef
  const binary = globalThis.atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function compressToBase64(text: string) {
  const u8 = strToU8(text);
  const compressed = compressSync(u8);
  return toBase64(compressed);
}

export function decompressFromBase64(b64: string) {
  const bytes = fromBase64(b64);
  const decompressed = decompressSync(bytes);
  return strFromU8(decompressed);
}
