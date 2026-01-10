import { z } from "zod";
import { publicProcedure } from "../../create-context";

export const getAppleIntegrationStatus = publicProcedure
  .input(z.object({
    provider: z.enum(['apple', 'icloud', 'apple-calendar', 'apple-reminders', 'apple-notes', 'healthkit']),
  }))
  .query(async ({ input }) => {
    console.log('[BACKEND] Checking Apple integration status for:', input.provider);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return {
        provider: input.provider,
        connected: false,
        lastSyncAt: null,
        scopes: [],
        message: 'Database not configured',
      };
    }
    
    try {
      const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/apple_integration_${input.provider}`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      if (!response.ok) {
        return {
          provider: input.provider,
          connected: false,
          lastSyncAt: null,
          scopes: [],
        };
      }
      
      const data = await response.json();
      return {
        provider: input.provider,
        connected: data?.enabled || false,
        lastSyncAt: data?.lastSyncAt || null,
        scopes: data?.scopes || [],
        userId: data?.userId || null,
      };
    } catch (error) {
      console.error('[BACKEND] Failed to check Apple integration:', error);
      return {
        provider: input.provider,
        connected: false,
        lastSyncAt: null,
        scopes: [],
      };
    }
  });

export const saveAppleIntegrationTokens = publicProcedure
  .input(z.object({
    provider: z.enum(['apple', 'icloud', 'apple-calendar', 'apple-reminders', 'apple-notes', 'healthkit']),
    identityToken: z.string(),
    authorizationCode: z.string(),
    userId: z.string().optional(),
    email: z.string().optional(),
    fullName: z.object({
      givenName: z.string().nullable().optional(),
      familyName: z.string().nullable().optional(),
    }).optional(),
    scopes: z.array(z.string()),
  }))
  .mutation(async ({ input }) => {
    console.log('[BACKEND] Saving Apple integration tokens for:', input.provider);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: false, message: 'Database not configured' };
    }
    
    try {
      await fetch(`${dbEndpoint}/key/${dbNamespace}/apple_integration_${input.provider}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: input.provider,
          identityToken: input.identityToken,
          authorizationCode: input.authorizationCode,
          userId: input.userId,
          email: input.email,
          fullName: input.fullName,
          scopes: input.scopes,
          enabled: true,
          updatedAt: new Date().toISOString(),
        }),
      });
      
      return { success: true, message: 'Apple integration saved' };
    } catch (error) {
      console.error('[BACKEND] Failed to save Apple integration:', error);
      return { success: false, error: String(error) };
    }
  });

export const disconnectAppleIntegration = publicProcedure
  .input(z.object({
    provider: z.enum(['apple', 'icloud', 'apple-calendar', 'apple-reminders', 'apple-notes', 'healthkit']),
  }))
  .mutation(async ({ input }) => {
    console.log('[BACKEND] Disconnecting Apple integration:', input.provider);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: false, message: 'Database not configured' };
    }
    
    try {
      await fetch(`${dbEndpoint}/key/${dbNamespace}/apple_integration_${input.provider}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      return { success: true, message: 'Apple integration disconnected' };
    } catch (error) {
      console.error('[BACKEND] Failed to disconnect Apple integration:', error);
      return { success: false, error: String(error) };
    }
  });

export const syncAppleCalendar = publicProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    console.log('[BACKEND] Syncing Apple Calendar events:', input);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: false, events: [], message: 'Database not configured' };
    }
    
    try {
      const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/apple_calendar_events`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      const events = response.ok ? await response.json() : [];
      
      return {
        success: true,
        events: Array.isArray(events) ? events : [],
        syncedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[BACKEND] Failed to sync Apple Calendar:', error);
      return { success: false, events: [], error: String(error) };
    }
  });

export const syncAppleReminders = publicProcedure
  .input(z.object({
    listId: z.string().optional(),
  }))
  .query(async ({ input }) => {
    console.log('[BACKEND] Fetching Apple Reminders:', input);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: false, reminders: [], message: 'Database not configured' };
    }
    
    try {
      const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/apple_reminders`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      const reminders = response.ok ? await response.json() : [];
      
      return {
        success: true,
        reminders: Array.isArray(reminders) ? reminders : [],
        syncedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[BACKEND] Failed to fetch Apple Reminders:', error);
      return { success: false, reminders: [], error: String(error) };
    }
  });

export const syncHealthKit = publicProcedure
  .input(z.object({
    dataTypes: z.array(z.enum([
      'steps',
      'heartRate',
      'sleep',
      'calories',
      'distance',
      'workouts',
      'weight',
      'bloodPressure',
    ])).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    console.log('[BACKEND] Syncing HealthKit data:', input);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: false, data: {}, message: 'Database not configured' };
    }
    
    try {
      const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/healthkit_data`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      const healthData = response.ok ? await response.json() : {};
      
      return {
        success: true,
        data: healthData,
        syncedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[BACKEND] Failed to sync HealthKit:', error);
      return { success: false, data: {}, error: String(error) };
    }
  });
