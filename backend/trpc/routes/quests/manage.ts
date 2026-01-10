import { z } from "zod";
import { publicProcedure } from "../../create-context";

export const getQuest = publicProcedure
  .input(z.object({ questId: z.string() }))
  .query(async ({ input }) => {
    console.log('[QUEST] Fetching quest:', input.questId);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { quest: null, message: 'Database not configured' };
    }
    
    try {
      const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/quest_${input.questId}`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      if (!response.ok) {
        return { quest: null };
      }
      
      const quest = await response.json();
      return { quest };
    } catch (error) {
      console.error('[QUEST] Failed to fetch quest:', error);
      return { quest: null, error: String(error) };
    }
  });

export const updateQuest = publicProcedure
  .input(z.object({
    questId: z.string(),
    patch: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      difficulty: z.number().min(1).max(10).optional(),
      status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED']).optional(),
      xp_reward: z.number().optional(),
      loot_reward: z.array(z.object({
        type: z.string(),
        name: z.string(),
        amount: z.number(),
      })).optional(),
      codex_points_reward: z.number().optional(),
      black_sun_essence_reward: z.number().optional(),
      stat_targets: z.array(z.object({
        stat: z.string(),
        value: z.number(),
      })).optional(),
      skill_links: z.array(z.object({
        skillId: z.string(),
        xpReward: z.number(),
      })).optional(),
      progress: z.object({
        current: z.number(),
        target: z.number(),
      }).optional(),
      subtasks: z.array(z.object({
        id: z.string(),
        title: z.string(),
        completed: z.boolean(),
      })).optional(),
      due_at: z.string().nullable().optional(),
    }),
  }))
  .mutation(async ({ input }) => {
    console.log('[QUEST] Updating quest:', input.questId, input.patch);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: false, message: 'Database not configured' };
    }
    
    try {
      const existingResponse = await fetch(`${dbEndpoint}/key/${dbNamespace}/quest_${input.questId}`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      const existingQuest = existingResponse.ok ? await existingResponse.json() : {};
      
      const updatedQuest = {
        ...existingQuest,
        ...input.patch,
        id: input.questId,
        updated_at: new Date().toISOString(),
      };
      
      await fetch(`${dbEndpoint}/key/${dbNamespace}/quest_${input.questId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedQuest),
      });
      
      return {
        success: true,
        quest_id: input.questId,
        updated_at: updatedQuest.updated_at,
      };
    } catch (error) {
      console.error('[QUEST] Failed to update quest:', error);
      return { success: false, error: String(error) };
    }
  });

export const deleteQuest = publicProcedure
  .input(z.object({
    questId: z.string(),
    hardDelete: z.boolean().optional().default(false),
  }))
  .mutation(async ({ input }) => {
    console.log('[QUEST] Deleting quest:', input.questId, 'hard:', input.hardDelete);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: false, message: 'Database not configured' };
    }
    
    try {
      if (input.hardDelete) {
        await fetch(`${dbEndpoint}/key/${dbNamespace}/quest_${input.questId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${dbToken}` },
        });
      } else {
        const existingResponse = await fetch(`${dbEndpoint}/key/${dbNamespace}/quest_${input.questId}`, {
          headers: { 'Authorization': `Bearer ${dbToken}` },
        });
        
        if (existingResponse.ok) {
          const existingQuest = await existingResponse.json();
          await fetch(`${dbEndpoint}/key/${dbNamespace}/quest_${input.questId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${dbToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...existingQuest,
              status: 'ARCHIVED',
              deleted_at: new Date().toISOString(),
            }),
          });
        }
      }
      
      return { success: true, quest_id: input.questId };
    } catch (error) {
      console.error('[QUEST] Failed to delete quest:', error);
      return { success: false, error: String(error) };
    }
  });

export const completeQuest = publicProcedure
  .input(z.object({
    questId: z.string(),
    completionNotes: z.string().optional(),
    evidence: z.array(z.object({
      type: z.enum(['text', 'image', 'file']),
      content: z.string(),
      description: z.string().optional(),
    })).optional(),
  }))
  .mutation(async ({ input }) => {
    console.log('[QUEST] Completing quest:', input.questId);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: false, message: 'Database not configured' };
    }
    
    try {
      const existingResponse = await fetch(`${dbEndpoint}/key/${dbNamespace}/quest_${input.questId}`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      if (!existingResponse.ok) {
        return { success: false, message: 'Quest not found' };
      }
      
      const existingQuest = await existingResponse.json();
      const completedAt = new Date().toISOString();
      
      const completedQuest = {
        ...existingQuest,
        status: 'COMPLETED',
        completed_at: completedAt,
        completion_notes: input.completionNotes,
        evidence: input.evidence,
        updated_at: completedAt,
      };
      
      await fetch(`${dbEndpoint}/key/${dbNamespace}/quest_${input.questId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completedQuest),
      });
      
      const rewards = {
        xp_awarded: existingQuest.xp_reward || 0,
        loot_awarded: existingQuest.loot_reward || [],
        codex_points_awarded: existingQuest.codex_points_reward || 0,
        black_sun_essence_awarded: existingQuest.black_sun_essence_reward || 0,
        skill_xp_awarded: existingQuest.skill_links || [],
      };
      
      return {
        success: true,
        quest_id: input.questId,
        status: 'COMPLETED',
        completed_at: completedAt,
        rewards,
      };
    } catch (error) {
      console.error('[QUEST] Failed to complete quest:', error);
      return { success: false, error: String(error) };
    }
  });

