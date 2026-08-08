import { schedule } from '../src/core/scheduler';
import { buildSession } from '../src/core/session';
import { mulberry32 } from '../src/core/rng';
import type { Progress, Rating } from '../src/core/types';

export const SIM_NUM_CARDS = 500;
export const SIM_NUM_DAYS = 730;

const CAPS = { newPerDay: 20, reviewsPerDay: 200 };
const MINUTES_PER_DAY = 1440;
const STARVATION_SLACK_DAYS = 30;

export interface Violation {
  day: number;
  id: string;
  reason: string;
}

export interface SimulationReport {
  finalProgress: Progress[];
  violations: Violation[];
  starvationViolations: Violation[];
  totalReviews: number;
}

interface Appearance {
  day: number;
  intervalAfter: number;
  stateAfter: Progress['state'];
}

function makeCard(i: number): Progress {
  return {
    id: `card-${i}`,
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
  };
}

/** p(good)=0.85, p(hard)=0.05, p(again)=0.10, per PLAN_PHASE1_ENGINE WS-E. */
function pickRating(r: number): Rating {
  if (r < 0.85) return 'good';
  if (r < 0.9) return 'hard';
  return 'again';
}

/**
 * Runs the seeded 500-card / 730-day soak: builds a session, answers every
 * queued card, advances one day, repeat. Collects invariant violations
 * instead of throwing so the caller can assert on the full set at once.
 */
export function runSimulation(seed: number): SimulationReport {
  const rng = mulberry32(seed);
  const contentOrder = new Map<string, { priority: number; index: number }>();
  const progressMap = new Map<string, Progress>();
  for (let i = 0; i < SIM_NUM_CARDS; i++) {
    const card = makeCard(i);
    progressMap.set(card.id, card);
    contentOrder.set(card.id, { priority: 1, index: i });
  }

  const appearances = new Map<string, Appearance[]>();
  const violations: Violation[] = [];
  let totalReviews = 0;

  for (let day = 0; day < SIM_NUM_DAYS; day++) {
    const nowMinute = day * MINUTES_PER_DAY + 600;
    const all = Array.from(progressMap.values());
    const session = buildSession(all, contentOrder, day, nowMinute, CAPS, rng);

    const seenToday = new Set<string>();
    for (const id of session.queue) {
      if (seenToday.has(id)) {
        violations.push({ day, id, reason: 'duplicate card in one session' });
      }
      seenToday.add(id);

      const progress = progressMap.get(id);
      if (!progress) continue;
      const rating = pickRating(rng());
      const result = schedule({ progress, rating, nowMinute, today: day });
      totalReviews += 1;

      if (Number.isNaN(result.ease) || Number.isNaN(result.intervalDays)) {
        violations.push({ day, id, reason: 'NaN in ease or intervalDays' });
      }
      if (result.ease < 1.3 || result.ease > 2.7) {
        violations.push({ day, id, reason: `ease ${result.ease} outside [1.3,2.7]` });
      }
      if (result.state === 'review' && (result.intervalDays < 1 || result.intervalDays > 365)) {
        violations.push({ day, id, reason: `interval ${result.intervalDays} outside [1,365]` });
      }

      progressMap.set(id, result);

      const history = appearances.get(id) ?? [];
      history.push({ day, intervalAfter: result.intervalDays, stateAfter: result.state });
      appearances.set(id, history);
    }
  }

  const finalProgress = Array.from(progressMap.values()).sort((a, b) =>
    a.id.localeCompare(b.id),
  );

  return {
    finalProgress,
    violations,
    starvationViolations: checkStarvation(appearances),
    totalReviews,
  };
}

/**
 * A non-suspended card must be re-reviewed within its post-review interval
 * plus a 30-day slack; a suspended (leech) card is expected to stop
 * appearing, so gaps after suspension aren't checked.
 */
function checkStarvation(appearances: Map<string, Appearance[]>): Violation[] {
  const result: Violation[] = [];
  for (const [id, history] of appearances) {
    const first = history[0];
    if (first && first.day > STARVATION_SLACK_DAYS - 1) {
      result.push({
        day: first.day,
        id,
        reason: `first appearance at day ${first.day} exceeds the ${STARVATION_SLACK_DAYS}-day slack`,
      });
    }
    for (let i = 0; i < history.length - 1; i++) {
      const curr = history[i]!;
      const next = history[i + 1]!;
      if (curr.stateAfter === 'suspended') continue;
      const allowed = curr.intervalAfter + STARVATION_SLACK_DAYS;
      const gap = next.day - curr.day;
      if (gap > allowed) {
        result.push({
          day: next.day,
          id,
          reason: `gap of ${gap} days exceeds interval(${curr.intervalAfter}) + ${STARVATION_SLACK_DAYS}`,
        });
      }
    }
  }
  return result;
}
