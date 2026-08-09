import { renderShell } from './ui/shell';
import { IdbStore } from './data/idb';
import { loadVocabDeck } from './data/content';
import { sharedAudioElement } from './ui/audio';
import { initPwa } from './pwa';
import type { ProgressStore } from './core/store';

declare global {
  interface Window {
    __e2eStore?: ProgressStore;
    __e2eAudio?: () => HTMLAudioElement | null;
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
    window.__e2eAudio = sharedAudioElement;
  }

  initPwa();
}

void bootstrap();
