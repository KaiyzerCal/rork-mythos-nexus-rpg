import { publicProcedure } from '../../create-context';
import { z } from 'zod';

const inputSchema = z.object({
  scope: z.string().optional().default('global'),
});

export default publicProcedure
  .input(inputSchema)
  .query(async ({ input }) => {
    console.log('[MEMORY] Fetching global memory:', { scope: input.scope });

    return {
      facts: [],
      preferences: [],
      arcs: [],
      last_updated: new Date().toISOString(),
    };
  });
