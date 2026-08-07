import { describe, it, expect } from 'vitest';
import { dayNumber, minuteNumber } from '../src/core/time';

describe('time', () => {
  it('time: 03:59 local belongs to previous day', () => {
    const at0359 = Date.UTC(2026, 7, 7, 3, 59, 0);
    const at0400PriorDay = Date.UTC(2026, 7, 6, 4, 0, 0);
    expect(dayNumber(at0359, 0)).toBe(dayNumber(at0400PriorDay, 0));
  });

  it('time: 04:00 starts new day', () => {
    const at0359 = Date.UTC(2026, 7, 7, 3, 59, 0);
    const at0400 = Date.UTC(2026, 7, 7, 4, 0, 0);
    expect(dayNumber(at0400, 0)).toBe(dayNumber(at0359, 0) + 1);
  });

  it('time: DST offset change shifts cutoff consistently', () => {
    // Same local wall-clock instant (04:00), reached via different UTC
    // offsets (winter UTC+1 vs summer UTC+2 in Denmark).
    const winter0400 = Date.UTC(2026, 0, 15, 3, 0, 0); // 04:00 local, offset -60
    const summer0400 = Date.UTC(2026, 6, 15, 2, 0, 0); // 04:00 local, offset -120

    expect(dayNumber(winter0400, -60)).toBe(dayNumber(winter0400 - 60_000, -60) + 1);
    expect(dayNumber(summer0400, -120)).toBe(dayNumber(summer0400 - 60_000, -120) + 1);
  });

  it('minuteNumber: floors ms to whole minutes since epoch', () => {
    expect(minuteNumber(0)).toBe(0);
    expect(minuteNumber(59_999)).toBe(0);
    expect(minuteNumber(60_000)).toBe(1);
  });
});
