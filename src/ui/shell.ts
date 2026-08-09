import type { ProgressStore } from '../core/store';
import type { DeckItem } from '../data/deck';
import { renderReview } from './review';
import { renderStats } from './stats';
import { renderUdtale } from './udtale';
import { renderReworkList } from './rework';

export type TabId = 'review' | 'udtale' | 'stats';

export interface ShellDeps {
  store: ProgressStore;
  deck: DeckItem[];
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

function pathFromHash(hash: string): string {
  return hash.replace(/^#/, '');
}

function tabFromHash(hash: string): TabId {
  const id = pathFromHash(hash).split('/')[0] ?? '';
  return isTabId(id) ? id : DEFAULT_TAB;
}

/** Sub-route after the tab, e.g. `#udtale/stoed` -> `stoed` — used by soundTag chip navigation into a specific Udtale detail view. */
function detailFromHash(hash: string): string | undefined {
  const path = pathFromHash(hash);
  const slash = path.indexOf('/');
  return slash === -1 ? undefined : path.slice(slash + 1) || undefined;
}

function renderMain(main: HTMLElement, tab: TabId, detail: string | undefined, deps: ShellDeps): void {
  main.textContent = '';
  const heading = document.createElement('h2');
  heading.textContent = TABS.find((t) => t.id === tab)?.label ?? '';
  main.appendChild(heading);

  if (tab === 'review') {
    renderReview(main, deps.store, deps.deck);
  } else if (tab === 'stats') {
    if (detail === 'rework') {
      renderReworkList(main, deps.store, deps.deck);
    } else {
      renderStats(main, deps.store, deps.deck);
    }
  } else if (tab === 'udtale') {
    renderUdtale(main, detail);
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
    renderMain(main, tabFromHash(window.location.hash), detailFromHash(window.location.hash), deps);
  });

  renderMain(main, tabFromHash(window.location.hash), detailFromHash(window.location.hash), deps);

  const footer = document.createElement('footer');
  footer.textContent = `v${import.meta.env.PACKAGE_VERSION}`;

  root.appendChild(header);
  root.appendChild(nav);
  root.appendChild(main);
  root.appendChild(footer);
}
