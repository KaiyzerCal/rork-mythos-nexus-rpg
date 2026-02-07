import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export interface MemoryItem {
  id: string;
  type: 'identity' | 'goal' | 'project' | 'pattern' | 'relationship' | 'court_event' | 'business_event' | 'emotional_state' | 'breakthrough' | 'preference' | 'conversation' | 'quest_memory' | 'insight';
  content: string;
  createdAt: number;
  updatedAt: number;
  importanceScore: 1 | 2 | 3;
  domains: string[];
  tags?: string[];
  conversationId?: string;
  relatedQuests?: string[];
}

export interface ConversationThread {
  id: string;
  title: string;
  summary: string;
  startedAt: number;
  lastMessageAt: number;
  messageCount: number;
  keyTopics: string[];
  emotionalTone: string;
  arcs: string[];
}

interface MavisMemoryState {
  memoryItems: MemoryItem[];
  conversationThreads: ConversationThread[];
  isLoaded: boolean;
}

const MAVIS_MEMORY_KEY = 'mavis_prime_memory_v2';
const MAVIS_CONVERSATIONS_KEY = 'mavis_conversation_threads_v1';
const MAX_MEMORY_ITEMS = 150;
const MAX_CONVERSATION_THREADS = 50;

export const [MavisMemoryProvider, useMavisMemory] = createContextHook(() => {
  const [state, setState] = useState<MavisMemoryState>({
    memoryItems: [],
    conversationThreads: [],
    isLoaded: false,
  });

  useEffect(() => {
    loadMemory();
  }, []);

  const loadMemory = async () => {
    try {
      console.log('[MAVIS-MEMORY] Loading memory items and conversation threads...');
      const [storedMemory, storedConversations] = await Promise.all([
        AsyncStorage.getItem(MAVIS_MEMORY_KEY),
        AsyncStorage.getItem(MAVIS_CONVERSATIONS_KEY),
      ]);
      
      let memoryItems: MemoryItem[] = [];
      let conversationThreads: ConversationThread[] = [];
      
      if (storedMemory) {
        try {
          memoryItems = JSON.parse(storedMemory);
          console.log('[MAVIS-MEMORY] Loaded', memoryItems.length, 'memory items');
        } catch (parseError) {
          console.error('[MAVIS-MEMORY] Failed to parse memory items, clearing corrupted data:', parseError);
          await AsyncStorage.removeItem(MAVIS_MEMORY_KEY);
          memoryItems = [];
        }
      }
      
      if (storedConversations) {
        try {
          conversationThreads = JSON.parse(storedConversations);
          console.log('[MAVIS-MEMORY] Loaded', conversationThreads.length, 'conversation threads');
        } catch (parseError) {
          console.error('[MAVIS-MEMORY] Failed to parse conversation threads, clearing corrupted data:', parseError);
          await AsyncStorage.removeItem(MAVIS_CONVERSATIONS_KEY);
          conversationThreads = [];
        }
      }
      
      if (!storedMemory && !storedConversations) {
        console.log('[MAVIS-MEMORY] No stored memory found, starting fresh');
      }
      
      setState({ memoryItems, conversationThreads, isLoaded: true });
    } catch (error) {
      console.error('[MAVIS-MEMORY] Failed to load memory:', error);
      setState({ memoryItems: [], conversationThreads: [], isLoaded: true });
    }
  };

  const saveMemory = async (items: MemoryItem[]) => {
    try {
      const sortedItems = items
        .sort((a, b) => {
          if (a.importanceScore !== b.importanceScore) {
            return b.importanceScore - a.importanceScore;
          }
          return b.updatedAt - a.updatedAt;
        })
        .slice(0, MAX_MEMORY_ITEMS);
      
      await AsyncStorage.setItem(MAVIS_MEMORY_KEY, JSON.stringify(sortedItems));
      console.log('[MAVIS-MEMORY] Saved', sortedItems.length, 'memory items');
    } catch (error) {
      console.error('[MAVIS-MEMORY] Failed to save memory:', error);
    }
  };
  
  const saveConversationThreads = async (threads: ConversationThread[]) => {
    try {
      const sortedThreads = threads
        .sort((a, b) => b.lastMessageAt - a.lastMessageAt)
        .slice(0, MAX_CONVERSATION_THREADS);
      
      await AsyncStorage.setItem(MAVIS_CONVERSATIONS_KEY, JSON.stringify(sortedThreads));
      console.log('[MAVIS-MEMORY] Saved', sortedThreads.length, 'conversation threads');
    } catch (error) {
      console.error('[MAVIS-MEMORY] Failed to save conversation threads:', error);
    }
  };

  const addMemoryItem = useCallback(async (item: Omit<MemoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: MemoryItem = {
      ...item,
      id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updatedItems = [newItem, ...state.memoryItems];
    setState(prev => ({ ...prev, memoryItems: updatedItems }));
    await saveMemory(updatedItems);
    
    console.log('[MAVIS-MEMORY] Added new memory item:', newItem.type, '-', newItem.content.substring(0, 50));
    return newItem;
  }, [state.memoryItems]);

  const updateMemoryItem = useCallback(async (id: string, updates: Partial<MemoryItem>) => {
    const updatedItems = state.memoryItems.map(item => 
      item.id === id 
        ? { ...item, ...updates, updatedAt: Date.now() }
        : item
    );
    
    setState(prev => ({ ...prev, memoryItems: updatedItems }));
    await saveMemory(updatedItems);
    
    console.log('[MAVIS-MEMORY] Updated memory item:', id);
  }, [state.memoryItems]);
  
  const createConversationThread = useCallback(async (firstMessage: string, topics: string[], arcs: string[]) => {
    const thread: ConversationThread = {
      id: `thread-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : ''),
      summary: firstMessage.substring(0, 200),
      startedAt: Date.now(),
      lastMessageAt: Date.now(),
      messageCount: 1,
      keyTopics: topics,
      emotionalTone: 'neutral',
      arcs,
    };
    
    const updatedThreads = [thread, ...state.conversationThreads];
    setState(prev => ({ ...prev, conversationThreads: updatedThreads }));
    await saveConversationThreads(updatedThreads);
    
    console.log('[MAVIS-MEMORY] Created conversation thread:', thread.id);
    return thread;
  }, [state.conversationThreads]);
  
  const updateConversationThread = useCallback(async (threadId: string, updates: Partial<ConversationThread>) => {
    const updatedThreads = state.conversationThreads.map(thread =>
      thread.id === threadId
        ? { ...thread, ...updates, lastMessageAt: Date.now() }
        : thread
    );
    
    setState(prev => ({ ...prev, conversationThreads: updatedThreads }));
    await saveConversationThreads(updatedThreads);
    
    console.log('[MAVIS-MEMORY] Updated conversation thread:', threadId);
  }, [state.conversationThreads]);

  const deleteMemoryItem = useCallback(async (id: string) => {
    const updatedItems = state.memoryItems.filter(item => item.id !== id);
    setState(prev => ({ ...prev, memoryItems: updatedItems }));
    await saveMemory(updatedItems);
    
    console.log('[MAVIS-MEMORY] Deleted memory item:', id);
  }, [state.memoryItems]);

  const getMemoryContext = useCallback((domains?: string[], maxItems: number = 20): string => {
    let relevantItems = state.memoryItems;

    if (domains && domains.length > 0) {
      relevantItems = relevantItems.filter(item => 
        item.domains.some(d => domains.includes(d))
      );
    }

    const topItems = relevantItems
      .sort((a, b) => {
        if (a.importanceScore !== b.importanceScore) {
          return b.importanceScore - a.importanceScore;
        }
        return b.updatedAt - a.updatedAt;
      })
      .slice(0, maxItems);

    if (topItems.length === 0) {
      return 'No long-term memory items loaded yet. This is a fresh session.';
    }

    const context = topItems.map(item => {
      const age = Math.floor((Date.now() - item.updatedAt) / (1000 * 60 * 60 * 24));
      const ageStr = age === 0 ? 'today' : age === 1 ? 'yesterday' : `${age} days ago`;
      return `[${item.type.toUpperCase()}] (${ageStr}, importance: ${item.importanceScore}/3)\n${item.content}`;
    }).join('\n\n');

    return `LONG-TERM MEMORY (${topItems.length} items):\n\n${context}`;
  }, [state.memoryItems]);

  const clearAllMemory = useCallback(async () => {
    await Promise.all([
      AsyncStorage.removeItem(MAVIS_MEMORY_KEY),
      AsyncStorage.removeItem(MAVIS_CONVERSATIONS_KEY),
    ]);
    setState({ memoryItems: [], conversationThreads: [], isLoaded: true });
    console.log('[MAVIS-MEMORY] Cleared all memory and conversation threads');
  }, []);

  const autoSaveFromConversation = useCallback(async (message: string, role: 'user' | 'assistant', threadId?: string) => {
    if (role !== 'user') return;

    const lowerMessage = message.toLowerCase();
    let savedMemory = false;
    
    if (lowerMessage.includes('court') || lowerMessage.includes('trial') || lowerMessage.includes('custody')) {
      await addMemoryItem({
        type: 'court_event',
        content: `User discussed court/custody topic: "${message.substring(0, 200)}..."`,
        importanceScore: 2,
        domains: ['court', 'legal'],
        conversationId: threadId,
      });
      savedMemory = true;
    }
    
    if (lowerMessage.includes('caliyah') || lowerMessage.includes('daughter')) {
      await addMemoryItem({
        type: 'relationship',
        content: `User mentioned Caliyah: "${message.substring(0, 200)}..."`,
        importanceScore: 3,
        domains: ['family', 'fatherhood'],
        conversationId: threadId,
      });
      savedMemory = true;
    }

    if (lowerMessage.includes('business') || lowerMessage.includes('bioneer') || lowerMessage.includes('pf51') || lowerMessage.includes('mavis') || lowerMessage.includes('codexos')) {
      await addMemoryItem({
        type: 'business_event',
        content: `User discussed business: "${message.substring(0, 200)}..."`,
        importanceScore: 2,
        domains: ['business', 'builder', 'dynasty'],
        conversationId: threadId,
      });
      savedMemory = true;
    }

    if (lowerMessage.includes('overwhelm') || lowerMessage.includes('burnout') || lowerMessage.includes('tired') || lowerMessage.includes('anxious')) {
      await addMemoryItem({
        type: 'emotional_state',
        content: `User expressed fatigue/overwhelm: "${message.substring(0, 200)}..."`,
        importanceScore: 2,
        domains: ['health', 'recovery'],
        conversationId: threadId,
      });
      savedMemory = true;
    }
    
    if (lowerMessage.includes('quest') || lowerMessage.includes('goal') || lowerMessage.includes('mission')) {
      await addMemoryItem({
        type: 'quest_memory',
        content: `User discussed quests/goals: "${message.substring(0, 200)}..."`,
        importanceScore: 2,
        domains: ['quests', 'progress'],
        conversationId: threadId,
      });
      savedMemory = true;
    }
    
    if (lowerMessage.includes('learned') || lowerMessage.includes('realized') || lowerMessage.includes('understand')) {
      await addMemoryItem({
        type: 'insight',
        content: `User had insight: "${message.substring(0, 200)}..."`,
        importanceScore: 3,
        domains: ['breakthrough', 'wisdom'],
        conversationId: threadId,
      });
      savedMemory = true;
    }
    
    if (!savedMemory && message.length > 100) {
      await addMemoryItem({
        type: 'conversation',
        content: `Conversation: "${message.substring(0, 200)}..."`,
        importanceScore: 1,
        domains: ['general'],
        conversationId: threadId,
      });
    }
  }, [addMemoryItem]);

  return {
    memoryItems: state.memoryItems,
    conversationThreads: state.conversationThreads,
    isLoaded: state.isLoaded,
    addMemoryItem,
    updateMemoryItem,
    deleteMemoryItem,
    getMemoryContext,
    clearAllMemory,
    autoSaveFromConversation,
    createConversationThread,
    updateConversationThread,
    reloadMemory: loadMemory,
  };
});
