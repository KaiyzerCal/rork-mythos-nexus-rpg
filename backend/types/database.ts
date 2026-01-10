export interface DBThread {
  id: string;
  title: string;
  contextTags: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface DBMessage {
  id: string;
  threadId: string;
  role: 'user' | 'assistant' | 'system';
  contentFull: string;
  contentDisplay: string;
  attachments: string[];
  meta: {
    mode?: string;
    form?: string | null;
    bpmState?: string | null;
  };
  modelMeta?: {
    engine?: string;
    latencyMs?: number;
    tokensIn?: number;
    tokensOut?: number;
  };
  createdAt: string;
  deletedAt: string | null;
}

export interface DBMemorySummary {
  id: string;
  threadId: string;
  summary: string;
  strategy: string;
  maxTokens: number;
  createdAt: string;
  updatedAt: string;
}

export interface DBMemoryFact {
  id: string;
  key: string;
  value: string;
  confidence: number;
  source: string;
  scope: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type QuestStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export interface DBQuest {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: number;
  xpReward: number;
  codexPointsReward?: number;
  blackSunEssenceReward?: number;
  lootRewards?: {
    itemId?: string;
    itemName: string;
    quantity: number;
    rarity?: string;
  }[];
  statTargets: { stat: string; value: number }[];
  skillLinks: string[];
  skillXpReward?: number;
  dueAt: string | null;
  status: QuestStatus;
  sourceThreadId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  completionNotes: string | null;
  evidence: string[];
  deletedAt: string | null;
  progress?: { current: number; target: number };
  type?: string;
  realWorldMapping?: string;
}

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface DBQuestApproval {
  id: string;
  questId: string;
  requestedBy: string;
  status: ApprovalStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DBSkill {
  id: string;
  name: string;
  tree: string;
  rank: string;
  description: string;
  tags: string[];
  tier: number;
  unlocked: boolean;
  cost: number;
  energyType: string;
  category: string;
  prerequisites?: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface DBUserSkill {
  id: string;
  oduserId: string;
  skillId: string;
  proficiency: number;
  lastPracticed: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DBStatBlock {
  id: string;
  oduserId: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  rank: string;
  STR: number;
  AGI: number;
  VIT: number;
  INT: number;
  WIS: number;
  CHA: number;
  LCK: number;
  auraPower: string;
  fatigue: number;
  fullCowlSync: number;
  codexIntegrity: number;
  updatedAt: string;
}

export interface DBVaultEntry {
  id: string;
  title: string;
  body: string;
  tags: string[];
  category: string;
  importance: string;
  linkedQuestId: string | null;
  linkedThreadId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface DBCouncilMember {
  id: string;
  name: string;
  role: string;
  specialty: string;
  class: string;
  notes: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface DBCouncilProfile {
  id: string;
  memberId: string;
  emotionalState: string;
  behaviorDelta: string;
  wins: string[];
  failures: string[];
  insights: string[];
  updatedAt: string;
}

export interface DBCouncilMemory {
  id: string;
  memberId: string;
  threadId: string;
  messageId: string;
  content: string;
  createdAt: string;
}

export interface DBAuditEvent {
  id: string;
  eventType: string;
  entityType: string;
  entityId: string;
  oduserId: string;
  payload: Record<string, any>;
  createdAt: string;
}

export interface DBSyncState {
  id: string;
  syncId: string;
  mode: string;
  reason: string;
  includedSystems: string[];
  status: 'STARTED' | 'COMPLETED' | 'FAILED';
  startedAt: string;
  completedAt: string | null;
  error: string | null;
}

export interface DBInventoryItem {
  id: string;
  slot: string;
  name: string;
  tier: string;
  description: string;
  effects: { label: string; value: number; unit: string }[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface DBEnergySystem {
  id: string;
  type: string;
  current: number;
  max: number;
  color: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DBTransformation {
  id: string;
  tier: string;
  name: string;
  order: number;
  bpmRange: string;
  category?: string;
  description?: string;
  energy: string;
  jjkGrade: string;
  opTier: string;
  activeBuffs: { label: string; value: number; unit: string }[];
  passiveBuffs: { label: string; value: number; unit: string }[];
  abilities: { title: string; irl: string }[];
  unlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DBTask {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  recurrence: string;
  xpReward: number;
  skillXpReward?: number;
  linkedSkillId?: string;
  linkedSubSkillId?: string;
  streak?: number;
  completedCount: number;
  lastCompleted?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface DBRitual {
  id: string;
  name: string;
  description: string;
  type: string;
  category?: string;
  xpReward: number;
  completed: boolean;
  streak: number;
  createdAt: string;
  updatedAt: string;
}

export interface DBAlly {
  id: string;
  name: string;
  relationship: string;
  level: number;
  specialty: string;
  affinity: number;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DBRosterEntry {
  id: string;
  display: string;
  role: string;
  rank: string;
  level: number;
  jjkGrade: string;
  opTier: string;
  gpr: number;
  pvp: number;
  influence: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface DBJournalEntry {
  id: string;
  title: string;
  content: string;
  mood?: string;
  tags: string[];
  xpGained?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DBBPMSession {
  id: string;
  bpm: number;
  form: string;
  duration: number;
  mood?: string;
  notes?: string;
  createdAt: string;
}

export interface DBIdentity {
  id: string;
  inscribedName: string;
  titles: string[];
  speciesLineage: string[];
  territory: {
    towerFloorsInfluence: string;
    class: string;
  };
  councils: {
    core: string[];
    advisory: string[];
    thinkTank: string[];
  };
  currentForm: string;
  currentBPM: number;
  currentFloor: number;
  gpr: number;
  pvpRating: number;
  arcStory?: string;
  updatedAt: string;
}

export interface DBGameState {
  id: string;
  identity: DBIdentity;
  stats: DBStatBlock;
  energySystems: DBEnergySystem[];
  transformations: DBTransformation[];
  quests: DBQuest[];
  councils: DBCouncilMember[];
  bpmSessions: DBBPMSession[];
  skills: DBSkill[];
  skillSubTrees: Record<string, DBSkill[]>;
  skillProficiency: Record<string, number>;
  dailyRituals: DBRitual[];
  inventory: DBInventoryItem[];
  currencies: { name: string; amount: number; icon: string }[];
  allies: DBAlly[];
  roster: DBRosterEntry[];
  journalEntries: DBJournalEntry[];
  vaultEntries: DBVaultEntry[];
  tasks: DBTask[];
  storeItems?: any[];
  realWorldModules: any;
  updatedAt: string;
  syncedAt: string;
}

export interface DBCalendarEvent {
  id: string;
  googleEventId?: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  linkedQuestId?: string;
  linkedTaskId?: string;
  recurrence?: string;
  reminders?: { method: string; minutes: number }[];
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
}

export interface DBExternalIntegration {
  id: string;
  provider: 'google' | 'gmail' | 'calendar' | 'drive' | 'sheets';
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  scopes: string[];
  enabled: boolean;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DBEmailSync {
  id: string;
  gmailMessageId: string;
  threadId: string;
  subject: string;
  from: string;
  to: string[];
  snippet: string;
  labels: string[];
  isRead: boolean;
  isStarred: boolean;
  linkedQuestId?: string;
  receivedAt: string;
  syncedAt: string;
}
