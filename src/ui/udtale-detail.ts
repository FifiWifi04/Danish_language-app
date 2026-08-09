import type { PronunciationItem } from '../data/pronunciation';
import { playFor } from './audio';
import { renderRecordControl } from './record';

/** Renders one pronunciation item's detail view into `wrapper`. */
export function renderUdtaleDetail(wrapper: HTMLElement, item: PronunciationItem, onBack: () => void): void {
  wrapper.textContent = '';

  const back = document.createElement('button');
  back.textContent = '◀ Back';
  back.addEventListener('click', onBack);
  wrapper.appendChild(back);

  const heading = document.createElement('h3');
  heading.textContent = `${item.title_da} — ${item.title_pl}`;
  wrapper.appendChild(heading);
  if (item.status === 'draft') wrapper.appendChild(makeBadge('DRAFT — unverified'));

  wrapper.appendChild(makeParagraph(item.whatItIs_pl));
  wrapper.appendChild(makeParagraph(item.anchor_pl));

  const steps = document.createElement('ol');
  steps.className = 'mechanics-steps';
  for (const step of item.mechanics_pl) {
    const li = document.createElement('li');
    li.textContent = step;
    steps.appendChild(li);
  }
  wrapper.appendChild(steps);

  const trap = document.createElement('div');
  trap.className = 'polish-trap-box';
  trap.textContent = item.polishTrap_pl;
  wrapper.appendChild(trap);

  wrapper.appendChild(renderPracticeWords(item));
  if (item.minimalPairs && item.minimalPairs.length > 0) {
    wrapper.appendChild(renderMinimalPairs(item.minimalPairs));
  }

  // PRON WS-D: self-record & compare, referenced against the item's first
  // practice word — degrades silently on playback if no clip exists yet,
  // same as the practice-word chips above (PHASE4 WS-B's pattern).
  const referenceWord = item.practiceWords[0];
  if (referenceWord) renderRecordControl(wrapper, referenceWord.word);

  // PRON WS-C (the perception drill) is blocked on G2 (real audio clips) —
  // the button exists per the plan's "hidden until then" but does nothing yet.
  const drillButton = document.createElement('button');
  drillButton.textContent = 'Drill this sound';
  drillButton.hidden = true;
  wrapper.appendChild(drillButton);
}

function renderPracticeWords(item: PronunciationItem): HTMLElement {
  const list = document.createElement('div');
  list.className = 'practice-words';
  for (const pw of item.practiceWords) {
    const chip = document.createElement('button');
    chip.className = 'practice-word-chip';
    chip.textContent = pw.word;
    chip.title = pw.gloss_pl;
    chip.addEventListener('click', () => void playFor(pw.word));
    list.appendChild(chip);
  }
  return list;
}

function renderMinimalPairs(pairs: NonNullable<PronunciationItem['minimalPairs']>): HTMLElement {
  const table = document.createElement('table');
  table.className = 'minimal-pairs';
  for (const pair of pairs) {
    const row = document.createElement('tr');
    for (const [word, gloss] of [
      [pair.a, pair.gloss_a_pl],
      [pair.b, pair.gloss_b_pl],
    ] as const) {
      const cell = document.createElement('td');
      cell.textContent = `${word} (${gloss})`;
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
  return table;
}

function makeParagraph(text: string): HTMLElement {
  const p = document.createElement('p');
  p.textContent = text;
  return p;
}

function makeBadge(text: string): HTMLElement {
  const badge = document.createElement('span');
  badge.className = 'badge';
  badge.textContent = text;
  return badge;
}
