import { z } from "zod";
import { publicProcedure } from "../../create-context";

export const listSkills = publicProcedure
  .input(z.object({
    tree: z.string().optional(),
    unlocked: z.boolean().optional(),
  }).optional())
  .query(async ({ input }) => {
    console.log('[BACKEND] Listing skills');
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { skills: [], subTrees: {}, proficiency: {} };
    }
    
    try {
      const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/skills_data`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      if (!response.ok) {
        return { skills: [], subTrees: {}, proficiency: {} };
      }
      
      const data = await response.json();
      let skills = data?.skills || [];
      
      if (input?.tree) {
        skills = skills.filter((s: any) => s.tree === input.tree);
      }
      if (input?.unlocked !== undefined) {
        skills = skills.filter((s: any) => s.unlocked === input.unlocked);
      }
      
      return {
        skills,
        subTrees: data?.subTrees || {},
        proficiency: data?.proficiency || {},
      };
    } catch (error) {
      console.error('[BACKEND] Failed to list skills:', error);
      return { skills: [], subTrees: {}, proficiency: {} };
    }
  });

export const saveSkillsData = publicProcedure
  .input(z.object({
    skills: z.array(z.any()),
    subTrees: z.record(z.string(), z.array(z.any())).optional(),
    proficiency: z.record(z.string(), z.number()).optional(),
  }))
  .mutation(async ({ input }) => {
    console.log('[BACKEND] Saving skills data');
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: true, message: 'Local mode' };
    }
    
    try {
      await fetch(`${dbEndpoint}/key/${dbNamespace}/skills_data`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skills: input.skills,
          subTrees: input.subTrees || {},
          proficiency: input.proficiency || {},
          updatedAt: new Date().toISOString(),
        }),
      });
      
      return { success: true, message: 'Skills saved' };
    } catch (error) {
      console.error('[BACKEND] Failed to save skills:', error);
      return { success: false, error: String(error) };
    }
  });

export const unlockSkill = publicProcedure
  .input(z.object({
    skillId: z.string(),
  }))
  .mutation(async ({ input }) => {
    console.log('[BACKEND] Unlocking skill:', input.skillId);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: true, message: 'Local mode' };
    }
    
    try {
      const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/skills_data`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      if (!response.ok) {
        return { success: false, message: 'No skills found' };
      }
      
      const data = await response.json();
      const skills = (data?.skills || []).map((s: any) =>
        s.id === input.skillId ? { ...s, unlocked: true } : s
      );
      
      await fetch(`${dbEndpoint}/key/${dbNamespace}/skills_data`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          skills,
          updatedAt: new Date().toISOString(),
        }),
      });
      
      return { success: true, message: 'Skill unlocked' };
    } catch (error) {
      console.error('[BACKEND] Failed to unlock skill:', error);
      return { success: false, error: String(error) };
    }
  });

export const updateSkillProficiency = publicProcedure
  .input(z.object({
    skillId: z.string(),
    xpAmount: z.number(),
  }))
  .mutation(async ({ input }) => {
    console.log('[BACKEND] Updating skill proficiency:', input.skillId, '+', input.xpAmount);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      return { success: true, message: 'Local mode' };
    }
    
    try {
      const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/skills_data`, {
        headers: { 'Authorization': `Bearer ${dbToken}` },
      });
      
      let data: any = { skills: [], subTrees: {}, proficiency: {} };
      if (response.ok) {
        data = await response.json();
      }
      
      const proficiency = data?.proficiency || {};
      proficiency[input.skillId] = (proficiency[input.skillId] || 0) + input.xpAmount;
      
      await fetch(`${dbEndpoint}/key/${dbNamespace}/skills_data`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          proficiency,
          updatedAt: new Date().toISOString(),
        }),
      });
      
      return { success: true, newProficiency: proficiency[input.skillId] };
    } catch (error) {
      console.error('[BACKEND] Failed to update proficiency:', error);
      return { success: false, error: String(error) };
    }
  });
