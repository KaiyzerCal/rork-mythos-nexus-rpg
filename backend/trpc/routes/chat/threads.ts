import { z } from "zod";
import { publicProcedure } from "../../create-context";

export const listThreads = publicProcedure
  .input(z.object({
    limit: z.number().optional().default(50),
    cursor: z.string().optional(),
    memberId: z.string().optional(),
  }))
  .query(async ({ input }) => {
    console.log('[BACKEND] Listing chat threads');
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { threads: [], nextCursor: null };
    }
    
    try {
      const key = input.memberId ? `threads_${input.memberId}` : 'threads_all';
      const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/${key}`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      if (!response.ok) {
        return { threads: [], nextCursor: null };
      }
      
      const data = await response.json();
      return { threads: data?.threads || [], nextCursor: null };
    } catch (error) {
      console.error('[BACKEND] Failed to list threads:', error);
      return { threads: [], nextCursor: null };
    }
  });

export const getThread = publicProcedure
  .input(z.object({
    threadId: z.string(),
  }))
  .query(async ({ input }) => {
    console.log('[BACKEND] Getting thread:', input.threadId);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { thread: null, messages: [] };
    }
    
    try {
      const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/thread_${input.threadId}`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      if (!response.ok) {
        return { thread: null, messages: [] };
      }
      
      const data = await response.json();
      return { thread: data?.thread || null, messages: data?.messages || [] };
    } catch (error) {
      console.error('[BACKEND] Failed to get thread:', error);
      return { thread: null, messages: [] };
    }
  });

export const saveThread = publicProcedure
  .input(z.object({
    threadId: z.string(),
    memberId: z.string().optional(),
    title: z.string(),
    messages: z.array(z.object({
      id: z.string(),
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
      timestamp: z.number(),
    })),
  }))
  .mutation(async ({ input }) => {
    console.log('[BACKEND] Saving thread:', input.threadId);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    const timestamp = new Date().toISOString();
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: true, savedAt: timestamp, message: 'Local mode' };
    }
    
    try {
      await fetch(`${dbEndpoint}/key/${dbNamespace}/thread_${input.threadId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          thread: {
            id: input.threadId,
            memberId: input.memberId,
            title: input.title,
            updatedAt: timestamp,
          },
          messages: input.messages,
        }),
      });
      
      if (input.memberId) {
        const threadsKey = `threads_${input.memberId}`;
        const existingResponse = await fetch(`${dbEndpoint}/key/${dbNamespace}/${threadsKey}`, {
          headers: { 'Authorization': `Bearer ${dbToken}` },
        });
        
        let threads: any[] = [];
        if (existingResponse.ok) {
          const data = await existingResponse.json();
          threads = data?.threads || [];
        }
        
        const existingIndex = threads.findIndex((t: any) => t.id === input.threadId);
        const threadEntry = { id: input.threadId, title: input.title, updatedAt: timestamp };
        
        if (existingIndex >= 0) {
          threads[existingIndex] = threadEntry;
        } else {
          threads.unshift(threadEntry);
        }
        
        await fetch(`${dbEndpoint}/key/${dbNamespace}/${threadsKey}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${dbToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ threads }),
        });
      }
      
      return { success: true, savedAt: timestamp, message: 'Thread saved' };
    } catch (error) {
      console.error('[BACKEND] Failed to save thread:', error);
      return { success: false, savedAt: timestamp, error: String(error) };
    }
  });

export const appendMessage = publicProcedure
  .input(z.object({
    threadId: z.string(),
    message: z.object({
      id: z.string(),
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
      timestamp: z.number(),
    }),
  }))
  .mutation(async ({ input }) => {
    console.log('[BACKEND] Appending message to thread:', input.threadId);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: true, messageId: input.message.id };
    }
    
    try {
      const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/thread_${input.threadId}`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      let thread = { id: input.threadId, title: 'Chat', updatedAt: new Date().toISOString() };
      let messages: any[] = [];
      
      if (response.ok) {
        const data = await response.json();
        thread = data?.thread || thread;
        messages = data?.messages || [];
      }
      
      messages.push(input.message);
      
      await fetch(`${dbEndpoint}/key/${dbNamespace}/thread_${input.threadId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ thread, messages }),
      });
      
      return { success: true, messageId: input.message.id };
    } catch (error) {
      console.error('[BACKEND] Failed to append message:', error);
      return { success: false, messageId: input.message.id, error: String(error) };
    }
  });
