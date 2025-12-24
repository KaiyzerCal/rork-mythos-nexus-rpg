import { publicProcedure } from '../../create-context';
import { z } from 'zod';

const inputSchema = z.object({
  include: z.object({
    tabs: z.boolean().optional().default(true),
    stats: z.boolean().optional().default(true),
    skills: z.boolean().optional().default(true),
    quests: z.boolean().optional().default(true),
    forms: z.boolean().optional().default(true),
    vault: z.boolean().optional().default(true),
    council: z.boolean().optional().default(true),
    recent_threads: z.boolean().optional().default(false),
  }).optional(),
}).optional();

export default publicProcedure
  .input(inputSchema)
  .query(async ({ input }) => {
    const snapshotId = `snap_${Date.now()}`;
    const generatedAt = new Date().toISOString();

    const snapshot: Record<string, any> = {
      snapshot_id: snapshotId,
      generated_at: generatedAt,
    };

    if (input?.include?.stats) {
      snapshot.stats = {
        level: 1,
        xp: 0,
        rank: 'F',
      };
    }

    if (input?.include?.skills) {
      snapshot.skills = [];
    }

    if (input?.include?.quests) {
      snapshot.quests = [];
    }

    if (input?.include?.forms) {
      snapshot.forms = {};
    }

    if (input?.include?.vault) {
      snapshot.vault_recent = [];
    }

    if (input?.include?.council) {
      snapshot.council = [];
    }

    if (input?.include?.recent_threads) {
      snapshot.threads_recent = [];
    }

    return snapshot;
  });
