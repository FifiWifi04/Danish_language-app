import type { VocabItem } from './content';
import type { ParticleItem } from './particles';
import { loadVocabDeck } from './content';
import { loadParticleDeck } from './particles';

/** Everything the Mode A review flow can present as a card. Particle cards are told apart from vocab structurally (`'particle' in item`) rather than via a tag field, so content files need no schema change. */
export type DeckItem = VocabItem | ParticleItem;

export function isParticleItem(item: DeckItem): item is ParticleItem {
  return 'particle' in item;
}

/** Vocab + particle content merged into one reviewable deck, in that order. */
export async function loadDeck(baseUrl: string, search: string): Promise<DeckItem[]> {
  const [vocab, particles] = await Promise.all([
    loadVocabDeck(baseUrl, search),
    loadParticleDeck(baseUrl, search),
  ]);
  return [...vocab, ...particles];
}
