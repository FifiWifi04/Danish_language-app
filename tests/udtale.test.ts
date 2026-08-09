import { describe, it, expect, beforeEach } from 'vitest';
import { renderShell } from '../src/ui/shell';
import { MemoryStore } from '../src/data/memory';

function makeDeps() {
  return { store: new MemoryStore(), deck: [] };
}

describe('udtale', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('udtale: list view shows all 12 pronunciation items', () => {
    const root = document.createElement('div');
    renderShell(root, makeDeps());
    window.location.hash = 'udtale';
    window.dispatchEvent(new Event('hashchange'));

    expect(root.querySelectorAll('.udtale-list-item').length).toBe(12);
  });

  it('udtale: opening an item from the list shows its mechanics steps', () => {
    const root = document.createElement('div');
    renderShell(root, makeDeps());
    window.location.hash = 'udtale';
    window.dispatchEvent(new Event('hashchange'));

    const stoedButton = [...root.querySelectorAll<HTMLButtonElement>('.udtale-list-item')].find((b) =>
      b.textContent?.includes('Stød'),
    );
    expect(stoedButton).toBeDefined();
    stoedButton?.click();

    expect(root.querySelectorAll('.mechanics-steps li').length).toBeGreaterThan(0);
  });

  it('udtale: a hash sub-route (e.g. from a soundTag chip) opens straight to that item', () => {
    const root = document.createElement('div');
    renderShell(root, makeDeps());
    window.location.hash = 'udtale/stoed';
    window.dispatchEvent(new Event('hashchange'));

    expect(root.querySelector('h3')?.textContent).toContain('Stød');
    expect(root.querySelectorAll('.mechanics-steps li').length).toBeGreaterThan(0);
  });
});
