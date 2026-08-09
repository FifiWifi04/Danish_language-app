import type { Progress, Rating } from './types';

export interface RatingSnapshot {
  id: string;
  priorProgress: Progress;
  rating: Rating;
}

/** Captures what's needed to undo a rating before it's applied — one level deep, per PLAN_PHASE5_MODES.md WS-D. */
export function captureSnapshot(id: string, priorProgress: Progress, rating: Rating): RatingSnapshot {
  return { id, priorProgress, rating };
}

/** Returns the exact pre-rating Progress for the caller to persist and requeue. */
export function applyUndo(snapshot: RatingSnapshot): Progress {
  return snapshot.priorProgress;
}
