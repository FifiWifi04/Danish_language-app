import { renderShell } from './ui/shell';
import { IdbStore } from './data/idb';
import { loadVocabDeck } from './data/content';
import { initPwa } from './pwa';
import type { ProgressStore } from './core/store';

declare global {
  interface Window {
    __e2eStore?: ProgressStore;
  }
}

async function bootstrap(): Promise<void> {
  const root = document.querySelector<HTMLDivElement>('#app');
  if (!root) return;

  const search = window.location.search;
  const deck = await loadVocabDeck(import.meta.env.BASE_URL, search);
  const store = new IdbStore();
  renderShell(root, { store, deck });

  if (new URLSearchParams(search).get('e2eDeck') === '1') {
    window.__e2eStore = store;
  }

  initPwa();
}

void bootstrap();
