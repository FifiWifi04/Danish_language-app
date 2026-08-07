import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';
import type { Progress, SessionLogEntry } from '../core/types';
import type { ExportPayload, ProgressStore } from '../core/store';
import { EXPORT_VERSION } from '../core/store';

const DB_NAME = 'danmarksliv';
const DB_VERSION = 1;
const PROGRESS_STORE = 'progress';
const SESSION_LOG_STORE = 'sessionLog';

function open(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore(PROGRESS_STORE, { keyPath: 'id' });
      db.createObjectStore(SESSION_LOG_STORE, { autoIncrement: true });
    },
  });
}

export class IdbStore implements ProgressStore {
  private dbPromise = open();

  async get(id: string): Promise<Progress | undefined> {
    const db = await this.dbPromise;
    return db.get(PROGRESS_STORE, id);
  }

  async put(p: Progress): Promise<void> {
    const db = await this.dbPromise;
    await db.put(PROGRESS_STORE, p);
  }

  async all(): Promise<Progress[]> {
    const db = await this.dbPromise;
    return db.getAll(PROGRESS_STORE);
  }

  async putSessionLog(e: SessionLogEntry): Promise<void> {
    const db = await this.dbPromise;
    await db.add(SESSION_LOG_STORE, e);
  }

  async sessionLog(): Promise<SessionLogEntry[]> {
    const db = await this.dbPromise;
    return db.getAll(SESSION_LOG_STORE);
  }

  async exportAll(): Promise<string> {
    const [progress, sessionLog] = await Promise.all([this.all(), this.sessionLog()]);
    const payload: ExportPayload = { v: EXPORT_VERSION, exportedAt: Date.now(), progress, sessionLog };
    return JSON.stringify(payload);
  }

  async importAll(json: string): Promise<void> {
    const data = JSON.parse(json) as ExportPayload;
    if (data.v !== EXPORT_VERSION) {
      throw new Error(`unsupported export version: ${String(data.v)}`);
    }
    const db = await this.dbPromise;

    const progressTx = db.transaction(PROGRESS_STORE, 'readwrite');
    await progressTx.store.clear();
    await Promise.all(data.progress.map((p) => progressTx.store.put(p)));
    await progressTx.done;

    const logTx = db.transaction(SESSION_LOG_STORE, 'readwrite');
    await logTx.store.clear();
    await Promise.all(data.sessionLog.map((e) => logTx.store.add(e)));
    await logTx.done;
  }
}
