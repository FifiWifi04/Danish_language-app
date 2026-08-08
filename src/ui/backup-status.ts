export const LAST_EXPORT_KEY = 'danmarksliv:lastExportAt';
export const BACKUP_NUDGE_DAYS = 7;

/** Age of the last export in whole days, or `null` if never exported. */
export function backupAgeDays(nowMs: number): number | null {
  const lastExportAt = localStorage.getItem(LAST_EXPORT_KEY);
  if (lastExportAt === null) return null;
  return Math.floor((nowMs - Number(lastExportAt)) / 86_400_000);
}

/** Always-visible status line for the Stats tab (unlike review.ts's nudge, which only warns past the threshold). */
export function backupStatusText(nowMs: number): string {
  const ageDays = backupAgeDays(nowMs);
  if (ageDays === null) return 'Backup: never';
  if (ageDays === 0) return 'Backup: today';
  return `Backup: ${String(ageDays)} day${ageDays === 1 ? '' : 's'} ago`;
}
