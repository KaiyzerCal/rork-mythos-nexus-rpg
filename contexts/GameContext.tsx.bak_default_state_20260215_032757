import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { jsonStoreGet, jsonStoreSet, jsonStoreRemove } from "../src/db/jsonStore";

const STORAGE_KEY = "black_sun_monarch_v3";
const SCOPE = "game";

type GameState = any;

const GameContext = createContext<any>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(() => jsonStoreGet(SCOPE, STORAGE_KEY, null));

  useEffect(() => {
    // If nothing stored yet, keep existing defaults if your app sets them elsewhere.
    if (state == null) {
      setState((prev: any) => prev ?? {});
    }
  }, []);

  const loadGameState = useCallback(async () => {
    const stored = jsonStoreGet(SCOPE, STORAGE_KEY, null);
    if (stored == null) {
      jsonStoreRemove(SCOPE, STORAGE_KEY);
      return null;
    }
    setState(stored);
    return stored;
  }, []);

  const saveGameState = useCallback(async (newState: GameState) => {
    setState(newState);
    jsonStoreSet(SCOPE, STORAGE_KEY, newState);
  }, []);

  const value = useMemo(() => ({ state, setState, loadGameState, saveGameState }), [state, loadGameState, saveGameState]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}

