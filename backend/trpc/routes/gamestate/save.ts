import { z } from "zod";
import { publicProcedure } from "../../create-context";

const gameStateSchema = z.object({
  identity: z.object({
    inscribedName: z.string(),
    titles: z.array(z.string()),
    speciesLineage: z.array(z.string()),
    territory: z.object({
      towerFloorsInfluence: z.string(),
      class: z.string(),
    }),
    councils: z.object({
      core: z.array(z.string()),
      advisory: z.array(z.string()),
      thinkTank: z.array(z.string()),
    }),
  }),
  stats: z.object({
    level: z.number(),
    xp: z.number(),
    xpToNextLevel: z.number(),
    rank: z.string(),
    STR: z.number(),
    AGI: z.number(),
    VIT: z.number(),
    INT: z.number(),
    WIS: z.number(),
    CHA: z.number(),
    LCK: z.number(),
    auraPower: z.string(),
    fatigue: z.number(),
    fullCowlSync: z.number(),
    codexIntegrity: z.number(),
  }),
  currentForm: z.string(),
  currentBPM: z.number(),
  currentFloor: z.number(),
  gpr: z.number(),
  pvpRating: z.number(),
  arcStory: z.string().optional(),
  energySystems: z.array(z.any()),
  transformations: z.array(z.any()),
  quests: z.array(z.any()),
  councils: z.array(z.any()),
  bpmSessions: z.array(z.any()),
  skillTrees: z.array(z.any()),
  skillSubTrees: z.record(z.string(), z.array(z.any())).optional(),
  skillProficiency: z.record(z.string(), z.number()).optional(),
  dailyRituals: z.array(z.any()),
  inventory: z.array(z.any()),
  inventoryV2: z.array(z.any()),
  currencies: z.array(z.any()),
  allies: z.array(z.any()),
  roster: z.array(z.any()),
  journalEntries: z.array(z.any()),
  vaultEntries: z.array(z.any()),
  tasks: z.array(z.any()),
  storeItems: z.array(z.any()).optional(),
  realWorldModules: z.any(),
});

export default publicProcedure
  .input(z.object({
    gameState: gameStateSchema,
  }))
  .mutation(async ({ input, ctx }) => {
    const { gameState } = input;
    const timestamp = new Date().toISOString();
    
    console.log('[BACKEND] Saving full game state at:', timestamp);
    console.log('[BACKEND] Stats level:', gameState.stats.level);
    console.log('[BACKEND] Quests count:', gameState.quests.length);
    console.log('[BACKEND] Skills count:', gameState.skillTrees.length);
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      console.log('[BACKEND] Database not configured, returning mock success');
      return {
        success: true,
        savedAt: timestamp,
        syncId: `sync_${Date.now()}`,
        message: 'Game state saved (local mode)',
      };
    }
    
    try {
      const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/game_state`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...gameState,
          updatedAt: timestamp,
          syncedAt: timestamp,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Database error: ${response.status}`);
      }
      
      console.log('[BACKEND] Game state saved to database successfully');
      
      return {
        success: true,
        savedAt: timestamp,
        syncId: `sync_${Date.now()}`,
        message: 'Game state saved to cloud',
      };
    } catch (error) {
      console.error('[BACKEND] Failed to save game state:', error);
      return {
        success: false,
        savedAt: timestamp,
        syncId: `sync_${Date.now()}`,
        message: 'Failed to save - using local storage',
        error: String(error),
      };
    }
  });
