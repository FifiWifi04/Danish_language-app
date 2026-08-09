import type { ProgressStore } from '../core/store';
import type { Rating, SessionLogEntry } from '../core/types';
import type { DeckItem } from '../data/deck';
import { isParticleItem } from '../data/deck';
import { buildSession } from '../core/session';
import { schedule } from '../core/scheduler';
import { materializeProgress } from '../core/progress';
import { computeStreak } from '../core/stats';
import { dayNumber, minuteNumber } from '../core/time';
import { mulberry32 } from '../core/rng';
import { isModeBEligible } from '../core/spelling';
import { renderCard } from './review-card';
import { renderSpellCard } from './review-spell';
import { renderParticleCard } from './review-particle';
import { backupAgeDays, BACKUP_NUDGE_DAYS } from './backup-status';
import { audioAutoplayEnabled, setAudioAutoplayEnabled } from './audio';

const DEFAULT_CAPS = { newPerDay: 20, reviewsPerDay: 200 };

function currentTime(): { today: number; nowMinute: number } {
  const nowMs = Date.now();
  return {
    today: dayNumber(nowMs, new Date().getTimezoneOffset()),
    nowMinute: minuteNumber(nowMs),
  };
}

/** Renders the Mode A review session into `container`. Self-contained: no state escapes this call. */
export function renderReview(container: HTMLElement, store: ProgressStore, deck: DeckItem[]): void {
  container.appendChild(renderAudioToggle());

  const wrapper = document.createElement('div');
  wrapper.className = 'review-wrapper';
  wrapper.textContent = 'Loading…';
  container.appendChild(wrapper);

  void start(wrapper, store, deck);
}

function renderAudioToggle(): HTMLElement {
  const label = document.createElement('label');
  label.className = 'audio-autoplay-toggle';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = audioAutoplayEnabled();
  checkbox.addEventListener('change', () => setAudioAutoplayEnabled(checkbox.checked));
  label.appendChild(checkbox);
  label.appendChild(document.createTextNode(' Auto-play audio on reveal'));
  return label;
}

async function start(wrapper: HTMLElement, store: ProgressStore, deck: DeckItem[]): Promise<void> {
  const itemsById = new Map(deck.map((item) => [item.id, item]));
  const stored = await store.all();
  const progressById = new Map(materializeProgress(deck, stored).map((p) => [p.id, p]));

  const { today, nowMinute } = currentTime();
  const order = new Map(deck.map((item, index) => [item.id, { priority: item.priority, index }]));
  const rng = mulberry32(Date.now());
  const session = buildSession([...progressById.values()], order, today, nowMinute, DEFAULT_CAPS, rng);

  const queue = session.queue;
  const counts = { again: 0, hard: 0, good: 0 };
  let index = 0;

  function showCard(): void {
    if (index >= queue.length) {
      void finish();
      return;
    }
    const id = queue[index] as string;
    const item = itemsById.get(id);
    const progress = progressById.get(id);
    if (!item || !progress) {
      index++;
      showCard();
      return;
    }
    const onRate = (rating: Rating): void => {
      const updated = schedule({ progress, rating, nowMinute: currentTime().nowMinute, today });
      if (rating === 'good') updated.contentHash = item.contentHash;
      progressById.set(id, updated);
      counts[rating]++;
      void store.put(updated).then(() => {
        index++;
        showCard();
      });
    };

    if (isParticleItem(item)) {
      renderParticleCard(wrapper, item, progress, onRate);
    } else if (isModeBEligible(progress)) {
      renderSpellCard(wrapper, item, progress, onRate);
    } else {
      renderCard(wrapper, item, progress, onRate);
    }
  }

  async function finish(): Promise<void> {
    const reviewed = counts.again + counts.hard + counts.good;
    const entry: SessionLogEntry = {
      day: today,
      mode: 'review',
      reviewed,
      newIntroduced: session.newIntroduced,
      againCount: counts.again,
      hardCount: counts.hard,
      goodCount: counts.good,
      durationSec: 0,
    };
    if (reviewed > 0) await store.putSessionLog(entry);
    const log = await store.sessionLog();
    renderSessionEnd(wrapper, reviewed, computeStreak(log, today));
  }

  showCard();
}

function renderSessionEnd(wrapper: HTMLElement, done: number, streak: number): void {
  wrapper.textContent = '';

  const summary = document.createElement('p');
  summary.textContent = `Session complete — ${String(done)} card${done === 1 ? '' : 's'} done. Streak: ${String(streak)} day${streak === 1 ? '' : 's'}.`;
  wrapper.appendChild(summary);

  const nudge = document.createElement('p');
  const ageDays = backupAgeDays(Date.now());
  if (ageDays === null) {
    nudge.textContent = "You haven't backed up your progress yet — export it from Stats soon.";
  } else if (ageDays > BACKUP_NUDGE_DAYS) {
    nudge.textContent = `Backup is ${String(ageDays)} days old — export your progress soon.`;
  }
  if (nudge.textContent) wrapper.appendChild(nudge);
}
