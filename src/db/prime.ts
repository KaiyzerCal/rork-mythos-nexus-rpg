import { db } from "./db";

export function kvSet(key: string, value: string) {
  const now = Date.now();
  db.runSync(`INSERT OR REPLACE INTO kv (key, value, updated_at) VALUES (?, ?, ?)`, [key, value, now]);
}

export function kvGet(key: string): string | null {
  const row = db.getFirstSync(`SELECT value FROM kv WHERE key = ?`, [key]) as any;
  return row?.value ?? null;
}

// ---- PRIME CHAT ----
export function primeChatUpsert(msg: {
  id: string;
  timestamp: number;
  userMessage: string;
  mavisReply: string;
  mode: string;
  arcTag?: string;
  sessionId: string;
  memoryFlag: boolean;
}) {
  db.runSync(
    `INSERT OR REPLACE INTO prime_chat
     (id, timestamp, userMessage, mavisReply, mode, arcTag, sessionId, memoryFlag)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      msg.id,
      msg.timestamp,
      msg.userMessage,
      msg.mavisReply,
      msg.mode,
      msg.arcTag ?? null,
      msg.sessionId,
      msg.memoryFlag ? 1 : 0,
    ]
  );
}

export function primeChatLoad(limit: number = 200) {
  return db.getAllSync(
    `SELECT * FROM prime_chat ORDER BY timestamp DESC LIMIT ?`,
    [limit]
  ) as any[];
}

export function primeChatClearSessionOnly(sessionId?: string) {
  if (sessionId) db.runSync(`DELETE FROM prime_chat WHERE sessionId = ?`, [sessionId]);
  else db.runSync(`DELETE FROM prime_chat`, []);
}

// ---- ARCS ----
export function arcsSaveAll(arcs: any[]) {
  db.execSync(`DELETE FROM prime_arcs;`);
  for (const a of arcs) {
    db.runSync(
      `INSERT INTO prime_arcs (id, arcName, status, lastEvent, notes) VALUES (?, ?, ?, ?, ?)`,
      [a.id, a.arcName, a.status, a.lastEvent, a.notes ?? ""]
    );
  }
}
export function arcsLoadAll() {
  return db.getAllSync(`SELECT * FROM prime_arcs ORDER BY lastEvent DESC`) as any[];
}

// ---- COUNCIL ----
export function councilSaveAll(rows: any[]) {
  db.execSync(`DELETE FROM prime_council_profiles;`);
  for (const p of rows) {
    db.runSync(
      `INSERT INTO prime_council_profiles
       (id, councilId, name, class, episodicMemory, semanticMemory, growthLevel, lastUpdated, domainAuthority)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id,
        p.councilId,
        p.name,
        p.class,
        JSON.stringify(p.episodicMemory ?? []),
        JSON.stringify(p.semanticMemory ?? {}),
        p.growthLevel ?? 0,
        p.lastUpdated ?? Date.now(),
        JSON.stringify(p.domainAuthority ?? []),
      ]
    );
  }
}
export function councilLoadAll() {
  const rows = db.getAllSync(`SELECT * FROM prime_council_profiles ORDER BY lastUpdated DESC`) as any[];
  return rows.map(r => ({
    ...r,
    episodicMemory: safeJson(r.episodicMemory, []),
    semanticMemory: safeJson(r.semanticMemory, {}),
    domainAuthority: safeJson(r.domainAuthority, []),
  }));
}

// ---- SNAPSHOTS (OMNISYNC) ----
export function snapshotInsert(s: { id: string; timestamp: number; mode: string; reason?: string; payload: any }) {
  db.runSync(
    `INSERT OR REPLACE INTO prime_snapshots (id, timestamp, mode, reason, payload) VALUES (?, ?, ?, ?, ?)`,
    [s.id, s.timestamp, s.mode, s.reason ?? null, JSON.stringify(s.payload ?? {})]
  );
}
export function snapshotLoad(limit: number = 50) {
  const rows = db.getAllSync(`SELECT * FROM prime_snapshots ORDER BY timestamp DESC LIMIT ?`, [limit]) as any[];
  return rows.map(r => ({ ...r, payload: safeJson(r.payload, {}) }));
}

function safeJson(raw: string, fallback: any) {
  try { return JSON.parse(raw); } catch { return fallback; }
}
