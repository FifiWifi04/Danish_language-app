import type { ProgressStore } from '../core/store';
import type { VocabItem } from '../data/content';
import { renderReview } from './review';
import { renderStats } from './stats';

export type TabId = 'review' | 'udtale' | 'stats';

export interface ShellDeps {
  store: ProgressStore;
  deck: VocabItem[];
}

interface TabDef {
  id: TabId;
  label: string;
}

const TABS: TabDef[] = [
  { id: 'review', label: 'Review' },
  { id: 'udtale', label: 'Udtale' },
  { id: 'stats', label: 'Stats' },
];

const DEFAULT_TAB: TabId = 'review';

function isTabId(value: string): value is TabId {
  return TABS.some((tab) => tab.id === value);
}

function tabFromHash(hash: string): TabId {
  const id = hash.replace(/^#/, '');
  return isTabId(id) ? id : DEFAULT_TAB;
}

function renderMain(main: HTMLElement, tab: TabId, deps: ShellDeps): void {
  main.textContent = '';
  const heading = document.createElement('h2');
  heading.textContent = TABS.find((t) => t.id === tab)?.label ?? '';
  main.appendChild(heading);

  if (tab === 'review') {
    renderReview(main, deps.store, deps.deck);
  } else if (tab === 'stats') {
    renderStats(main, deps.store, deps.deck);
  }
}

export function renderShell(root: HTMLElement, deps: ShellDeps): void {
  root.textContent = '';

  const header = document.createElement('header');
  const title = document.createElement('h1');
  title.textContent = 'DanmarksLiv';
  header.appendChild(title);

  const nav = document.createElement('nav');
  const main = document.createElement('main');

  for (const tab of TABS) {
    const button = document.createElement('button');
    button.textContent = tab.label;
    button.dataset.tab = tab.id;
    button.addEventListener('click', () => {
      window.location.hash = tab.id;
    });
    nav.appendChild(button);
  }

  window.addEventListener('hashchange', () => {
    renderMain(main, tabFromHash(window.location.hash), deps);
  });

  renderMain(main, tabFromHash(window.location.hash), deps);

  const footer = document.createElement('footer');
  footer.textContent = `v${import.meta.env.PACKAGE_VERSION}`;

  root.appendChild(header);
  root.appendChild(nav);
  root.appendChild(main);
  root.appendChild(footer);
}
