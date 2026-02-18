import { db } from "./db";

/**
 * Clears ONLY chat + session data.
 * Preserves long-term memory (memory_vault).
 */
export function clearChatSessionOnly(token?: string) {
  
  
  if (!__DEV__) { return; }
  if (token !== "I_UNDERSTAND") { return; }
if (!__DEV__) { return; }
db.execSync(`
    DELETE FROM messages;
    DELETE FROM threads;
    DELETE FROM stream_state;
    VACUUM;
  `);
}


