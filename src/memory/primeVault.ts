import { jsonStoreGet, jsonStoreSet } from "../db/jsonStore";

export type PrimeMemoryEntry = {
  id: string;
  ts: number;
  role?: "system" | "user" | "assistant";
  type?: string;
  content: string;
  meta?: Record<string, any>;
};

const SCOPE = "prime_vault";
const KEY = "entries";

export async function getAllMemory(): Promise<PrimeMemoryEntry[]> {
  const existing = await jsonStoreGet<PrimeMemoryEntry[]>(SCOPE, KEY);
  return Array.isArray(existing) ? existing : [];
}

export async function insertMemory(entry: PrimeMemoryEntry): Promise<void> {
  const list = await getAllMemory();
  list.push(entry);
  await jsonStoreSet(SCOPE, KEY, list);
}

export async function clearMemory(): Promise<void> {
  await jsonStoreSet(SCOPE, KEY, []);
}

export async function getLatestMemory(limit: number): Promise<PrimeMemoryEntry[]> {
  const list = await getAllMemory();
  if (!Number.isFinite(limit) || limit <= 0) return [];
  return list.slice(-limit);
}