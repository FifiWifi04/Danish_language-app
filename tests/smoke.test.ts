import { describe, it, expect, beforeEach } from 'vitest';
import { renderShell } from '../src/ui/shell';

describe('smoke', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('smoke: shell renders three tabs', () => {
    const root = document.createElement('div');
    renderShell(root);

    const buttons = root.querySelectorAll('nav button');
    expect(buttons.length).toBe(3);
  });

  it('smoke: tab switch swaps main region', () => {
    const root = document.createElement('div');
    renderShell(root);

    const main = root.querySelector('main');
    expect(main?.textContent).toContain('Review');

    window.location.hash = 'stats';
    window.dispatchEvent(new Event('hashchange'));

    expect(main?.textContent).toContain('Stats');
    expect(main?.textContent).not.toContain('Review');
  });
});
