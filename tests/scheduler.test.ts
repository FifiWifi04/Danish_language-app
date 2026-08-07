import { describe, it, expect } from 'vitest';
import { schedule } from '../src/core/scheduler';
import type { Progress } from '../src/core/types';

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

describe('scheduler: transition table rows', () => {
  it('sched: row 1 new card enters learning at step 0', () => {
    const p = makeProgress('a', { state: 'new' });
    const result = schedule({ progress: p, rating: 'good', nowMinute: 1000, today: 50 });
    expect(result.state).toBe('learning');
    expect(result.step).toBe(0);
    expect(result.dueMinute).toBe(1001);
  });

  it('sched: row 2 learning step 0 again stays at step 0', () => {
    const p = makeProgress('a', { state: 'learning', step: 0 });
    const result = schedule({ progress: p, rating: 'again', nowMinute: 1000, today: 50 });
    expect(result.step).toBe(0);
    expect(result.dueMinute).toBe(1001);
  });

  it('sched: row 3 learning step 0 good advances to step 1', () => {
    const p = makeProgress('a', { state: 'learning', step: 0 });
    const result = schedule({ progress: p, rating: 'good', nowMinute: 1000, today: 50 });
    expect(result.step).toBe(1);
    expect(result.dueMinute).toBe(1010);
  });

  it('sched: row 4 learning step 1 again returns to step 0', () => {
    const p = makeProgress('a', { state: 'learning', step: 1 });
    const result = schedule({ progress: p, rating: 'again', nowMinute: 1000, today: 50 });
    expect(result.step).toBe(0);
    expect(result.dueMinute).toBe(1001);
  });

  it('sched: row 5 learning step 1 good graduates to review', () => {
    const p = makeProgress('a', { state: 'learning', step: 1 });
    const result = schedule({ progress: p, rating: 'good', nowMinute: 1000, today: 50 });
    expect(result.state).toBe('review');
    expect(result.step).toBe(0);
    expect(result.reps).toBe(0);
    expect(result.intervalDays).toBe(1);
    expect(result.dueDay).toBe(51);
    expect(result.dueMinute).toBeNull();
  });

  it('sched: row 6 learning hard repeats the current step', () => {
    const p = makeProgress('a', { state: 'learning', step: 1 });
    const result = schedule({ progress: p, rating: 'hard', nowMinute: 1000, today: 50 });
    expect(result.step).toBe(1);
    expect(result.dueMinute).toBe(1005);
  });

  it('sched: row 7 first review good gives 6 days', () => {
    const p = makeProgress('a', { state: 'review', reps: 0, intervalDays: 3, ease: 2.5 });
    const result = schedule({ progress: p, rating: 'good', nowMinute: 1000, today: 50 });
    expect(result.reps).toBe(1);
    expect(result.intervalDays).toBe(6);
    expect(result.dueDay).toBe(56);
  });

  it('sched: row 8 subsequent review good multiplies by ease', () => {
    const p = makeProgress('a', { state: 'review', reps: 1, intervalDays: 6, ease: 2.5 });
    const result = schedule({ progress: p, rating: 'good', nowMinute: 1000, today: 50 });
    expect(result.reps).toBe(2);
    expect(result.intervalDays).toBe(15); // round(6 * 2.5)
    expect(result.dueDay).toBe(65);
  });

  it('sched: row 9 review hard is not a lapse', () => {
    const p = makeProgress('a', { state: 'review', reps: 2, intervalDays: 15, ease: 2.5, lapses: 0 });
    const result = schedule({ progress: p, rating: 'hard', nowMinute: 1000, today: 50 });
    expect(result.intervalDays).toBe(18); // max(16, round(18))
    expect(result.ease).toBeCloseTo(2.35);
    expect(result.reps).toBe(3);
    expect(result.dueDay).toBe(68);
    expect(result.lapses).toBe(0);
    expect(result.state).toBe('review');
  });

  it('sched: row 10 review again enters relearning with halved pending interval', () => {
    const p = makeProgress('a', { state: 'review', reps: 3, intervalDays: 18, ease: 2.35, lapses: 0 });
    const result = schedule({ progress: p, rating: 'again', nowMinute: 1000, today: 50 });
    expect(result.lapses).toBe(1);
    expect(result.ease).toBeCloseTo(2.15);
    expect(result.state).toBe('relearning');
    expect(result.step).toBe(0);
    expect(result.dueMinute).toBe(1010);
    expect(result.intervalDays).toBe(9); // max(1, round(18 * 0.5))
  });

  it('sched: row 11 relearning good graduates at the pending interval', () => {
    const p = makeProgress('a', { state: 'relearning', intervalDays: 9, reps: 3, ease: 2.15, lapses: 1 });
    const result = schedule({ progress: p, rating: 'good', nowMinute: 1000, today: 50 });
    expect(result.state).toBe('review');
    expect(result.step).toBe(0);
    expect(result.dueMinute).toBeNull();
    expect(result.dueDay).toBe(59); // today + the parked interval
    expect(result.intervalDays).toBe(9);
    expect(result.reps).toBe(3);
    expect(result.ease).toBeCloseTo(2.15);
  });

  it('sched: row 12 relearning again stays with no extra lapse', () => {
    const p = makeProgress('a', { state: 'relearning', intervalDays: 9, lapses: 1 });
    const result = schedule({ progress: p, rating: 'again', nowMinute: 1000, today: 50 });
    expect(result.state).toBe('relearning');
    expect(result.step).toBe(0);
    expect(result.dueMinute).toBe(1010);
    expect(result.lapses).toBe(1);
    expect(result.intervalDays).toBe(9);
  });

  it('sched: row 12b relearning hard graduates at half the pending interval', () => {
    const p = makeProgress('a', { state: 'relearning', intervalDays: 9, reps: 3, ease: 2.15, lapses: 1 });
    const result = schedule({ progress: p, rating: 'hard', nowMinute: 1000, today: 50 });
    expect(result.state).toBe('review');
    expect(result.step).toBe(0);
    expect(result.intervalDays).toBe(5); // max(1, round(9 * 0.5))
    expect(result.dueDay).toBe(55);
    expect(result.reps).toBe(3);
    expect(result.ease).toBeCloseTo(2.15); // unchanged, no second penalty
    expect(result.lapses).toBe(1); // not a lapse
  });
});
