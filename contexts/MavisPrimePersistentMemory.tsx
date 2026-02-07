import Storage from 'expo-sqlite/kv-store';
import { useCallback, useEffect, useState } from 'react';
import createContextHook from '@nkzw/create-context-hook';

export interface PrimeMemoryEntry {
  id: string;
  timestamp: number;
  memoryType: 'court_arc' | 'business_arc' | 'family' | 'health' | 'identity' | 'preference' | 'breakthrough' | 'council_insight' | 'board_decision';
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
  status: 'active' | 'paused' | 'completed';
  lastEvent: number;
  notes: string;
}

export interface CouncilProfile {
  id: string;
  councilId: string;
  name: string;
  class: 'core' | 'advisory' | 'think-tank' | 'shadows';
  episodicMemory: string[];
  semanticMemory: Record<string, string>;
  growthLevel: number;
  lastUpdated: number;
  domainAuthority: string[];
}

export interface SystemSnapshot {
  id: string;
  timestamp: number;
  level: number;
  rank: string;
  currentForm: string;
  activeQuests: number;
  completedQuests: number;
  unlockedSkills: number;
  vaultEntries: number;
  councilMembers: number;
  identity: string;
}

interface MavisPrimeMemoryState {
  memoryEntries: PrimeMemoryEntry[];
  chatHistory: ChatMessage[];
  arcIndex: ArcIndex[];
  councilProfiles: CouncilProfile[];
  systemSnapshots: SystemSnapshot[];
  isLoaded: boolean;
}

const PRIME_MEMORY_KEY = 'mavis_prime_memory_core_v7_5';
const PRIME_CHAT_KEY = 'mavis_prime_chat_history_v7_5';
const PRIME_ARCS_KEY = 'mavis_prime_arc_index_v7_5';
const PRIME_COUNCIL_PROFILES_KEY = 'mavis_prime_council_profiles_v7_5';
const PRIME_SNAPSHOTS_KEY = 'mavis_prime_system_snapshots_v7_5';

const MAX_MEMORY_ENTRIES = 1000;
const MAX_CHAT_HISTORY = 500;
const MAX_ARC_INDEX = 50;
const MAX_COUNCIL_PROFILES = 100;
const MAX_SNAPSHOTS = 100;

