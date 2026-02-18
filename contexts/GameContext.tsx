import React, { createContext, useContext, useMemo, useState } from "react";

type AnyObj = Record<string, any>;

export type GameState = {
  identity: {
    inscribedName: string;
    titles: string[];
    speciesLineage: string[];
    territory: { class: string; towerFloorsInfluence: number };
  };

  stats: {
    level: number;
    xp: number;
    rank: string;

    STR: number; AGI: number; VIT: number; INT: number; WIS: number; CHA: number; LCK: number;

    codexIntegrity: number;
    fullCowlSync: number;
    fatigue: number;
    auraPower: number;

    [key: string]: any;
  };

  currentForm: string;
  currentBPM: number;
  currentFloor: number;

  arcStory?: string;

  currencies: { id: string; name: string; amount: number }[];

  tasks: AnyObj[];
  quests: AnyObj[];
  dailyRituals: AnyObj[];

  inventoryV2: AnyObj[];
  journalEntries: AnyObj[];

  skillTrees: AnyObj[];
  skillSubTrees: Record<string, AnyObj[]>;
  skillProficiency?: Record<string, number>;

  transformations: AnyObj[];

  vaultEntries: AnyObj[];
  allies: AnyObj[];
  energySystems: AnyObj[];
  bpmSessions: AnyObj[];

  roster: AnyObj[];
  storeItems: AnyObj[];

  [key: string]: any;
};

export const DEFAULT_GAME_STATE: GameState = {
  identity: {
    inscribedName: "Calvin",
    titles: ["Black Sun Monarch"],
    speciesLineage: ["Human"],
    territory: { class: "E", towerFloorsInfluence: 0 },
  },

  stats: {
    level: 1,
    xp: 0,
    rank: "E",

    STR: 1, AGI: 1, VIT: 1, INT: 1, WIS: 1, CHA: 1, LCK: 1,

    codexIntegrity: 100,
    fullCowlSync: 0,
    fatigue: 0,
    auraPower: 0,
  },

  currentForm: "Base",
  currentBPM: 60,
  currentFloor: 1,

  arcStory: "Forge of Equilibrium (Phase III Evolution)",

  currencies: [{ id: "codex_points", name: "Codex Points", amount: 0 }],

  tasks: [],
  quests: [],
  dailyRituals: [],

  inventoryV2: [],
  journalEntries: [],

  skillTrees: [],
  skillSubTrees: {},
  skillProficiency: {},

  transformations: [],

  vaultEntries: [],
  allies: [],
  energySystems: [],
  bpmSessions: [],

  roster: [],
  storeItems: [],
};

function coerceGameState(input: any): GameState {
  const s = input && typeof input === "object" ? input : {};

  const safeArray = (v: any) => (Array.isArray(v) ? v : []);
  const safeObj = (v: any) => (v && typeof v === "object" && !Array.isArray(v) ? v : {});

  return {
    ...DEFAULT_GAME_STATE,
    ...s,
    identity: {
      ...DEFAULT_GAME_STATE.identity,
      ...safeObj(s.identity),
      titles: safeArray(s?.identity?.titles),
      speciesLineage: safeArray(s?.identity?.speciesLineage),
      territory: {
        ...DEFAULT_GAME_STATE.identity.territory,
        ...safeObj(s?.identity?.territory),
      },
    },
    stats: {
      ...DEFAULT_GAME_STATE.stats,
      ...safeObj(s.stats),
    },

    currencies: safeArray(s.currencies),
    tasks: safeArray(s.tasks),
    quests: safeArray(s.quests),
    dailyRituals: safeArray(s.dailyRituals),

    inventoryV2: safeArray(s.inventoryV2),
    journalEntries: safeArray(s.journalEntries),

    skillTrees: safeArray(s.skillTrees),
    skillSubTrees: safeObj(s.skillSubTrees),
    skillProficiency: safeObj(s.skillProficiency),

    transformations: safeArray(s.transformations),

    vaultEntries: safeArray(s.vaultEntries),
    allies: safeArray(s.allies),
    energySystems: safeArray(s.energySystems),
    bpmSessions: safeArray(s.bpmSessions),

    roster: safeArray(s.roster),
    storeItems: safeArray(s.storeItems),
  };
}

type GameContextType = {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
};

const GameContext = createContext<GameContextType>({
  gameState: DEFAULT_GAME_STATE,
  setGameState: () => {},
});

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, _setGameState] = useState<GameState>(() => coerceGameState(DEFAULT_GAME_STATE));

  const setGameState: React.Dispatch<React.SetStateAction<GameState>> = (updater: any) => {
    _setGameState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return coerceGameState(next);
    });
  };

  const value = useMemo(
    () => ({ gameState: coerceGameState(gameState), setGameState }),
    [gameState]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  return useContext(GameContext);
}
