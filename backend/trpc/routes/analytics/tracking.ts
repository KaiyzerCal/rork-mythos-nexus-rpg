import { z } from "zod";
import { publicProcedure } from "../../create-context";

export const trackEvent = publicProcedure
  .input(z.object({
    eventType: z.string(),
    eventData: z.record(z.string(), z.any()).optional(),
    sessionId: z.string().optional(),
    timestamp: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    console.log('[ANALYTICS] Tracking event:', input.eventType);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: false, message: 'Database not configured' };
    }
    
    try {
      const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const event = {
        id: eventId,
        type: input.eventType,
        data: input.eventData || {},
        sessionId: input.sessionId,
        timestamp: input.timestamp || new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      
      await fetch(`${dbEndpoint}/key/${dbNamespace}/analytics_${eventId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
      
      const indexResponse = await fetch(`${dbEndpoint}/key/${dbNamespace}/analytics_index`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      const index = indexResponse.ok ? await indexResponse.json() : [];
      const indexArray = Array.isArray(index) ? index : [];
      
      await fetch(`${dbEndpoint}/key/${dbNamespace}/analytics_index`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...indexArray, { id: eventId, type: input.eventType, timestamp: event.timestamp }]),
      });
      
      return { success: true, eventId };
    } catch (error) {
      console.error('[ANALYTICS] Failed to track event:', error);
      return { success: false, error: String(error) };
    }
  });

export const getAnalyticsSummary = publicProcedure
  .input(z.object({
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    eventTypes: z.array(z.string()).optional(),
  }))
  .query(async ({ input }) => {
    console.log('[ANALYTICS] Getting summary:', input);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { summary: null, message: 'Database not configured' };
    }
    
    try {
      const indexResponse = await fetch(`${dbEndpoint}/key/${dbNamespace}/analytics_index`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      const index = indexResponse.ok ? await indexResponse.json() : [];
      const indexArray = Array.isArray(index) ? index : [];
      
      const filtered = indexArray.filter((event: any) => {
        const matchesDateFrom = !input.dateFrom || new Date(event.timestamp) >= new Date(input.dateFrom);
        const matchesDateTo = !input.dateTo || new Date(event.timestamp) <= new Date(input.dateTo);
        const matchesTypes = !input.eventTypes?.length || input.eventTypes.includes(event.type);
        return matchesDateFrom && matchesDateTo && matchesTypes;
      });
      
      const eventCounts: Record<string, number> = {};
      const dailyCounts: Record<string, number> = {};
      
      filtered.forEach((event: any) => {
        eventCounts[event.type] = (eventCounts[event.type] || 0) + 1;
        const date = event.timestamp.split('T')[0];
        dailyCounts[date] = (dailyCounts[date] || 0) + 1;
      });
      
      return {
        summary: {
          totalEvents: filtered.length,
          eventCounts,
          dailyCounts,
          dateRange: {
            from: input.dateFrom || 'all',
            to: input.dateTo || 'all',
          },
        },
      };
    } catch (error) {
      console.error('[ANALYTICS] Failed to get summary:', error);
      return { summary: null, error: String(error) };
    }
  });

export const getActivityLog = publicProcedure
  .input(z.object({
    limit: z.number().optional().default(50),
    offset: z.number().optional().default(0),
    eventType: z.string().optional(),
  }))
  .query(async ({ input }) => {
    console.log('[ANALYTICS] Getting activity log:', input);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { activities: [], total: 0, message: 'Database not configured' };
    }
    
    try {
      const indexResponse = await fetch(`${dbEndpoint}/key/${dbNamespace}/analytics_index`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      const index = indexResponse.ok ? await indexResponse.json() : [];
      const indexArray = Array.isArray(index) ? index : [];
      
      const filtered = input.eventType 
        ? indexArray.filter((e: any) => e.type === input.eventType)
        : indexArray;
      
      const sorted = filtered.sort((a: any, b: any) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      return {
        activities: sorted.slice(input.offset, input.offset + input.limit),
        total: sorted.length,
      };
    } catch (error) {
      console.error('[ANALYTICS] Failed to get activity log:', error);
      return { activities: [], total: 0, error: String(error) };
    }
  });

export const getUserStats = publicProcedure
  .input(z.object({
    period: z.enum(['day', 'week', 'month', 'year', 'all']).optional().default('week'),
  }))
  .query(async ({ input }) => {
    console.log('[ANALYTICS] Getting user stats:', input);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { stats: null, message: 'Database not configured' };
    }
    
    try {
      const now = new Date();
      let startDate: Date;
      
      switch (input.period) {
        case 'day':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = new Date(0);
      }
      
      const indexResponse = await fetch(`${dbEndpoint}/key/${dbNamespace}/analytics_index`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      const index = indexResponse.ok ? await indexResponse.json() : [];
      const indexArray = Array.isArray(index) ? index : [];
      
      const periodEvents = indexArray.filter((e: any) => 
        new Date(e.timestamp) >= startDate
      );
      
      const questsCompleted = periodEvents.filter((e: any) => e.type === 'quest_completed').length;
      const tasksCompleted = periodEvents.filter((e: any) => e.type === 'task_completed').length;
      const sessionsCount = periodEvents.filter((e: any) => e.type === 'session_start').length;
      const chatMessages = periodEvents.filter((e: any) => e.type === 'chat_message').length;
      
      return {
        stats: {
          period: input.period,
          questsCompleted,
          tasksCompleted,
          sessionsCount,
          chatMessages,
          totalEvents: periodEvents.length,
          avgEventsPerDay: periodEvents.length / Math.max(1, Math.ceil((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24))),
        },
      };
    } catch (error) {
      console.error('[ANALYTICS] Failed to get user stats:', error);
      return { stats: null, error: String(error) };
    }
  });

export const getStreaks = publicProcedure
  .input(z.object({
    streakType: z.enum(['login', 'quest', 'task', 'ritual']).optional().default('login'),
  }))
  .query(async ({ input }) => {
    console.log('[ANALYTICS] Getting streaks:', input);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { streaks: null, message: 'Database not configured' };
    }
    
    try {
      const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/streaks_${input.streakType}`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      const streakData = response.ok ? await response.json() : {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        streakHistory: [],
      };
      
      return { streaks: streakData };
    } catch (error) {
      console.error('[ANALYTICS] Failed to get streaks:', error);
      return { streaks: null, error: String(error) };
    }
  });

export const updateStreak = publicProcedure
  .input(z.object({
    streakType: z.enum(['login', 'quest', 'task', 'ritual']),
  }))
  .mutation(async ({ input }) => {
    console.log('[ANALYTICS] Updating streak:', input);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: false, message: 'Database not configured' };
    }
    
    try {
      const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/streaks_${input.streakType}`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      const streakData = response.ok ? await response.json() : {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        streakHistory: [],
      };
      
      const today = new Date().toISOString().split('T')[0];
      const lastActive = streakData.lastActiveDate;
      
      let newStreak = streakData.currentStreak;
      
      if (lastActive === today) {
        return { success: true, streaks: streakData, message: 'Already logged today' };
      }
      
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (lastActive === yesterday) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
      
      const updatedData = {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, streakData.longestStreak),
        lastActiveDate: today,
        streakHistory: [...(streakData.streakHistory || []).slice(-30), { date: today, streak: newStreak }],
      };
      
      await fetch(`${dbEndpoint}/key/${dbNamespace}/streaks_${input.streakType}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      
      return { success: true, streaks: updatedData };
    } catch (error) {
      console.error('[ANALYTICS] Failed to update streak:', error);
      return { success: false, error: String(error) };
    }
  });