export const updateQuestProgress = publicProcedure
  .input(z.object({
    questId: z.string(),
    current: z.number(),
    target: z.number().optional(),
  }))
  .mutation(async ({ input }) => {
    console.log('[QUEST] Updating quest progress:', input);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: false, message: 'Database not configured' };
    }
    
    try {
      const existingResponse = await fetch(`${dbEndpoint}/key/${dbNamespace}/quest_${input.questId}`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      if (!existingResponse.ok) {
        return { success: false, message: 'Quest not found' };
      }
      
      const existingQuest = await existingResponse.json();
      const target = input.target || existingQuest.progress?.target || 100;
      const isComplete = input.current >= target;
      
      const updatedQuest = {
        ...existingQuest,
        progress: { current: input.current, target },
        status: isComplete ? 'COMPLETED' : existingQuest.status,
        completed_at: isComplete ? new Date().toISOString() : existingQuest.completed_at,
        updated_at: new Date().toISOString(),
      };
      
      await fetch(`${dbEndpoint}/key/${dbNamespace}/quest_${input.questId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedQuest),
      });
      
      return {
        success: true,
        quest_id: input.questId,
        progress: updatedQuest.progress,
        isComplete,
      };
    } catch (error) {
      console.error('[QUEST] Failed to update progress:', error);
      return { success: false, error: String(error) };
    }
  });

export const toggleSubtask = publicProcedure
  .input(z.object({
    questId: z.string(),
    subtaskId: z.string(),
    completed: z.boolean(),
  }))
  .mutation(async ({ input }) => {
    console.log('[QUEST] Toggling subtask:', input);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: false, message: 'Database not configured' };
    }
    
    try {
      const existingResponse = await fetch(`${dbEndpoint}/key/${dbNamespace}/quest_${input.questId}`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      if (!existingResponse.ok) {
        return { success: false, message: 'Quest not found' };
      }
      
      const existingQuest = await existingResponse.json();
      const subtasks = existingQuest.subtasks || [];
      const updatedSubtasks = subtasks.map((st: any) => 
        st.id === input.subtaskId ? { ...st, completed: input.completed } : st
      );
      
      const allComplete = updatedSubtasks.every((st: any) => st.completed);
      
      const updatedQuest = {
        ...existingQuest,
        subtasks: updatedSubtasks,
        status: allComplete ? 'COMPLETED' : existingQuest.status,
        completed_at: allComplete ? new Date().toISOString() : existingQuest.completed_at,
        updated_at: new Date().toISOString(),
      };
      
      await fetch(`${dbEndpoint}/key/${dbNamespace}/quest_${input.questId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedQuest),
      });
      
      return {
        success: true,
        quest_id: input.questId,
        subtasks: updatedSubtasks,
        allComplete,
      };
    } catch (error) {
      console.error('[QUEST] Failed to toggle subtask:', error);
      return { success: false, error: String(error) };
    }
  });
