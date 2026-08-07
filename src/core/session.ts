import type { Progress, Session } from './types';

export interface SessionCaps {
  newPerDay: number;
  reviewsPerDay: number;
}

const DEFAULT_CAPS: SessionCaps = { newPerDay: 20, reviewsPerDay: 200 };

/**
 * Builds one day's review queue: due learning/relearning steps first, then
 * due reviews (shuffled, capped), then new cards — but only once the due
 * reviews are fully cleared (none left over the cap), per HANDOFF §4.5
 * ("new cards are introduced only after reviews are cleared").
 */
export function buildSession(
  all: Progress[],
  contentOrder: Map<string, { priority: number; index: number }>,
  today: number,
  nowMinute: number,
  caps: SessionCaps = DEFAULT_CAPS,
  rng: () => number,
): Session {
  const active = all.filter((p) => p.state !== 'suspended' && !p.isLeech);

  const dueSteps = active.filter(
    (p) =>
      (p.state === 'learning' || p.state === 'relearning') &&
      p.dueMinute !== null &&
      p.dueMinute <= nowMinute,
  );

  const dueReviewsAll = active.filter((p) => p.state === 'review' && p.dueDay <= today);
  const reviewsCleared = dueReviewsAll.length <= caps.reviewsPerDay;
  const dueReviews = shuffle(dueReviewsAll, rng).slice(0, caps.reviewsPerDay);

  const newCards = reviewsCleared
    ? active
        .filter((p) => p.state === 'new')
        .sort((a, b) => compareOrder(contentOrder, a.id, b.id))
        .slice(0, caps.newPerDay)
    : [];

  return {
    queue: [...dueSteps, ...dueReviews, ...newCards].map((p) => p.id),
    newIntroduced: newCards.length,
    reviewsDone: dueReviews.length,
  };
}

function compareOrder(
  contentOrder: Map<string, { priority: number; index: number }>,
  a: string,
  b: string,
): number {
  const fallback = { priority: Number.MAX_SAFE_INTEGER, index: 0 };
  const oa = contentOrder.get(a) ?? fallback;
  const ob = contentOrder.get(b) ?? fallback;
  return oa.priority - ob.priority || oa.index - ob.index;
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = result[i] as T;
    result[i] = result[j] as T;
    result[j] = tmp;
  }
  return result;
}
