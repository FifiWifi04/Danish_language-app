import { describe, it, expect } from 'vitest';
import { unsuspendForRework, flagForRework, REWORK_FLAG } from '../src/core/rework';
import type { Progress } from '../src/core/types';

const LEECH: Progress = {
  id: 'card-1',
  state: 'suspended',
  step: 0,
  reps: 5,
  lapses: 8,
  ease: 1.3,
  intervalDays: 200,
  dueDay: 500,
  dueMinute: null,
  isLeech: true,
  contentHash: 'h',
  flagged: null,
};

describe('rework', () => {
  it('rework: unsuspend resets schedule not history', () => {
    const result = unsuspendForRework(LEECH, 600);
    expect(result.isLeech).toBe(false);
    expect(result.state).toBe('review');
    expect(result.step).toBe(0);
    expect(result.intervalDays).toBe(1);
    expect(result.dueDay).toBe(601);
    expect(result.dueMinute).toBeNull();
    // history is preserved, not reset
    expect(result.lapses).toBe(8);
    expect(result.reps).toBe(5);
    expect(result.ease).toBe(1.3);
  });

  it('rework: flagForRework sets flagged without touching the schedule', () => {
    const result = flagForRework(LEECH);
    expect(result.flagged).toBe(REWORK_FLAG);
    expect(result.state).toBe(LEECH.state);
    expect(result.isLeech).toBe(LEECH.isLeech);
    expect(result.lapses).toBe(LEECH.lapses);
  });
});
