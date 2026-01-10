import { z } from "zod";
import { publicProcedure } from "../../create-context";

export const listVaultEntries = publicProcedure
  .input(z.object({
    limit: z.number().optional().default(50),
    cursor: z.string().optional(),
    category: z.string().optional(),
  }))
  .query(async ({ input }) => {
    console.log('[BACKEND] Listing vault entries');
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { entries: [], nextCursor: null };
    }
    
    try {
      const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/vault_entries`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      if (!response.ok) {
        return { entries: [], nextCursor: null };
      }
      
      const data = await response.json();
      let entries = data?.entries || [];
      
      if (input.category) {
        entries = entries.filter((e: any) => e.category === input.category);
      }
      
      return { entries: entries.slice(0, input.limit), nextCursor: null };
    } catch (error) {
      console.error('[BACKEND] Failed to list vault entries:', error);
      return { entries: [], nextCursor: null };
    }
  });

export const createVaultEntry = publicProcedure
  .input(z.object({
    title: z.string(),
    body: z.string(),
    category: z.string(),
    importance: z.string(),
    tags: z.array(z.string()).optional(),
    linkedQuestId: z.string().optional(),
    linkedThreadId: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    console.log('[BACKEND] Creating vault entry:', input.title);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    const entryId = `vault_${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: true, entryId, message: 'Local mode' };
    }
    
    try {
      const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/vault_entries`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      let entries: any[] = [];
      if (response.ok) {
        const data = await response.json();
        entries = data?.entries || [];
      }
      
      entries.unshift({
        id: entryId,
        ...input,
        tags: input.tags || [],
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      
      await fetch(`${dbEndpoint}/key/${dbNamespace}/vault_entries`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entries }),
      });
      
      return { success: true, entryId, message: 'Entry created' };
    } catch (error) {
      console.error('[BACKEND] Failed to create vault entry:', error);
      return { success: false, entryId, error: String(error) };
    }
  });

export const updateVaultEntry = publicProcedure
  .input(z.object({
    entryId: z.string(),
    updates: z.object({
      title: z.string().optional(),
      body: z.string().optional(),
      category: z.string().optional(),
      importance: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }),
  }))
  .mutation(async ({ input }) => {
    console.log('[BACKEND] Updating vault entry:', input.entryId);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: true, message: 'Local mode' };
    }
    
    try {
      const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/vault_entries`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      if (!response.ok) {
        return { success: false, message: 'No entries found' };
      }
      
      const data = await response.json();
      let entries = data?.entries || [];
      
      entries = entries.map((e: any) =>
        e.id === input.entryId
          ? { ...e, ...input.updates, updatedAt: new Date().toISOString() }
          : e
      );
      
      await fetch(`${dbEndpoint}/key/${dbNamespace}/vault_entries`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entries }),
      });
      
      return { success: true, message: 'Entry updated' };
    } catch (error) {
      console.error('[BACKEND] Failed to update vault entry:', error);
      return { success: false, error: String(error) };
    }
  });

export const deleteVaultEntry = publicProcedure
  .input(z.object({
    entryId: z.string(),
  }))
  .mutation(async ({ input }) => {
    console.log('[BACKEND] Deleting vault entry:', input.entryId);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: true, message: 'Local mode' };
    }
    
    try {
      const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/vault_entries`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      if (!response.ok) {
        return { success: false, message: 'No entries found' };
      }
      
      const data = await response.json();
      let entries = (data?.entries || []).filter((e: any) => e.id !== input.entryId);
      
      await fetch(`${dbEndpoint}/key/${dbNamespace}/vault_entries`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entries }),
      });
      
      return { success: true, message: 'Entry deleted' };
    } catch (error) {
      console.error('[BACKEND] Failed to delete vault entry:', error);
      return { success: false, error: String(error) };
    }
  });
