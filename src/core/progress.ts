import type { Progress } from './types';

/** Default row for a card that has never been shown. */
export function newProgress(id: string, contentHash: string): Progress {
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
    contentHash,
    flagged: null,
  };
}

/**
 * Unions content items with stored progress: a stored row wins over its id,
 * an item with no stored row gets a fresh `newProgress`. Order follows
 * `items`.
 */
export function materializeProgress(
  items: { id: string; contentHash: string }[],
  stored: Progress[],
): Progress[] {
  const byId = new Map(stored.map((p) => [p.id, p]));
  return items.map((item) => byId.get(item.id) ?? newProgress(item.id, item.contentHash));
}
