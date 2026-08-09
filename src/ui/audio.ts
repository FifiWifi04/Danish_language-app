export interface AudioManifestEntry {
  filename: string;
  voice: string;
  provider: string;
  generatedAt: string;
}

type Manifest = Record<string, AudioManifestEntry>;

// Reuses the existing `?e2eDeck=1` flag (src/data/content.ts) rather than
// inventing a second query param — Playwright's fixture session already
// means "use fixtures for everything", not just the deck.
const FIXTURE_QUERY_PARAM = 'e2eDeck';
const MANIFEST_PATH = 'audio-manifest.json';
const FIXTURE_MANIFEST_PATH = 'e2e-fixtures/audio-manifest.fixture.json';
const AUDIO_DIR = 'audio/';
const FIXTURE_AUDIO_DIR = 'e2e-fixtures/audio/';

let manifestPromise: Promise<Manifest> | null = null;
let sharedAudio: HTMLAudioElement | null = null;

function isFixtureMode(): boolean {
  return new URLSearchParams(window.location.search).get(FIXTURE_QUERY_PARAM) === '1';
}

function loadManifest(): Promise<Manifest> {
  manifestPromise ??= fetch(`${import.meta.env.BASE_URL}${isFixtureMode() ? FIXTURE_MANIFEST_PATH : MANIFEST_PATH}`)
    .then((res) => (res.ok ? (res.json() as Promise<Manifest>) : {}))
    .catch(() => ({}) as Manifest);
  return manifestPromise;
}

/** Resolves the manifest entry for `text`, or undefined if no clip was generated for it. */
export async function clipFor(text: string): Promise<AudioManifestEntry | undefined> {
  const manifest = await loadManifest();
  return manifest[text];
}

/**
 * Plays the clip for `text` via a single shared <audio> element. No
 * speechSynthesis fallback for learning-critical listening — a wrong stød
 * drilled forty times is worse than silence (HANDOFF §3.4). Resolves
 * false silently on any manifest miss or playback failure.
 */
export async function playFor(text: string): Promise<boolean> {
  const entry = await clipFor(text);
  if (!entry) return false;
  sharedAudio ??= new Audio();
  sharedAudio.src = `${import.meta.env.BASE_URL}${isFixtureMode() ? FIXTURE_AUDIO_DIR : AUDIO_DIR}${entry.filename}`;
  try {
    await sharedAudio.play();
    return true;
  } catch {
    return false;
  }
}

/** Exposes the shared `<audio>` element for the e2e smoke test (mirrors `window.__e2eStore`'s pattern) — not used by app code. */
export function sharedAudioElement(): HTMLAudioElement | null {
  return sharedAudio;
}

const AUTOPLAY_KEY = 'danmarksliv:audioAutoplay';

/** A UI preference (not progress data) — whether Mode A auto-plays a card's clip on reveal. */
export function audioAutoplayEnabled(): boolean {
  return localStorage.getItem(AUTOPLAY_KEY) === '1';
}

export function setAudioAutoplayEnabled(enabled: boolean): void {
  localStorage.setItem(AUTOPLAY_KEY, enabled ? '1' : '0');
}
