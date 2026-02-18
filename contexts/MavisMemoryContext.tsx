import React, { useCallback, useEffect, useMemo, useState } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { jsonStoreGet, jsonStoreSet, jsonStoreRemove, jsonStoreSetSync, jsonStoreRemoveSync } from "../src/db/jsonStore";

const MAVIS_MEMORY_KEY = "mavis_memory_items";
const MAVIS_CONVERSATIONS_KEY = "mavis_conversation_threads";
const SCOPE = "mavis";

export interface MemoryItem {
  id: string;
  type: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
}

export interface ConversationThread {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageIds: string[];
}

interface MavisMemoryState {
  memoryItems: MemoryItem[];
  conversationThreads: ConversationThread[];
  storageBackend: "sqlite";
}

export const [MavisMemoryProvider, useMavisMemory] = createContextHook(() => {
  const [state, setState] = useState<MavisMemoryState>({
    memoryItems: [],
    conversationThreads: [],
    storageBackend: "sqlite",
  });

  useEffect(() => {
    try {
      const items = jsonStoreGet<MemoryItem[]>(SCOPE, MAVIS_MEMORY_KEY, []);
      const threads = jsonStoreGet<ConversationThread[]>(SCOPE, MAVIS_CONVERSATIONS_KEY, []);
      setState(prev => ({
        ...prev,
        memoryItems: Array.isArray(items) ? items : [],
        conversationThreads: Array.isArray(threads) ? threads : [],
      }));
    } catch (e) {
      console.warn("[MAVIS-MEMORY] SQLite load failed:", e);
    }
  }, []);

  const persist = useCallback((items: MemoryItem[], threads: ConversationThread[]) => {
    jsonStoreSetSync(SCOPE, MAVIS_MEMORY_KEY, items ?? []);
    jsonStoreSetSync(SCOPE, MAVIS_CONVERSATIONS_KEY, threads ?? []);
  }, []);

  const addMemoryItem = useCallback(async (item: MemoryItem) => {
    setState(prev => {
      const next = [...prev.memoryItems, item];
      persist(next, prev.conversationThreads);
      return { ...prev, memoryItems: next };
    });
  }, [persist]);

  const updateMemoryItem = useCallback(async (id: string, patch: Partial<MemoryItem>) => {
    setState(prev => {
      const next = prev.memoryItems.map(m => (m.id === id ? { ...m, ...patch, updatedAt: Date.now() } : m));
      persist(next, prev.conversationThreads);
      return { ...prev, memoryItems: next };
    });
  }, [persist]);

  const deleteMemoryItem = useCallback(async (id: string) => {
    setState(prev => {
      const next = prev.memoryItems.filter(m => m.id !== id);
      persist(next, prev.conversationThreads);
      return { ...prev, memoryItems: next };
    });
  }, [persist]);

  const createConversationThread = useCallback(async (thread: ConversationThread) => {
    setState(prev => {
      const next = [thread, ...prev.conversationThreads];
      persist(prev.memoryItems, next);
      return { ...prev, conversationThreads: next };
    });
  }, [persist]);

  const updateConversationThread = useCallback(async (id: string, patch: Partial<ConversationThread>) => {
    setState(prev => {
      const next = prev.conversationThreads.map(t =>
        t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t
      );
      persist(prev.memoryItems, next);
      return { ...prev, conversationThreads: next };
    });
  }, [persist]);

  const clearAllMemory = useCallback(async () => {
    setState(prev => ({ ...prev, memoryItems: [], conversationThreads: [] }));
    jsonStoreRemoveSync(SCOPE, MAVIS_MEMORY_KEY);
    jsonStoreRemoveSync(SCOPE, MAVIS_CONVERSATIONS_KEY);
  }, []);

  return useMemo(() => ({
    state,
    addMemoryItem,
    updateMemoryItem,
    deleteMemoryItem,
    createConversationThread,
    updateConversationThread,
    clearAllMemory,
  }), [state, addMemoryItem, updateMemoryItem, deleteMemoryItem, createConversationThread, updateConversationThread, clearAllMemory]);
});


