import { db } from "./db";

const MAX_SLOTS = 128; // increase anytime via OTA

export function insertMemory({
  slot,
  kind,
  title,
  content,
  tags = "",
  importance = 0,
}: {
  slot: number;
  kind: string;
  title?: string;
  content: string;
  tags?: string;
  importance?: number;
}) {
  if (slot >= MAX_SLOTS) throw new Error("Memory slot limit exceeded");

  const now = Date.now();
  db.runSync(
    `INSERT OR REPLACE INTO memory_vault
     (id, slot, kind, title, content, tags, importance, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      `${slot}:${now}`,
      slot,
      kind,
      title ?? null,
      content,
      tags,
      importance,
      now,
      now,
    ]
  );
}

export function getAllMemory() {
  return db.getAllSync(`SELECT * FROM memory_vault ORDER BY importance DESC, updated_at DESC`);
}

export function clearMemorySlot(slot: number) {
  db.runSync(`DELETE FROM memory_vault WHERE slot = ?`, [slot]);
}
