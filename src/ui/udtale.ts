import type { PronunciationItem } from '../data/pronunciation';
import { loadPronunciationGuide } from '../data/pronunciation';
import { renderUdtaleDetail } from './udtale-detail';

/** Renders the Udtale (pronunciation guide) tab into `container`. `initialItemId` opens straight to that item's detail view (used by soundTag chip navigation). */
export function renderUdtale(container: HTMLElement, initialItemId?: string): void {
  const items = loadPronunciationGuide();

  const wrapper = document.createElement('div');
  wrapper.className = 'udtale-wrapper';
  container.appendChild(wrapper);

  function showList(): void {
    renderList(wrapper, items, showDetail);
  }
  function showDetail(item: PronunciationItem): void {
    renderUdtaleDetail(wrapper, item, showList);
  }

  const initial = initialItemId ? items.find((item) => item.id === initialItemId) : undefined;
  if (initial) showDetail(initial);
  else showList();
}

function renderList(wrapper: HTMLElement, items: PronunciationItem[], onOpen: (item: PronunciationItem) => void): void {
  wrapper.textContent = '';

  const list = document.createElement('ul');
  list.className = 'udtale-list';
  for (const item of items) {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.className = 'udtale-list-item';
    button.textContent = `${item.title_da} — ${item.title_pl}`;
    if (item.status === 'draft') {
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = 'DRAFT';
      button.appendChild(badge);
    }
    button.addEventListener('click', () => onOpen(item));
    li.appendChild(button);
    list.appendChild(li);
  }
  wrapper.appendChild(list);
}
