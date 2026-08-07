import type { Progress, SessionLogEntry } from './types';

export interface ProgressStore {
  get(id: string): Promise<Progress | undefined>;
  put(p: Progress): Promise<void>;
  all(): Promise<Progress[]>;
  putSessionLog(e: SessionLogEntry): Promise<void>;
  sessionLog(): Promise<SessionLogEntry[]>;
  exportAll(): Promise<string>;
  importAll(json: string): Promise<void>;
}

export const EXPORT_VERSION = 1;

export interface ExportPayload {
  v: number;
  exportedAt: number;
  progress: Progress[];
  sessionLog: SessionLogEntry[];
}
