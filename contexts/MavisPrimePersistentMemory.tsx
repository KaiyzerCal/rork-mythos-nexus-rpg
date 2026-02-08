import { useCallback, useEffect, useState } from "react";
import createContextHook from "@nkzw/create-context-hook";

import { insertMemory, getAllMemory } from "../src/db/memory";
import {
  kvSet,
  kvGet,
  primeChatUpsert,
  primeChatLoad,
  primeChatClearSessionOnly,
  arcsSaveAll,
  arcsLoadAll,
  councilSaveAll,
  councilLoadAll,
  snapshotInsert,
  snapshotLoad,
} from "../src/db/prime";

export interface PrimeMemoryEntry {
  id: string;
  timestamp: number;
  memoryType:
    | "court_arc"
    | "business_arc"
    | "family"
    | "health"
    | "identity"
    | "preference"
    | "breakthrough"
    | "council_insight"
    | "board_decision";
  memoryKey: string;
  memoryValue: string;
  lastUpdated: number;
  importance: 1 | 2 | 3;
  arc?: string;
  relatedQuests?: string[];
  tags?: string[];
}

export interface ChatMessage {
  id: string;
  timestamp: number;
  userMessage: string;
  mavisReply: string;
  mode: string;
  arcTag?: string;
  sessionId: string;
  memoryFlag: boolean;
}

export interface ArcIndex {
  id: string;
  arcName: string;
  status: "active" | "paused" | "completed";
  lastEvent: number;
  notes: string;
}

export interface CouncilProfile {
  id: string;
  councilId: string;
  name: string;
  class: "core" | "advisory" | "think-tank" | "shadows";
  episodicMemory: string[];
  semanticMemory: Record<string, string>;
  growthLevel: number;
  lastUpdated: number;
  domainAuthority: string[];
}

export interface SystemSnapshot {
  id: string;
  timestamp: number;
  mode: string;
  reason?: string;
  payload: any;
}

// --- SQLite-backed long-term memory helpers (slot-based) ---
export function savePrimeMemoryToSqlite(args: {
  slot: number;
  kind: string;
  title?: string;
  content: string;
  tags?: string;
  importance?: number;
}) {
  insertMemory(args);
}
export function loadPrimeMemoryFromSqlite() {
  return getAllMemory();
}

interface PrimeMemoryState {
  chatHistory: ChatMessage[];
  arcIndex: ArcIndex[];
  councilProfiles: CouncilProfile[];
  systemSnapshots: SystemSnapshot[];
  storageBackend: "sqlite";
}

export const [MavisPrimeMemoryProvider, useMavisPrimeMemory] = createContextHook(() => {
  const [state, setState] = useState<PrimeMemoryState>({
    chatHistory: [],
    arcIndex: [],
    councilProfiles: [],
    systemSnapshots: [],
    storageBackend: "sqlite",
  });

  // Load from SQLite on mount
  useEffect(() => {
    try {
      // mark backend so we can verify in UI/logs
      kvSet("storage_backend", "sqlite_v1");

      const chat = primeChatLoad(250).reverse();
      const arcs = arcsLoadAll();
      const council = councilLoadAll();
      const snaps = snapshotLoad(50);

      setState(prev => ({
        ...prev,
        chatHistory: chat.map(row => ({
          id: row.id,
          timestamp: row.timestamp,
          userMessage: row.userMessage,
          mavisReply: row.mavisReply,
          mode: row.mode,
          arcTag: row.arcTag ?? undefined,
          sessionId: row.sessionId,
          memoryFlag: !!row.memoryFlag,
        })),
        arcIndex: arcs,
        councilProfiles: council,
        systemSnapshots: snaps.map(r => ({
          id: r.id,
          timestamp: r.timestamp,
          mode: r.mode,
          reason: r.reason ?? undefined,
          payload: r.payload,
        })),
      }));
    } catch (e) {
      console.warn("[PRIME-MEMORY] SQLite load failed:", e);
    }
  }, []);

  const addChatMessage = useCallback(async (message: ChatMessage) => {
    setState(prev => ({ ...prev, chatHistory: [...prev.chatHistory, message] }));
    try {
      primeChatUpsert(message);
    } catch (e) {
      console.warn("[PRIME-MEMORY] Failed to write chat to SQLite:", e);
    }
  }, []);

  const replaceChatHistory = useCallback(async (chat: ChatMessage[]) => {
    setState(prev => ({ ...prev, chatHistory: chat }));
    try {
      // simplest: clear then reinsert
      primeChatClearSessionOnly();
      for (const m of chat) primeChatUpsert(m);
    } catch (e) {
      console.warn("[PRIME-MEMORY] Failed to replace chat in SQLite:", e);
    }
  }, []);

  const setArcs = useCallback(async (arcs: ArcIndex[]) => {
    setState(prev => ({ ...prev, arcIndex: arcs }));
    try { arcsSaveAll(arcs); } catch (e) { console.warn("[PRIME-MEMORY] Failed arcs save:", e); }
  }, []);

  const setCouncilProfiles = useCallback(async (profiles: CouncilProfile[]) => {
    setState(prev => ({ ...prev, councilProfiles: profiles }));
    try { councilSaveAll(profiles); } catch (e) { console.warn("[PRIME-MEMORY] Failed council save:", e); }
  }, []);

  const createSystemSnapshot = useCallback(async (payload: any, mode: string = "omnisync", reason?: string) => {
    const snap: SystemSnapshot = {
      id: `snapshot-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
      mode,
      reason,
      payload,
    };
    setState(prev => ({ ...prev, systemSnapshots: [snap, ...prev.systemSnapshots].slice(0, 100) }));
    try { snapshotInsert({ ...snap }); } catch (e) { console.warn("[PRIME-MEMORY] Failed snapshot insert:", e); }
    return snap;
  }, []);

  const omniSync = useCallback(async (gameStateSnapshot: any, reason: string = "manual") => {
    console.log("[OMNI-SYNC] Writing snapshot to SQLite...");
    const snap = await createSystemSnapshot(gameStateSnapshot, "omnisync", reason);
    console.log("[OMNI-SYNC] Saved:", snap.id);
    return {
      ok: true,
      backend: kvGet("storage_backend") ?? "unknown",
      snapshotId: snap.id,
      timestamp: snap.timestamp,
      counts: {
        chat: state.chatHistory.length,
        arcs: state.arcIndex.length,
        councils: state.councilProfiles.length,
        snapshots: state.systemSnapshots.length + 1,
      },
    };
  }, [createSystemSnapshot, state]);

  const clearChatSessionOnly = useCallback(async () => {
    setState(prev => ({ ...prev, chatHistory: [] }));
    try { primeChatClearSessionOnly(); } catch (e) { console.warn("[PRIME-MEMORY] Failed clear chat:", e); }
  }, []);

  return {
    state,

    // chat
    addChatMessage,
    replaceChatHistory,
    clearChatSessionOnly,

    // arcs & councils
    setArcs,
    setCouncilProfiles,

    // omnisync
    createSystemSnapshot,
    omniSync,

    // quick verification helper
    getBackend: () => kvGet("storage_backend"),
  };
});
