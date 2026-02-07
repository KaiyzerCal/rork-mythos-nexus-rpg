import { trpcClient } from '@/lib/trpc';

export const SystemAPI = {
  async getQuests(status?: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED') {
    return await trpcClient.quests.list.query({ status, limit: 100 });
  },

  async updateStats(delta: Record<string, number>, reason: string) {
    console.log('[SystemAPI] Updating stats:', { delta, reason });
    return { ok: true };
  },

  async getStats() {
    console.log('[SystemAPI] Getting stats');
    return {};
  },

  async saveMemory(key: string, value: string, scope: string = 'global') {
    return await trpcClient.memory.upsertMemoryFact.mutate({
      key,
      value,
      confidence: 0.9,
      source: 'user',
      scope,
    });
  },

  async loadMemory(scope: string = 'global') {
    return await trpcClient.memory.getGlobalMemory.query({ scope });
  },

  async getCouncilProfiles(classFilter?: 'core' | 'advisory' | 'think-tank' | 'shadows') {
    return await trpcClient.council.listMembers.query({ class: classFilter || null });
  },

  async updateCouncilProfile(memberId: string, updates: any) {
    return await trpcClient.council.upsertMember.mutate({
      member_id: memberId,
      ...updates,
    });
  },

  async writeToVault(title: string, content: string, tags: string[] = []) {
    console.log('[SystemAPI] Writing to vault:', { title, tags });
    return { ok: true };
  },

  async readVault(limit: number = 50) {
    console.log('[SystemAPI] Reading vault');
    return { items: [], next_cursor: null };
  },

  async syncState(mode: string = 'omnisync', reason?: string) {
    return await trpcClient.system.syncNow.mutate({
      mode,
      reason,
      include: {
        memory: true,
        vault: true,
        stats: true,
        skills: true,
        quests: true,
        council: true,
      },
    });
  },

  async getSystemSnapshot() {
    return await trpcClient.system.getSystemSnapshot.query({
      include: {
        tabs: true,
        stats: true,
        skills: true,
        quests: true,
        forms: true,
        vault: true,
        council: true,
        recent_threads: true,
      },
    });
  },

  async getHealthStatus() {
    return await trpcClient.health.getStatus.query();
  },
};

export default SystemAPI;
