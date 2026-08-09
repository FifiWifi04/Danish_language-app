# AUTON_STATUS — queue, gates, log, decisions (the single pane of glass)

Seeded 2026-08-06 by the design review (REVIEW.md). Updated by every
autonomous iteration per `AUTON_ORDERS.md` step 8. The owner may edit this
file from anywhere — iterations re-read it on every firing.

## Gate registry (owner clears a gate by editing its row)

| Gate | Meaning | State |
|---|---|---|
| G1 | Native review of the 30-card pilot + pronunciation guide + stød-critical audio spot-check passed (error rate recorded below; ≤~10 %) | **open** — owner confirmed 2026-08-07 they WILL arrange the review (OWNER_INPUTS); the gate clears only when the review has happened and the error rate is recorded here |
| G2 | Real audio clips generated (owner ran `build-audio` locally with a key) and committed | **open** |
| G3 | Seven consecutive days of actual daily use, attested by the owner | **open** |
| D-DEP1 | `idb` dependency approved | **CONFIRMED yes** (owner, 2026-08-07 — item 5 builds on `idb`) |
| D-AUD1 | Audio provider chosen (recommended default: TTS-only v1) | **CONFIRMED: ElevenLabs**, TTS-only v1 (owner, 2026-08-07 — `TTS_PROVIDER=elevenlabs` is the build-audio default) |

## Queue (top unblocked `todo` item goes first)

| # | Item | Plan / WS | State | Gate |
|---|---|---|---|---|
| 0 | Scaffold: Vite+TS strict+Vitest, app shell, `base` path, `docs/DECISIONS.md` seeded with the handoff's decisions | PHASE0 WS-A | done@37a1b64 | — |
| 1 | CI (test+typecheck+build) + Pages deploy workflow | PHASE0 WS-B | done@eb6b9c2 | — (deploy-pages CONFIRMED SUCCEEDING 2026-08-07 after owner enabled Pages; see log) |
| 2 | Day-number time core + seeded RNG (pure, tested) | PHASE1 WS-A | done@1fc5f2c | — |
| 3 | Scheduler transitions per the authoritative table (expected values hand-written first) | PHASE1 WS-B | done@ad84b4d | — |
| 4 | Session queue builder (caps, ordering, no-repeat, relearning re-entry) | PHASE1 WS-C | done@8cdfd8f | — |
| 5 | Progress store: interface + memory adapter + IndexedDB adapter | PHASE1 WS-D | done@889545b | D-DEP1 answered (either answer unblocks) |
| 6 | Simulation soak harness (2 y × 500 cards) wired into `npm test` | PHASE1 WS-E | done@63a0b34 | — |
| 7 | Content schema + validator (`vocab`, `particle`, `pronunciation` types) + `npm run validate` in CI | PHASE2 WS-A | done@64395f2 | — |
| 8 | 30-card pilot deck, generated per the template, `"status":"draft"` | PHASE2 WS-B | done@2975a0d | — |
| 9 | Mode A review UI (reveal + Again/Hard/Good), draft badge on draft cards | PHASE3 WS-A | done@cc14779 | — |
| 10 | PWA: manifest, precache, offline, update-available toast | PHASE3 WS-B | done@35b0a16 | — |
| 11 | Stats view + append-only session log + streak/due counts | PHASE3 WS-C | done@f11292c | — |
| 12 | Progress export/import (JSON file) + stale-backup nudge | PHASE3 WS-D | done@00548ed | — |
| 13 | Pronunciation guide content file (~12 phenomena, mechanics, DRAFT) + add `soundTags` to the 10 sound-coverage pilot cards (deferred from item 8 — see its log entry) | PRON WS-A | done@e0d2987 | — |
| 14 | Udtale tab UI (guide browser) + `soundTags` links from cards | PRON WS-B | done@edf4814 | — |
| 15 | Audio build script + manifest + fake-provider tests (no real key use) | PHASE4 WS-A | done@95ff9d4 | — |
| 16 | Audio playback wiring in Mode A (manifest-driven, silent degrade) | PHASE4 WS-B | done@678a275 | — |
| 17 | Self-record & compare in the Udtale tab (MediaRecorder, no scoring) | PRON WS-D | done@87e8d4a | — |
| 18 | Mode B active spelling: æ/ø/å button row, `ae/oe/aa` equivalence, promotion at reps ≥ 2 | PHASE5 WS-A | done@5033fd0 | — |
| 19 | Particle cards: contrastive-pair card type, pilot content DRAFT | PHASE5 WS-C | done@0d0f8a0 | — |
| 20 | Leech rework list + in-review "flag card" + undo last rating | PHASE5 WS-D | done@2b33a65 | — |
| 21 | Minimal-pair perception drill (real clips only — TTS fallback forbidden here) | PRON WS-C | blocked | G2 |
| 22 | Mode C dictation | PHASE5 WS-B | blocked | G2 |
| 23 | Docs sweep: HANDOFF re-sync to what exists, DECISIONS completeness, test-list sync | — | todo (take last) | — |
| — | Scale deck to 500 in ~50-card themed batches | PHASE2 WS-C | blocked | G1 + G3 |
| — | Flip pilot content `draft`→`reviewed` per reviewer verdicts | PHASE2 WS-D | blocked | G1 (owner supplies verdicts) |
| — | Dialogues, sagittal diagrams, speech scoring, cross-device sync, Forvo, grammar module | — | parked | see `PARKED_GATES.md` |

## Iteration log (append-only; one line per firing)

- 2026-08-06 — seeded by design review; no autonomous iterations yet.
- 2026-08-07 — FIRST FIRING ABORTED at step 1: the session reported the
  build branch missing from origin and stopped without changes. Stopping
  was CORRECT behaviour. Diagnosis below; no code impact.
- 2026-08-07 — item 0 (PHASE0 WS-A scaffold) done@37a1b64, tier-1
  verified (npm test + tsc --noEmit + vite build all green), pushed.
- 2026-08-07 — item 1 (PHASE0 WS-B CI + Pages deploy) done@eb6b9c2,
  tier-1 verified locally and confirmed on GitHub Actions: CI run
  succeeded (build 31168074406). Deploy run (31168074338) built and
  uploaded the Pages artifact successfully; only the final
  `actions/deploy-pages@v4` step failed, consistent with Pages not yet
  being enabled in repo settings (G2/OWNER_INPUTS one-click step) —
  live-verify DEFERRED, not a workflow defect. No repo settings changed.
- 2026-08-07 — owner reported enabling Pages; re-ran the existing deploy
  run (31168141735, no new commit) via the GitHub Actions API to check —
  it now completes green end-to-end including `actions/deploy-pages@v4`.
  Tier-3 live-verify: deploy pipeline CONFIRMED SUCCEEDING. Could not
  fetch `https://fifiwifi04.github.io/Danish_language-app/` directly from
  this sandbox (egress proxy blocks the `github.io` domain) to eyeball
  the rendered shell, so recording the verification honestly as "deploy
  succeeded per GitHub Actions" rather than "page visually confirmed
  live" — the owner should do one visual check when convenient. No repo
  settings changed by this session.
- 2026-08-07 — item 2 (PHASE1 WS-A day-number time core + seeded RNG)
  done@1fc5f2c, tier-1 verified (npm test: 8/8 incl. the 4 named
  `time:` tests and 2 named `rng:` tests; tsc --noEmit; vite build all
  green), pushed. `src/core/time.ts` and `src/core/rng.ts` implement the
  plan's WS-A signatures exactly; no scheduler/UI/content touched, no
  new dependency, so tier 2/3 don't apply.
