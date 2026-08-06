# REVIEW — critical review of HANDOFF.md and the build-out design

Written 2026-08-06. This file plays the same role FABLE_REVIEW.md plays in
FifiWifi04/Building_app: an external review whose Part A contains **binding
corrections** to the handoff, and whose Part B is the rationale for the
autonomous build machinery added alongside it. Where this file and
HANDOFF.md §4.6 disagree, this file and the `PLAN_*.md` files win.

**Verdict up front:** the handoff is unusually good — the SRS critique
(day-number due dates, ease clamps, leech-at-8, relearning steps), the
content/progress split, offline audio generation, the core purity rule, and
gating content validation at 30 cards are all correct and are kept
verbatim. The problems are omissions, not errors: nothing teaches the user
to *hear or produce* Danish sounds, progress has no backup, two of the six
gates cannot be checked by an agent, and the working agreement describes a
process but has no execution engine. Part A fixes those.

---

## Part A — binding corrections

### A.1 The gates conflate agent-verifiable and owner-only checks

Phase 2's gate (native-speaker review) and Phase 3's gate (seven days of
real use) are owner/human gates. As written they serialize the whole
project behind them, which directly contradicts the goal of an autonomous
build with minimal owner involvement. Correction: **owner gates block only
the work that actually depends on them** — content review (G1) blocks
scaling past 30 cards and removal of draft badges; the usage gate (G3)
blocks scale-up too; neither blocks building Phases 3–5 code. The gate
registry lives in `AUTON_STATUS.md`; the owner clears a gate by editing
that file, which every firing re-reads.

### A.2 There is no pronunciation instruction at all — the largest gap

The handoff drills recognition and spelling but never teaches the learner
how Danish sounds are *made* or how to tell them apart — and Danish is the
language where that omission hurts most: stød, soft d, two r realisations,
and a vowel inventory roughly twice Polish's are exactly why Danish
listening comprehension lags years behind reading. Correction: a new
**Pronunciation Lab ("Udtale") tab** — see `PLAN_PRONUNCIATION.md`:

- A curated guide of ~12 Danish-specific phenomena, each with
  **mechanical articulation instructions** (tongue position, lip rounding,
  jaw, throat — written contrastively against Polish habits), the common
  Polish-speaker mistake, and practice words.
- **Minimal-pair perception drills** (hear *hun* vs *hund*, pick which) —
  perception training precedes production and is measurable.
- **Self-record & compare** (MediaRecorder: record yourself, A/B against
  the reference clip). Deliberately **no automated scoring** — speech
  scoring is unreliable enough to mislead; the ear is the judge.
- Cards gain an optional `soundTags` field linking them to guide entries.

All linguistic content ships DRAFT-flagged and goes through the same
native-review gate as the deck (§3.7 of the handoff applies to it fully).

### A.3 Progress has no backup — a must-fix before the daily-use gate

IndexedDB is per-browser, per-device, and evictable (browser data clears;
storage pressure). Months of SRS history in a single unexported IndexedDB
is a standing data-loss incident. Correction: **export/import of the full
progress store as a JSON file** (Phase 3, not later), plus an in-app nudge
when the last export is >7 days old. Cross-device sync stays parked — a
manual file restore is enough for one user.

### A.4 The Forvo preference has a licensing flaw

The handoff prefers Forvo human recordings and commits MP3s to the repo.
Forvo's API terms do not permit redistributing their audio, and a public
GitHub repo + GitHub Pages deployment *is* redistribution (note: on a free
GitHub plan, Pages requires a public repo). Correction: **default to
TTS-only generation** for v1, and manage the stød-correctness risk the
handoff rightly worried about by having the native reviewer *listen to*
the stød-critical subset of generated clips at the G1 review (bad clips
get flagged and regenerated with a different voice/provider). Forvo moves
to `PARKED_GATES.md` pending an explicit licensing check or a private-repo
decision (D-REPO1, `OWNER_INPUTS.md`).

### A.5 The Phase 3 gate is behavioural but nothing measures behaviour

"Seven consecutive days of actual daily use" is the right gate and is
unverifiable as specified. Correction: a **session log** (append-only in
IndexedDB: date, cards reviewed, accuracy, mode) and a small stats view
(due today, streak, retention). The gate becomes checkable from data the
owner can see in the app and attest with one line in `AUTON_STATUS.md`.
Stats also serve motivation, which is what the gate is really measuring.

### A.6 No PWA update path

