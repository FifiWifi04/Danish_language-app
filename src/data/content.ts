import productionDeck from '../../content/deck.v1.json';

export interface VocabItem {
  id: string;
  status: 'draft' | 'reviewed';
  priority: number;
  danish: string;
  english: string;
  polish: string;
  phoneticPl: string;
  emojiAnchor: string;
  imageUrl?: string;
  grammarNote?: string;
  clozeSentence?: string;
  clozeTarget?: string;
  contentHash: string;
  soundTags?: string[];
}

interface ContentFile {
  v: number;
  type: string;
  items: VocabItem[];
}

const FIXTURE_QUERY_PARAM = 'e2eDeck';
const FIXTURE_URL_SUFFIX = 'e2e-fixtures/deck.fixture.json';

/**
 * Loads the vocab deck. `?e2eDeck=1` in the URL swaps in a small fixture
 * (served from public/e2e-fixtures) so a Playwright smoke test can run a
 * short, deterministic session instead of the full 30-card deck.
 */
export async function loadVocabDeck(baseUrl: string, search: string): Promise<VocabItem[]> {
  if (new URLSearchParams(search).get(FIXTURE_QUERY_PARAM) === '1') {
    const res = await fetch(`${baseUrl}${FIXTURE_URL_SUFFIX}`);
    const data = (await res.json()) as ContentFile;
    return data.items;
  }
  return (productionDeck as ContentFile).items;
}

export function contentOrder(items: VocabItem[]): Map<string, { priority: number; index: number }> {
  const map = new Map<string, { priority: number; index: number }>();
  items.forEach((item, index) => map.set(item.id, { priority: item.priority, index }));
  return map;
}

export function contentById(items: VocabItem[]): Map<string, VocabItem> {
  return new Map(items.map((item) => [item.id, item]));
}
