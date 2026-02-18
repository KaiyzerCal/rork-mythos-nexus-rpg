import type { GameState } from "./GameContext";

/**
 * Guarantees required arrays/objects exist so screens never crash on undefined.
 * Keep this conservative: only default the fields your UI expects.
 */
export function normalizeGameState(input: any): GameState {
  const s: any = (input && typeof input === "object") ? input : {};

  // Identity defaults (screens expect nested identity.*)
  const identity = s.identity && typeof s.identity === "object" ? s.identity : {};
  const territory = identity.territory && typeof identity.territory === "object" ? identity.territory : {};

  // Stats defaults (if your UI expects stats keys)
  const stats = s.stats && typeof s.stats === "object" ? s.stats : {
    STR: 0, AGI: 0, VIT: 0, INT: 0, WIS: 0, CHA: 0, LCK: 0,
  };

  return {
    ...s,

    // Always-safe primitives
    currentForm: s.currentForm ?? "",
    currentBPM: s.currentBPM ?? 0,
    currentFloor: s.currentFloor ?? 0,

    // Always-safe objects/arrays used by UI
    identity: {
      inscribedName: identity.inscribedName ?? "Unknown",
      titles: Array.isArray(identity.titles) ? identity.titles : ["Untitled"],
      speciesLineage: Array.isArray(identity.speciesLineage) ? identity.speciesLineage : ["Human"],
      territory: {
        class: territory.class ?? "Unranked",
        towerFloorsInfluence: territory.towerFloorsInfluence ?? 0,
        ...territory,
      },
      ...identity,
    },

    stats,

    currencies: Array.isArray(s.currencies) ? s.currencies : [],
    arcs: Array.isArray(s.arcs) ? s.arcs : [],
    councilProfiles: Array.isArray(s.councilProfiles) ? s.councilProfiles : [],
    transformations: Array.isArray(s.transformations) ? s.transformations : [],

    // if you have inventory or similar lists used anywhere:
    inventory: Array.isArray(s.inventory) ? s.inventory : [],
  } as GameState;
}
