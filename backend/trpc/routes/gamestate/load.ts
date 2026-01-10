import { z } from "zod";
import { publicProcedure } from "../../create-context";

export default publicProcedure
  .input(z.object({
    includeHistory: z.boolean().optional(),
  }).optional())
  .query(async ({ input, ctx }) => {
    console.log('[BACKEND] Loading game state from database');
    
    const dbEndpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
    const dbNamespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
    const dbToken = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;
    
    if (!dbEndpoint || !dbNamespace || !dbToken) {
      console.log('[BACKEND] Database not configured, returning null');
      return {
        found: false,
        gameState: null,
        loadedAt: new Date().toISOString(),
        message: 'Database not configured - use local storage',
      };
    }
    
    try {
      const response = await fetch(`${dbEndpoint}/key/${dbNamespace}/game_state`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${dbToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === 404) {
        console.log('[BACKEND] No game state found in database');
        return {
          found: false,
          gameState: null,
          loadedAt: new Date().toISOString(),
          message: 'No saved game state found',
        };
      }
      
      if (!response.ok) {
        throw new Error(`Database error: ${response.status}`);
      }
      
      const gameState = await response.json();
      console.log('[BACKEND] Game state loaded successfully');
      
      return {
        found: true,
        gameState,
        loadedAt: new Date().toISOString(),
        message: 'Game state loaded from cloud',
      };
    } catch (error) {
      console.error('[BACKEND] Failed to load game state:', error);
      return {
        found: false,
        gameState: null,
        loadedAt: new Date().toISOString(),
        message: 'Failed to load - use local storage',
        error: String(error),
      };
    }
  });
