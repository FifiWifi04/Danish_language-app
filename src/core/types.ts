export type Rating = 'again' | 'hard' | 'good';
export type CardState = 'new' | 'learning' | 'review' | 'relearning' | 'suspended';

export interface Progress {
  id: string; // content id, e.g. "bakery.rundstykke"
  state: CardState;
  step: number; // index into learning/relearning steps, else 0
  reps: number; // successful REVIEW-state answers (graduation resets to 0)
  lapses: number;
  ease: number; // [1.3, 2.7]
  intervalDays: number; // 0 while learning
  dueDay: number; // day number (see time.ts); learning steps use dueMinute
  dueMinute: number | null; // absolute minutes since epoch for intra-session steps
  isLeech: boolean; // true ⇒ state 'suspended', shown in rework list
  contentHash: string; // last-seen hash; mismatch ⇒ needsReviewFlag
  flagged: string | null; // user flag reason or null
}

export interface ScheduleInput {
  progress: Progress;
  rating: Rating;
  nowMinute: number;
  today: number;
}

export interface Session {
  queue: string[];
  newIntroduced: number;
  reviewsDone: number;
}
