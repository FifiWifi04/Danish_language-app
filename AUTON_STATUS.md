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
| 8 | 30-card pilot deck, generated per the template, `"status":"draft"` | PHASE2 WS-B | todo | — |
| 9 | Mode A review UI (reveal + Again/Hard/Good), draft badge on draft cards | PHASE3 WS-A | todo | — |
| 10 | PWA: manifest, precache, offline, update-available toast | PHASE3 WS-B | todo | — |
| 11 | Stats view + append-only session log + streak/due counts | PHASE3 WS-C | todo | — |
| 12 | Progress export/import (JSON file) + stale-backup nudge | PHASE3 WS-D | todo | — |
| 13 | Pronunciation guide content file (~12 phenomena, mechanics, DRAFT) | PRON WS-A | todo | — |
| 14 | Udtale tab UI (guide browser) + `soundTags` links from cards | PRON WS-B | todo | — |
| 15 | Audio build script + manifest + fake-provider tests (no real key use) | PHASE4 WS-A | todo | — |
| 16 | Audio playback wiring in Mode A (manifest-driven, silent degrade) | PHASE4 WS-B | todo | — |
| 17 | Self-record & compare in the Udtale tab (MediaRecorder, no scoring) | PRON WS-D | todo | — |
| 18 | Mode B active spelling: æ/ø/å button row, `ae/oe/aa` equivalence, promotion at reps ≥ 2 | PHASE5 WS-A | todo | — |
| 19 | Particle cards: contrastive-pair card type, pilot content DRAFT | PHASE5 WS-C | todo | — |
| 20 | Leech rework list + in-review "flag card" + undo last rating | PHASE5 WS-D | todo | — |
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
