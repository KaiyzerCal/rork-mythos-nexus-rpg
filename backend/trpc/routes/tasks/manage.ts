import { z } from "zod";
import { publicProcedure } from "../../create-context";

export const listTasks = publicProcedure
  .input(z.object({
    status: z.string().optional(),
    type: z.string().optional(),
  }).optional())
  .query(async ({ input }) => {
    console.log('[BACKEND] Listing tasks');
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { tasks: [] };
    }
    
    try {
      const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/tasks_data`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      if (!response.ok) {
        return { tasks: [] };
      }
      
      const data = await response.json();
      let tasks = data?.tasks || [];
      
      if (input?.status) {
        tasks = tasks.filter((t: any) => t.status === input.status);
      }
      if (input?.type) {
        tasks = tasks.filter((t: any) => t.type === input.type);
      }
      
      return { tasks };
    } catch (error) {
      console.error('[BACKEND] Failed to list tasks:', error);
      return { tasks: [] };
    }
  });

export const saveTasks = publicProcedure
  .input(z.object({
    tasks: z.array(z.any()),
  }))
  .mutation(async ({ input }) => {
    console.log('[BACKEND] Saving tasks, count:', input.tasks.length);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: true, message: 'Local mode' };
    }
    
    try {
      await fetch(`${dbEndpoint}/key/${dbNamespace}/tasks_data`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tasks: input.tasks,
          updatedAt: new Date().toISOString(),
        }),
      });
      
      return { success: true, message: 'Tasks saved' };
    } catch (error) {
      console.error('[BACKEND] Failed to save tasks:', error);
      return { success: false, error: String(error) };
    }
  });

export const createTask = publicProcedure
  .input(z.object({
    title: z.string(),
    description: z.string().optional(),
    type: z.string(),
    recurrence: z.string(),
    xpReward: z.number(),
    skillXpReward: z.number().optional(),
    linkedSkillId: z.string().optional(),
    linkedSubSkillId: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    console.log('[BACKEND] Creating task:', input.title);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    const taskId = `task_${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: true, taskId, message: 'Local mode' };
    }
    
    try {
      const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/tasks_data`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      let tasks: any[] = [];
      if (response.ok) {
        const data = await response.json();
        tasks = data?.tasks || [];
      }
      
      tasks.push({
        id: taskId,
        ...input,
        status: 'active',
        streak: 0,
        completedCount: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      
      await fetch(`${dbEndpoint}/key/${dbNamespace}/tasks_data`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tasks, updatedAt: timestamp }),
      });
      
      return { success: true, taskId, message: 'Task created' };
    } catch (error) {
      console.error('[BACKEND] Failed to create task:', error);
      return { success: false, taskId, error: String(error) };
    }
  });

export const completeTask = publicProcedure
  .input(z.object({
    taskId: z.string(),
  }))
  .mutation(async ({ input }) => {
    console.log('[BACKEND] Completing task:', input.taskId);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: true, message: 'Local mode' };
    }
    
    try {
      const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/tasks_data`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      if (!response.ok) {
        return { success: false, message: 'No tasks found' };
      }
      
      const data = await response.json();
      const timestamp = new Date().toISOString();
      
      const tasks = (data?.tasks || []).map((t: any) => {
        if (t.id !== input.taskId) return t;
        
        return {
          ...t,
          status: t.recurrence === 'once' ? 'completed' : 'active',
          completedCount: (t.completedCount || 0) + 1,
          lastCompleted: timestamp,
          streak: (t.streak || 0) + 1,
          updatedAt: timestamp,
        };
      });
      
      await fetch(`${dbEndpoint}/key/${dbNamespace}/tasks_data`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tasks, updatedAt: timestamp }),
      });
      
      return { success: true, message: 'Task completed' };
    } catch (error) {
      console.error('[BACKEND] Failed to complete task:', error);
      return { success: false, error: String(error) };
    }
  });

export const deleteTask = publicProcedure
  .input(z.object({
    taskId: z.string(),
  }))
  .mutation(async ({ input }) => {
    console.log('[BACKEND] Deleting task:', input.taskId);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: true, message: 'Local mode' };
    }
    
    try {
      const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/tasks_data`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      if (!response.ok) {
        return { success: false, message: 'No tasks found' };
      }
      
      const data = await response.json();
      const tasks = (data?.tasks || []).filter((t: any) => t.id !== input.taskId);
      
      await fetch(`${dbEndpoint}/key/${dbNamespace}/tasks_data`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tasks, updatedAt: new Date().toISOString() }),
      });
      
      return { success: true, message: 'Task deleted' };
    } catch (error) {
      console.error('[BACKEND] Failed to delete task:', error);
      return { success: false, error: String(error) };
    }
  });
