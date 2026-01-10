import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useRef, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useGame } from './GameContext';
import type { GameState } from '@/types/rpg';

interface SyncStatus {
  lastSyncAt: string | null;
  isSyncing: boolean;
  syncError: string | null;
  isOnline: boolean;
  pendingChanges: number;
}

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  linkedQuestId?: string;
  linkedTaskId?: string;
}

interface IntegrationStatus {
  google: boolean;
  gmail: boolean;
  calendar: boolean;
}

export const [BackendSyncProvider, useBackendSync] = createContextHook(() => {
  const { gameState } = useGame();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSyncAt: null,
    isSyncing: false,
    syncError: null,
    isOnline: true,
    pendingChanges: 0,
  });
  
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationStatus>({
    google: false,
    gmail: false,
    calendar: false,
  });
  
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncedStateRef = useRef<string>('');

  const saveGameStateMutation = trpc.gamestate.save.useMutation({
    onSuccess: (data) => {
      console.log('[SYNC] Game state saved to backend:', data.message);
      setSyncStatus(prev => ({
        ...prev,
        lastSyncAt: data.savedAt,
        isSyncing: false,
        syncError: null,
        pendingChanges: 0,
      }));
    },
    onError: (error) => {
      console.error('[SYNC] Failed to save game state:', error);
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        syncError: error.message,
      }));
    },
  });

  const loadGameStateQuery = trpc.gamestate.load.useQuery(undefined, {
    enabled: false,
    retry: 1,
  });

  const calendarListQuery = trpc.calendar.list.useQuery({}, {
    enabled: integrations.calendar,
    refetchInterval: 60000,
  });

  const createCalendarEventMutation = trpc.calendar.create.useMutation({
    onSuccess: () => {
      calendarListQuery.refetch();
    },
  });

  const googleStatusQuery = trpc.integrations.getStatus.useQuery(
    { provider: 'google' },
    { enabled: true, retry: 1 }
  );

  const calendarStatusQuery = trpc.integrations.getStatus.useQuery(
    { provider: 'calendar' },
    { enabled: true, retry: 1 }
  );

  useEffect(() => {
    if (googleStatusQuery.data) {
      setIntegrations(prev => ({ ...prev, google: googleStatusQuery.data.connected }));
    }
    if (calendarStatusQuery.data) {
      setIntegrations(prev => ({ ...prev, calendar: calendarStatusQuery.data.connected }));
    }
  }, [googleStatusQuery.data, calendarStatusQuery.data]);

  useEffect(() => {
    if (calendarListQuery.data?.events) {
      setCalendarEvents(calendarListQuery.data.events);
    }
  }, [calendarListQuery.data]);

  const syncToBackend = useCallback(async (state: GameState) => {
    const stateHash = JSON.stringify({
      stats: state.stats,
      quests: state.quests.length,
      currentForm: state.currentForm,
    });
    
    if (stateHash === lastSyncedStateRef.current) {
      console.log('[SYNC] No changes detected, skipping sync');
      return;
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true }));
    
    try {
      await saveGameStateMutation.mutateAsync({ gameState: state });
      lastSyncedStateRef.current = stateHash;
    } catch (error) {
      console.error('[SYNC] Sync failed:', error);
    }
  }, [saveGameStateMutation]);

  const debouncedSync = useCallback((state: GameState) => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    
    setSyncStatus(prev => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }));
    
    syncTimeoutRef.current = setTimeout(() => {
      syncToBackend(state);
    }, 3000);
  }, [syncToBackend]);

  useEffect(() => {
    if (gameState && !syncStatus.isSyncing) {
      debouncedSync(gameState);
    }
  }, [gameState, debouncedSync, syncStatus.isSyncing]);

  const forceSync = useCallback(async () => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    await syncToBackend(gameState);
  }, [gameState, syncToBackend]);

  const loadFromBackend = useCallback(async () => {
    console.log('[SYNC] Loading game state from backend');
    const result = await loadGameStateQuery.refetch();
    return result.data;
  }, [loadGameStateQuery]);

  const createCalendarEvent = useCallback(async (event: Omit<CalendarEvent, 'id'>) => {
    const result = await createCalendarEventMutation.mutateAsync(event);
    return result;
  }, [createCalendarEventMutation]);

  const linkQuestToCalendar = useCallback(async (questId: string, questTitle: string, deadline?: string) => {
    if (!deadline) return null;
    
    const startTime = new Date(deadline);
    startTime.setHours(9, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(10, 0, 0, 0);
    
    return createCalendarEvent({
      title: `Quest: ${questTitle}`,
      description: `Quest deadline reminder`,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      linkedQuestId: questId,
    });
  }, [createCalendarEvent]);

  const checkIntegrationStatus = useCallback(async () => {
    await Promise.all([
      googleStatusQuery.refetch(),
      calendarStatusQuery.refetch(),
    ]);
  }, [googleStatusQuery, calendarStatusQuery]);

  return {
    syncStatus,
    calendarEvents,
    integrations,
    forceSync,
    loadFromBackend,
    createCalendarEvent,
    linkQuestToCalendar,
    checkIntegrationStatus,
    isLoading: saveGameStateMutation.isPending || loadGameStateQuery.isFetching,
  };
});
