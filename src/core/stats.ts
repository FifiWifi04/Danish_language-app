import type { Progress, SessionLogEntry } from './types';

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

export interface DueCaps {
  newPerDay: number;
  reviewsPerDay: number;
}

/**
 * Due/new counts for "today", mirroring `buildSession`'s own filtering
 * (active, non-leech; reviews capped; new cards gated on reviews being
 * cleared) without consuming an RNG — this is a display-only preview, not
 * an actual session draw.
 */
export function computeDueCounts(
  all: Progress[],
  today: number,
  nowMinute: number,
  caps: DueCaps,
): { dueToday: number; newRemaining: number } {
  const active = all.filter((p) => p.state !== 'suspended' && !p.isLeech);

  const dueSteps = active.filter(
    (p) =>
      (p.state === 'learning' || p.state === 'relearning') &&
      p.dueMinute !== null &&
      p.dueMinute <= nowMinute,
  ).length;

  const dueReviewsAll = active.filter((p) => p.state === 'review' && p.dueDay <= today);
  const reviewsCleared = dueReviewsAll.length <= caps.reviewsPerDay;
  const dueReviews = Math.min(dueReviewsAll.length, caps.reviewsPerDay);

  const newCount = active.filter((p) => p.state === 'new').length;
  const newRemaining = reviewsCleared ? Math.min(newCount, caps.newPerDay) : 0;

  return { dueToday: dueSteps + dueReviews, newRemaining };
}

/**
 * (good+hard)/(all rated) over the trailing `windowDays` ending at `today`,
 * inclusive. `null` when there were zero reviews in the window (avoids a
 * misleading 0% / divide-by-zero).
 */
export function computeRetention(
  log: SessionLogEntry[],
  today: number,
  windowDays: number,
): number | null {
  const cutoff = today - windowDays + 1;
  const inWindow = log.filter((e) => e.day >= cutoff && e.day <= today);
  const total = inWindow.reduce((sum, e) => sum + e.reviewed, 0);
  if (total === 0) return null;
  const retained = inWindow.reduce((sum, e) => sum + e.goodCount + e.hardCount, 0);
  return retained / total;
}

/** One entry per day for the trailing 30 days ending at `today`, oldest first. */
export function last30DaysBars(
  log: SessionLogEntry[],
  today: number,
): { day: number; reviewed: number }[] {
  const byDay = new Map<number, number>();
  for (const e of log) {
    byDay.set(e.day, (byDay.get(e.day) ?? 0) + e.reviewed);
  }
  const bars: { day: number; reviewed: number }[] = [];
  for (let day = today - 29; day <= today; day++) {
    bars.push({ day, reviewed: byDay.get(day) ?? 0 });
  }
  return bars;
}

export function countLeeches(all: Progress[]): number {
  return all.filter((p) => p.isLeech).length;
}
