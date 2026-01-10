import { z } from "zod";
import { publicProcedure } from "../../create-context";

export const createReminder = publicProcedure
  .input(z.object({
    title: z.string(),
    body: z.string().optional(),
    type: z.enum(['quest', 'task', 'ritual', 'event', 'custom']),
    linkedId: z.string().optional(),
    triggerAt: z.string(),
    repeatInterval: z.enum(['none', 'daily', 'weekly', 'monthly']).optional().default('none'),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).optional().default('normal'),
    sound: z.boolean().optional().default(true),
    vibrate: z.boolean().optional().default(true),
  }))
  .mutation(async ({ input }) => {
    console.log('[REMINDERS] Creating reminder:', input.title);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: false, message: 'Database not configured' };
    }
    
    try {
      const reminderId = `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      
      const reminder = {
        id: reminderId,
        ...input,
        isActive: true,
        created_at: now,
        updated_at: now,
      };
      
      await fetch(`${dbEndpoint}/key/${dbNamespace}/${reminderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reminder),
      });
      
      const indexResponse = await fetch(`${dbEndpoint}/key/${dbNamespace}/reminders_index`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      const index = indexResponse.ok ? await indexResponse.json() : [];
      const indexArray = Array.isArray(index) ? index : [];
      
      await fetch(`${dbEndpoint}/key/${dbNamespace}/reminders_index`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...indexArray, { id: reminderId, title: input.title, triggerAt: input.triggerAt, type: input.type }]),
      });
      
      return { success: true, reminderId, reminder };
    } catch (error) {
      console.error('[REMINDERS] Failed to create reminder:', error);
      return { success: false, error: String(error) };
    }
  });

export const listReminders = publicProcedure
  .input(z.object({
    type: z.enum(['quest', 'task', 'ritual', 'event', 'custom', 'all']).optional().default('all'),
    activeOnly: z.boolean().optional().default(true),
    upcoming: z.boolean().optional().default(false),
  }))
  .query(async ({ input }) => {
    console.log('[REMINDERS] Listing reminders:', input);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { reminders: [], message: 'Database not configured' };
    }
    
    try {
      const indexResponse = await fetch(`${dbEndpoint}/key/${dbNamespace}/reminders_index`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      const index = indexResponse.ok ? await indexResponse.json() : [];
      const indexArray = Array.isArray(index) ? index : [];
      
      const reminders = [];
      for (const item of indexArray) {
        const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/${item.id}`, {
          headers: { 'Authorization': `Bearer ${dbToken}` },
        });
        if (response.ok) {
          const reminder = await response.json();
          
          const matchesType = input.type === 'all' || reminder.type === input.type;
          const matchesActive = !input.activeOnly || reminder.isActive;
          const matchesUpcoming = !input.upcoming || new Date(reminder.triggerAt) > new Date();
          
          if (matchesType && matchesActive && matchesUpcoming) {
            reminders.push(reminder);
          }
        }
      }
      
      reminders.sort((a, b) => new Date(a.triggerAt).getTime() - new Date(b.triggerAt).getTime());
      
      return { reminders };
    } catch (error) {
      console.error('[REMINDERS] Failed to list reminders:', error);
      return { reminders: [], error: String(error) };
    }
  });

export const updateReminder = publicProcedure
  .input(z.object({
    reminderId: z.string(),
    patch: z.object({
      title: z.string().optional(),
      body: z.string().optional(),
      triggerAt: z.string().optional(),
      repeatInterval: z.enum(['none', 'daily', 'weekly', 'monthly']).optional(),
      isActive: z.boolean().optional(),
      priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
      sound: z.boolean().optional(),
      vibrate: z.boolean().optional(),
    }),
  }))
  .mutation(async ({ input }) => {
    console.log('[REMINDERS] Updating reminder:', input.reminderId);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: false, message: 'Database not configured' };
    }
    
    try {
      const existingResponse = await fetch(`${dbEndpoint}/key/${dbNamespace}/${input.reminderId}`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      if (!existingResponse.ok) {
        return { success: false, message: 'Reminder not found' };
      }
      
      const existing = await existingResponse.json();
      const updated = {
        ...existing,
        ...input.patch,
        updated_at: new Date().toISOString(),
      };
      
      await fetch(`${dbEndpoint}/key/${dbNamespace}/${input.reminderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updated),
      });
      
      return { success: true, reminder: updated };
    } catch (error) {
      console.error('[REMINDERS] Failed to update reminder:', error);
      return { success: false, error: String(error) };
    }
  });

