import type { Progress, SessionLogEntry } from '../core/types';
import type { ExportPayload, ProgressStore } from '../core/store';
import { EXPORT_VERSION } from '../core/store';

export class MemoryStore implements ProgressStore {
  private progress = new Map<string, Progress>();
  private log: SessionLogEntry[] = [];

  async get(id: string): Promise<Progress | undefined> {
    return this.progress.get(id);
  }

  async put(p: Progress): Promise<void> {
    this.progress.set(p.id, p);
  }

  async all(): Promise<Progress[]> {
    return [...this.progress.values()];
  }

  async putSessionLog(e: SessionLogEntry): Promise<void> {
    this.log.push(e);
  }

  async sessionLog(): Promise<SessionLogEntry[]> {
    return [...this.log];
  }

  async exportAll(): Promise<string> {
    const payload: ExportPayload = {
      v: EXPORT_VERSION,
      exportedAt: Date.now(),
      progress: [...this.progress.values()],
      sessionLog: [...this.log],
    };
    return JSON.stringify(payload);
  }

  async importAll(json: string): Promise<void> {
    const data = JSON.parse(json) as ExportPayload;
    if (data.v !== EXPORT_VERSION) {
      throw new Error(`unsupported export version: ${String(data.v)}`);
    }
    this.progress = new Map(data.progress.map((p) => [p.id, p]));
    this.log = [...data.sessionLog];
  }
}
