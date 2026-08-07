import type { Progress, ScheduleInput } from './types';

const LEECH_LAPSES = 8;
const EASE_MIN = 1.3;
const EASE_MAX = 2.7;
const INTERVAL_MIN = 1;
const INTERVAL_MAX = 365;

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/**
 * Applies one rating to a card. Pure: returns a NEW Progress, never mutates
 * `input.progress`. The transition table in PLAN_PHASE1_ENGINE.md WS-B is
 * authoritative — row numbers in comments below refer to it.
 */
export function schedule(input: ScheduleInput): Progress {
  const { progress, rating, nowMinute, today } = input;
  const result: Progress = { ...progress };

  switch (progress.state) {
    case 'new':
      // row 1: first shown, any rating
      result.state = 'learning';
      result.step = 0;
      result.dueMinute = nowMinute + 1;
      break;

    case 'learning':
      if (rating === 'hard') {
        // row 6: learning any step, hard — repeat current step
        result.dueMinute = nowMinute + 5;
      } else if (progress.step === 0) {
        if (rating === 'again') {
          // row 2
          result.dueMinute = nowMinute + 1;
        } else {
          // row 3: good
          result.step = 1;
          result.dueMinute = nowMinute + 10;
        }
      } else if (rating === 'again') {
        // row 4
        result.step = 0;
        result.dueMinute = nowMinute + 1;
      } else {
        // row 5: good — graduate
        result.state = 'review';
        result.step = 0;
        result.reps = 0;
        result.intervalDays = 1;
        result.dueDay = today + 1;
        result.dueMinute = null;
      }
      break;

    case 'review':
      if (rating === 'good') {
        if (progress.reps === 0) {
          // row 7
          result.reps = 1;
          result.intervalDays = 6;
        } else {
          // row 8
          result.reps = progress.reps + 1;
          result.intervalDays = Math.round(progress.intervalDays * progress.ease);
        }
        result.intervalDays = clamp(result.intervalDays, INTERVAL_MIN, INTERVAL_MAX);
        result.dueDay = today + result.intervalDays;
      } else if (rating === 'hard') {
        // row 9: not a lapse
        result.intervalDays = clamp(
          Math.max(progress.intervalDays + 1, Math.round(progress.intervalDays * 1.2)),
          INTERVAL_MIN,
          INTERVAL_MAX,
        );
        result.ease = Math.max(EASE_MIN, progress.ease - 0.15);
        result.reps = progress.reps + 1;
        result.dueDay = today + result.intervalDays;
      } else {
        // row 10: again — enter relearning, park the halved interval
        result.lapses = progress.lapses + 1;
        result.ease = Math.max(EASE_MIN, progress.ease - 0.2);
        result.state = 'relearning';
        result.step = 0;
        result.dueMinute = nowMinute + 10;
        result.intervalDays = clamp(
          Math.max(1, Math.round(progress.intervalDays * 0.5)),
          INTERVAL_MIN,
          INTERVAL_MAX,
        );
      }
      break;

    case 'relearning':
      if (rating === 'good') {
        // row 11: graduate on the parked interval
        result.state = 'review';
        result.step = 0;
        result.dueMinute = null;
        result.dueDay = today + progress.intervalDays;
      } else if (rating === 'again') {
        // row 12: stay, no extra lapse
        result.dueMinute = nowMinute + 10;
      } else {
        // row 12b: hard — graduate conservatively at half the parked interval
        result.intervalDays = clamp(
          Math.max(1, Math.round(progress.intervalDays * 0.5)),
          INTERVAL_MIN,
          INTERVAL_MAX,
        );
        result.state = 'review';
        result.step = 0;
        result.dueMinute = null;
        result.dueDay = today + result.intervalDays;
      }
      break;

    case 'suspended':
      // no row addresses a suspended card; the session queue never presents
      // one to schedule() — leave it untouched.
      break;
  }

  // row 13: applies after every transition, regardless of state.
  result.ease = clamp(result.ease, EASE_MIN, EASE_MAX);
  result.intervalDays = clamp(result.intervalDays, INTERVAL_MIN, INTERVAL_MAX);
  if (result.lapses >= LEECH_LAPSES) {
    result.isLeech = true;
    result.state = 'suspended';
  }

  return result;
}
