import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import healthStatus from "./routes/health/status";
import systemSnapshot from "./routes/system/snapshot";
import systemSync from "./routes/system/sync";
import questsList from "./routes/quests/list";
import questsCreateDraft from "./routes/quests/create-draft";
import questsApprove from "./routes/quests/approve";
import memoryGetGlobal from "./routes/memory/get-global";
import memoryUpsertFact from "./routes/memory/upsert-fact";
import councilListMembers from "./routes/council/list-members";
import councilUpsertMember from "./routes/council/upsert-member";
import gamestateSave from "./routes/gamestate/save";
import gamestateLoad from "./routes/gamestate/load";
import { listThreads, getThread, saveThread, appendMessage } from "./routes/chat/threads";
import { getIntegrationStatus, saveIntegrationTokens, disconnectIntegration } from "./routes/integrations/google";
import { listCalendarEvents, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from "./routes/integrations/calendar";
import { listVaultEntries, createVaultEntry, updateVaultEntry, deleteVaultEntry } from "./routes/vault/entries";
import { listSkills, saveSkillsData, unlockSkill, updateSkillProficiency } from "./routes/skills/manage";
import { listTasks, saveTasks, createTask, completeTask, deleteTask } from "./routes/tasks/manage";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  health: createTRPCRouter({
    getStatus: healthStatus,
  }),
  system: createTRPCRouter({
    getSystemSnapshot: systemSnapshot,
    syncNow: systemSync,
  }),
  quests: createTRPCRouter({
    list: questsList,
    createDraftFromNavi: questsCreateDraft,
    approve: questsApprove,
  }),
  memory: createTRPCRouter({
    getGlobalMemory: memoryGetGlobal,
    upsertMemoryFact: memoryUpsertFact,
  }),
  council: createTRPCRouter({
    listMembers: councilListMembers,
    upsertMember: councilUpsertMember,
  }),
  gamestate: createTRPCRouter({
    save: gamestateSave,
    load: gamestateLoad,
  }),
  chat: createTRPCRouter({
    listThreads: listThreads,
    getThread: getThread,
    saveThread: saveThread,
    appendMessage: appendMessage,
  }),
  integrations: createTRPCRouter({
    getStatus: getIntegrationStatus,
    saveTokens: saveIntegrationTokens,
    disconnect: disconnectIntegration,
  }),
  calendar: createTRPCRouter({
    list: listCalendarEvents,
    create: createCalendarEvent,
    update: updateCalendarEvent,
    delete: deleteCalendarEvent,
  }),
  vault: createTRPCRouter({
    list: listVaultEntries,
    create: createVaultEntry,
    update: updateVaultEntry,
    delete: deleteVaultEntry,
  }),
  skills: createTRPCRouter({
    list: listSkills,
    save: saveSkillsData,
    unlock: unlockSkill,
    updateProficiency: updateSkillProficiency,
  }),
  tasks: createTRPCRouter({
    list: listTasks,
    save: saveTasks,
    create: createTask,
    complete: completeTask,
    delete: deleteTask,
  }),
});

export type AppRouter = typeof appRouter;
