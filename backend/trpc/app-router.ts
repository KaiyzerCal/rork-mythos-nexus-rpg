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
import { getAppleIntegrationStatus, saveAppleIntegrationTokens, disconnectAppleIntegration, syncAppleCalendar, syncAppleReminders, syncHealthKit } from "./routes/integrations/apple";
import { getQuest, updateQuest, deleteQuest, completeQuest, updateQuestProgress, toggleSubtask } from "./routes/quests/manage";
import { searchMemory, deleteMemoryFact, archiveMemory, getMemoryStats, exportMemory, importMemory } from "./routes/memory/manage";
import { trackEvent, getAnalyticsSummary, getActivityLog, getUserStats, getStreaks, updateStreak } from "./routes/analytics/tracking";
import { createReminder, listReminders, updateReminder, deleteReminder, snoozeReminder, getDueReminders } from "./routes/reminders/manage";
import { createTextFile, uploadFile, uploadImage, generateImage, listFiles, getFile, deleteFile } from "./routes/files/manage";

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
    get: getQuest,
    update: updateQuest,
    delete: deleteQuest,
    complete: completeQuest,
    updateProgress: updateQuestProgress,
    toggleSubtask: toggleSubtask,
  }),
  memory: createTRPCRouter({
    getGlobalMemory: memoryGetGlobal,
    upsertMemoryFact: memoryUpsertFact,
    search: searchMemory,
    delete: deleteMemoryFact,
    archive: archiveMemory,
    getStats: getMemoryStats,
    export: exportMemory,
    import: importMemory,
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
  apple: createTRPCRouter({
    getStatus: getAppleIntegrationStatus,
    saveTokens: saveAppleIntegrationTokens,
    disconnect: disconnectAppleIntegration,
    syncCalendar: syncAppleCalendar,
    syncReminders: syncAppleReminders,
    syncHealthKit: syncHealthKit,
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
  analytics: createTRPCRouter({
    track: trackEvent,
    getSummary: getAnalyticsSummary,
    getActivityLog: getActivityLog,
    getUserStats: getUserStats,
    getStreaks: getStreaks,
    updateStreak: updateStreak,
  }),
  reminders: createTRPCRouter({
    create: createReminder,
    list: listReminders,
    update: updateReminder,
    delete: deleteReminder,
    snooze: snoozeReminder,
    getDue: getDueReminders,
  }),
  files: createTRPCRouter({
    createText: createTextFile,
    upload: uploadFile,
    uploadImage: uploadImage,
    generate: generateImage,
    list: listFiles,
    get: getFile,
    delete: deleteFile,
  }),
});

export type AppRouter = typeof appRouter;
