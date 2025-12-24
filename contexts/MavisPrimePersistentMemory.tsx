import AsyncStorage from '@react-native-async-storage/async-storage';
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
        AsyncStorage.getItem(PRIME_MEMORY_KEY),
        AsyncStorage.getItem(PRIME_CHAT_KEY),
        AsyncStorage.getItem(PRIME_ARCS_KEY),
        AsyncStorage.getItem(PRIME_COUNCIL_PROFILES_KEY),
        AsyncStorage.getItem(PRIME_SNAPSHOTS_KEY),
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
      await AsyncStorage.setItem(PRIME_MEMORY_KEY, JSON.stringify(sorted));
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
      await AsyncStorage.setItem(PRIME_CHAT_KEY, JSON.stringify(sorted));
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
      await AsyncStorage.setItem(PRIME_ARCS_KEY, JSON.stringify(sorted));
      console.log('[PRIME-MEMORY] Saved', sorted.length, 'arc indexes');
    } catch (error) {
      console.error('[PRIME-MEMORY] Failed to save arc index:', error);
    }
  };

  const saveCouncilProfiles = async (profiles: CouncilProfile[]) => {
    try {
      const sorted = profiles.slice(0, MAX_COUNCIL_PROFILES);
      await AsyncStorage.setItem(PRIME_COUNCIL_PROFILES_KEY, JSON.stringify(sorted));
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
      await AsyncStorage.setItem(PRIME_SNAPSHOTS_KEY, JSON.stringify(sorted));
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
    const updated = [newEntry, ...state.memoryEntries];
    setState(prev => ({ ...prev, memoryEntries: updated }));
    await saveMemoryEntries(updated);
    console.log('[PRIME-MEMORY] Added memory entry:', newEntry.memoryType, '-', newEntry.memoryKey);
    return newEntry;
  }, [state.memoryEntries]);

  const updateMemoryEntry = useCallback(async (id: string, updates: Partial<PrimeMemoryEntry>) => {
    const updated = state.memoryEntries.map(e =>
      e.id === id ? { ...e, ...updates, lastUpdated: Date.now() } : e
    );
    setState(prev => ({ ...prev, memoryEntries: updated }));
    await saveMemoryEntries(updated);
    console.log('[PRIME-MEMORY] Updated memory entry:', id);
  }, [state.memoryEntries]);

  const addChatMessage = useCallback(async (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `chat-prime-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    const updated = [newMessage, ...state.chatHistory];
    setState(prev => ({ ...prev, chatHistory: updated }));
    await saveChatHistory(updated);
    console.log('[PRIME-MEMORY] Added chat message');
    return newMessage;
  }, [state.chatHistory]);

  const updateArc = useCallback(async (arcName: string, updates: Partial<ArcIndex>) => {
    const existing = state.arcIndex.find(a => a.arcName === arcName);
    let updated: ArcIndex[];
    
    if (existing) {
      updated = state.arcIndex.map(a =>
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
      updated = [newArc, ...state.arcIndex];
    }
    
    setState(prev => ({ ...prev, arcIndex: updated }));
    await saveArcIndex(updated);
    console.log('[PRIME-MEMORY] Updated arc:', arcName);
  }, [state.arcIndex]);

  const updateCouncilProfile = useCallback(async (councilId: string, updates: Partial<CouncilProfile>) => {
    const existing = state.councilProfiles.find(p => p.councilId === councilId);
    let updated: CouncilProfile[];
    
    if (existing) {
      updated = state.councilProfiles.map(p =>
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
      updated = [newProfile, ...state.councilProfiles];
    }
    
    setState(prev => ({ ...prev, councilProfiles: updated }));
    await saveCouncilProfiles(updated);
    console.log('[PRIME-MEMORY] Updated council profile:', councilId);
  }, [state.councilProfiles]);

  const createSystemSnapshot = useCallback(async (snapshot: Omit<SystemSnapshot, 'id' | 'timestamp'>) => {
    const newSnapshot: SystemSnapshot = {
      ...snapshot,
      id: `snapshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    const updated = [newSnapshot, ...state.systemSnapshots];
    setState(prev => ({ ...prev, systemSnapshots: updated }));
    await saveSystemSnapshots(updated);
    console.log('[PRIME-MEMORY] Created system snapshot');
    return newSnapshot;
  }, [state.systemSnapshots]);

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
      AsyncStorage.removeItem(PRIME_MEMORY_KEY),
      AsyncStorage.removeItem(PRIME_CHAT_KEY),
      AsyncStorage.removeItem(PRIME_ARCS_KEY),
      AsyncStorage.removeItem(PRIME_COUNCIL_PROFILES_KEY),
      AsyncStorage.removeItem(PRIME_SNAPSHOTS_KEY),
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
    
    await Promise.all([
      saveMemoryEntries(state.memoryEntries),
      saveChatHistory(state.chatHistory),
      saveArcIndex(state.arcIndex),
      saveCouncilProfiles(state.councilProfiles),
      saveSystemSnapshots(state.systemSnapshots),
    ]);
    
    console.log('[OMNI-SYNC] Complete. All systems synchronized:');
    console.log(`  - ${state.memoryEntries.length} memory entries`);
    console.log(`  - ${state.chatHistory.length} chat messages`);
    console.log(`  - ${state.arcIndex.length} arcs`);
    console.log(`  - ${state.councilProfiles.length} council profiles`);
    console.log(`  - ${state.systemSnapshots.length} snapshots`);
    
    return {
      success: true,
      timestamp: Date.now(),
      memorySynced: state.memoryEntries.length,
      chatSynced: state.chatHistory.length,
      arcsSynced: state.arcIndex.length,
      councilsSynced: state.councilProfiles.length,
      snapshotsSynced: state.systemSnapshots.length,
    };
  }, [state, createSystemSnapshot]);

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
