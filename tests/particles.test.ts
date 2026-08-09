import { describe, it, expect } from 'vitest';
import { renderParticleCard } from '../src/ui/review-particle';
import { newProgress } from '../src/core/progress';
import type { ParticleItem } from '../src/data/particles';

const ITEM: ParticleItem = {
  id: 'particle.test',
  status: 'draft',
  priority: 1,
  particle: 'da',
  note_pl: 'Test note.',
  pairs: [
    { withoutIt: 'Kom nu.', withIt: 'Kom nu da.', socialEffect_pl: 'Effect one.' },
    { withoutIt: 'Han er her ikke.', withIt: 'Han er her da ikke!', socialEffect_pl: 'Effect two.' },
  ],
  contentHash: 'test-hash',
};

describe('particles', () => {
  it('particles: front shows the particle and the first pair\'s withoutIt sentence, nothing more revealed yet', () => {
    const wrapper = document.createElement('div');
    renderParticleCard(wrapper, ITEM, newProgress(ITEM.id, ITEM.contentHash), () => {});

    expect(wrapper.querySelector('h2')?.textContent).toBe('da');
    expect(wrapper.textContent).toContain('Kom nu.');
    expect(wrapper.querySelector('.particle-pairs')).toBeNull();
  });

  it('particles: renders both pair sides plus each socialEffect_pl and the note on reveal', () => {
    const wrapper = document.createElement('div');
    renderParticleCard(wrapper, ITEM, newProgress(ITEM.id, ITEM.contentHash), () => {});

    wrapper.querySelector<HTMLElement>('.review-card')?.click();

    const pairs = wrapper.querySelectorAll('.particle-pair');
    expect(pairs.length).toBe(2);
    expect(pairs[0]?.textContent).toContain('Kom nu.');
    expect(pairs[0]?.textContent).toContain('Kom nu da.');
    expect(pairs[0]?.textContent).toContain('Effect one.');
    expect(pairs[1]?.textContent).toContain('Han er her ikke.');
    expect(pairs[1]?.textContent).toContain('Han er her da ikke!');
    expect(pairs[1]?.textContent).toContain('Effect two.');
    expect(wrapper.textContent).toContain('Test note.');
  });

  it('particles: rating calls onRate with the chosen rating', () => {
    const wrapper = document.createElement('div');
    const ratings: string[] = [];
    renderParticleCard(wrapper, ITEM, newProgress(ITEM.id, ITEM.contentHash), (r) => ratings.push(r));

    wrapper.querySelector<HTMLElement>('.review-card')?.click();
    const goodButton = [...wrapper.querySelectorAll('button')].find((b) => b.textContent === 'Good');
    goodButton?.click();

    expect(ratings).toEqual(['good']);
  });

  it('particles: shows the DRAFT badge for draft-status items', () => {
    const wrapper = document.createElement('div');
    renderParticleCard(wrapper, ITEM, newProgress(ITEM.id, ITEM.contentHash), () => {});

    expect(wrapper.querySelector('.badge')?.textContent).toContain('DRAFT');
  });
});
