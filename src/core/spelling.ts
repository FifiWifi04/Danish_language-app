import type { Progress } from './types';

export const MODE_B_MIN_REPS = 2;

const DIGRAPHS: [RegExp, string][] = [
  [/ae/g, 'æ'],
  [/oe/g, 'ø'],
  [/aa/g, 'å'],
];

/** Lowercase, trim, and unify the ae/oe/aa digraphs with their accented letters so typed and reference spellings compare equal either way. */
export function normalizeSpelling(input: string): string {
  let s = input.trim().toLowerCase();
  for (const [pattern, replacement] of DIGRAPHS) {
    s = s.replace(pattern, replacement);
  }
  return s;
}

export function isSpellingMatch(input: string, target: string): boolean {
  return normalizeSpelling(input) === normalizeSpelling(target);
}

export interface CharDiff {
  char: string;
  correct: boolean;
}

/** Per-char diff of the normalised input against the normalised target, for a simple highlight — shows the target's own letters so the correct spelling is visible even on a miss. */
export function spellingDiff(input: string, target: string): CharDiff[] {
  const a = normalizeSpelling(input);
  const b = normalizeSpelling(target);
  const len = Math.max(a.length, b.length);
  const result: CharDiff[] = [];
  for (let i = 0; i < len; i++) {
    result.push({ char: b[i] ?? a[i] ?? '', correct: a[i] === b[i] });
  }
  return result;
}

export function firstWrongIndex(diff: CharDiff[]): number | null {
  const idx = diff.findIndex((d) => !d.correct);
  return idx === -1 ? null : idx;
}

/** Promotion rule (HANDOFF §3.8): a review-state card is eligible for Mode B active spelling once it has been rated at least `MODE_B_MIN_REPS` times. */
export function isModeBEligible(progress: Progress): boolean {
  return progress.state === 'review' && progress.reps >= MODE_B_MIN_REPS;
}
