import { describe, it, expect } from 'vitest';
import { schedule } from '../src/core/scheduler';
import { mulberry32 } from '../src/core/rng';
import type { Progress, Rating, CardState } from '../src/core/types';

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

describe('scheduler: invariants', () => {
  it('sched: leech at 8th lapse suspends', () => {
    const p = makeProgress('a', { state: 'review', reps: 4, intervalDays: 10, ease: 1.5, lapses: 7 });
    const result = schedule({ progress: p, rating: 'again', nowMinute: 1000, today: 50 });
    expect(result.lapses).toBe(8);
    expect(result.isLeech).toBe(true);
    expect(result.state).toBe('suspended');
  });

  it('sched: ease never leaves [1.3,2.7] under 100 random ratings', () => {
    const ratings: Rating[] = ['again', 'hard', 'good'];
    const rng = mulberry32(42);
    let p = makeProgress('a', { state: 'review', reps: 5, intervalDays: 10, ease: 2.5 });
    for (let i = 0; i < 100; i++) {
      const rating = ratings[Math.floor(rng() * ratings.length)] as Rating;
      const result = schedule({ progress: p, rating, nowMinute: i * 20, today: i });
      expect(result.ease).toBeGreaterThanOrEqual(1.3);
      expect(result.ease).toBeLessThanOrEqual(2.7);
      p = result;
    }
  });

  it('sched: interval never exceeds 365', () => {
    let p = makeProgress('a', { state: 'review', reps: 5, intervalDays: 300, ease: 2.7 });
    for (let i = 0; i < 10; i++) {
      const result = schedule({ progress: p, rating: 'good', nowMinute: i, today: i });
      expect(result.intervalDays).toBeLessThanOrEqual(365);
      expect(result.intervalDays).toBeGreaterThanOrEqual(1);
      p = result;
    }
  });

  it('sched: schedule is pure (input object unmutated)', () => {
    const p = Object.freeze(makeProgress('a', { state: 'review', reps: 2, intervalDays: 10, ease: 2.5 }));
    const before = JSON.stringify(p);
    const result = schedule({ progress: p, rating: 'again', nowMinute: 1000, today: 50 });
    expect(JSON.stringify(p)).toBe(before);
    expect(result).not.toBe(p);
  });

  it('sched: every (state, rating) pair returns a valid Progress', () => {
    const states: CardState[] = ['new', 'learning', 'review', 'relearning', 'suspended'];
    const ratings: Rating[] = ['again', 'hard', 'good'];
    for (const state of states) {
      for (const rating of ratings) {
        const p = makeProgress('a', {
          state,
          step: state === 'learning' || state === 'relearning' ? 1 : 0,
          reps: 2,
          lapses: 1,
          ease: 2.0,
          intervalDays: 5,
          dueDay: 10,
          dueMinute: 1000,
        });
        let result: Progress | undefined;
        expect(() => {
          result = schedule({ progress: p, rating, nowMinute: 1000, today: 10 });
        }).not.toThrow();
        expect(Number.isNaN(result?.ease)).toBe(false);
        expect(Number.isNaN(result?.intervalDays)).toBe(false);
        expect(result?.intervalDays).toBeGreaterThanOrEqual(1);
      }
    }
  });
});
