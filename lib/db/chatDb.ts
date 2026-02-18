import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabase("vantara.db");

export function initDb() {
  db.transaction(tx => {
    tx.executeSql(`CREATE TABLE IF NOT EXISTS threads (
      id TEXT PRIMARY KEY,
      title TEXT,
      createdAt INTEGER,
      updatedAt INTEGER
    );`);
    tx.executeSql(`CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      threadId TEXT,
      role TEXT,
      content TEXT,
      createdAt INTEGER,
      FOREIGN KEY(threadId) REFERENCES threads(id)
    );`);
    tx.executeSql(`CREATE TABLE IF NOT EXISTS kv (
      key TEXT PRIMARY KEY,
      value TEXT,
      updatedAt INTEGER
    );`);
    tx.executeSql(`CREATE INDEX IF NOT EXISTS idx_messages_threadId ON messages(threadId);`);
  });
}

