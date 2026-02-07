import { db } from "./chatDb";

export function saveMessage(msg) {
  db.transaction(tx => {
    tx.executeSql(
      "INSERT INTO messages (id, threadId, role, content, createdAt) VALUES (?,?,?,?,?)",
      [msg.id, msg.threadId, msg.role, msg.content, Date.now()]
    );
  });
}

export function loadThread(threadId, cb) {
  db.transaction(tx => {
    tx.executeSql(
      "SELECT * FROM messages WHERE threadId = ? ORDER BY createdAt",
      [threadId],
      (_, { rows }) => cb(rows._array)
    );
  });
}

export function clearThread(threadId) {
  db.transaction(tx => {
    tx.executeSql("DELETE FROM messages WHERE threadId = ?", [threadId]);
  });
}