- 2026-08-07 — item 3 (PHASE1 WS-B scheduler) picked up first per queue
  order but BLOCKED before any code was written: the authoritative
  transition table in `PLAN_PHASE1_ENGINE.md` has 13 rows covering every
  (state, rating) pair except one — `state=relearning, rating=hard` has
  no row. HANDOFF §4.5 and `docs/DECISIONS.md` were also checked and
  neither addresses it (relearning is described only via its single
  10-minute step and the again/good outcomes in rows 11–12). Since
  `ScheduleInput.rating` is `Rating` (`'again'|'hard'|'good'`) with no
  narrowing per state, `schedule()` must do *something* deterministic for
  this input, and CLAUDE.md rule 2 forbids inventing scheduler behaviour
  without a new `docs/DECISIONS.md` entry — this is exactly the
  STOP-and-flag case in `AUTON_ORDERS.md` step 5 ("a product judgement
  the plan didn't pre-make"). Moved to `blocked` per orders; see
  DECISIONS-NEEDED below. Took item 4 instead as this firing's one
  workstream (no code had been written for item 3, so this doesn't
  double up on the one-WS bound).
- 2026-08-07 — item 4 (PHASE1 WS-C session queue builder) done@8cdfd8f,
  tier-1 verified (npm test: 13/13 incl. the 5 named `session:` tests;
  tsc --noEmit; vite build all green), pushed. `src/core/session.ts`
  implements `buildSession` exactly per the plan's signature and rules;
  also added the plan's shared `src/core/types.ts`
  (`Progress`/`Rating`/`CardState`/`ScheduleInput`/`Session`), needed by
  both this workstream and the still-blocked scheduler. One reading
  decision made in-scope (not a scheduler-behaviour change, just applying
  the already-stated rule precisely): "new cards only after due reviews
  are cleared" is implemented as "cleared" meaning zero due reviews left
  over the `reviewsPerDay` cap — matches HANDOFF §4.5's exact phrase and
  is pinned by a named test (`session: new cards are introduced only
  after due reviews are cleared…`). No UI/PWA/content touched, no new
  dependency, so tier 2/3 don't apply.
- 2026-08-07 — item 3 (PHASE1 WS-B scheduler transitions) done@ad84b4d,
  tier-1 verified (npm test: 31/31 incl. one named `sched:` test per
  table row 1–12b plus the plan's five invariant tests — ease bound,
  interval cap, leech-at-8, purity, totality; tsc --noEmit; vite build
  all green), pushed. `src/core/scheduler.ts` implements `schedule()`
  exactly per the now-total transition table, including row 12b per the
  2026-08-07 `docs/DECISIONS.md` entry. `state='suspended'` (not covered
  by any row, since the session queue never presents a suspended card to
  `schedule()`) is a deliberate passthrough — only row 13's blanket
  clamp/leech check applies to it — needed to satisfy the plan's own
  totality test (5 states × 3 ratings, no throw/NaN) without inventing
  scheduler behaviour for an unreachable input; this reading has no
  plausible alternative the way relearning+hard did, so it wasn't treated
  as a DECISIONS-NEEDED stop. Tests split across `tests/scheduler.test.ts`
  (row tests) and `tests/scheduler-invariants.test.ts` (property tests)
  to keep both under CLAUDE.md's ~200-line guideline. No UI/PWA/content
  touched, no new dependency, so tier 2/3 don't apply.
- 2026-08-07 — item 5 (PHASE1 WS-D progress store) done@889545b, tier-1
  verified (npm test: 34/34 incl. 3 named `store:` tests — roundtrip,
  export/import identity, import rejects bad version; tsc --noEmit; vite
  build all green), pushed. `src/core/store.ts` defines the
  `ProgressStore` interface, `SessionLogEntry` type (added to
  `src/core/types.ts` per the field list in `PLAN_PHASE3_APP.md` WS-C,
  the only concrete definition available at this phase), and the
  versioned `ExportPayload` shape — pure, no I/O, no DOM. `src/data/
  memory.ts` implements `MemoryStore` (in-memory Map, used by every core
  test). `src/data/idb.ts` implements `IdbStore` as thin delegation to
  the approved `idb` package (D-DEP1 CONFIRMED yes) — DB `danmarksliv`,
  stores `progress` (key `id`) and `sessionLog` (autoincrement); per the
  plan it is NOT unit-tested here (no `fake-indexeddb`, no new dep) and
  will be exercised by PHASE3 WS-A's Playwright smoke instead. Added
  `idb@^8.0.3` as the sole runtime dependency (zero-dependency package;
  lockfile diff is 9 lines). No UI/PWA/content touched, no scheduler
  change, so tier 2/3 don't apply.
- 2026-08-08 — item 6 (PHASE1 WS-E simulation soak harness) done@63a0b34,
  tier-1 verified (npm test: 41/41 across 8 files incl. the 7 named `sim:`
  tests; tsc --noEmit; vite build all green), pushed. Split per plan into
  `tests/simulation-harness.ts` (the pure seeded runner: 500 synthetic
  `card-N` ids, `contentOrder` all priority 1 ordered by index, 730 days
  of build-session/answer-everything/advance-day using the existing
  `buildSession`/`schedule`/`mulberry32`, learner ratings drawn
  good p=0.85 / hard p=0.05 / again p=0.10 exactly per the plan) and
  `tests/simulation.test.ts` (the named assertions), keeping both under
  CLAUDE.md's ~200-line guideline; the harness file has no `.test.ts`
  suffix so vitest's `tests/**/*.test.ts` include doesn't pick it up as
  its own suite. All six plan assertions implemented: no NaN / no interval
  outside [1,365] on review cards, ease within [1.3,2.7] every card every
  day, no starvation (gap between a card's consecutive appearances ≤ its
  post-review interval + 30 days, skipped once a card is suspended since
  leeches are expected to stop appearing), no duplicate card within one
  session, byte-identical `JSON.stringify` of final progress across two
  runs of the same seed, and a wall-clock assertion on the first run.
  Full suite runs in ~2 s (measured via `performance.now()` in the test,
  not `src/core` — core stays pure, no `Date.now()`/`Math.random()` was
  added there). No UI/PWA/content/scheduler-behaviour/dependency touched,
  so tier 2/3 don't apply.
- 2026-08-08 — item 7 (PHASE2 WS-A content schema + validator) done@64395f2,
  tier-1 verified (npm test: 48/48 across 9 files incl. the 7 named
  `validate:` tests — accepts the fixture deck, rejects duplicate id,
  rejects bad contentHash, rejects cloze without target, rejects unknown
  soundTag, accepts a cross-file soundTag resolution, and the whole-repo
  `every content file is clean` assertion (0 files today — `content/`
  doesn't exist until item 8); tsc --noEmit; vite build; `npm run
  validate` all green), pushed. Implemented per `CLAUDE.md` rule 4b's
  resolved decision: `scripts/validate-content.mjs` (thin orchestrator,
  96 lines) + `scripts/content-item-schemas.mjs` (per-type field
  validators + shared helpers, 152 lines) are plain ESM JS, pure
  functions over parsed JSON, no fs/TS/new dependency; split into two
  files to stay under CLAUDE.md's ~200-line guideline (a single-file
  draft hit 234 lines). Validates: top-level `{v:1, type, items}` shape;
  vocab fields incl. `theme.word`-shaped id, emoji-ness of `emojiAnchor`
  (via `Intl.Segmenter` grapheme count, 1-2 clusters all
  Extended_Pictographic), `contentHash` recomputed via
  `sha256(danish + "|" + (clozeTarget ?? ""))` and compared,
  clozeSentence/clozeTarget co-requirement (contains `"___"`, target
  required iff sentence present — the "must equal danish or an inflected
  form" clause in the plan is left unchecked as unenforceable without a
  Danish morphology dictionary, which is out of scope); particle fields
  incl. `pairs` ≥2; pronunciation fields per `PLAN_PRONUNCIATION.md`
  WS-A's schema (`practiceWords` 4-8, `minimalPairs` 0-4, optional
  `exampleSentence`); id uniqueness across ALL passed-in files; soundTags
  referential integrity against pronunciation ids collected across files.
  `tests/validate-content.test.ts` reads `content/*.json` from disk via
  `process.cwd()` (an `import.meta.url`-based path threw `TypeError: The
  URL must be of scheme file` under vitest's happy-dom test environment —
  switched to `process.cwd()`, which is stable since vitest always runs
  from the repo root) and is exactly what `npm run validate` runs
  (already wired in `package.json` from item 0's scaffold — no CI change
  needed, matching the plan's "wire nothing extra into CI"). No
  UI/PWA/scheduler-behaviour/dependency touched. `content/` itself is
  still absent — that's item 8 (PHASE2 WS-B, the 30-card pilot deck),
  correctly left for the next firing per the one-workstream bound.
- 2026-08-08 — item 8 (PHASE2 WS-B 30-card pilot deck) done@2975a0d,
  tier-1 verified (npm test: 48/48 across 9 files incl. all 7 `validate:`
  tests now running against real content; tsc --noEmit; vite build;
  `npm run validate` all green), pushed. `content/deck.v1.json` has
  exactly 30 vocab items, every one `"status":"draft"`, composed per the
  plan: 10 survival nouns/verbs (hej, tak, undskyld, kaffe, rundstykke,
  dankort, at hedde, at bo, at arbejde, brød), 10 conversational
  verbs/phrases (at snakke, at synes, at gide, "det ved jeg ikke",
  "hvad så?", "det er fint", at hygge, at glæde sig, "vi ses", "hav det
  godt"), 10 sound-coverage items (stød: hund/mand/ven; soft d:
  mad/gade/glad; y/ø: ny/øl; vocalised r: mor/her — 3+3+2+2, meeting the
  "at least" minimums exactly). 19/30 cards carry a `clozeSentence` (plan
  requires ≥15); `clozeTarget` uses inflected forms where natural
  (hedder, bor, arbejder, gider, glæder mig) per the field's own
  definition. `grammarNote` added to 7 cards only where Polish/Danish
  genuinely diverge (tak false-friend, et-word gender, infinitive "at",
  synes/tro/tænke three-way split, no Polish equivalent for gide/hygge,
  silent hv-, reflexive sig + V2) — the rest carry none, per the
  authoring rule. `phoneticPl` uses Polish orthography throughout,
  including "ł" for blødt d (soft d) following the sound's own
  description in `PLAN_PRONUNCIATION.md` ("resembles a dark ł/l to
  Polish ears") and "a"-glide spellings (moa, hea) for vocalised r.
  **Deliberate deviation from the plan text, logged here rather than
  silently applied:** the 10 sound-coverage cards do NOT carry
  `soundTags` yet, though WS-B's text says to add them. Reality check
  (AUTON_ORDERS step 0) — the validator built in item 7 checks
  `soundTags` referential integrity against pronunciation item ids
  collected across ALL `content/*.json` files, and
  `content/pronunciation.v1.json` doesn't exist (that's item 13, PRON
  WS-A, still `todo`, queued *after* this item). Adding `soundTags` now
  would fail `npm run validate` outright — not a product-judgement
  ambiguity like item 3's relearning gap, just a hard forward
  dependency created by queue ordering (item 8 before item 13). Treated
  as a small, mechanical, in-scope self-heal per the self-healing
  mandate rather than a STOP-and-flag: omitted the field, kept
  everything else in the WS as specified, and added a note to item 13's
  queue row above so the tags get attached when the pronunciation
  content lands (ids should follow `PLAN_PRONUNCIATION.md` WS-A's slugs:
  stoed → hund/mand/ven, soft-d → mad/gade/glad, y/oe → ny/oel, r-final
  → mor/her). No UI/PWA/scheduler/dependency touched.

- 2026-08-08 — item 9 (PHASE3 WS-A Mode A review UI) done@cc14779, tier-1
  verified (npm test: 53/53 across 11 files, incl. 2 named `progress:`
  tests and 3 named `stats:` tests; tsc --noEmit; vite build; `npm run
  validate` all green) AND tier-2 verified (Playwright:
  `tests/e2e/review.spec.ts` completes a 3-card session against the new
  `?e2eDeck=1` fixture deck at `public/e2e-fixtures/deck.fixture.json`,
  asserts the queue empties, then reads `exportAll()` back in-page and
  confirms all 3 fixture ids got a Progress row at `state:'learning'`;
  also eyeballed the built preview manually via a Playwright screenshot —
  front shows danish+emoji+DRAFT badge, tap reveals english/polish/
  phoneticPl/disabled audio button/Again-Hard-Good row all ≥48px tall).
  `src/ui/review.ts` (orchestration: load store+deck, `buildSession`,
  iterate the fixed queue, `schedule()` + `store.put` per rating, session
  log + end screen) and `src/ui/review-card.ts` (one-card rendering, kept
  separate to stay under CLAUDE.md's ~200-line guideline — 111 + 104
  lines) implement the plan's Review tab exactly: reveal on tap or
  Space/Enter, draft badge, "content changed — re-check" badge (cleared
  on the next Good by re-stamping `contentHash` before the `put`), session
  end screen with counts done, streak, and a backup-age nudge.
  Two new pure `src/core/` modules, both unit-tested: `progress.ts`
  (`newProgress`/`materializeProgress` — a content item with no stored row
  gets a synthesized `state:'new'` row, matching how `session.test.ts`'s
  `buildSession` already expected `all: Progress[]` to be a full union) and
  `stats.ts` (`computeStreak`, consecutive day numbers with `reviewed>=1`
  ending at `today` — the plan's WS-C stats view will reuse this rather
  than reimplement it). `src/data/content.ts` loads the real
  `content/deck.v1.json` via a direct ES/JSON import (bundled, so no
  runtime fetch or CORS surface for the production path; `tsconfig.json`
  gained `resolveJsonModule` for this) — chosen over a fetch-from-public
  design because it's simpler and the plan doesn't pin a loading
  mechanism; WS-B (PWA precache) can decide when it lands whether
  precaching content separately is still needed once it's already inside
  the precached JS bundle. `renderShell`/`renderMain` (`src/ui/shell.ts`)
  now take `{store, deck}` as explicit deps instead of constructing an
  `IdbStore` themselves, so `tests/smoke.test.ts` and Playwright can both
  inject a `MemoryStore`/fixture without touching real IndexedDB;
  `src/main.ts` does the real wiring (`IdbStore` + `loadVocabDeck` off
  `location.search`) and, only behind `?e2eDeck=1`, exposes the store on
  `window.__e2eStore` so the e2e spec can call `exportAll()` in-page —
  gated by the same query flag as the fixture, so production loads never
  do this.
  **New dev dependency `@playwright/test`** (on CLAUDE.md's pre-approved
  list, not previously installed) — added via `npm install --save-dev`,
  wired as `npm run test:e2e` / `playwright.config.ts`.
  `playwright.config.ts`'s `launchOptions.executablePath` only points at
  this build sandbox's pre-installed Chromium
  (`/opt/pw-browsers/chromium`) when `existsSync` finds it there — guarded
  so a real CI runner or the owner's machine, which won't have that path,
  falls back to Playwright's own `playwright install`/download instead of
  inheriting a dead path. `test-results/` and `playwright-report/` added
  to `.gitignore`.
  **Deliberate, documented deviation (self-healing mandate, small and
  in-scope):** the plan's session-end "backup is N days old" nudge has no
  data source yet — WS-D (export/import) is still `todo` and hasn't
  started writing a last-export timestamp anywhere. Rather than invent
  fake backup data or block WS-A on WS-D, `review.ts` reads an
  as-yet-unwritten `localStorage['danmarksliv:lastExportAt']` key and
  shows "you haven't backed up yet" when it's absent (only showing an
  age once WS-D starts writing that key and 7 days have actually passed).
  No UI/scheduler/content/dependency-approval-list touched beyond the
  above; `content/` itself untouched (firewall respected).
- 2026-08-08 — item 10 (PHASE3 WS-B PWA: manifest, precache, offline,
  update toast) done@35b0a16, tier-1 verified (npm test: 53/53; tsc
  --noEmit; vite build; npm run validate all green) AND tier-2 verified
  (Playwright: 2/2, incl. new `tests/e2e/pwa-offline.spec.ts` — load,
  await `navigator.serviceWorker.ready`, `context.setOffline(true)`,
  reload, assert the 3-tab nav renders and a `.review-card` appears from
  the precached bundle; existing `review.spec.ts` still green).
  `vite-plugin-pwa@1.3.0` added (pre-approved on CLAUDE.md's dev list,
  not previously installed; confirmed peer-compatible with this repo's
  `vite@^8.2.1` before installing). `vite.config.ts` wires `VitePWA` with
  `registerType:'prompt'`, `injectRegister:false` (registration is done
  by hand in `src/pwa.ts` so the update/offline-ready callbacks can drive
  custom toasts), manifest (name "DanmarksLiv", da-flag-red
  `#C8102E` theme/background, `start_url`/`scope` pinned to the Pages
  base path, maskable icon pair), and workbox `globPatterns` covering
  `js/css/html/png/svg/json/mp3` with `globIgnores:['e2e-fixtures/**']`
  so the Playwright fixture deck never ships in the real precache.
  Verified in the built manifest afterward: `content/deck.v1.json` isn't
  a separate precache entry because item 9 already bundles it straight
  into the JS chunk (which is precached by default) rather than
  fetching it at runtime — the plan's "precache includes content/*.json"
  outcome is already satisfied, just via item 9's mechanism instead of a
  standalone file; `public/audio/**` has nothing to match yet (items
  15/16 still `todo`) but the `mp3` extension is already in
  `globPatterns` so no further `vite.config.ts` change will be needed
  when audio lands. `src/pwa.ts` calls the plugin's `registerSW` with
  `onNeedRefresh` → toast "New version — reload" whose action calls
  `updateSW(true)` (the library's own `controlling`-event listener does
  the actual reload — no manual `location.reload()` needed) and
  `onOfflineReady` → one-time "works offline now" toast, auto-dismissing
  after 5 s; wired into `src/main.ts`'s `bootstrap()` after
  `renderShell`. No CSS was added for the toast (the app has no
  stylesheet anywhere yet; adding one was out of scope for this WS).
  **Deliberate, documented deviation (self-healing mandate, small and
  in-scope):** the plan's WS-B text asks for an "emoji-on-red" icon pair.
  Rasterizing an actual emoji glyph needs font/canvas rendering (canvas,
  sharp, resvg, satori, …), none of which is on CLAUDE.md rule 4's
  approved dependency list — adding one would itself be a STOP-and-flag
  case. Wrote `scripts/png-encoder.mjs` (a ~90-line dependency-free PNG
  encoder over Node's built-in `zlib`) and `scripts/generate-icons.mjs`
  (draws a 192/512 pair) and substituted a hand-drawn **off-center Nordic
  cross** (Dannebrog-style, not a centered plus/Swiss cross — verified by
  eye on the 512px output) on the theme red for the emoji glyph — simpler,
  dependency-free, and arguably more on-theme for a Danish-learning app
  than an arbitrary emoji would have been. Cross arm tips kept 18% clear
  of every edge (safe-zone circle only requires ≥10%) so the maskable
  crop never clips them. Both scripts are checked in and rerunnable
  (`node scripts/generate-icons.mjs`), matching the plan's "with a
  script, checked in." No UI(other tabs)/scheduler/content/progress-store
  touched.
- 2026-08-08 — item 11 (PHASE3 WS-C stats view) done@f11292c, tier-1
  verified (npm test: 59/59 across 11 files, incl. 7 new named `stats:`
  tests for the pure helpers below; tsc --noEmit; vite build; npm run
  validate 7/7 all green) AND tier-2 verified (Playwright 3/3, incl. new
  `tests/e2e/stats.spec.ts` — completes a 3-card session, switches to the
  Stats tab, asserts a `Streak: N days` line with N ≥ 1 and exactly one
  `.session-row` containing "3 reviewed"; existing `review.spec.ts` and
  `pwa-offline.spec.ts` still green). Four new pure `src/core/stats.ts`
  functions, all unit-tested: `computeDueCounts` (due learning/relearning
  steps + capped due reviews; new-card count gated on reviews being
  cleared — mirrors `buildSession`'s own filtering exactly but without
  consuming an RNG, since this is a display-only preview, not an actual
  session draw), `computeRetention` ((good+hard)/reviewed over a trailing
  window, `null` on zero reviews rather than a misleading 0%),
  `last30DaysBars` (30 zero-filled day buckets ending at `today`), and
  `countLeeches`. `src/ui/stats.ts` renders: due/new-remaining line,
  streak, a plain-div bar strip (title attr carries the per-day count, no
  chart lib per the plan), retention, leech count, backup status, and a
  recent-sessions list (`.session-row` per entry, newest first, capped at
  10) — wired into `src/ui/shell.ts`'s existing (previously unreachable)
  `stats` tab case. Factored `src/ui/backup-status.ts`
  (`LAST_EXPORT_KEY`/`BACKUP_NUDGE_DAYS`/`backupAgeDays`/
  `backupStatusText`) out of what was inline in `review.ts`'s session-end
  nudge so both WS-A's nudge and WS-C's always-visible "Backup: N days
  ago" line share one source of truth instead of duplicating the
  `localStorage` key and age math — `review.ts`'s nudge text and
  threshold behaviour are unchanged, only the constant/computation moved.
  **Deliberate, documented deviation (self-healing mandate, small and
  in-scope):** the plan's WS-C text says the leech count should link "to
  the rework list (PHASE5 WS-D)" — that item (queue #20) is still `todo`
  and no such tab/route exists yet, so a link would 404. Rendered as a
  plain "Leeches: N" count instead; when item 20 lands it should turn this
  into a real link/anchor. No content/scheduler/dependency touched; the
  content firewall wasn't in play (no `content/` file edited).
- 2026-08-08 — item 12 (PHASE3 WS-D export/import) done@00548ed, tier-1
  verified (npm test: 59/59; tsc --noEmit; vite build; npm run validate
  7/7 all green) AND tier-2 verified (Playwright 4/4, incl. new
  `tests/e2e/backup.spec.ts` — completes a 3-card session, clicks Export
  backup and captures the real downloaded file, clears progress via the
  e2e-exposed store, clicks Import backup (file input + native confirm
  dialog accepted), and asserts the same 3 fixture ids come back from
  `store.all()`; existing `review.spec.ts`, `pwa-offline.spec.ts`,
  `stats.spec.ts` still green). New `src/ui/backup.ts`
  (`renderBackupControls`) wired into `src/ui/stats.ts` right after the
  existing backup-status line: **Export backup** builds the Blob +
  `a[download]` (`danmarksliv-backup-<date>.json`, ISO date) per the
  plan and stamps `backup-status.ts`'s existing `LAST_EXPORT_KEY` on
  click; **Import backup** is a hidden file input behind a button,
  gated by `window.confirm(...)` stating it replaces current progress,
  then calls `store.importAll` and surfaces the thrown error's message
  verbatim (or "Import complete.") in a status line — no separate
  validation was added here since `ProgressStore.importAll` (both
  `MemoryStore` and `IdbStore`, done in item 5) already parses/checks
  the version before writing anything, so a bad file never partially
  imports. No core/scheduler/content/dependency touched; the content
  firewall wasn't in play.
- 2026-08-08 — item 13 (PRON WS-A pronunciation guide content) done@e0d2987,
  tier-1 verified (npm test: 59/59 across 11 files, incl. the existing
  `validate: accepts a soundTag that resolves to a pronunciation item in
  another file` and `validate: every content file is clean` tests now
  exercising the real cross-file reference; tsc --noEmit; vite build;
  `npm run validate` 7/7 all green). Content-only workstream (no UI/PWA
  touched), so tier 2/3 don't apply. `content/pronunciation.v1.json` seeds
  all 12 phenomena from `PLAN_PRONUNCIATION.md` WS-A verbatim in scope —
  stoed, soft-d, r-initial, r-vocalised, y, oe, o-aa-u-ladder,
  i-e-ae-a-ladder, soft-g, silent-letters, lenis-fortis, schwa-rhythm —
  every item `"status":"draft"`, each with `mechanics_pl` as ordered
  imperative tongue/lips/jaw/throat steps, `polishTrap_pl` naming the
  specific L1-transfer error, `anchor_pl` giving a Polish-sound starting
  point, 4-5 `practiceWords` (within the schema's 4-8 range), and
  `minimalPairs`/`exampleSentence` where a natural pair existed (not
  forced onto every item — both optional per schema). Also closed out
  item 8's deferred TODO: added `soundTags` to the 10 sound-coverage
  pilot cards in `content/deck.v1.json` using exactly the slugs that log
  entry named — `sound.hund`/`sound.mand`/`sound.ven` → `["stoed"]`,
  `sound.mad`/`sound.gade`/`sound.glad` → `["soft-d"]`, `sound.ny` →
  `["y"]`, `sound.oel` → `["oe"]`, `sound.mor`/`sound.her` →
  `["r-vocalised"]` (the last pair matches phenomenon 4, "vocalised r
  after a vowel", not r-initial). No new dependency, no scheduler change,
  no `"status":"reviewed"` content touched (deck.v1.json's edited rows
  are all still draft) — content firewall respected. Validator support
  (`scripts/content-item-schemas.mjs`'s `validatePronunciationItem`) was
  already built ahead of time in item 7, so no validator change was
  needed here, only content authored against the existing schema.
- 2026-08-09 — item 14 (PRON WS-B Udtale tab UI) done@edf4814, tier-1
  verified (npm test: 62/62 across 12 files incl. 3 new named `udtale:`
  tests; tsc --noEmit; vite build; npm run validate 7/7 all green) AND
  tier-2 verified (Playwright 6/6, incl. new `tests/e2e/udtale.spec.ts` —
  opens "stød" from the list and asserts mechanics steps render; taps a
  soundTag chip on a fixture card back and asserts hash-navigation into
  the matching detail view; existing review/pwa-offline/stats/backup
  specs still green). `src/data/pronunciation.ts` loads
  `content/pronunciation.v1.json` the same way `data/content.ts` loads
  the deck (bundled JSON import, typed per WS-A's schema). `src/ui/
  udtale.ts` (list view: 12 items, title_da/title_pl, DRAFT badge) and
  `src/ui/udtale-detail.ts` (detail view: whatItIs → anchor → numbered
  mechanics steps → polishTrap in a warning box → practice-word chips →
  minimal-pairs table → "drill this sound" button) split to stay under
  CLAUDE.md's ~200-line guideline, mirroring the existing review.ts/
  review-card.ts split. `src/ui/shell.ts`'s hash router gained an
  optional sub-route (`#udtale/<id>` → opens straight to that item,
  parsed by a new `detailFromHash`) so soundTag chips can deep-link
  without a bigger routing rework; `tabFromHash` now takes only the
  segment before the first `/`, so plain `#udtale`/`#review`/`#stats`
  behave exactly as before. `src/ui/review-card.ts`'s card back renders
  a small chip per `item.soundTags` entry (tag text as-is, no title
  lookup — kept minimal) that sets `location.hash` to jump into Udtale.
  **Deliberate, documented deviation (self-healing mandate, small and
  in-scope):** the plan's WS-B text says practice-word chips "play audio
  when the manifest has it, PHASE4 WS-B's `playFor`" — that function and
  the whole audio manifest (items 15/16) are still `todo`, so chips are
  rendered `disabled`, exactly matching the silent-degrade pattern
  `review-card.ts` already uses for its own audio button; PHASE4 WS-B
  should wire `playFor` into these chips (and remove `disabled`) when it
  lands, no other change needed here. The "drill this sound" button is
  rendered `hidden` per the plan's own words ("hidden until then"), since
  WS-C is `blocked` on G2 — nothing to wait on, just following the text.
  Added `"soundTags": ["stoed"]` to the e2e fixture deck's first card
  (`public/e2e-fixtures/deck.fixture.json`, not under the content
  firewall — it's a Playwright fixture, not `content/*.json`) so the
  chip-navigation smoke has something to click. No scheduler/dependency
  touched; `content/` itself untouched (firewall respected — the guide
  file was only read, never edited).

- 2026-08-09 — item 15 (PHASE4 WS-A audio build script + manifest +
  fake-provider tests) done@95ff9d4, tier-1 verified (npm test: 66/66
  across 13 files incl. the 4 named `audio:` tests; tsc --noEmit; vite
  build; npm run validate 7/7 all green). Content-only-adjacent
  workstream (a build script, no UI/PWA touched), so tier 2/3 don't
  apply. `scripts/audio-lib.mjs` (pure): `hashUtterance` (sha256 of
  `text|voice|provider`, sliced to 16 hex chars), `collectUtterances`
  (vocab `danish`; particle `pairs[].withoutIt`/`withIt`; pronunciation
  `practiceWords[].word`, `minimalPairs[].a`/`b`, `exampleSentence.danish`
  — deduped, first-seen order), `planSynthesis` (a manifest hit requires
  matching voice+provider AND the file still present in a caller-supplied
  `existingFiles` set, so a stale/missing file always re-synthesizes),
  and `runSynthesis` (async, continues past a per-utterance failure,
  `now` injectable for deterministic tests — a failed utterance never
  gets a manifest entry, satisfying the plan's "failure keeps manifest
  consistent"). `scripts/providers/fake.mjs` returns a 1-byte buffer,
  used by all four tests and safe for CI. `scripts/providers/elevenlabs.mjs`
  is the real D-AUD1 default (plain `fetch` against ElevenLabs'
  text-to-speech endpoint, no new dependency) — never invoked by tests or
  this routine, only by the owner's local G2 run.
  `scripts/build-audio.mjs` is the CLI orchestrator: hand-parses `.env`
  (no dotenv dependency — a few lines of `KEY=value` line matching) for
  `TTS_PROVIDER`/`TTS_API_KEY`/`TTS_VOICE`, reads `content/*.json`, lists
  `public/audio/` for existing files, plans + runs synthesis, and writes
  `public/audio/<hash>.mp3` + `scripts/audio-manifest.json` after every
  success (so a mid-run crash keeps whatever already succeeded); exits
  non-zero listing every failed utterance. Added
  `"build-audio": "node scripts/build-audio.mjs"` to `package.json` per
  the plan. Manually dry-ran the full script end-to-end against a scratch
  copy of the repo (never touching the real `public/audio/` or
  `scripts/audio-manifest.json`) with `TTS_PROVIDER=fake`: first run
  collected all 82 real utterances from the current `content/*.json` and
  "synthesized" all 82; a second run against the same scratch copy
  skipped all 82 via the manifest-hit path — confirms the skip logic
  against real content shape, not just the unit-test fixtures. No real
  key was used anywhere in this session; `.env` was already gitignored
  from item 0's scaffold (`.env`/`.env.*` with `!.env.example`), so no
  `.gitignore` change was needed. No UI/PWA/scheduler/content/dependency
  touched — `content/` itself was only read, never edited (firewall
  respected). Item 16 (PHASE4 WS-B playback wiring) is next but needs a
  real manifest to wire against meaningfully; it's still buildable
  against a fixture manifest per its own plan text, so left `todo` for
  the next firing per the one-workstream bound.

- 2026-08-09 — item 16 (PHASE4 WS-B audio playback wiring) done@678a275,
  tier-1 verified (npm test: 72/72 across 14 files incl. 6 new named
  `audio:` tests; tsc --noEmit; vite build; npm run validate 7/7 all
  green) AND tier-2 verified (Playwright 8/8, incl. new
  `tests/e2e/audio.spec.ts` — reveals the fixture deck's first card
  ("et", which the fixture manifest has a clip for), asserts the 🔊 Play
  button becomes visible, clicks it, and polls `window.__e2eAudio()`
  (new e2e-only accessor mirroring `window.__e2eStore`'s pattern) until
  `.paused === false`; a second test rates that card away, reveals the
  next one ("to", no fixture clip), and asserts the button stays hidden;
  existing review/pwa-offline/stats/backup/udtale specs still green).
  `src/ui/audio.ts` (new, 72 lines): `clipFor`/`playFor` per the plan's
  signature, manifest fetched once and memoized in a module-level
  promise, played through one shared `<audio>` element; `playFor`
  resolves `false` silently on any manifest miss or playback rejection —
  deliberately no `speechSynthesis` fallback (HANDOFF §3.4, a wrong stød
  drilled forty times is worse than silence). `audioAutoplayEnabled`/
  `setAudioAutoplayEnabled` back a `localStorage` toggle (UI preference,
  not progress data) rendered once per review session in `review.ts`
  (`renderAudioToggle`, outside the per-card `wrapper` so it survives
  `review-card.ts`'s per-card `wrapper.textContent = ''` clear).
  `review-card.ts`'s audio button now starts `hidden` (was `disabled`)
  and only unhides once `clipFor` resolves a hit, matching the plan's
  "audio button simply hides when the clip is missing" exactly; on
  unhide, auto-plays if the toggle is on. Also closed out item 14's
  logged deferred TODO: `udtale-detail.ts`'s practice-word chips now
  call `playFor(pw.word)` on click instead of rendering `disabled` —
  they stay clickable regardless of manifest coverage (the word text is
  informational on its own) and degrade silently on a miss, same as the
  review card's button behaviour once revealed.
  **Deliberate, documented decision (small, in-scope, forced by how Vite
  serves files — not a product-judgement STOP):** moved
  `scripts/build-audio.mjs`'s `MANIFEST_PATH` from `scripts/
  audio-manifest.json` to `public/audio-manifest.json`. WS-B's own text
  says `playFor` "look[s] up the manifest (fetched once, cached)" and
  separately asks to "confirm the PWA glob picks up audio/ + the
  manifest" — neither is possible from `scripts/`, since Vite only
  serves `public/` (and the bundled `src/`) at runtime; `scripts/` never
  reaches `dist/`. Moving the write target into `public/` (already
  covered by the existing `json` glob entry from item 10, so no
  `vite.config.ts` change was needed) is the only reading that makes
  WS-B's two stated requirements possible at all — not a scheduler
  change, no new dependency, doesn't touch `content/` or the audio-lib
  unit tests (which pass `existingFiles`/`manifest` in directly and
  never reference the path constant). HANDOFF §4.2's repo-shape tree
  still lists it under `scripts/`; that diagram is documentation, not a
  binding path per CLAUDE.md, so it's now stale and worth a note in the
  eventual docs sweep (item 23) rather than a blocker here.
  No real manifest exists yet (G2 — real audio generation — is still
  open), so `public/audio-manifest.json` and `public/audio/*.mp3` are
  still absent from the repo; the fixture manifest + a hand-built
  8-bit-PCM WAV (named `.wav`, not `.mp3` — honest about not being a
  real MP3, and format-agnostic since `playFor` just plays whatever
  filename the manifest gives it) under `public/e2e-fixtures/` stand in
  for the smoke test only, gated behind the same `?e2eDeck=1` flag
  `data/content.ts` already uses (no second query param invented).
  `audioButton`/practice-word chips keep the plan's 48px min-height
  convention from the rating buttons. No scheduler/content/dependency
  touched; the content firewall wasn't in play (no `content/` file
  edited).

- 2026-08-09 — item 17 (PRON WS-D self-record & compare) done@87e8d4a,
  tier-1 verified (npm test: 75/75 across 15 files incl. 3 new named
  `record:` tests; tsc --noEmit; vite build all green) AND tier-2 verified
  (Playwright 9/9, incl. new `tests/e2e/record.spec.ts` — reveals the
  fixture deck's first card ("et", which has a clip), clicks the record
  button, asserts it toggles to "⏹ Stop recording", clicks it again as a
  manual early stop, and asserts the "Yours" replay button becomes
  enabled; existing 8 specs still green). `src/ui/record.ts` (new, 90
  lines): `renderRecordControl(container, referenceText)` feature-detects
  `MediaRecorder`/`navigator.mediaDevices.getUserMedia` and renders nothing
  at all when absent (older iOS, per the plan); otherwise renders a plain
  explanation line, a record button (mic requested on click, ≤5s auto-stop
  via `setTimeout` or an earlier manual click-to-stop), and "Yours"/
  "Reference" replay buttons. The recorded `Blob`'s object URL lives only
  in memory for the control's lifetime (revoked on the next recording,
  never uploaded, never written to the progress store) — no scoring of any
  kind, per PARKED_GATES. `playwright.config.ts` gained Chromium's
  `--use-fake-device-for-media-stream --use-fake-ui-for-media-stream`
  launch args (plus `permissions:['microphone']` in the new spec) so the
  smoke test runs without a real mic or an interactive permission prompt;
  harmless to every other spec since none of them touch media.
  **Reading decision (small, in-scope, not a STOP case — documented per
  the self-healing mandate):** the plan's WS-D text places the control "on
  an item detail page and on card backs with audio." Read as two distinct
  single-widget locations: unconditionally on the Udtale detail page
  (referenced against `item.practiceWords[0].word`, the item's first and
  most prominent practice word — no picker UI, since the plan gives one
  button per location, not one per word) and, on review card backs, nested
  inside the existing `clipFor(item.danish).then(...)` hit callback so it
  only appears once the card actually "has audio" (mirroring the 🔊 Play
  button's own gating right next to it). The detail-page instance's
  `Reference` button degrades silently on a manifest miss exactly like
  item 16's practice-word chips already do (`playFor` resolving false) —
  same "always clickable, degrades silently" precedent, not a new pattern.
  No dependency/scheduler/content/progress-store touched; the content
  firewall wasn't in play (no `content/` file edited). Item 18 (PHASE5
  WS-A Mode B active spelling) is next per queue order.

- 2026-08-09 — item 18 (PHASE5 WS-A Mode B active spelling) done@5033fd0,
  tier-1 verified (npm test: 80/80 across 16 files incl. 5 new named
  `spell:` tests; tsc --noEmit; vite build; npm run validate 7/7 all
  green) AND tier-2 verified (Playwright 11/11, incl. new
  `tests/e2e/spell.spec.ts` — seeds a `state:'review', reps:2` progress
  row for the fixture deck's `fixture.two` via `__e2eStore.put` then
  reloads, types "toe" into the spelling input and asserts it's accepted
  as an exact match for "tø" — oe→ø digraph equivalence — progress
  advances to `reps:3` and the session moves to the next card; a second
  test types a wrong answer, asserts a `.spell-char-wrong` diff span and
  the Again/Hard/Good row appear, rates Hard, and asserts the card stays
  in `state:'review'` with `reps:3`, matching row 9 — not a lapse;
  existing audio/backup/pwa-offline/record/review/stats/udtale specs
  still green). `src/core/spelling.ts` (new, pure, 49 lines):
  `normalizeSpelling` (trim, lowercase, `ae→æ`/`oe→ø`/`aa→å`, applied
  identically to both sides so it doesn't matter which one carries the
  digraph — "both directions" per the plan), `isSpellingMatch`,
  `spellingDiff` (per-char diff built from the *target's* own letters so
  a highlighted miss still shows the correct spelling, not just the
  user's wrong one), `firstWrongIndex`, and `isModeBEligible` (the
  promotion rule verbatim — `state==='review' && reps>=2`, HANDOFF §3.8).
  `src/ui/review-spell.ts` (new, 125 lines) renders the Mode B card:
  emoji + english/polish prompt (the Danish word itself is withheld,
  unlike the normal reveal card whose front already shows it), a text
  input with `aria-label="Danish spelling"`, an æ ø å Æ Ø Å row that
  inserts at the caret, a "Check answer" button (also wired to Enter),
  and a "Show answer" escape hatch. Exact match → renders a "✓ Correct"
  line and calls `onRate('good')` directly (read as the plan's "auto-Good
  prompt" — no extra click, since a byte-exact typed answer is
  unambiguous); a mismatch → renders `spellingDiff`'s per-char spans
  (`.spell-char-ok`/`.spell-char-wrong`) and falls through to the same
  reveal used by "Show answer": `renderBack` (translations, audio, sound
  tags) plus the full Again/Hard/Good row for honest self-rating, per the
  plan's "self-graded, like Anki." `src/ui/review-card.ts` had
  `renderCardBadges`/`renderRatingButtons` extracted and `renderBack`
  exported (was private) so `review-spell.ts` reuses them exactly rather
  than duplicating the back-content/audio/sound-tag-chip logic —
  `renderCard`'s own rendered output is byte-identical to before, only
  the internals were factored out (all 75 pre-existing tests plus the 5
  new ones stayed green, confirming no behaviour drift). `src/ui/
  review.ts`'s `showCard()` now branches on `isModeBEligible(progress)` to
  pick `renderSpellCard` vs `renderCard`; both share the exact same
  `onRate` closure (schedule + store.put + advance), so `schedule()` and
  the transition table are completely untouched — only the UI eliciting a
  rating changed, not what a rating *does* — so no `docs/DECISIONS.md`
  entry was needed (confirmed against CLAUDE.md rule 2: that rule guards
  scheduler *behaviour*, not the input surface). `public/e2e-fixtures/
  deck.fixture.json`'s `fixture.two` danish field changed from "to" to
  "tø" so the smoke test has a digraph-testable target; not under the
  content firewall (same precedent as item 14's fixture edit — a
  Playwright fixture, not `content/*.json`) and not referenced by literal
  text anywhere else in the test suite (checked: only used by id, never
  asserted by string). No dependency/content/progress-store-shape
  touched; the content firewall wasn't in play. Item 19 (PHASE5 WS-C
  particle cards) is next per queue order.

- 2026-08-09 — item 19 (PHASE5 WS-C particle cards) done@0d0f8a0, tier-1
  verified (npm test: 84/84 across 17 files incl. 4 new named `particles:`
  tests; tsc --noEmit; vite build; npm run validate 7/7 all green — the
  real validator now also exercises `content/particles.v1.json`) AND
  tier-2 verified (Playwright 12/12, incl. new `tests/e2e/particles.spec.ts`
  — walks the fixture queue, asserts a `.particle-card` renders "da" and
  its first pair's `withoutIt` sentence on the front, reveals it and
  asserts both pairs' `withIt`/`socialEffect_pl` text appear, then rates
  it Good and finishes the session normally; existing 11 specs still
  green). `content/particles.v1.json` seeds the 6 pilot items named in
  the plan (da, jo, lige, vel, nok, godt), each `"status":"draft"` with
  exactly 2 contrastive pairs (`withoutIt`/`withIt`/`socialEffect_pl`) and
  a `note_pl`, matching HANDOFF §3.6's "Kom nu"/"Kom nu da" pattern; the
  existing `validateParticleItem` schema (built ahead of time in item 7)
  needed no change. **Reading decision, small and in-scope (not a STOP
  case):** the particle schema doesn't require or check `contentHash` (only
  `validateVocabItem` does), but `materializeProgress`/`Progress` assume
  every card has one for the "content changed" re-check flag — rather than
  special-case particles out of that mechanism, gave each item a
  `contentHash` computed the same way as vocab's
  `sha256(danish + "|" + (clozeTarget ?? ""))` formula but with
  `particle` standing in for `danish` and the pairs' `withoutIt>withIt`
  text (joined) standing in for `clozeTarget`; documented here since it's
  not enforced anywhere and a future content edit must recompute it by
  hand (or a small script) using that same formula.
  `src/data/deck.ts` (new) introduces `DeckItem = VocabItem | ParticleItem`
  and `isParticleItem` (structural — `'particle' in item` — no tag field
  added to either content shape) plus `loadDeck()`, which the review/stats/
  shell layer now takes instead of `VocabItem[]` (only a type-import swap
  in `shell.ts`/`stats.ts`; `materializeProgress` already only needed
  `{id, contentHash}` structurally, so no core change). `src/data/
  particles.ts` loads `content/particles.v1.json` the same way `data/
  content.ts` loads the vocab deck; under `?e2eDeck=1` it returns `[]`
  unless a *second*, separate flag `?e2eParticles=1` is also present, so
  every pre-existing e2e spec's fixed 3-card fixture deck (`review.spec.ts`
  asserts exactly 3 progress rows, byte-checked by id) is completely
  unaffected — the new smoke test opts in with both params and gets a
  4-item queue (3 vocab + 1 particle, `public/e2e-fixtures/
  particles.fixture.json`). `src/ui/review-particle.ts` (new, 87 lines)
  renders the card per the plan's text exactly: front = particle + pairs[0]
  .withoutIt; reveal = every pair's withoutIt/withIt/socialEffect_pl plus
  note_pl; reuses `renderCardBadges`/`renderRatingButtons` from
  `review-card.ts` rather than duplicating them (`renderCardBadges`'s
  parameter type was widened from `VocabItem` to a minimal
  `{status, contentHash}` shape so both card kinds satisfy it structurally
  — `renderCard`'s own call site and behaviour are unchanged). `review.ts`'s
  `showCard()` now checks `isParticleItem(item)` first and routes straight
  to `renderParticleCard`, bypassing `isModeBEligible` entirely — Mode B
  active spelling only ever applies to vocab, matching the plan's silence
  on spelling for particles; `schedule()`/the transition table are
  completely untouched (particles rate through the exact same `onRate`
  closure as vocab, per "the scheduler does not know card types"), so no
  `docs/DECISIONS.md` entry was needed. No audio wiring was added for
  particle pairs — WS-C's text doesn't mention audio for this card type
  (unlike WS-A/pronunciation, which named `playFor` explicitly), so this
  was read as out of scope rather than a silent gap; `scripts/audio-lib.mjs`
  already collects particle pairs' utterances (from item 15), so PHASE4/
  a future audio workstream can wire playback into `review-particle.ts` if
  wanted, same silent-degrade pattern as everywhere else. No dependency
  added; content firewall respected (no `"status":"reviewed"` file
  touched — `content/particles.v1.json` is new and all-draft). Item 20
  (PHASE5 WS-D leech rework/flag/undo) is next per queue order.

- 2026-08-09 — item 20 (PHASE5 WS-D leech rework list + flag + undo)
  done@2b33a65, tier-1 verified (npm test: 88/88 across 19 files incl. 2
  new named `rework:` tests, 1 new named `undo:` test, and a new
  `stats: flaggedEntries` test; tsc --noEmit; vite build; npm run
  validate 7/7 all green) AND tier-2 verified (Playwright 13/13, incl.
  new `tests/e2e/flag.spec.ts` — reveals the fixture deck's first card,
  flags it "Content wrong", finishes the 3-card session, opens Stats, and
  asserts the `.flagged-block textarea` reads exactly
  `fixture.one: content`; existing 12 specs still green). Two new pure
  `src/core/` modules: `rework.ts` (`unsuspendForRework` — isLeech→false,
  state→review, intervalDays→1, dueDay→today+1, `dueMinute`→null, leaves
  `lapses`/`reps`/`ease` untouched so history survives, per the plan's own
  "lapses→0? NO" note; `flagForRework` — sets `flagged:'rework-request'`
  only) and `undo.ts` (`captureSnapshot`/`applyUndo`, trivial pure
  wrappers around "return the prior Progress" — extracted so the named
  `undo:` test could assert the invariant without spinning up jsdom/UI
  closures). `src/ui/rework.ts` (new, 80 lines) renders the rework list
  at `#stats/rework` (a sub-route on the existing Stats tab, reusing
  `shell.ts`'s `detailFromHash` mechanism already built for Udtale in
  item 14, rather than adding a fourth top-level tab): every `isLeech`
  card with its lapse count and current flag, "Unsuspend & retry" and
  "Needs rewrite" buttons that call the two core functions and
  `store.put`. `src/ui/stats.ts`'s "Leeches: N" line is now an `<a
  href="#stats/rework">` (closing out item 11's logged deferral) and
  gained a copyable `<textarea readonly>` block (`core/stats.ts`'s new
  `flaggedEntries`) with a Copy button
  (`navigator.clipboard.writeText`), shown only when at least one card is
  flagged. `src/ui/flag.ts` (new, 51 lines) is the shared flag control —
  a toggle revealing 4 reason buttons (content/audio/phonetic/other,
  stored as short codes, not the button labels) — wired into every card
  back: `review-card.ts`'s `renderBack` (now takes `flagged`/`onFlag`,
  reused unchanged by `review-spell.ts`'s reveal/escape-hatch) and
  `review-particle.ts`'s `reveal()` (appended after `renderPairs`, since
  particle cards don't share `renderBack`). `review.ts`'s `showCard()`
  now builds an `onFlag` closure per card (mirrors `onRate`'s existing
  pattern) that reads the *current* `progressById` entry rather than the
  stale one captured at card-display time — required so flag-then-rate in
  the same card view doesn't have the rating's `schedule()` call silently
  drop the just-set flag. Undo: `onRate` now calls `captureSnapshot`
  before scheduling; a `↺ Undo last rating` button renders (appended
  after the card, so the per-type renderers' own
  `wrapper.textContent = ''` doesn't wipe it) whenever a snapshot exists;
  clicking it restores the prior `Progress`, decrements that rating's
  session-summary count, persists the revert, and resets `index` back to
  the undone card's queue position so it's shown next — satisfying "one
  level deep" (the snapshot is cleared on use and overwritten by the next
  rating) and "returns the card to the queue front" (it's literally the
  next card shown). Undo and the rework list's two actions were also
  manually verified end-to-end against a running preview build (mic-free,
  via the existing e2e store hooks) before committing — not checked in as
  specs, since the plan's own "Smoke:" line for WS-D names only the flag
  → Stats-block path, matching every prior WS's "the plan names the
  smoke test" convention.
  **New DECISIONS.md entry**, per the plan's own explicit "add a
  DECISIONS entry" instruction for the unsuspend behaviour: documents
  which `Progress` fields `unsuspendForRework` touches vs. preserves, and
  why this isn't a `schedule()`/transition-table change (it's a distinct
  user action outside the rating flow; `schedule()` never sees a
  `suspended` card by construction, since the session queue already
  excludes leeches). No dependency added; content firewall respected (no
  `content/*.json` touched). Existing `tests/particles.test.ts` call
  sites updated to pass a no-op 5th `onFlag` arg after
  `renderParticleCard`'s signature grew one parameter — no behaviour
  change to what those 4 tests assert. Item 21 (PRON WS-C minimal-pair
  drill) and item 22 (PHASE5 WS-B dictation) remain `blocked` on G2; item
  23 (docs sweep) is next per queue order ("take last").

## Solutions & fixes log

- **2026-08-07 — first firing could not see the build branch (environmental,
  not a repo defect).** *What broke:* the firing reported `git fetch origin
  claude/danish-app-design-review-z48b7e` → "couldn't find remote ref", and
  described origin as having only `main` and its own auto-created session
  branch. *Verified reality:* `git ls-remote --heads origin` at the same
  time returned exactly two refs — `main` (92624d6) and
  `claude/danish-app-design-review-z48b7e` (08dc92b, carrying all 14
  scaffolding files). The branch has existed since 2026-08-06 and had
  three verified pushes. *Root cause:* the firing's environment had a
  stale or single-branch git view (clone snapshotted before the branch
  was pushed); `git branch -a` in such a clone shows only `origin/main`
  plus the session branch, which the firing reported as the repo's true
  contents. *Solution:* (a) re-create the routine in a FRESH environment —
  the actual fix, since no prompt change can widen a stale mirror;
  (b) AUTON_ORDERS step 1 now fetches ALL refs (`--prune`), prints
  `git ls-remote --heads origin` as the authoritative listing, asserts
  `AUTON_ORDERS.md` is present in the tree, and documents that a missing
  branch means a stale environment — never a licence to create the branch
  or work on the session's own. *Reviewer should double-check:* that the
  first successful firing's log line names the expected branch, and that
  no commit ever lands on an auto-created `claude/<random>` branch.

## DECISIONS-NEEDED (owner)

- ✅ **RESOLVED 2026-08-07 — `relearning + hard` is now row 12b.** Correct
  stop; the gap was real and the table is now total over every (state,
  rating) pair. **Decision:** Hard graduates the card conservatively —
  `intervalDays = max(1, round(intervalDays × 0.5))` (halving the
  already-halved pending interval from row 10), `state=review`,
  `dueDay=today+intervalDays`, `reps` unchanged, **ease unchanged** (the
  lapse already charged −0.20; a second penalty would double-punish one
  failure), not a lapse. Reading (a) — repeat the single step — was
  rejected because with one relearning step it is byte-identical to
  Again, making Hard a no-op button. Rationale and rejected alternatives
  are recorded in `docs/DECISIONS.md`; the row is in
  `PLAN_PHASE1_ENGINE.md`'s table with a named test
  (`sched: row 12b relearning hard graduates at half the pending
  interval`) plus a new totality test over all 5 states × 3 ratings.
  Item 3 is unblocked — take it next.

- ~~**OPEN 2026-08-07 — the scheduler transition table has no row for
  `state=relearning, rating=hard`.** Blocks item 3 (PHASE1 WS-B). The
  13-row table in `PLAN_PHASE1_ENGINE.md` covers every other (state,
  rating) combination the engine can receive, including all three
  ratings for `review` (rows 7–10) and both ratings that matter for
  `learning`'s "hard" case generically (row 6: "learning any | hard").
  But `relearning` gets only two rows — 11 (`good`) and 12 (`again`) — and
  nothing says what a `hard` rating does to a relearning card. HANDOFF
  §4.5 doesn't add anything beyond what's already in the table (it only
  describes the single 10-minute relearning step and the again/good
  outcomes), and `docs/DECISIONS.md` doesn't mention it either. Two
  plausible readings, neither pinned by the plan: (a) treat it like row 6
  and repeat the current [only] step with a shorter due offset, since the
  `Progress.step` field comment groups "learning/relearning steps"
  together; or (b) treat relearning as a strictly two-outcome state by
  design (only one step exists, so only pass/fail make sense) and either
  collapse `hard` into `again` or into `good`. Owner: please add a row 12b
  (or amend row 12) to `PLAN_PHASE1_ENGINE.md`'s table and a matching
  `docs/DECISIONS.md` entry per CLAUDE.md rule 2 — then item 3 unblocks
  as-is, no other part of WS-B is affected.~~
  *(superseded by the resolution above — kept for the record)*

- ✅ **RESOLVED 2026-08-07 — no TS script runner is being added.** Good
  catch; the flag was correct and caught this before item 7 hit it cold.
  Decision (now `CLAUDE.md` rule 4b): `src/` is TypeScript, `scripts/` is
  plain ESM JavaScript (`.mjs`) runnable with bare `node`. `npm run
  validate` is `vitest run tests/validate-content.test.ts` (vitest is
  already approved and reads plain JS, so the validator's pure functions
  live in `scripts/validate-content.mjs` and the test imports them);
  `npm run build-audio` will be `node scripts/build-audio.mjs`. The
  shipped `package.json` script has been corrected, and PLAN_PHASE0 WS-A,
  PLAN_PHASE2 WS-A, and PLAN_PHASE4 WS-A now specify this. No new
  dependency, item 7 unblocked.

- ~~**`validate` script names a runner (`vite-node`) that isn't on the
  approved dev-dependency list.** `PLAN_PHASE0_HARNESS.md` WS-A specifies
  `"validate": "vite-node scripts/validate-deck.ts"` verbatim, and item 0
  now ships that exact script text — but `vite-node` is not installed
  (it is not a transitive dep of `vite` or `vitest`; confirmed empty in
  `package-lock.json`) and `CLAUDE.md` rule 4's approved dev list
  (`vite, typescript, vitest, vite-plugin-pwa, @playwright/test`) doesn't
  include it. This doesn't block item 0 (the script isn't invoked and
  `scripts/validate-deck.ts` doesn't exist yet) but WILL block item 7
  (PHASE2 WS-A, the content validator) per the STOP-on-new-dependency
  rule. Owner needs to either approve `vite-node` as a dev dependency, or
  the PLAN_PHASE2 executor needs a different runner (e.g. a plain
  `node --experimental-strip-types` invocation, no extra dep). Flagging
  now so item 7's firing isn't the one that discovers this cold.~~
  *(superseded by the resolution above — kept for the record)*
