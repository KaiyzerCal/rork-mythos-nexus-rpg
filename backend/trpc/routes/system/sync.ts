import { publicProcedure } from '../../create-context';
import { z } from 'zod';

const inputSchema = z.object({
  mode: z.string(),
  reason: z.string().optional(),
  include: z.object({
    memory: z.boolean().optional().default(true),
    vault: z.boolean().optional().default(true),
    stats: z.boolean().optional().default(true),
    skills: z.boolean().optional().default(true),
    quests: z.boolean().optional().default(true),
    council: z.boolean().optional().default(true),
  }).optional(),
}).optional();

export default publicProcedure
  .input(inputSchema)
  .mutation(async ({ input }) => {
    const syncId = `sync_${Date.now()}`;
    const startedAt = new Date().toISOString();

    console.log('[OMNISYNC] Starting synchronization:', {
      syncId,
      mode: input?.mode,
      reason: input?.reason,
      systems: input?.include,
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    const completedAt = new Date().toISOString();

    return {
      sync_id: syncId,
      status: 'COMPLETED' as const,
      started_at: startedAt,
      completed_at: completedAt,
    };
  });
