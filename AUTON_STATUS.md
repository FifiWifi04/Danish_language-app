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
| 1 | CI (test+typecheck+build) + Pages deploy workflow | PHASE0 WS-B | done@eb6b9c2 | — (live-verify deferred until owner enables Pages) |
| 2 | Day-number time core + seeded RNG (pure, tested) | PHASE1 WS-A | todo | — |
| 3 | Scheduler transitions per the authoritative table (expected values hand-written first) | PHASE1 WS-B | todo | — |
| 4 | Session queue builder (caps, ordering, no-repeat, relearning re-entry) | PHASE1 WS-C | todo | — |
| 5 | Progress store: interface + memory adapter + IndexedDB adapter | PHASE1 WS-D | todo | D-DEP1 answered (either answer unblocks) |
| 6 | Simulation soak harness (2 y × 500 cards) wired into `npm test` | PHASE1 WS-E | todo | — |
| 7 | Content schema + validator (`vocab`, `particle`, `pronunciation` types) + `npm run validate` in CI | PHASE2 WS-A | todo | — |
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

- **`validate` script names a runner (`vite-node`) that isn't on the
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
  now so item 7's firing isn't the one that discovers this cold.