export const deleteReminder = publicProcedure
  .input(z.object({
    reminderId: z.string(),
  }))
  .mutation(async ({ input }) => {
    console.log('[REMINDERS] Deleting reminder:', input.reminderId);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: false, message: 'Database not configured' };
    }
    
    try {
      await fetch(`${dbEndpoint}/key/${dbNamespace}/${input.reminderId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      const indexResponse = await fetch(`${dbEndpoint}/key/${dbNamespace}/reminders_index`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      const index = indexResponse.ok ? await indexResponse.json() : [];
      const indexArray = Array.isArray(index) ? index : [];
      
      const updatedIndex = indexArray.filter((item: any) => item.id !== input.reminderId);
      
      await fetch(`${dbEndpoint}/key/${dbNamespace}/reminders_index`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedIndex),
      });
      
      return { success: true };
    } catch (error) {
      console.error('[REMINDERS] Failed to delete reminder:', error);
      return { success: false, error: String(error) };
    }
  });

export const snoozeReminder = publicProcedure
  .input(z.object({
    reminderId: z.string(),
    snoozeMinutes: z.number().min(1).max(1440),
  }))
  .mutation(async ({ input }) => {
    console.log('[REMINDERS] Snoozing reminder:', input.reminderId, 'for', input.snoozeMinutes, 'minutes');
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: false, message: 'Database not configured' };
    }
    
    try {
      const existingResponse = await fetch(`${dbEndpoint}/key/${dbNamespace}/${input.reminderId}`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      if (!existingResponse.ok) {
        return { success: false, message: 'Reminder not found' };
      }
      
      const existing = await existingResponse.json();
      const newTriggerAt = new Date(Date.now() + input.snoozeMinutes * 60 * 1000).toISOString();
      
      const updated = {
        ...existing,
        triggerAt: newTriggerAt,
        snoozedAt: new Date().toISOString(),
        snoozeCount: (existing.snoozeCount || 0) + 1,
        updated_at: new Date().toISOString(),
      };
      
      await fetch(`${dbEndpoint}/key/${dbNamespace}/${input.reminderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updated),
      });
      
      return { success: true, newTriggerAt, reminder: updated };
    } catch (error) {
      console.error('[REMINDERS] Failed to snooze reminder:', error);
      return { success: false, error: String(error) };
    }
  });

export const getDueReminders = publicProcedure
  .input(z.object({
    withinMinutes: z.number().optional().default(60),
  }))
  .query(async ({ input }) => {
    console.log('[REMINDERS] Getting due reminders within', input.withinMinutes, 'minutes');
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { reminders: [], message: 'Database not configured' };
    }
    
    try {
      const indexResponse = await fetch(`${dbEndpoint}/key/${dbNamespace}/reminders_index`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      const index = indexResponse.ok ? await indexResponse.json() : [];
      const indexArray = Array.isArray(index) ? index : [];
      
      const now = Date.now();
      const cutoff = now + input.withinMinutes * 60 * 1000;
      
      const dueReminders = [];
      for (const item of indexArray) {
        const triggerTime = new Date(item.triggerAt).getTime();
        if (triggerTime >= now && triggerTime <= cutoff) {
          const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/${item.id}`, {
            headers: { 'Authorization': `Bearer ${dbToken}` },
          });
          if (response.ok) {
            const reminder = await response.json();
            if (reminder.isActive) {
              dueReminders.push(reminder);
            }
          }
        }
      }
      
      dueReminders.sort((a, b) => new Date(a.triggerAt).getTime() - new Date(b.triggerAt).getTime());
      
      return { reminders: dueReminders };
    } catch (error) {
      console.error('[REMINDERS] Failed to get due reminders:', error);
      return { reminders: [], error: String(error) };
    }
  });
