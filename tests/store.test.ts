import { describe, it, expect } from 'vitest';
import { MemoryStore } from '../src/data/memory';
import type { Progress, SessionLogEntry } from '../src/core/types';

function makeProgress(id: string, overrides: Partial<Progress> = {}): Progress {
  return {
    id,
    state: 'new',
    step: 0,
    reps: 0,
    lapses: 0,
    ease: 2.5,
    intervalDays: 0,
    dueDay: 0,
    dueMinute: null,
    isLeech: false,
    contentHash: '',
    flagged: null,
    ...overrides,
  };
}

function makeLogEntry(overrides: Partial<SessionLogEntry> = {}): SessionLogEntry {
  return {
    day: 100,
    mode: 'review',
    reviewed: 5,
    newIntroduced: 2,
    againCount: 1,
    hardCount: 1,
    goodCount: 3,
    durationSec: 120,
    ...overrides,
  };
}

describe('store: MemoryStore contract', () => {
  it('store: roundtrip', async () => {
    const store = new MemoryStore();
    expect(await store.get('a')).toBeUndefined();

    const p = makeProgress('a');
    await store.put(p);
    expect(await store.get('a')).toEqual(p);
    expect(await store.all()).toEqual([p]);

    const entry = makeLogEntry();
    await store.putSessionLog(entry);
    expect(await store.sessionLog()).toEqual([entry]);
  });

  it('store: export/import identity', async () => {
    const store = new MemoryStore();
    await store.put(makeProgress('a'));
    await store.put(makeProgress('b', { state: 'review', reps: 3, ease: 2.1 }));
    await store.putSessionLog(makeLogEntry());
    await store.putSessionLog(makeLogEntry({ day: 101, mode: 'dictation' }));

    const json = await store.exportAll();

    const restored = new MemoryStore();
    await restored.importAll(json);

    expect(await restored.all()).toEqual(await store.all());
    expect(await restored.sessionLog()).toEqual(await store.sessionLog());
  });

  it('store: import rejects bad version', async () => {
    const store = new MemoryStore();
    const badExport = JSON.stringify({ v: 999, exportedAt: 0, progress: [], sessionLog: [] });
    await expect(store.importAll(badExport)).rejects.toThrow();
  });
});
