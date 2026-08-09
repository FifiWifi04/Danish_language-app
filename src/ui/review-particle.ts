import type { Progress, Rating } from '../core/types';
import type { ParticleItem } from '../data/particles';
import { renderCardBadges, renderRatingButtons } from './review-card';

/**
 * Renders a particle card into `wrapper`: front shows the particle plus its
 * first pair's withoutIt sentence; reveal shows every contrastive pair side
 * by side with its socialEffect_pl, then the overall note. Rated exactly
 * like a vocab card — the scheduler doesn't know card types (PLAN_PHASE5
 * WS-C).
 */
export function renderParticleCard(
  wrapper: HTMLElement,
  item: ParticleItem,
  progress: Progress,
  onRate: (rating: Rating) => void,
): void {
  wrapper.textContent = '';
  wrapper.appendChild(renderCardBadges(item, progress));

  const card = document.createElement('div');
  card.tabIndex = 0;
  card.className = 'review-card particle-card';

  const front = document.createElement('div');
  const particle = document.createElement('h2');
  particle.textContent = item.particle;
  const sentence = document.createElement('p');
  sentence.textContent = item.pairs[0]?.withoutIt ?? '';
  front.appendChild(particle);
  front.appendChild(sentence);
  card.appendChild(front);

  const back = document.createElement('div');
  back.hidden = true;
  const buttons = renderRatingButtons(onRate);
  buttons.hidden = true;

  let revealed = false;
  function reveal(): void {
    if (revealed) return;
    revealed = true;
    renderPairs(back, item);
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

function renderPairs(back: HTMLElement, item: ParticleItem): void {
  back.textContent = '';
  const pairsList = document.createElement('div');
  pairsList.className = 'particle-pairs';
  for (const pair of item.pairs) {
    const row = document.createElement('div');
    row.className = 'particle-pair';

    const without = document.createElement('p');
    without.textContent = pair.withoutIt;
    const withIt = document.createElement('p');
    withIt.textContent = pair.withIt;
    const effect = document.createElement('p');
    effect.className = 'particle-social-effect';
    effect.textContent = pair.socialEffect_pl;

    row.appendChild(without);
    row.appendChild(withIt);
    row.appendChild(effect);
    pairsList.appendChild(row);
  }
  back.appendChild(pairsList);

  const note = document.createElement('p');
  note.textContent = item.note_pl;
  back.appendChild(note);
}
