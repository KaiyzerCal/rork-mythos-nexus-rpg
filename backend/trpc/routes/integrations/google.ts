import { z } from "zod";
import { publicProcedure } from "../../create-context";

export const getIntegrationStatus = publicProcedure
  .input(z.object({
    provider: z.enum(['google', 'gmail', 'calendar', 'drive', 'sheets']),
  }))
  .query(async ({ input }) => {
    console.log('[BACKEND] Checking integration status for:', input.provider);
    
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
      const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/integration_${input.provider}`, {
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
      };
    } catch (error) {
      console.error('[BACKEND] Failed to check integration:', error);
      return {
        provider: input.provider,
        connected: false,
        lastSyncAt: null,
        scopes: [],
      };
    }
  });

export const saveIntegrationTokens = publicProcedure
  .input(z.object({
    provider: z.enum(['google', 'gmail', 'calendar', 'drive', 'sheets']),
    accessToken: z.string(),
    refreshToken: z.string().optional(),
    expiresAt: z.string().optional(),
    scopes: z.array(z.string()),
  }))
  .mutation(async ({ input }) => {
    console.log('[BACKEND] Saving integration tokens for:', input.provider);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: false, message: 'Database not configured' };
    }
    
    try {
      await fetch(`${dbEndpoint}/key/${dbNamespace}/integration_${input.provider}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: input.provider,
          accessToken: input.accessToken,
          refreshToken: input.refreshToken,
          expiresAt: input.expiresAt,
          scopes: input.scopes,
          enabled: true,
          updatedAt: new Date().toISOString(),
        }),
      });
      
      return { success: true, message: 'Integration saved' };
    } catch (error) {
      console.error('[BACKEND] Failed to save integration:', error);
      return { success: false, error: String(error) };
    }
  });

export const disconnectIntegration = publicProcedure
  .input(z.object({
    provider: z.enum(['google', 'gmail', 'calendar', 'drive', 'sheets']),
  }))
  .mutation(async ({ input }) => {
    console.log('[BACKEND] Disconnecting integration:', input.provider);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: false, message: 'Database not configured' };
    }
    
    try {
      await fetch(`${dbEndpoint}/key/${dbNamespace}/integration_${input.provider}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      return { success: true, message: 'Integration disconnected' };
    } catch (error) {
      console.error('[BACKEND] Failed to disconnect integration:', error);
      return { success: false, error: String(error) };
    }
  });
