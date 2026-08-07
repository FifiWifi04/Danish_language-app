export type TabId = 'review' | 'udtale' | 'stats';

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

function renderMain(main: HTMLElement, tab: TabId): void {
  main.textContent = '';
  const heading = document.createElement('h2');
  heading.textContent = TABS.find((t) => t.id === tab)?.label ?? '';
  main.appendChild(heading);
}

export function renderShell(root: HTMLElement): void {
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
    renderMain(main, tabFromHash(window.location.hash));
  });

  renderMain(main, tabFromHash(window.location.hash));

  const footer = document.createElement('footer');
  footer.textContent = `v${import.meta.env.PACKAGE_VERSION}`;

  root.appendChild(header);
  root.appendChild(nav);
  root.appendChild(main);
  root.appendChild(footer);
}
