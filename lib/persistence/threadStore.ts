import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("mavis.db");

export type ChatThread = {
  id: string;
  title: string;
  createdAt: number;
};

export type ChatMessage = {
  id: string;
  threadId: string;
  role: "user" | "assistant";
  text: string;
  createdAt: number;
};

export function initThreadStore() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS threads (
      id TEXT PRIMARY KEY,
      title TEXT,
      createdAt INTEGER
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      threadId TEXT,
      role TEXT,
      text TEXT,
      createdAt INTEGER
    );
  `);
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function createThread(title = "New Chat"): ChatThread {
  const thread: ChatThread = {
    id: uid(),
    title,
    createdAt: Date.now(),
  };

  db.runSync(
    "INSERT INTO threads (id, title, createdAt) VALUES (?, ?, ?)",
    [thread.id, thread.title, thread.createdAt]
  );

  return thread;
}

export function getMessages(threadId: string): ChatMessage[] {
  return db.getAllSync(
    "SELECT * FROM messages WHERE threadId = ? ORDER BY createdAt ASC",
    [threadId]
  ) as ChatMessage[];
}

export function addMessage(msg: ChatMessage) {
  db.runSync(
    "INSERT INTO messages (id, threadId, role, text, createdAt) VALUES (?, ?, ?, ?, ?)",
    [msg.id, msg.threadId, msg.role, msg.text, msg.createdAt]
  );
}

export function clearThread(threadId: string) {
  db.runSync("DELETE FROM messages WHERE threadId = ?", [threadId]);
}