export const [MavisPrimeMemoryProvider, useMavisPrimeMemory] = createContextHook(() => {
  const [state, setState] = useState<MavisPrimeMemoryState>({
    memoryEntries: [],
    chatHistory: [],
    arcIndex: [],
    councilProfiles: [],
    systemSnapshots: [],
    isLoaded: false,
  });

  useEffect(() => {
    loadAllMemory();
  }, []);

  const loadAllMemory = async () => {
    try {
      console.log('[PRIME-MEMORY] Loading all memory systems...');
      const [
        storedMemory,
        storedChat,
        storedArcs,
        storedCouncils,
        storedSnapshots,
      ] = await Promise.all([
        Storage.getItem(PRIME_MEMORY_KEY),
        Storage.getItem(PRIME_CHAT_KEY),
        Storage.getItem(PRIME_ARCS_KEY),
        Storage.getItem(PRIME_COUNCIL_PROFILES_KEY),
        Storage.getItem(PRIME_SNAPSHOTS_KEY),
      ]);

      const memoryEntries: PrimeMemoryEntry[] = storedMemory ? JSON.parse(storedMemory) : [];
      const chatHistory: ChatMessage[] = storedChat ? JSON.parse(storedChat) : [];
      const arcIndex: ArcIndex[] = storedArcs ? JSON.parse(storedArcs) : [];
      const councilProfiles: CouncilProfile[] = storedCouncils ? JSON.parse(storedCouncils) : [];
      const systemSnapshots: SystemSnapshot[] = storedSnapshots ? JSON.parse(storedSnapshots) : [];

      console.log('[PRIME-MEMORY] Loaded:');
      console.log(`  - ${memoryEntries.length} memory entries`);
      console.log(`  - ${chatHistory.length} chat messages`);
      console.log(`  - ${arcIndex.length} arc indexes`);
      console.log(`  - ${councilProfiles.length} council profiles`);
      console.log(`  - ${systemSnapshots.length} system snapshots`);

      setState({
        memoryEntries,
        chatHistory,
        arcIndex,
        councilProfiles,
        systemSnapshots,
        isLoaded: true,
      });
    } catch (error) {
      console.error('[PRIME-MEMORY] Failed to load memory:', error);
      setState({
        memoryEntries: [],
        chatHistory: [],
        arcIndex: [],
        councilProfiles: [],
        systemSnapshots: [],
        isLoaded: true,
      });
    }
  };

  const saveMemoryEntries = async (entries: PrimeMemoryEntry[]) => {
    try {
      const sorted = entries
        .sort((a, b) => {
          if (a.importance !== b.importance) return b.importance - a.importance;
          return b.lastUpdated - a.lastUpdated;
        })
        .slice(0, MAX_MEMORY_ENTRIES);
      await Storage.setItem(PRIME_MEMORY_KEY, JSON.stringify(sorted));
      console.log('[PRIME-MEMORY] Saved', sorted.length, 'memory entries');
    } catch (error) {
      console.error('[PRIME-MEMORY] Failed to save memory entries:', error);
    }
  };

  const saveChatHistory = async (chat: ChatMessage[]) => {
    try {
      const sorted = chat
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, MAX_CHAT_HISTORY);
      await Storage.setItem(PRIME_CHAT_KEY, JSON.stringify(sorted));
      console.log('[PRIME-MEMORY] Saved', sorted.length, 'chat messages');
    } catch (error) {
      console.error('[PRIME-MEMORY] Failed to save chat history:', error);
    }
  };

  const saveArcIndex = async (arcs: ArcIndex[]) => {
    try {
      const sorted = arcs
        .sort((a, b) => b.lastEvent - a.lastEvent)
        .slice(0, MAX_ARC_INDEX);
      await Storage.setItem(PRIME_ARCS_KEY, JSON.stringify(sorted));
      console.log('[PRIME-MEMORY] Saved', sorted.length, 'arc indexes');
    } catch (error) {
      console.error('[PRIME-MEMORY] Failed to save arc index:', error);
    }
  };

  const saveCouncilProfiles = async (profiles: CouncilProfile[]) => {
    try {
      const sorted = profiles.slice(0, MAX_COUNCIL_PROFILES);
      await Storage.setItem(PRIME_COUNCIL_PROFILES_KEY, JSON.stringify(sorted));
      console.log('[PRIME-MEMORY] Saved', sorted.length, 'council profiles');
    } catch (error) {
      console.error('[PRIME-MEMORY] Failed to save council profiles:', error);
    }
  };

  const saveSystemSnapshots = async (snapshots: SystemSnapshot[]) => {
    try {
      const sorted = snapshots
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, MAX_SNAPSHOTS);
      await Storage.setItem(PRIME_SNAPSHOTS_KEY, JSON.stringify(sorted));
      console.log('[PRIME-MEMORY] Saved', sorted.length, 'system snapshots');
    } catch (error) {
      console.error('[PRIME-MEMORY] Failed to save system snapshots:', error);
    }
  };

  const addMemoryEntry = useCallback(async (entry: Omit<PrimeMemoryEntry, 'id' | 'timestamp' | 'lastUpdated'>) => {
    const newEntry: PrimeMemoryEntry = {
      ...entry,
      id: `mem-prime-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      lastUpdated: Date.now(),
    };
    let updated: PrimeMemoryEntry[] = [];
    setState(prev => {
      updated = [newEntry, ...prev.memoryEntries];
      return { ...prev, memoryEntries: updated };
    });
    await saveMemoryEntries(updated);
    console.log('[PRIME-MEMORY] Added memory entry:', newEntry.memoryType, '-', newEntry.memoryKey);
    return newEntry;
  }, []);

  const updateMemoryEntry = useCallback(async (id: string, updates: Partial<PrimeMemoryEntry>) => {
    let updated: PrimeMemoryEntry[] = [];
    setState(prev => {
      updated = prev.memoryEntries.map(e =>
        e.id === id ? { ...e, ...updates, lastUpdated: Date.now() } : e
      );
      return { ...prev, memoryEntries: updated };
    });
    await saveMemoryEntries(updated);
    console.log('[PRIME-MEMORY] Updated memory entry:', id);
  }, []);

  const addChatMessage = useCallback(async (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `chat-prime-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    let updated: ChatMessage[] = [];
    setState(prev => {
      updated = [newMessage, ...prev.chatHistory];
      return { ...prev, chatHistory: updated };
    });
    await saveChatHistory(updated);
    console.log('[PRIME-MEMORY] Added chat message');
    return newMessage;
  }, []);

  const updateArc = useCallback(async (arcName: string, updates: Partial<ArcIndex>) => {
    let updated: ArcIndex[] = [];
    setState(prev => {
      const existing = prev.arcIndex.find(a => a.arcName === arcName);
      if (existing) {
        updated = prev.arcIndex.map(a =>
          a.arcName === arcName ? { ...a, ...updates, lastEvent: Date.now() } : a
        );
      } else {
        const newArc: ArcIndex = {
          id: `arc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          arcName,
          status: 'active',
          lastEvent: Date.now(),
          notes: '',
          ...updates,
        };
        updated = [newArc, ...prev.arcIndex];
      }
      return { ...prev, arcIndex: updated };
    });
    await saveArcIndex(updated);
    console.log('[PRIME-MEMORY] Updated arc:', arcName);
  }, []);

  const updateCouncilProfile = useCallback(async (councilId: string, updates: Partial<CouncilProfile>) => {
    let updated: CouncilProfile[] = [];
    setState(prev => {
      const existing = prev.councilProfiles.find(p => p.councilId === councilId);
      if (existing) {
        updated = prev.councilProfiles.map(p =>
          p.councilId === councilId ? { ...p, ...updates, lastUpdated: Date.now(), growthLevel: (updates.growthLevel ?? p.growthLevel) + 0.1 } : p
        );
      } else {
        const newProfile: CouncilProfile = {
          id: `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          councilId,
          name: '',
          class: 'core',
          episodicMemory: [],
          semanticMemory: {},
          growthLevel: 1.0,
          lastUpdated: Date.now(),
          domainAuthority: [],
          ...updates,
        };
        updated = [newProfile, ...prev.councilProfiles];
      }
      return { ...prev, councilProfiles: updated };
    });
    await saveCouncilProfiles(updated);
    console.log('[PRIME-MEMORY] Updated council profile:', councilId);
  }, []);

  const createSystemSnapshot = useCallback(async (snapshot: Omit<SystemSnapshot, 'id' | 'timestamp'>) => {
    const newSnapshot: SystemSnapshot = {
      ...snapshot,
      id: `snapshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    let updated: SystemSnapshot[] = [];
    setState(prev => {
      updated = [newSnapshot, ...prev.systemSnapshots];
      return { ...prev, systemSnapshots: updated };
    });
    await saveSystemSnapshots(updated);
    console.log('[PRIME-MEMORY] Created system snapshot');
    return newSnapshot;
  }, []);

  const getMemoryContext = useCallback((domains?: string[], maxItems: number = 30): string => {
    let relevant = state.memoryEntries;
    
    if (domains && domains.length > 0) {
      relevant = relevant.filter(e =>
        e.arc && domains.includes(e.arc) ||
        e.memoryType && domains.includes(e.memoryType) ||
        e.tags && e.tags.some(t => domains.includes(t))
      );
    }
    
    const top = relevant
      .sort((a, b) => {
        if (a.importance !== b.importance) return b.importance - a.importance;
        return b.lastUpdated - a.lastUpdated;
      })
      .slice(0, maxItems);
    
    if (top.length === 0) {
      return 'No long-term memory loaded. Fresh session.';
    }
    
    const context = top.map(item => {
      const age = Math.floor((Date.now() - item.lastUpdated) / (1000 * 60 * 60 * 24));
      const ageStr = age === 0 ? 'today' : age === 1 ? 'yesterday' : `${age} days ago`;
      return `[${item.memoryType.toUpperCase()}] ${item.memoryKey} (${ageStr}, importance: ${item.importance}/3)\n${item.memoryValue}`;
    }).join('\n\n');
    
    return `PRIME MEMORY (${top.length} items):\n\n${context}`;
  }, [state.memoryEntries]);

  const clearAllMemory = useCallback(async () => {
    await Promise.all([
      Storage.removeItem(PRIME_MEMORY_KEY),
      Storage.removeItem(PRIME_CHAT_KEY),
      Storage.removeItem(PRIME_ARCS_KEY),
      Storage.removeItem(PRIME_COUNCIL_PROFILES_KEY),
      Storage.removeItem(PRIME_SNAPSHOTS_KEY),
    ]);
    setState({
      memoryEntries: [],
      chatHistory: [],
      arcIndex: [],
      councilProfiles: [],
      systemSnapshots: [],
      isLoaded: true,
    });
    console.log('[PRIME-MEMORY] Cleared ALL Prime memory systems');
  }, []);

  const omniSync = useCallback(async (gameStateSnapshot: Omit<SystemSnapshot, 'id' | 'timestamp'>) => {
    console.log('[OMNI-SYNC] Initiating master synchronization...');
    
    await createSystemSnapshot(gameStateSnapshot);
    
    let currentState: MavisPrimeMemoryState | null = null;
    setState(prev => {
      currentState = prev;
      return prev;
    });

    if (!currentState) return { success: false, timestamp: Date.now(), memorySynced: 0, chatSynced: 0, arcsSynced: 0, councilsSynced: 0, snapshotsSynced: 0 };
    
    const snap = currentState as MavisPrimeMemoryState;
    await Promise.all([
      saveMemoryEntries(snap.memoryEntries),
      saveChatHistory(snap.chatHistory),
      saveArcIndex(snap.arcIndex),
      saveCouncilProfiles(snap.councilProfiles),
      saveSystemSnapshots(snap.systemSnapshots),
    ]);
    
    console.log('[OMNI-SYNC] Complete. All systems synchronized:');
    console.log(`  - ${snap.memoryEntries.length} memory entries`);
    console.log(`  - ${snap.chatHistory.length} chat messages`);
    console.log(`  - ${snap.arcIndex.length} arcs`);
    console.log(`  - ${snap.councilProfiles.length} council profiles`);
    console.log(`  - ${snap.systemSnapshots.length} snapshots`);
    
    return {
      success: true,
      timestamp: Date.now(),
      memorySynced: snap.memoryEntries.length,
      chatSynced: snap.chatHistory.length,
      arcsSynced: snap.arcIndex.length,
      councilsSynced: snap.councilProfiles.length,
      snapshotsSynced: snap.systemSnapshots.length,
    };
  }, [createSystemSnapshot]);

  return {
    ...state,
    addMemoryEntry,
    updateMemoryEntry,
    addChatMessage,
    updateArc,
    updateCouncilProfile,
    createSystemSnapshot,
    getMemoryContext,
    clearAllMemory,
    omniSync,
    reloadMemory: loadAllMemory,
  };
});
