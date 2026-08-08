import type { SessionLogEntry } from './types';

/**
 * Consecutive day numbers ending at (and including) `today` that have a
 * session log entry with at least one review. Breaks on the first gap.
 */
export function computeStreak(log: SessionLogEntry[], today: number): number {
  const daysReviewed = new Set(log.filter((e) => e.reviewed >= 1).map((e) => e.day));
  let streak = 0;
  let day = today;
  while (daysReviewed.has(day)) {
    streak++;
    day--;
  }
  return streak;
}
