import { z } from "zod";
import { publicProcedure } from "../../create-context";

export const searchMemory = publicProcedure
  .input(z.object({
    query: z.string(),
    scope: z.enum(['global', 'chat', 'council', 'vault', 'all']).optional().default('all'),
    limit: z.number().optional().default(20),
    tags: z.array(z.string()).optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  }))
  .query(async ({ input }) => {
    console.log('[MEMORY] Searching memory:', input);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { results: [], total: 0, message: 'Database not configured' };
    }
    
    try {
      const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/memory_index`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      const allMemories = response.ok ? await response.json() : [];
      const memoriesArray = Array.isArray(allMemories) ? allMemories : [];
      
      const queryLower = input.query.toLowerCase();
      const filtered = memoriesArray.filter((mem: any) => {
        const matchesQuery = 
          mem.content?.toLowerCase().includes(queryLower) ||
          mem.key?.toLowerCase().includes(queryLower) ||
          mem.tags?.some((t: string) => t.toLowerCase().includes(queryLower));
        
        const matchesScope = input.scope === 'all' || mem.scope === input.scope;
        
        const matchesTags = !input.tags?.length || 
          input.tags.some(tag => mem.tags?.includes(tag));
        
        const matchesDateFrom = !input.dateFrom || 
          new Date(mem.created_at) >= new Date(input.dateFrom);
        
        const matchesDateTo = !input.dateTo || 
          new Date(mem.created_at) <= new Date(input.dateTo);
        
        return matchesQuery && matchesScope && matchesTags && matchesDateFrom && matchesDateTo;
      });
      
      return {
        results: filtered.slice(0, input.limit),
        total: filtered.length,
        query: input.query,
      };
    } catch (error) {
      console.error('[MEMORY] Failed to search memory:', error);
      return { results: [], total: 0, error: String(error) };
    }
  });

export const deleteMemoryFact = publicProcedure
  .input(z.object({
    key: z.string(),
    scope: z.string().optional().default('global'),
    hardDelete: z.boolean().optional().default(false),
  }))
  .mutation(async ({ input }) => {
    console.log('[MEMORY] Deleting memory fact:', input);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: false, message: 'Database not configured' };
    }
    
    try {
      const memoryKey = `memory_${input.scope}_${input.key}`;
      
      if (input.hardDelete) {
        await fetch(`${dbEndpoint}/key/${dbNamespace}/${memoryKey}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${dbToken}` },
        });
      } else {
        const existingResponse = await fetch(`${dbEndpoint}/key/${dbNamespace}/${memoryKey}`, {
          headers: { 'Authorization': `Bearer ${dbToken}` },
        });
        
        if (existingResponse.ok) {
          const existing = await existingResponse.json();
          await fetch(`${dbEndpoint}/key/${dbNamespace}/${memoryKey}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${dbToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...existing,
              archived: true,
              archived_at: new Date().toISOString(),
            }),
          });
        }
      }
      
      return { success: true, key: input.key };
    } catch (error) {
      console.error('[MEMORY] Failed to delete memory:', error);
      return { success: false, error: String(error) };
    }
  });

export const archiveMemory = publicProcedure
  .input(z.object({
    keys: z.array(z.string()),
    scope: z.string().optional().default('global'),
    archiveReason: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    console.log('[MEMORY] Archiving memories:', input);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: false, archived: 0, message: 'Database not configured' };
    }
    
    let archivedCount = 0;
    
    try {
      for (const key of input.keys) {
        const memoryKey = `memory_${input.scope}_${key}`;
        const existingResponse = await fetch(`${dbEndpoint}/key/${dbNamespace}/${memoryKey}`, {
          headers: { 'Authorization': `Bearer ${dbToken}` },
        });
        
        if (existingResponse.ok) {
          const existing = await existingResponse.json();
          await fetch(`${dbEndpoint}/key/${dbNamespace}/${memoryKey}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${dbToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...existing,
              archived: true,
              archived_at: new Date().toISOString(),
              archive_reason: input.archiveReason,
            }),
          });
          archivedCount++;
        }
      }
      
      return { success: true, archived: archivedCount };
    } catch (error) {
      console.error('[MEMORY] Failed to archive memories:', error);
      return { success: false, archived: archivedCount, error: String(error) };
    }
  });

export const getMemoryStats = publicProcedure
  .input(z.object({
    scope: z.string().optional().default('all'),
  }))
  .query(async ({ input }) => {
    console.log('[MEMORY] Getting memory stats:', input);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { stats: null, message: 'Database not configured' };
    }
    
    try {
      const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/memory_stats`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      const stats = response.ok ? await response.json() : {
        totalFacts: 0,
        totalPreferences: 0,
        totalArcs: 0,
        byScope: {},
        lastUpdated: new Date().toISOString(),
      };
      
      return { stats };
    } catch (error) {
      console.error('[MEMORY] Failed to get stats:', error);
      return { stats: null, error: String(error) };
    }
  });

export const exportMemory = publicProcedure
  .input(z.object({
    scope: z.string().optional().default('all'),
    format: z.enum(['json', 'csv']).optional().default('json'),
    includeArchived: z.boolean().optional().default(false),
  }))
  .query(async ({ input }) => {
    console.log('[MEMORY] Exporting memory:', input);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { data: null, message: 'Database not configured' };
    }
    
    try {
      const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/memory_index`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      const allMemories = response.ok ? await response.json() : [];
      const memoriesArray = Array.isArray(allMemories) ? allMemories : [];
      
      const filtered = memoriesArray.filter((mem: any) => {
        const matchesScope = input.scope === 'all' || mem.scope === input.scope;
        const matchesArchived = input.includeArchived || !mem.archived;
        return matchesScope && matchesArchived;
      });
      
      if (input.format === 'csv') {
        const headers = ['key', 'value', 'scope', 'confidence', 'created_at', 'archived'];
        const rows = filtered.map((mem: any) => 
          [mem.key, mem.value, mem.scope, mem.confidence, mem.created_at, mem.archived].join(',')
        );
        return { data: [headers.join(','), ...rows].join('\n'), format: 'csv' };
      }
      
      return { data: JSON.stringify(filtered, null, 2), format: 'json' };
    } catch (error) {
      console.error('[MEMORY] Failed to export memory:', error);
      return { data: null, error: String(error) };
    }
  });

export const importMemory = publicProcedure
  .input(z.object({
    data: z.string(),
    format: z.enum(['json']),
    mergeStrategy: z.enum(['overwrite', 'skip', 'merge']).optional().default('merge'),
  }))
  .mutation(async ({ input }) => {
    console.log('[MEMORY] Importing memory:', input.mergeStrategy);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: false, imported: 0, message: 'Database not configured' };
    }
    
    try {
      const memories = JSON.parse(input.data);
      let importedCount = 0;
      
      for (const mem of memories) {
        const memoryKey = `memory_${mem.scope || 'global'}_${mem.key}`;
        
        if (input.mergeStrategy === 'skip') {
          const existingResponse = await fetch(`${dbEndpoint}/key/${dbNamespace}/${memoryKey}`, {
            headers: { 'Authorization': `Bearer ${dbToken}` },
          });
          if (existingResponse.ok) continue;
        }
        
        await fetch(`${dbEndpoint}/key/${dbNamespace}/${memoryKey}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${dbToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...mem,
            imported_at: new Date().toISOString(),
          }),
        });
        importedCount++;
      }
      
      return { success: true, imported: importedCount };
    } catch (error) {
      console.error('[MEMORY] Failed to import memory:', error);
      return { success: false, imported: 0, error: String(error) };
    }
  });