A PWA with a precaching service worker and no update flow strands the user
on the first cached version — the classic failure, and fatal here because
the owner is not a developer who hard-refreshes. Correction: Phase 3
includes an **"update available" toast** wired to the waiting service
worker (`vite-plugin-pwa`'s `registerSW` `onNeedRefresh`), one tap to
reload into the new version.

### A.7 Scheduler rep-indexing is ambiguous

"Good: rep 0 → 1 day; rep 1 → 6 days" doesn't pin whether graduation from
learning counts as a rep. Corrected by definition in
`PLAN_PHASE1_ENGINE.md`: graduation sets `reps = 0, interval = 1`; the
first *review-state* Good sets `reps = 1, interval = 6`; thereafter
`round(interval × ease)`. The plan's hand-written transition table is
authoritative; the prose is commentary.

### A.8 New-card introduction order is unspecified

With 500 cards and 20/day, *which* 20 matters for months. Correction:
content gains an integer `priority` (1 = highest); the session queue
introduces new cards ordered by `(priority, position in file)`. Frequency-
and-need ordering then lives in content, where it can be reviewed.

### A.9 Leech rework, error capture, and undo have no flow

The handoff correctly says leeches go to a rework list "not quarantined
and forgotten" — but specifies no UI, so they would be forgotten.
Corrections (Phase 5): a **rework list view**; an in-review **"flag this
card" button** (content error, bad audio, bad phonetic — captured at the
moment the only error-detector in the loop, the user, notices it; flags
export with progress); and **undo last rating** (phone misclicks are
routine and un-undoable ratings poison scheduling data).

### A.10 Raw IndexedDB is a bug farm for the build model

The IndexedDB API (versioned upgrades, transaction lifetimes, event-based
async) is exactly where a smaller model will burn sessions. Correction:
approve **`idb`** (~1.5 kB, the standard promise wrapper) as one of the
under-five runtime dependencies — pre-approval requested as D-DEP1 in
`OWNER_INPUTS.md`, recommended yes. If declined, the store interface is
unchanged and the adapter is written raw.

### A.11 Dialogue blocks silently disappeared

The original spec's situational dialogue blocks (§2 item 6) appear nowhere
in the revised plan — dropped without a decision. Correction: **parked
explicitly** in `PARKED_GATES.md` with a gate (post-Phase-6, owner
judgement) rather than lost. Same for grammar exercises beyond notes.

### A.12 The working agreement has no execution engine

HANDOFF §6 (one issue one PR, acceptance criteria as test names, branch
protection) describes good process but nothing runs it. Correction: the
Building_app routine machinery, adapted — `AUTON_ORDERS.md` (standing
orders per firing), `AUTON_STATUS.md` (queue, gates, log),
seven executor-grade `PLAN_*.md` files, `PARKED_GATES.md`,
`OWNER_INPUTS.md`, and `CLAUDE.md` at the root. Part B explains the
adaptations.

---

## Part B — the autonomous build design (why it looks the way it does)

The Building_app pattern is kept: one firing = one workstream; the queue
file is the single pane of glass; entry regression before building; a
generous STOP list; drained queue ends silently (the 22-noise-firings
lesson is inherited, not relearned); status not pushed = iteration didn't
happen; `AUTON_HOLD` at repo root is the kill switch.

Adaptations for this project and for a **less capable executor model**:

1. **Every decision is pre-made in the plans** — exact file paths, exported
   function signatures (PLAN_PHASE1 appendix), exact test names as
   acceptance criteria, exact commands. The executor implements to a
   failing test; it never designs an API or chooses a library. "If reality
   contradicts the plan, STOP and report" is standing policy.
2. **Verification tiers are web-shaped:** tier 1 = `npm test` + `tsc
   --noEmit` + `npm run build` (always); tier 2 = `vite preview` +
   Playwright smoke on the built bundle (anything UI/PWA); tier 3 = live
   Pages deploy check (deferred-honestly when the environment can't).
3. **The content firewall replaces Building_app's legal firewall:** the
   agent NEVER edits files under `content/` that have passed review
   (`status: "reviewed"`); generated content is always `status: "draft"`
   and renders with a draft badge until the owner flips it after G1. An
   agent that thinks reviewed content is wrong flags it in the status
   file; it does not fix it. This is the single most important rule —
   §3.7 of the handoff as code.
4. **Workstreams are sized down** to fit one short session of a smaller
   model: no workstream touches more than ~4 files; UI workstreams ship
   one view each.
5. **No dependency may be added by the executor, ever** (Building_app
   allows a STOP-flag; here it's a flat ban — the approved list lives in
   CLAUDE.md and only the owner extends it).
6. **Owner involvement is bounded and enumerated** in `OWNER_INPUTS.md`:
   five decisions (D-DEP1, D-AUD1, D-REPO1, cadence, reviewer
   arrangement), two one-click GitHub settings, one local audio-generation
   run, and the G1/G3 gate clearances. Everything else is the routine's.

Arming: the owner creates a scheduled routine (same as Building_app's)
whose prompt is the block quoted at the top of `AUTON_ORDERS.md`, pointed
at this repo and branch, on whatever model and cadence they choose
(every 6 h worked for Building_app; this queue is smaller).
