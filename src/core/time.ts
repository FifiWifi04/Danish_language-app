const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const CUTOFF_MS = 4 * HOUR_MS;

/**
 * Integer days since the Unix epoch, with a 4 am local cutoff: the day
 * rolls over at 04:00 local time, not midnight. Callers pass
 * `new Date().getTimezoneOffset()`; this module never reads the clock.
 */
export function dayNumber(nowMs: number, tzOffsetMinutes: number): number {
  const localMs = nowMs - tzOffsetMinutes * MINUTE_MS;
  return Math.floor((localMs - CUTOFF_MS) / DAY_MS);
}

/** Integer minutes since the Unix epoch. */
export function minuteNumber(nowMs: number): number {
  return Math.floor(nowMs / MINUTE_MS);
}
