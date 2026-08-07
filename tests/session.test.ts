import { describe, it, expect } from 'vitest';
import { buildSession } from '../src/core/session';
import type { Progress } from '../src/core/types';

const TODAY = 100;
const NOW_MINUTE = 144_100;

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

const zeroRng = () => 0;

describe('session', () => {
  it('session: due learning/relearning steps come first', () => {
    const review = makeProgress('review-card', { state: 'review', dueDay: TODAY });
    const learning = makeProgress('learning-card', {
      state: 'learning',
      dueMinute: NOW_MINUTE - 1,
    });
    const relearning = makeProgress('relearning-card', {
      state: 'relearning',
      dueMinute: NOW_MINUTE,
    });
    const fresh = makeProgress('new-card');

    const result = buildSession(
      [review, learning, relearning, fresh],
      new Map([['new-card', { priority: 1, index: 0 }]]),
      TODAY,
      NOW_MINUTE,
      { newPerDay: 20, reviewsPerDay: 200 },
      zeroRng,
    );

    expect(result.queue).toEqual(['learning-card', 'relearning-card', 'review-card', 'new-card']);
  });

  it('session: due reviews are shuffled and capped at reviewsPerDay', () => {
    const a = makeProgress('a', { state: 'review', dueDay: TODAY });
    const b = makeProgress('b', { state: 'review', dueDay: TODAY });
    const c = makeProgress('c', { state: 'review', dueDay: TODAY });

    // Fisher-Yates with rng() === 0 always picks index 0 to swap with:
    // [a,b,c] -> swap(2,0) -> [c,b,a] -> swap(1,0) -> [b,c,a]
    const result = buildSession(
      [a, b, c],
      new Map(),
      TODAY,
      NOW_MINUTE,
      { newPerDay: 20, reviewsPerDay: 2 },
      zeroRng,
    );

    expect(result.queue).toEqual(['b', 'c']);
    expect(result.reviewsDone).toBe(2);
  });

  it('session: new cards are introduced only after due reviews are cleared, ordered by (priority, index)', () => {
    const p1 = makeProgress('p1', { state: 'new' });
    const p2 = makeProgress('p2', { state: 'new' });
    const p3 = makeProgress('p3', { state: 'new' });
    const order = new Map([
      ['p1', { priority: 2, index: 0 }],
      ['p2', { priority: 1, index: 5 }],
      ['p3', { priority: 1, index: 2 }],
    ]);

    const cleared = buildSession([p1, p2, p3], order, TODAY, NOW_MINUTE, { newPerDay: 2, reviewsPerDay: 200 }, zeroRng);
    expect(cleared.queue).toEqual(['p3', 'p2']);
    expect(cleared.newIntroduced).toBe(2);

    const dueA = makeProgress('due-a', { state: 'review', dueDay: TODAY });
    const dueB = makeProgress('due-b', { state: 'review', dueDay: TODAY });
    const notCleared = buildSession(
      [dueA, dueB, p1, p2, p3],
      order,
      TODAY,
      NOW_MINUTE,
      { newPerDay: 20, reviewsPerDay: 1 },
      zeroRng,
    );
    expect(notCleared.newIntroduced).toBe(0);
    expect(notCleared.queue).not.toContain('p1');
  });

  it('session: a card id never appears twice in the queue', () => {
    const cards = [
      makeProgress('rev', { state: 'review', dueDay: TODAY }),
      makeProgress('learn', { state: 'learning', dueMinute: NOW_MINUTE }),
      makeProgress('fresh', { state: 'new' }),
    ];
    const result = buildSession(
      cards,
      new Map([['fresh', { priority: 1, index: 0 }]]),
      TODAY,
      NOW_MINUTE,
      { newPerDay: 20, reviewsPerDay: 200 },
      zeroRng,
    );
    expect(new Set(result.queue).size).toBe(result.queue.length);
  });

  it('session: suspended and leech cards never appear', () => {
    const suspended = makeProgress('suspended-card', {
      state: 'suspended',
      isLeech: true,
      dueDay: TODAY,
    });
    const dueReview = makeProgress('due-review', { state: 'review', dueDay: TODAY });

    const result = buildSession(
      [suspended, dueReview],
      new Map(),
      TODAY,
      NOW_MINUTE,
      { newPerDay: 20, reviewsPerDay: 200 },
      zeroRng,
    );

    expect(result.queue).not.toContain('suspended-card');
    expect(result.queue).toEqual(['due-review']);
  });
});
