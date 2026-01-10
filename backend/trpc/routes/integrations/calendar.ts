import { z } from "zod";
import { publicProcedure } from "../../create-context";

export const listCalendarEvents = publicProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    limit: z.number().optional().default(50),
  }))
  .query(async ({ input }) => {
    console.log('[BACKEND] Listing calendar events');
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { events: [], synced: false };
    }
    
    try {
      const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/calendar_events`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      if (!response.ok) {
        return { events: [], synced: false };
      }
      
      const data = await response.json();
      let events = data?.events || [];
      
      if (input.startDate) {
        const startDate = input.startDate;
        events = events.filter((e: any) => e.startTime >= startDate);
      }
      if (input.endDate) {
        const endDate = input.endDate;
        events = events.filter((e: any) => e.startTime <= endDate);
      }
      
      return { events: events.slice(0, input.limit), synced: true };
    } catch (error) {
      console.error('[BACKEND] Failed to list calendar events:', error);
      return { events: [], synced: false };
    }
  });

export const createCalendarEvent = publicProcedure
  .input(z.object({
    title: z.string(),
    description: z.string().optional(),
    startTime: z.string(),
    endTime: z.string(),
    location: z.string().optional(),
    linkedQuestId: z.string().optional(),
    linkedTaskId: z.string().optional(),
    reminders: z.array(z.object({
      method: z.string(),
      minutes: z.number(),
    })).optional(),
  }))
  .mutation(async ({ input }) => {
    console.log('[BACKEND] Creating calendar event:', input.title);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    const eventId = `event_${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: true, eventId, message: 'Local mode' };
    }
    
    try {
      const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/calendar_events`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      let events: any[] = [];
      if (response.ok) {
        const data = await response.json();
        events = data?.events || [];
      }
      
      events.push({
        id: eventId,
        ...input,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      
      await fetch(`${dbEndpoint}/key/${dbNamespace}/calendar_events`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      });
      
      return { success: true, eventId, message: 'Event created' };
    } catch (error) {
      console.error('[BACKEND] Failed to create event:', error);
      return { success: false, eventId, error: String(error) };
    }
  });

export const updateCalendarEvent = publicProcedure
  .input(z.object({
    eventId: z.string(),
    updates: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      location: z.string().optional(),
      linkedQuestId: z.string().optional(),
      linkedTaskId: z.string().optional(),
    }),
  }))
  .mutation(async ({ input }) => {
    console.log('[BACKEND] Updating calendar event:', input.eventId);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: true, message: 'Local mode' };
    }
    
    try {
      const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/calendar_events`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      if (!response.ok) {
        return { success: false, message: 'No events found' };
      }
      
      const data = await response.json();
      let events = data?.events || [];
      
      events = events.map((e: any) =>
        e.id === input.eventId
          ? { ...e, ...input.updates, updatedAt: new Date().toISOString() }
          : e
      );
      
      await fetch(`${dbEndpoint}/key/${dbNamespace}/calendar_events`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      });
      
      return { success: true, message: 'Event updated' };
    } catch (error) {
      console.error('[BACKEND] Failed to update event:', error);
      return { success: false, error: String(error) };
    }
  });

export const deleteCalendarEvent = publicProcedure
  .input(z.object({
    eventId: z.string(),
  }))
  .mutation(async ({ input }) => {
    console.log('[BACKEND] Deleting calendar event:', input.eventId);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: true, message: 'Local mode' };
    }
    
    try {
      const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/calendar_events`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      if (!response.ok) {
        return { success: false, message: 'No events found' };
      }
      
      const data = await response.json();
      let events = (data?.events || []).filter((e: any) => e.id !== input.eventId);
      
      await fetch(`${dbEndpoint}/key/${dbNamespace}/calendar_events`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      });
      
      return { success: true, message: 'Event deleted' };
    } catch (error) {
      console.error('[BACKEND] Failed to delete event:', error);
      return { success: false, error: String(error) };
    }
  });
