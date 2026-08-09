import type { Progress } from './types';

export const REWORK_FLAG = 'rework-request';

/**
 * Pulls a leech back into the active review queue. Only the schedule resets
 * (isLeech, state, interval, due day) — lapses and reps are left untouched
 * so the card's history survives, per PLAN_PHASE5_MODES.md WS-D and the
 * matching docs/DECISIONS.md entry.
 */
export function unsuspendForRework(progress: Progress, today: number): Progress {
  return {
    ...progress,
    isLeech: false,
    state: 'review',
    step: 0,
    intervalDays: 1,
    dueDay: today + 1,
    dueMinute: null,
  };
}

/** Marks a leech as needing a content rewrite, without touching its schedule. */
export function flagForRework(progress: Progress): Progress {
  return { ...progress, flagged: REWORK_FLAG };
}
