# AUTON_STATUS — queue, gates, log, decisions (the single pane of glass)

Seeded 2026-08-06 by the design review (REVIEW.md). Updated by every
autonomous iteration per `AUTON_ORDERS.md` step 8. The owner may edit this
file from anywhere — iterations re-read it on every firing.

## Gate registry (owner clears a gate by editing its row)

| Gate | Meaning | State |
|---|---|---|
| G1 | Native review of the 30-card pilot + pronunciation guide + stød-critical audio spot-check passed (error rate recorded below; ≤~10 %) | **open** |
| G2 | Real audio clips generated (owner ran `build-audio` locally with a key) and committed | **open** |
| G3 | Seven consecutive days of actual daily use, attested by the owner | **open** |
| D-DEP1 | `idb` dependency approved | **pending** (recommended: yes — see OWNER_INPUTS.md) |
| D-AUD1 | Audio provider chosen (recommended default: TTS-only v1) | **pending** |

## Queue (top unblocked `todo` item goes first)

| # | Item | Plan / WS | State | Gate |
|---|---|---|---|---|
| 0 | Scaffold: Vite+TS strict+Vitest, app shell, `base` path, `docs/DECISIONS.md` seeded with the handoff's decisions | PHASE0 WS-A | todo | — |
| 1 | CI (test+typecheck+build) + Pages deploy workflow | PHASE0 WS-B | todo | — (live-verify deferred until owner enables Pages) |
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

## Solutions & fixes log

(empty)

## DECISIONS-NEEDED (owner)

(empty — see OWNER_INPUTS.md for the standing list)
