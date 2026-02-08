import { db } from "./db";

/**
 * Clears ONLY chat + session data.
 * Preserves long-term memory (memory_vault).
 */
export function clearChatSessionOnly() {
  db.execSync(`
    DELETE FROM messages;
    DELETE FROM threads;
    DELETE FROM stream_state;
    VACUUM;
  `);
}
