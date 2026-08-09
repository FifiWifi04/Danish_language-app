import type { ProgressStore } from '../core/store';
import type { Progress, SessionLogEntry } from '../core/types';
import type { DeckItem } from '../data/deck';
import { materializeProgress } from '../core/progress';
import {
  computeStreak,
  computeDueCounts,
  computeRetention,
  last30DaysBars,
  countLeeches,
  flaggedEntries,
} from '../core/stats';
import { dayNumber, minuteNumber } from '../core/time';
import { backupStatusText } from './backup-status';
import { renderBackupControls } from './backup';

const DEFAULT_CAPS = { newPerDay: 20, reviewsPerDay: 200 };
const RETENTION_WINDOW_DAYS = 30;
const RECENT_SESSIONS_SHOWN = 10;

/** Renders the Stats tab into `container`. Self-contained: no state escapes this call. */
export function renderStats(container: HTMLElement, store: ProgressStore, deck: DeckItem[]): void {
  const wrapper = document.createElement('div');
  wrapper.className = 'stats-wrapper';
  wrapper.textContent = 'Loading…';
  container.appendChild(wrapper);

  void start(wrapper, store, deck);
}

async function start(wrapper: HTMLElement, store: ProgressStore, deck: DeckItem[]): Promise<void> {
  const [stored, log] = await Promise.all([store.all(), store.sessionLog()]);
  const all = materializeProgress(deck, stored);

  const nowMs = Date.now();
  const today = dayNumber(nowMs, new Date().getTimezoneOffset());
  const nowMinute = minuteNumber(nowMs);

  const { dueToday, newRemaining } = computeDueCounts(all, today, nowMinute, DEFAULT_CAPS);
  const streak = computeStreak(log, today);
  const bars = last30DaysBars(log, today);
  const retention = computeRetention(log, today, RETENTION_WINDOW_DAYS);
  const leeches = countLeeches(all);

  wrapper.textContent = '';
  wrapper.appendChild(makeLine(`Due today: ${String(dueToday)} · New remaining: ${String(newRemaining)}`));
  wrapper.appendChild(makeLine(`Streak: ${String(streak)} day${streak === 1 ? '' : 's'}`));
  wrapper.appendChild(renderBarStrip(bars));
  wrapper.appendChild(
    makeLine(
      retention === null
        ? 'Retention (last 30 days): no reviews yet'
        : `Retention (last 30 days): ${String(Math.round(retention * 100))}%`,
    ),
  );
  wrapper.appendChild(renderLeechLine(leeches));
  wrapper.appendChild(makeLine(backupStatusText(nowMs)));
  renderBackupControls(wrapper, store);
  renderFlaggedBlock(wrapper, all);
  wrapper.appendChild(renderSessionList(log));
}

function makeLine(text: string): HTMLElement {
  const p = document.createElement('p');
  p.textContent = text;
  return p;
}

/** Links "Leeches: N" to the rework list (`#stats/rework`, PHASE5 WS-D). */
function renderLeechLine(leeches: number): HTMLElement {
  const p = document.createElement('p');
  const link = document.createElement('a');
  link.href = '#stats/rework';
  link.textContent = `Leeches: ${String(leeches)}`;
  p.appendChild(link);
  return p;
}

/** Copyable block of flagged card ids + reasons, for the owner to paste into AUTON_STATUS.md (REVIEW A.9). */
function renderFlaggedBlock(container: HTMLElement, all: Progress[]): void {
  const entries = flaggedEntries(all);
  if (entries.length === 0) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'flagged-block';
  wrapper.appendChild(makeLine(`Flagged cards (${String(entries.length)}):`));

  const textarea = document.createElement('textarea');
  textarea.readOnly = true;
  textarea.value = entries.map((e) => `${e.id}: ${e.flagged}`).join('\n');
  wrapper.appendChild(textarea);

  const copyButton = document.createElement('button');
  copyButton.textContent = 'Copy';
  copyButton.addEventListener('click', () => void navigator.clipboard.writeText(textarea.value));
  wrapper.appendChild(copyButton);

  container.appendChild(wrapper);
}

function renderBarStrip(bars: { day: number; reviewed: number }[]): HTMLElement {
  const strip = document.createElement('div');
  strip.className = 'bar-strip';
  const max = Math.max(1, ...bars.map((b) => b.reviewed));
  for (const b of bars) {
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = `${String(Math.round((b.reviewed / max) * 100))}%`;
    bar.title = `day ${String(b.day)}: ${String(b.reviewed)} review${b.reviewed === 1 ? '' : 's'}`;
    strip.appendChild(bar);
  }
  return strip;
}

function renderSessionList(log: SessionLogEntry[]): HTMLElement {
  const list = document.createElement('ul');
  list.className = 'session-list';
  const recent = [...log].sort((a, b) => b.day - a.day).slice(0, RECENT_SESSIONS_SHOWN);
  for (const entry of recent) {
    const li = document.createElement('li');
    li.className = 'session-row';
    li.textContent = `Day ${String(entry.day)} — ${String(entry.reviewed)} reviewed (${String(entry.newIntroduced)} new)`;
    list.appendChild(li);
  }
  return list;
}
