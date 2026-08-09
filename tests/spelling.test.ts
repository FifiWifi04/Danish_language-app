import { describe, it, expect } from 'vitest';
import { isSpellingMatch, spellingDiff, firstWrongIndex, isModeBEligible } from '../src/core/spelling';
import type { Progress } from '../src/core/types';

function makeProgress(overrides: Partial<Progress> = {}): Progress {
  return {
    id: 'a',
    state: 'review',
    step: 0,
    reps: 2,
    lapses: 0,
    ease: 2.5,
    intervalDays: 6,
    dueDay: 0,
    dueMinute: null,
    isLeech: false,
    contentHash: '',
    flagged: null,
    ...overrides,
  };
}

describe('spell', () => {
  it('spell: ae oe aa equivalence', () => {
    expect(isSpellingMatch('faerdig', 'færdig')).toBe(true);
    expect(isSpellingMatch('groen', 'grøn')).toBe(true);
    expect(isSpellingMatch('blaa', 'blå')).toBe(true);
    expect(isSpellingMatch('færdig', 'faerdig')).toBe(true);
  });

  it('spell: case and trim insensitive', () => {
    expect(isSpellingMatch('  Hej  ', 'hej')).toBe(true);
    expect(isSpellingMatch('HEJ', 'hej')).toBe(true);
    expect(isSpellingMatch(' blaa ', 'Blå')).toBe(true);
  });

  it('spell: diff marks first wrong char', () => {
    const diff = spellingDiff('haj', 'hej');
    expect(firstWrongIndex(diff)).toBe(1);
    expect(diff[1]).toEqual({ char: 'e', correct: false });
    expect(diff[0]).toEqual({ char: 'h', correct: true });
  });

  it('spell: diff is empty of wrong chars on an exact match', () => {
    const diff = spellingDiff('toe', 'tø');
    expect(firstWrongIndex(diff)).toBeNull();
    expect(diff.every((d) => d.correct)).toBe(true);
  });

  it('spell: mode B eligibility requires review state and reps >= 2', () => {
    expect(isModeBEligible(makeProgress({ state: 'review', reps: 2 }))).toBe(true);
    expect(isModeBEligible(makeProgress({ state: 'review', reps: 1 }))).toBe(false);
    expect(isModeBEligible(makeProgress({ state: 'learning', reps: 5 }))).toBe(false);
  });
});
