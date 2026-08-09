import productionParticles from '../../content/particles.v1.json';

export interface ParticlePair {
  withoutIt: string;
  withIt: string;
  socialEffect_pl: string;
}

export interface ParticleItem {
  id: string;
  status: 'draft' | 'reviewed';
  priority: number;
  particle: string;
  pairs: ParticlePair[];
  note_pl: string;
  contentHash: string;
}

interface ParticleFile {
  v: number;
  type: string;
  items: ParticleItem[];
}

const FIXTURE_QUERY_PARAM = 'e2eDeck';
const FIXTURE_PARTICLES_PARAM = 'e2eParticles';
const FIXTURE_URL_SUFFIX = 'e2e-fixtures/particles.fixture.json';

/**
 * Loads particle cards. Under `?e2eDeck=1` (the review-flow fixture switch),
 * particles are omitted unless `?e2eParticles=1` is also present — this
 * keeps every pre-existing e2e spec's fixed 3-card deck unchanged while
 * letting a dedicated particle smoke test opt in.
 */
export async function loadParticleDeck(baseUrl: string, search: string): Promise<ParticleItem[]> {
  const params = new URLSearchParams(search);
  if (params.get(FIXTURE_QUERY_PARAM) === '1') {
    if (params.get(FIXTURE_PARTICLES_PARAM) !== '1') return [];
    const res = await fetch(`${baseUrl}${FIXTURE_URL_SUFFIX}`);
    const data = (await res.json()) as ParticleFile;
    return data.items;
  }
  return (productionParticles as ParticleFile).items;
}
