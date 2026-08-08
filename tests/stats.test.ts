import { describe, it, expect } from 'vitest';
import {
  computeStreak,
  computeDueCounts,
  computeRetention,
  last30DaysBars,
  countLeeches,
} from '../src/core/stats';
import type { Progress, SessionLogEntry } from '../src/core/types';

const TODAY = 100;
const NOW_MINUTE = 144_100;
const CAPS = { newPerDay: 20, reviewsPerDay: 200 };

function entry(day: number, reviewed: number, overrides: Partial<SessionLogEntry> = {}): SessionLogEntry {
  return {
    day,
    mode: 'review',
    reviewed,
    newIntroduced: 0,
    againCount: 0,
    hardCount: 0,
    goodCount: reviewed,
    durationSec: 0,
    ...overrides,
  };
}

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

describe('stats', () => {
  it('stats: streak counts consecutive reviewed days ending at today', () => {
    const log = [entry(98, 5), entry(99, 3), entry(100, 1)];
    expect(computeStreak(log, 100)).toBe(3);
  });

  it('stats: streak stops at the first gap', () => {
    const log = [entry(97, 2), entry(99, 3), entry(100, 1)];
    expect(computeStreak(log, 100)).toBe(2);
  });

  it('stats: a day with zero reviews does not count', () => {
    const log = [entry(100, 0)];
    expect(computeStreak(log, 100)).toBe(0);
  });

  it('stats: computeDueCounts counts due steps and due reviews, caps reviews', () => {
    const all = [
      makeProgress('learn', { state: 'learning', dueMinute: NOW_MINUTE - 1 }),
      makeProgress('rev-a', { state: 'review', dueDay: TODAY }),
      makeProgress('rev-b', { state: 'review', dueDay: TODAY }),
      makeProgress('rev-c', { state: 'review', dueDay: TODAY }),
      makeProgress('suspended', { state: 'suspended', dueDay: TODAY }),
      makeProgress('leech', { state: 'review', dueDay: TODAY, isLeech: true }),
    ];
    const { dueToday } = computeDueCounts(all, TODAY, NOW_MINUTE, { newPerDay: 20, reviewsPerDay: 2 });
    expect(dueToday).toBe(3); // 1 learning step + 2 of the 3 due reviews (capped)
  });

  it('stats: computeDueCounts gates new cards on due reviews being cleared', () => {
    const cleared = [makeProgress('new-1', { state: 'new' }), makeProgress('new-2', { state: 'new' })];
    expect(computeDueCounts(cleared, TODAY, NOW_MINUTE, CAPS).newRemaining).toBe(2);

    const notCleared = [
      makeProgress('rev-a', { state: 'review', dueDay: TODAY }),
      makeProgress('rev-b', { state: 'review', dueDay: TODAY }),
      makeProgress('new-1', { state: 'new' }),
    ];
    expect(
      computeDueCounts(notCleared, TODAY, NOW_MINUTE, { newPerDay: 20, reviewsPerDay: 1 }).newRemaining,
    ).toBe(0);
  });

  it('stats: computeRetention is (good+hard)/reviewed over the window, null when empty', () => {
    const log = [entry(TODAY, 10, { goodCount: 7, hardCount: 2, againCount: 1 })];
    expect(computeRetention(log, TODAY, 30)).toBeCloseTo(0.9);
    expect(computeRetention([], TODAY, 30)).toBeNull();
  });

  it('stats: computeRetention excludes entries outside the trailing window', () => {
    const log = [
      entry(TODAY, 10, { goodCount: 10 }), // fully retained, inside window
      entry(TODAY - 40, 10, { goodCount: 0 }), // outside a 30-day window
    ];
    expect(computeRetention(log, TODAY, 30)).toBe(1);
  });

  it('stats: last30DaysBars returns 30 entries ending at today, zero-filled where absent', () => {
    const log = [entry(TODAY, 5), entry(TODAY - 1, 2)];
    const bars = last30DaysBars(log, TODAY);
    expect(bars).toHaveLength(30);
    expect(bars[bars.length - 1]).toEqual({ day: TODAY, reviewed: 5 });
    expect(bars[bars.length - 2]).toEqual({ day: TODAY - 1, reviewed: 2 });
    expect(bars[0]).toEqual({ day: TODAY - 29, reviewed: 0 });
  });

  it('stats: countLeeches counts only isLeech rows', () => {
    const all = [
      makeProgress('a', { isLeech: true }),
      makeProgress('b', { isLeech: false }),
      makeProgress('c', { isLeech: true }),
    ];
    expect(countLeeches(all)).toBe(2);
  });
});
