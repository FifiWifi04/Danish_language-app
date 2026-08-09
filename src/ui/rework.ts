import type { ProgressStore } from '../core/store';
import type { DeckItem } from '../data/deck';
import type { Progress } from '../core/types';
import { materializeProgress } from '../core/progress';
import { unsuspendForRework, flagForRework } from '../core/rework';
import { dayNumber } from '../core/time';

/** Renders the leech rework list (linked from Stats) into `container`. Self-contained: no state escapes this call. */
export function renderReworkList(container: HTMLElement, store: ProgressStore, deck: DeckItem[]): void {
  const wrapper = document.createElement('div');
  wrapper.className = 'rework-wrapper';
  wrapper.textContent = 'Loading…';
  container.appendChild(wrapper);
  void start(wrapper, store, deck);
}

async function start(wrapper: HTMLElement, store: ProgressStore, deck: DeckItem[]): Promise<void> {
  const itemsById = new Map(deck.map((item) => [item.id, item]));
  const stored = await store.all();
  let all = materializeProgress(deck, stored);

  function render(): void {
    wrapper.textContent = '';

    const back = document.createElement('a');
    back.href = '#stats';
    back.textContent = '← Back to Stats';
    wrapper.appendChild(back);

    const leeches = all.filter((p) => p.isLeech);
    if (leeches.length === 0) {
      const empty = document.createElement('p');
      empty.textContent = 'No leeches — nothing to rework.';
      wrapper.appendChild(empty);
      return;
    }

    const list = document.createElement('ul');
    list.className = 'rework-list';
    for (const progress of leeches) {
      list.appendChild(renderRow(progress));
    }
    wrapper.appendChild(list);
  }

  function renderRow(progress: Progress): HTMLElement {
    const item = itemsById.get(progress.id);
    const label = item && 'danish' in item ? `${progress.id} — ${item.danish}` : progress.id;

    const li = document.createElement('li');
    li.className = 'rework-row';

    const text = document.createElement('span');
    text.textContent = `${label} (${String(progress.lapses)} lapses)${progress.flagged ? ` [${progress.flagged}]` : ''}`;
    li.appendChild(text);

    const unsuspendButton = document.createElement('button');
    unsuspendButton.textContent = 'Unsuspend & retry';
    unsuspendButton.addEventListener('click', () => {
      const today = dayNumber(Date.now(), new Date().getTimezoneOffset());
      void apply(progress.id, unsuspendForRework(progress, today));
    });
    li.appendChild(unsuspendButton);

    const rewriteButton = document.createElement('button');
    rewriteButton.textContent = 'Needs rewrite';
    rewriteButton.addEventListener('click', () => void apply(progress.id, flagForRework(progress)));
    li.appendChild(rewriteButton);

    return li;
  }

  async function apply(id: string, updated: Progress): Promise<void> {
    await store.put(updated);
    all = all.map((p) => (p.id === id ? updated : p));
    render();
  }

  render();
}
