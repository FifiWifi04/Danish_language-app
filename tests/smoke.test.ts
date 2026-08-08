import { describe, it, expect, beforeEach } from 'vitest';
import { renderShell } from '../src/ui/shell';
import { MemoryStore } from '../src/data/memory';

function makeDeps() {
  return { store: new MemoryStore(), deck: [] };
}

describe('smoke', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('smoke: shell renders three tabs', () => {
    const root = document.createElement('div');
    renderShell(root, makeDeps());

    const buttons = root.querySelectorAll('nav button');
    expect(buttons.length).toBe(3);
  });

  it('smoke: tab switch swaps main region', () => {
    const root = document.createElement('div');
    renderShell(root, makeDeps());

    const main = root.querySelector('main');
    expect(main?.textContent).toContain('Review');

    window.location.hash = 'stats';
    window.dispatchEvent(new Event('hashchange'));

    expect(main?.textContent).toContain('Stats');
    expect(main?.textContent).not.toContain('Review');
  });
});
