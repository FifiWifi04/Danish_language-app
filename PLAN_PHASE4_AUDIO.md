# PLAN — Phase 4: audio, offline generation only

Executor-grade. The security posture is fixed (HANDOFF §3.4): no API key
ever reaches the client or the repo; generation is a local, owner-run
build step; the app only ever reads committed MP3s via a manifest.

## WS-A — build script + manifest

`scripts/build-audio.ts` (run: `npm run build-audio`; add the script
entry). Contract:

- Reads every content file; collects utterances: vocab `danish`,
  particle pair sentences (`withoutIt`, `withIt`), pronunciation
  `practiceWords` and `minimalPairs` (both sides), pronunciation
  `exampleSentence` where present.
- Key from `.env`: `TTS_PROVIDER` (`elevenlabs` | `azure`),
  `TTS_API_KEY`, `TTS_VOICE`. `.env` is gitignored in this WS if not
  already.
- Output `public/audio/<sha256(text|voice|provider).slice(0,16)>.mp3`;
  `scripts/audio-manifest.json` maps `text → filename` plus `{voice,
  provider, generatedAt}`. Anything already in the manifest with an
  existing file is **skipped** — unchanged cards are never re-billed.
- Provider calls are isolated in `scripts/providers/<name>.ts` with a
  `synthesize(text, voice, key): Promise<Uint8Array>` signature; a
  `fake` provider returns a 1-byte buffer for tests.
- Exit non-zero listing failures; partial progress is kept (manifest
  written after each success).

**Tests (fake provider only — the routine NEVER uses a real key):**
`audio: hash covers text+voice+provider`, `audio: manifest hit skips
synthesis`, `audio: utterance collection finds vocab+pairs+practice`,
`audio: failure keeps manifest consistent`.

The real generation run is the owner's (OWNER_INPUTS G2). Provider
default per D-AUD1; TTS-only v1 (REVIEW.md A.4 — Forvo is parked).

## WS-B — playback wiring

- `src/ui/audio.ts`: `playFor(text): Promise<boolean>` — look up the
  manifest (fetched once, cached), play the MP3 via a single shared
  `Audio` element; on miss return false silently. NO `speechSynthesis`
  fallback for learning-critical listening (a wrong stød drilled forty
  times is worse than silence — HANDOFF §3.4); Mode A's audio button
  simply hides when the clip is missing.
- Mode A: back side gets the audio button (auto-play on reveal, toggle
  remembered in localStorage — a UI preference, not progress data).
- Precache: confirm the PWA glob picks up `audio/` + the manifest.

**Smoke:** with a fixture manifest + a tiny silent MP3 checked into
`tests/fixtures/`, reveal a card and assert the button appears and
`playFor` resolves true; assert a manifest-missing card hides the button.

Gate for the phase (HANDOFF): airplane mode, complete session, all audio
plays — owner-observed after G2; the offline part is already covered by
the PHASE3 WS-B smoke.
