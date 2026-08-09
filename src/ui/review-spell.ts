import type { Progress, Rating } from '../core/types';
import type { VocabItem } from '../data/content';
import { isSpellingMatch, spellingDiff } from '../core/spelling';
import { renderCardBadges, renderRatingButtons, renderBack } from './review-card';

const SPECIAL_CHARS = ['æ', 'ø', 'å', 'Æ', 'Ø', 'Å'];

/**
 * Renders a Mode B active-spelling card: the front withholds the Danish
 * word (only the translation prompt), a text field elicits it. Exact match
 * auto-rates Good; a mismatch shows a per-char diff and lets the user
 * self-rate honestly. A "show answer" escape hatch bails to the normal
 * reveal + self-rate flow without touching the typed input.
 */
export function renderSpellCard(
  wrapper: HTMLElement,
  item: VocabItem,
  progress: Progress,
  onRate: (rating: Rating) => void,
  onFlag: (reason: string) => void,
): void {
  wrapper.textContent = '';
  wrapper.appendChild(renderCardBadges(item, progress));

  const prompt = document.createElement('div');
  prompt.className = 'spell-card';
  const emoji = document.createElement('span');
  emoji.textContent = item.emojiAnchor;
  const heading = document.createElement('h2');
  heading.textContent = `${item.english} (${item.polish})`;
  prompt.appendChild(emoji);
  prompt.appendChild(heading);
  wrapper.appendChild(prompt);

  const input = document.createElement('input');
  input.type = 'text';
  input.autocomplete = 'off';
  input.autocapitalize = 'off';
  input.spellcheck = false;
  input.setAttribute('aria-label', 'Danish spelling');
  input.style.minHeight = '48px';
  wrapper.appendChild(input);

  const charRow = document.createElement('div');
  for (const ch of SPECIAL_CHARS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = ch;
    button.style.minHeight = '48px';
    button.addEventListener('click', () => insertAtCaret(input, ch));
    charRow.appendChild(button);
  }
  wrapper.appendChild(charRow);

  const checkButton = document.createElement('button');
  checkButton.textContent = 'Check answer';
  checkButton.style.minHeight = '48px';
  wrapper.appendChild(checkButton);

  const showAnswer = document.createElement('a');
  showAnswer.href = '#';
  showAnswer.textContent = 'Show answer';
  wrapper.appendChild(showAnswer);

  const feedback = document.createElement('div');
  wrapper.appendChild(feedback);

  const back = document.createElement('div');
  back.hidden = true;
  wrapper.appendChild(back);

  const ratingRow = renderRatingButtons(onRate);
  ratingRow.hidden = true;
  wrapper.appendChild(ratingRow);

  function revealNormally(): void {
    input.disabled = true;
    checkButton.disabled = true;
    renderBack(back, item, progress.flagged, onFlag);
    back.hidden = false;
    ratingRow.hidden = false;
  }

  function check(): void {
    if (input.disabled) return;
    if (isSpellingMatch(input.value, item.danish)) {
      feedback.textContent = `✓ Correct — ${item.danish}`;
      input.disabled = true;
      checkButton.disabled = true;
      onRate('good');
      return;
    }
    feedback.textContent = '';
    for (const d of spellingDiff(input.value, item.danish)) {
      const span = document.createElement('span');
      span.textContent = d.char;
      span.className = d.correct ? 'spell-char-ok' : 'spell-char-wrong';
      feedback.appendChild(span);
    }
    revealNormally();
  }

  checkButton.addEventListener('click', check);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      check();
    }
  });
  showAnswer.addEventListener('click', (e) => {
    e.preventDefault();
    feedback.textContent = '';
    revealNormally();
  });

  input.focus();
}

function insertAtCaret(input: HTMLInputElement, char: string): void {
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  input.value = input.value.slice(0, start) + char + input.value.slice(end);
  const pos = start + char.length;
  input.setSelectionRange(pos, pos);
  input.focus();
}
