import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

let db: SQLite.SQLiteDatabase | null = null;

const getDb = (): SQLite.SQLiteDatabase => {
  if (!db) {
    db = SQLite.openDatabaseSync('blacksun_storage.db');
    db.execSync(
      'CREATE TABLE IF NOT EXISTS kv_store (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);'
    );
    console.log('[Storage] SQLite database initialized');
  }
  return db;
};

let webFallback: Record<string, string> | null = null;

const getWebStorage = (): Record<string, string> => {
  if (!webFallback) {
    webFallback = {};
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith('bsm_')) {
          webFallback[key.slice(4)] = localStorage.getItem(key) || '';
        }
      }
    } catch (e) {
      console.error('[Storage] Web localStorage init error:', e);
    }
  }
  return webFallback;
};

const Storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        try {
          const val = localStorage.getItem('bsm_' + key);
          return val;
        } catch {
          return getWebStorage()[key] ?? null;
        }
      }
      const database = getDb();
      const result = database.getFirstSync<{ value: string }>(
        'SELECT value FROM kv_store WHERE key = ?;',
        [key]
      );
      return result?.value ?? null;
    } catch (e) {
      console.error('[Storage] getItem error:', key, e);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        try {
          localStorage.setItem('bsm_' + key, value);
        } catch {
          getWebStorage()[key] = value;
        }
        return;
      }
      const database = getDb();
      database.runSync(
        'INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?);',
        [key, value]
      );
    } catch (e) {
      console.error('[Storage] setItem error:', key, e);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        try {
          localStorage.removeItem('bsm_' + key);
        } catch {
          delete getWebStorage()[key];
        }
        return;
      }
      const database = getDb();
      database.runSync('DELETE FROM kv_store WHERE key = ?;', [key]);
    } catch (e) {
      console.error('[Storage] removeItem error:', key, e);
    }
  },
};

export default Storage;
