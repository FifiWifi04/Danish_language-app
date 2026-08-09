import type { Progress, Rating } from '../core/types';
import type { VocabItem } from '../data/content';
import { audioAutoplayEnabled, clipFor, playFor } from './audio';
import { renderRecordControl } from './record';

const RATINGS: [string, Rating][] = [
  ['Again', 'again'],
  ['Hard', 'hard'],
  ['Good', 'good'],
];

/** Draft / content-changed badges for a card, shared by the reveal and spelling flows. */
export function renderCardBadges(item: VocabItem, progress: Progress): HTMLElement {
  const badges = document.createElement('div');
  if (item.status === 'draft') badges.appendChild(makeBadge('DRAFT — unverified'));
  if (progress.contentHash && progress.contentHash !== item.contentHash) {
    badges.appendChild(makeBadge('content changed — re-check'));
  }
  return badges;
}

/** Again/Hard/Good rating row, shared by the reveal and spelling flows. */
export function renderRatingButtons(onRate: (rating: Rating) => void): HTMLElement {
  const buttons = document.createElement('div');
  for (const [label, rating] of RATINGS) {
    const button = document.createElement('button');
    button.textContent = label;
    button.style.minHeight = '48px';
    button.addEventListener('click', () => onRate(rating));
    buttons.appendChild(button);
  }
  return buttons;
}

/** Renders one card into `wrapper`: front, tap/space-to-reveal back, rating row. */
export function renderCard(
  wrapper: HTMLElement,
  item: VocabItem,
  progress: Progress,
  onRate: (rating: Rating) => void,
): void {
  wrapper.textContent = '';
  wrapper.appendChild(renderCardBadges(item, progress));

  const card = document.createElement('div');
  card.tabIndex = 0;
  card.className = 'review-card';

  const front = document.createElement('div');
  const emoji = document.createElement('span');
  emoji.textContent = item.emojiAnchor;
  const danish = document.createElement('h2');
  danish.textContent = item.danish;
  front.appendChild(emoji);
  front.appendChild(danish);
  if (item.imageUrl) {
    const img = document.createElement('img');
    img.src = item.imageUrl;
    img.alt = item.danish;
    front.appendChild(img);
  }
  card.appendChild(front);

  const back = document.createElement('div');
  back.hidden = true;
  const buttons = renderRatingButtons(onRate);
  buttons.hidden = true;

  let revealed = false;
  function reveal(): void {
    if (revealed) return;
    revealed = true;
    renderBack(back, item);
    back.hidden = false;
    buttons.hidden = false;
  }

  card.addEventListener('click', reveal);
  card.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      reveal();
    }
  });

  wrapper.appendChild(card);
  wrapper.appendChild(back);
  wrapper.appendChild(buttons);
}

/** Renders a card's back content (translations, note, audio, sound tags) — reused by the Mode B spelling flow's reveal/escape-hatch. */
export function renderBack(back: HTMLElement, item: VocabItem): void {
  back.textContent = '';
  for (const text of [item.english, item.polish, item.phoneticPl]) {
    const p = document.createElement('p');
    p.textContent = text;
    back.appendChild(p);
  }
  if (item.grammarNote) {
    const note = document.createElement('p');
    note.textContent = item.grammarNote;
    back.appendChild(note);
  }

  const audioButton = document.createElement('button');
  audioButton.textContent = '🔊 Play';
  audioButton.style.minHeight = '48px';
  audioButton.hidden = true; // stays hidden if the manifest has no clip for this card (silent degrade, no TTS fallback)
  audioButton.addEventListener('click', () => void playFor(item.danish));
  back.appendChild(audioButton);

  void clipFor(item.danish).then((entry) => {
    if (!entry) return;
    audioButton.hidden = false;
    if (audioAutoplayEnabled()) void playFor(item.danish);
    renderRecordControl(back, item.danish); // "card backs with audio" per PRON WS-D
  });

  if (item.soundTags && item.soundTags.length > 0) {
    const chips = document.createElement('div');
    chips.className = 'sound-tag-chips';
    for (const tag of item.soundTags) {
      const chip = document.createElement('button');
      chip.className = 'sound-tag-chip';
      chip.textContent = tag;
      chip.addEventListener('click', () => {
        window.location.hash = `udtale/${tag}`;
      });
      chips.appendChild(chip);
    }
    back.appendChild(chips);
  }
}

function makeBadge(text: string): HTMLElement {
  const badge = document.createElement('span');
  badge.className = 'badge';
  badge.textContent = text;
  return badge;
}
