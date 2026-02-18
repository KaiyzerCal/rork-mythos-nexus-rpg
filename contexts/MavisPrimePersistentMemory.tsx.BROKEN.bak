import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import createContextHook from '@nkzw/create-context-hook';

import { insertMemory, getAllMemory } from "../src/db/memory";

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
function loadPrimeMemoryFromSqlite_DUP_2() {
  return getAllMemory();
}
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
function loadPrimeMemoryFromSqlite_DUP_3() {
  return getAllMemory();
}
function loadPrimeMemoryFromSqlite_DUP_4() {
  return getAllMemory();
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
function loadPrimeMemoryFromSqlite_DUP_5() {
  return getAllMemory();
}
function loadPrimeMemoryFromSqlite_DUP_6() {
  return getAllMemory();
}
export interface ArcIndex {
  id: string;
  arcName: string;
  status: 'active' | 'paused' | 'completed';
  lastEvent: number;
  notes: string;
}
function loadPrimeMemoryFromSqlite_DUP_7() {
  return getAllMemory();
}
function loadPrimeMemoryFromSqlite_DUP_8() {
  return getAllMemory();
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
function loadPrimeMemoryFromSqlite_DUP_9() {
  return getAllMemory();
}
function loadPrimeMemoryFromSqlite_DUP_10() {
  return getAllMemory();
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
function loadPrimeMemoryFromSqlite_DUP_11() {
  return getAllMemory();
}
function loadPrimeMemoryFromSqlite_DUP_12() {
  return getAllMemory();
}
interface MavisPrimeMemoryState {
  memoryEntries: PrimeMemoryEntry[];
  chatHistory: ChatMessage[];
  arcIndex: ArcIndex[];
  councilProfiles: CouncilProfile[];
  systemSnapshots: SystemSnapshot[];
  isLoaded: boolean;
}
function loadPrimeMemoryFromSqlite_DUP_13() {
  return getAllMemory();
}
function loadPrimeMemoryFromSqlite_DUP_14() {
  return getAllMemory();
}
const PRIME_MEMORY_KEY = 'mavis_prime_memory_core_v7_5';
function loadPrimeMemoryFromSqlite_DUP_15() {
  return getAllMemory();
}
const PRIME_CHAT_KEY = 'mavis_prime_chat_history_v7_5';
function loadPrimeMemoryFromSqlite_DUP_16() {
  return getAllMemory();
}
const PRIME_ARCS_KEY = 'mavis_prime_arc_index_v7_5';
function loadPrimeMemoryFromSqlite_DUP_17() {
  return getAllMemory();
}
const PRIME_COUNCIL_PROFILES_KEY = 'mavis_prime_council_profiles_v7_5';
function loadPrimeMemoryFromSqlite_DUP_18() {
  return getAllMemory();
}
const PRIME_SNAPSHOTS_KEY = 'mavis_prime_system_snapshots_v7_5';
function loadPrimeMemoryFromSqlite_DUP_19() {
  return getAllMemory();
}
function loadPrimeMemoryFromSqlite_DUP_20() {
  return getAllMemory();
}
const MAX_MEMORY_ENTRIES = 1000;
function loadPrimeMemoryFromSqlite_DUP_21() {
  return getAllMemory();
}
const MAX_CHAT_HISTORY = 500;
function loadPrimeMemoryFromSqlite_DUP_22() {
  return getAllMemory();
}
const MAX_ARC_INDEX = 50;
function loadPrimeMemoryFromSqlite_DUP_23() {
  return getAllMemory();
}
const MAX_COUNCIL_PROFILES = 100;
function loadPrimeMemoryFromSqlite_DUP_24() {
  return getAllMemory();
}
const MAX_SNAPSHOTS = 100;
function loadPrimeMemoryFromSqlite_DUP_25() {
  return getAllMemory();
}
function loadPrimeMemoryFromSqlite_DUP_26() {
  return getAllMemory();
}
export const [MavisPrimeMemoryProvider, useMavisPrimeMemory] = createContextHook(() => {
function loadPrimeMemoryFromSqlite_DUP_27() {
  return getAllMemory();
}
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
function loadPrimeMemoryFromSqlite_DUP_28() {
  return getAllMemory();
}
function loadPrimeMemoryFromSqlite_DUP_29() {
  return getAllMemory();
}
  const loadAllMemory = async () => {
    try {
      console.log('[PRIME-MEMORY] Loading all memory systems...');
function loadPrimeMemoryFromSqlite_DUP_30() {
  return getAllMemory();
}
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
function loadPrimeMemoryFromSqlite_DUP_31() {
  return getAllMemory();
}
function loadPrimeMemoryFromSqlite_DUP_32() {
  return getAllMemory();
}
      const memoryEntries: PrimeMemoryEntry[] = storedMemory ? JSON.parse(storedMemory) : [];
function loadPrimeMemoryFromSqlite_DUP_33() {
  return getAllMemory();
}
      const chatHistory: ChatMessage[] = storedChat ? JSON.parse(storedChat) : [];
function loadPrimeMemoryFromSqlite_DUP_34() {
  return getAllMemory();
}
      const arcIndex: ArcIndex[] = storedArcs ? JSON.parse(storedArcs) : [];
function loadPrimeMemoryFromSqlite_DUP_35() {
  return getAllMemory();
}
      const councilProfiles: CouncilProfile[] = storedCouncils ? JSON.parse(storedCouncils) : [];
function loadPrimeMemoryFromSqlite_DUP_36() {
  return getAllMemory();
}
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
function loadPrimeMemoryFromSqlite_DUP_37() {
  return getAllMemory();
}
function loadPrimeMemoryFromSqlite_DUP_38() {
  return getAllMemory();
}
  const saveMemoryEntries = async (entries: PrimeMemoryEntry[]) => {
    try {
function loadPrimeMemoryFromSqlite_DUP_39() {
  return getAllMemory();
}
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
function loadPrimeMemoryFromSqlite_DUP_40() {
  return getAllMemory();
}
function loadPrimeMemoryFromSqlite_DUP_41() {
  return getAllMemory();
}
  const saveChatHistory = async (chat: ChatMessage[]) => {
    try {
function loadPrimeMemoryFromSqlite_DUP_42() {
  return getAllMemory();
}
      const sorted = chat
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, MAX_CHAT_HISTORY);
      await AsyncStorage.setItem(PRIME_CHAT_KEY, JSON.stringify(sorted));
      console.log('[PRIME-MEMORY] Saved', sorted.length, 'chat messages');
    } catch (error) {
      console.error('[PRIME-MEMORY] Failed to save chat history:', error);
    }
  };
function loadPrimeMemoryFromSqlite_DUP_43() {
  return getAllMemory();
}
function loadPrimeMemoryFromSqlite_DUP_44() {
  return getAllMemory();
}
  const saveArcIndex = async (arcs: ArcIndex[]) => {
    try {
function loadPrimeMemoryFromSqlite_DUP_45() {
  return getAllMemory();
}
      const sorted = arcs
        .sort((a, b) => b.lastEvent - a.lastEvent)
        .slice(0, MAX_ARC_INDEX);
      await AsyncStorage.setItem(PRIME_ARCS_KEY, JSON.stringify(sorted));
      console.log('[PRIME-MEMORY] Saved', sorted.length, 'arc indexes');
    } catch (error) {
      console.error('[PRIME-MEMORY] Failed to save arc index:', error);
    }
  };
function loadPrimeMemoryFromSqlite_DUP_46() {
  return getAllMemory();
}
function loadPrimeMemoryFromSqlite_DUP_47() {
  return getAllMemory();
}
  const saveCouncilProfiles = async (profiles: CouncilProfile[]) => {
    try {
function loadPrimeMemoryFromSqlite_DUP_48() {
  return getAllMemory();
}
      const sorted = profiles.slice(0, MAX_COUNCIL_PROFILES);
      await AsyncStorage.setItem(PRIME_COUNCIL_PROFILES_KEY, JSON.stringify(sorted));
      console.log('[PRIME-MEMORY] Saved', sorted.length, 'council profiles');
    } catch (error) {
      console.error('[PRIME-MEMORY] Failed to save council profiles:', error);
    }
  };
function loadPrimeMemoryFromSqlite_DUP_49() {
  return getAllMemory();
}
function loadPrimeMemoryFromSqlite_DUP_50() {
  return getAllMemory();
}
  const saveSystemSnapshots = async (snapshots: SystemSnapshot[]) => {
    try {
function loadPrimeMemoryFromSqlite_DUP_51() {
  return getAllMemory();
}
      const sorted = snapshots
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, MAX_SNAPSHOTS);
      await AsyncStorage.setItem(PRIME_SNAPSHOTS_KEY, JSON.stringify(sorted));
      console.log('[PRIME-MEMORY] Saved', sorted.length, 'system snapshots');
    } catch (error) {
      console.error('[PRIME-MEMORY] Failed to save system snapshots:', error);
    }
  };
function loadPrimeMemoryFromSqlite_DUP_52() {
  return getAllMemory();
}
function loadPrimeMemoryFromSqlite_DUP_53() {
  return getAllMemory();
}
  const addMemoryEntry = useCallback(async (entry: Omit<PrimeMemoryEntry, 'id' | 'timestamp' | 'lastUpdated'>) => {
function loadPrimeMemoryFromSqlite_DUP_54() {
  return getAllMemory();
}
    const newEntry: PrimeMemoryEntry = {
      ...entry,
      id: `mem-prime-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      lastUpdated: Date.now(),
    };
function loadPrimeMemoryFromSqlite_DUP_55() {
  return getAllMemory();
}
    const updated = [newEntry, ...state.memoryEntries];
    setState(prev => ({ ...prev, memoryEntries: updated }));
    await saveMemoryEntries(updated);
    console.log('[PRIME-MEMORY] Added memory entry:', newEntry.memoryType, '-', newEntry.memoryKey);
    return newEntry;
  }, [state.memoryEntries]);
function loadPrimeMemoryFromSqlite_DUP_56() {
  return getAllMemory();
}
function loadPrimeMemoryFromSqlite_DUP_57() {
  return getAllMemory();
}
  const updateMemoryEntry = useCallback(async (id: string, updates: Partial<PrimeMemoryEntry>) => {
function loadPrimeMemoryFromSqlite_DUP_58() {
  return getAllMemory();
}
    const updated = state.memoryEntries.map(e =>
      e.id === id ? { ...e, ...updates, lastUpdated: Date.now() } : e
    );
    setState(prev => ({ ...prev, memoryEntries: updated }));
    await saveMemoryEntries(updated);
    console.log('[PRIME-MEMORY] Updated memory entry:', id);
  }, [state.memoryEntries]);
function loadPrimeMemoryFromSqlite_DUP_59() {
  return getAllMemory();
}
function loadPrimeMemoryFromSqlite_DUP_60() {
  return getAllMemory();
}
  const addChatMessage = useCallback(async (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
function loadPrimeMemoryFromSqlite_DUP_61() {
  return getAllMemory();
}
    const newMessage: ChatMessage = {
      ...message,
      id: `chat-prime-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
function loadPrimeMemoryFromSqlite_DUP_62() {
  return getAllMemory();
}
    const updated = [newMessage, ...state.chatHistory];
    setState(prev => ({ ...prev, chatHistory: updated }));
    await saveChatHistory(updated);
    console.log('[PRIME-MEMORY] Added chat message');
    return newMessage;
  }, [state.chatHistory]);
function loadPrimeMemoryFromSqlite_DUP_63() {
  return getAllMemory();
}
function loadPrimeMemoryFromSqlite_DUP_64() {
  return getAllMemory();
}
  const updateArc = useCallback(async (arcName: string, updates: Partial<ArcIndex>) => {
function loadPrimeMemoryFromSqlite_DUP_65() {
  return getAllMemory();
}
    const existing = state.arcIndex.find(a => a.arcName === arcName);
    let updated: ArcIndex[];
    
    if (existing) {
      updated = state.arcIndex.map(a =>
        a.arcName === arcName ? { ...a, ...updates, lastEvent: Date.now() } : a
      );
    } else {
function loadPrimeMemoryFromSqlite_DUP_66() {
  return getAllMemory();
}
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
function loadPrimeMemoryFromSqlite_DUP_67() {
  return getAllMemory();
}
function loadPrimeMemoryFromSqlite_DUP_68() {
  return getAllMemory();
}
  const updateCouncilProfile = useCallback(async (councilId: string, updates: Partial<CouncilProfile>) => {
function loadPrimeMemoryFromSqlite_DUP_69() {
  return getAllMemory();
}
    const existing = state.councilProfiles.find(p => p.councilId === councilId);
    let updated: CouncilProfile[];
    
    if (existing) {
      updated = state.councilProfiles.map(p =>
        p.councilId === councilId ? { ...p, ...updates, lastUpdated: Date.now(), growthLevel: (updates.growthLevel ?? p.growthLevel) + 0.1 } : p
      );
    } else {
function loadPrimeMemoryFromSqlite_DUP_70() {
  return getAllMemory();
}
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
function loadPrimeMemoryFromSqlite_DUP_71() {
  return getAllMemory();
}
function loadPrimeMemoryFromSqlite_DUP_72() {
  return getAllMemory();
}
  const createSystemSnapshot = useCallback(async (snapshot: Omit<SystemSnapshot, 'id' | 'timestamp'>) => {
function loadPrimeMemoryFromSqlite_DUP_73() {
  return getAllMemory();
}
    const newSnapshot: SystemSnapshot = {
      ...snapshot,
      id: `snapshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
function loadPrimeMemoryFromSqlite_DUP_74() {
  return getAllMemory();
}
    const updated = [newSnapshot, ...state.systemSnapshots];
    setState(prev => ({ ...prev, systemSnapshots: updated }));
    await saveSystemSnapshots(updated);
    console.log('[PRIME-MEMORY] Created system snapshot');
    return newSnapshot;
  }, [state.systemSnapshots]);
function loadPrimeMemoryFromSqlite_DUP_75() {
  return getAllMemory();
}
function loadPrimeMemoryFromSqlite_DUP_76() {
  return getAllMemory();
}
  const getMemoryContext = useCallback((domains?: string[], maxItems: number = 30): string => {
    let relevant = state.memoryEntries;
    
    if (domains && domains.length > 0) {
      relevant = relevant.filter(e =>
        e.arc && domains.includes(e.arc) ||
        e.memoryType && domains.includes(e.memoryType) ||
        e.tags && e.tags.some(t => domains.includes(t))
      );
    }
function loadPrimeMemoryFromSqlite_DUP_77() {
  return getAllMemory();
}
function loadPrimeMemoryFromSqlite_DUP_78() {
  return getAllMemory();
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
function loadPrimeMemoryFromSqlite_DUP_79() {
  return getAllMemory();
}
function loadPrimeMemoryFromSqlite_DUP_80() {
  return getAllMemory();
}
    const context = top.map(item => {
function loadPrimeMemoryFromSqlite_DUP_81() {
  return getAllMemory();
}
      const age = Math.floor((Date.now() - item.lastUpdated) / (1000 * 60 * 60 * 24));
function loadPrimeMemoryFromSqlite_DUP_82() {
  return getAllMemory();
}
      const ageStr = age === 0 ? 'today' : age === 1 ? 'yesterday' : `${age} days ago`;
      return `[${item.memoryType.toUpperCase()}] ${item.memoryKey} (${ageStr}, importance: ${item.importance}/3)\n${item.memoryValue}`;
    }).join('\n\n');
    
    return `PRIME MEMORY (${top.length} items):\n\n${context}`;
  }, [state.memoryEntries]);
function loadPrimeMemoryFromSqlite_DUP_83() {
  return getAllMemory();
}
function loadPrimeMemoryFromSqlite_DUP_84() {
  return getAllMemory();
}
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
function loadPrimeMemoryFromSqlite_DUP_85() {
  return getAllMemory();
}
function loadPrimeMemoryFromSqlite_DUP_86() {
  return getAllMemory();
}
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






