import { publicProcedure } from '../../create-context';
import { z } from 'zod';

const inputSchema = z.object({
  key: z.string(),
  value: z.string(),
  confidence: z.number().min(0).max(1),
  source: z.string(),
  scope: z.string(),
});

export default publicProcedure
  .input(inputSchema)
  .mutation(async ({ input }) => {
    console.log('[MEMORY] Upserting memory fact:', {
      key: input.key,
      scope: input.scope,
      confidence: input.confidence,
    });

    return { ok: true };
  });
