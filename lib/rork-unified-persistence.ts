/**
 * LEGACY STUB (deprecated)
 * This file exists only to catch accidental imports.
 * Migrate callsites to src/db/jsonStore.ts (SQLite KV), or the new modules that wrap it.
 */
export function legacyPersistenceCalled(): never {
  throw new Error(
    "Legacy persistence called (lib/rork-unified-persistence.ts). " +
      "Migrate this callsite to SQLite jsonStore (src/db/jsonStore.ts)."
  );
}

// Export common names as traps (edit these to match what your legacy file exported)
export const getItem = legacyPersistenceCalled;
export const setItem = legacyPersistenceCalled;
export const removeItem = legacyPersistenceCalled;
export const multiRemove = legacyPersistenceCalled;
export default legacyPersistenceCalled;