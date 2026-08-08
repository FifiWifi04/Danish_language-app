import { describe, it, expect } from 'vitest';
import { computeStreak } from '../src/core/stats';
import type { SessionLogEntry } from '../src/core/types';

function entry(day: number, reviewed: number): SessionLogEntry {
  return { day, mode: 'review', reviewed, newIntroduced: 0, againCount: 0, hardCount: 0, goodCount: reviewed, durationSec: 0 };
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
});
