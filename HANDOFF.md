# DanmarksLiv — Project Handoff

**Revision 1.1 (2026-08-06).** This handoff was critically reviewed; the
review's corrections are **binding** and live in `REVIEW.md` Part A. The
build is now executed autonomously: `AUTON_ORDERS.md` is the per-firing
procedure, `AUTON_STATUS.md` the queue, and the `PLAN_*.md` files the
executor-grade specifications — where §4.6's phases and the plans
disagree, the plans win. Major additions in 1.1: the Udtale pronunciation
lab (mechanical articulation guide + minimal-pair perception drills +
self-record), progress export/import, stats + session log, PWA update
flow, leech-rework/flag/undo UI, `priority`-ordered new-card
introduction, and a TTS-only audio default (Forvo parked for licensing —
REVIEW.md A.4). See §7.

**Purpose of this document.** This is the full context for a personal Danish-learning PWA, written to be dropped into a fresh repository so an agent with no conversation history can plan and build it correctly. It records three things: what was originally specified, what was wrong with it and why, and the revised plan that resulted.

Read the "Why these decisions" sections before proposing changes. Several choices here look arbitrary and are not — they are corrections of specific failure modes, and reverting them re-introduces bugs that were already reasoned through.

---

## 1. What this is

A single-user, personal Progressive Web App for a **native Polish speaker living in Denmark**, targeting everyday conversational fluency rather than exam preparation or bureaucratic vocabulary.

It is explicitly **not** a product. An earlier document explored commercialising this as a "personalised software factory" (generating custom language apps per user, sold either B2B to corporate relocation departments or as a prosumer micro-SaaS). That direction was assessed and set aside — see §5. The app should be built for one user, with no multi-tenancy, no accounts, no server, and no generality that isn't needed.

**Development model:** GitHub repository, work done through Claude Code in the browser, issue-driven, one PR per issue, deployed to GitHub Pages.

---

## 2. The original specification (as provided)

The starting spec described six modules. Summarised, so the revisions below make sense:

1. **Data schema** — one flat JSON card object per item, containing `danish`, `english`, `polish`, `phonetic` (approximated for Polish ears), `emojiAnchor`, `imageKeyword`, `grammarNote`, `clozeSentence`/`clozeTarget`, and a nested `srs` block (`interval`, `repetitions`, `easeFactor`, `dueDate`, `consecutiveFailures`, `isLeech`).
2. **SRS engine** — SM-2-style scheduler in `localStorage`. Hard resets interval to 1 day and decrements ease; three consecutive failures marks the card a leech and quarantines it. Good multiplies interval by ease.
3. **Visual pipeline** — three tiers: fetch a photo by `imageKeyword`, catch failure via inline `onerror`, fall back to a large emoji anchor.
4. **Audio** — runtime calls to ElevenLabs (Multilingual v2) or Forvo, played via `Audio()`, falling back to `speechSynthesis` with `da-DK`.
5. **Learning modes** — Mode A (reveal), Mode B (active typing, from `repetitions >= 1`), Mode C (dictation from audio).
6. **Content focus** — conversational rather than administrative: modal particles (*da, jo, lige, vel*), social idioms, situational dialogue blocks.

The intent behind all six is sound and should be preserved. The implementation details below are what changed.

---

## 3. Critique — what was wrong and why

### 3.1 The scheduler was under-specified in ways that degrade over time

- **Missing second interval.** SM-2 is 1 day → 6 days → `interval × ease`. The spec went straight to `interval × ease` at rep 1, producing 1 → 2.5 → 6 days. Too aggressive early, and the error compounds across every subsequent repetition.
- **No ease floor and no defined decrement.** Without a clamp, ease drifts downward indefinitely and intervals collapse toward zero. SM-2 uses roughly −0.15 to −0.20 per failure with a floor of 1.3.
- **Timestamp due dates.** `dueDate = now + interval × 86400000` means a card reviewed at 22:00 isn't due until 22:00 the next day, so it won't appear in a morning session. This makes daily use feel broken and makes tests non-deterministic.
- **Leech at 3 consecutive failures is far too tight.** Anki's default is 8 lapses. Danish phonetics make three consecutive struggles entirely normal for a word that will eventually stick. At a threshold of 3, a large fraction of useful vocabulary is quarantined within two weeks.
- **No relearning step.** A failed mature card should return within the same session (~10 minutes), not merely reset to `interval = 1` and disappear until tomorrow. Without this, failures aren't actually corrected.

### 3.2 Progress state was nested inside content

With `srs` inside the card object, every deck edit or expansion becomes a migration against live progress data. Splitting them means deck updates are a file swap.

### 3.3 `localStorage` is the wrong store

Synchronous, string-only, ~5MB quota, and it forces re-serialising the whole deck on every single rating. With 500+ cards that's wasteful; with cached audio it fails outright, since base64 inflates blobs by roughly a third and the quota is exhausted long before a deck's worth of MP3s is cached.

### 3.4 Runtime audio generation is the wrong shape for a fixed deck

The spec assumed live API calls with local caching. For a deck that changes rarely, generating all clips once as an offline build step is strictly better: zero runtime cost, zero latency, genuine offline support, and — decisively — **no API key in the client**. A key embedded in a PWA is extractable by anyone who opens devtools. Runtime generation only earns its complexity if cards are added on the fly, which they aren't.

Also: prefer human recordings (Forvo) over synthesis for single words. Multilingual TTS handles *stød* inconsistently, and a wrong pronunciation drilled forty times is worse than no audio.

### 3.5 The image pipeline's first tier doesn't exist

"A reliable, secure image URL based on `imageKeyword`" — there is no such endpoint. The old Unsplash Source endpoint is gone, and keyword-to-image APIs require auth and return semantically wrong images often enough to be actively misleading. The emoji anchor (Tier 3) is the genuinely good idea and should be **primary**, with hand-picked real images only for the small subset of cards where a photograph teaches something the emoji can't.

### 3.6 Modal particles cannot be represented by the card schema

*Da, jo, lige, vel* have no translation — which is exactly why they were listed as a priority — but a `danish`/`english`/`polish` triple structurally cannot express them. They need **contrastive minimal pairs**: *"Kom nu"* vs *"Kom da"* vs *"Kom lige"*, with a note on what each does socially. This is a distinct card type, not a variant of the existing one.

### 3.7 The largest actual risk is content correctness, not code

LLM-generated Polish-centric phonetic approximations and Polish-contrastive grammar notes will read plausibly and be wrong a meaningful fraction of the time. The learner cannot detect this — that's the whole point of being the learner. **Content validation must happen at 30 cards, before 470 more are generated from an unvalidated template.**

### 3.8 One UX blocker

Typing æ ø å on a phone with a Polish or English keyboard is miserable, and Mode B makes it mandatory from `repetitions >= 1`. Needs a character button row and `ae`/`oe`/`aa` accepted as equivalent input. Promotion to active spelling should also be pushed to `repetitions >= 2` — Danish orthography is a large jump after a single reveal.

---

## 4. The revised plan

### 4.1 Stack

Vite + TypeScript, **vanilla DOM**, Vitest, `vite-plugin-pwa`, GitHub Pages via Actions.

No UI framework. The interface is a card, two buttons and a text input; a framework buys nothing and costs context in every agent session. **Keep runtime dependencies under five, and require explicit owner approval before adding one.**

Two configuration items to handle in Phase 0 rather than discover later:
- `base: '/<repo-name>/'` in `vite.config.ts`, required for Pages.
- Verify the service worker precache manifest actually includes `/public/audio`.

### 4.2 Repo shape

```
content/              deck source of truth (JSON, hand-checked)
  deck.v1.json
  particles.v1.json
  pronunciation.v1.json   Udtale lab guide entries (rev 1.1, PLAN_PRONUNCIATION.md)
scripts/              offline tooling, run locally only
  validate-deck.ts
  build-audio.ts
  audio-manifest.json
src/
  core/               pure: scheduler, session queue, store interface, time, rng
  data/               IndexedDB progress store (+ memory adapter for tests)
  ui/                 views: shell, review, udtale, stats, backup, audio
public/audio/         generated mp3, committed
tests/                unit + simulation soak + e2e/ Playwright smokes
docs/DECISIONS.md
CLAUDE.md
AUTON_ORDERS.md AUTON_STATUS.md OWNER_INPUTS.md PARKED_GATES.md REVIEW.md
PLAN_*.md             executor-grade specs, one per phase + pronunciation
```

### 4.3 The core purity rule

**`src/core/` is pure. No DOM, no I/O, no imports from `ui/`, and no `Date.now()` — `now` is always an explicit parameter.**

This is the load-bearing constraint of the whole project. It is what makes the scheduler testable and the simulation harness possible, and it is precisely the rule an agent breaks when trying to fix a UI bug quickly. It belongs verbatim in `CLAUDE.md`.

### 4.4 Data model

**Content and progress are separate stores, joined by `id`.**

- Content: versioned files in `content/`, read-only at runtime. `id` is a stable slug (`bakery.rundstykke`, `particle.da-vs-jo`).
- Each card carries a `contentHash` over the meaning-bearing fields (`danish`, `clozeTarget`). A changed hash flags the card for review rather than destroying its history.
- Progress: IndexedDB, keyed by `id`. Unknown ids get default state; missing ids are ignored. Deck updates therefore need no migration.

**Due dates are day numbers, not timestamps.** Store `dueDay` as an integer count of days since epoch, computed against a **4am local cutoff**. This eliminates the late-evening-review problem and makes scheduler tests trivially deterministic.

### 4.5 Scheduler specification

This is authoritative. It belongs in `docs/DECISIONS.md` and should not be altered without a decision entry.

- **States:** `new` → `learning` → `review`, plus `relearning` and `leech`.
- **Learning steps:** 1 min, 10 min. Graduating interval 1 day.
- **Review, Good:** rep 0 → 1 day; rep 1 → 6 days; otherwise `round(interval × ease)`.
- **Review, Hard:** `interval × 1.2`, ease − 0.15, not counted as a lapse.
- **Review, Again:** lapse++, ease − 0.20, enter `relearning` with a 10 min step, then resume at `max(1, interval × 0.5)` days.
- **Ease clamped to `[1.3, 2.7]`. Interval capped at 365 days.**
- **Leech at 8 lapses.** A leech is *suspended and pushed to a rework list*, not quarantined and forgotten. Rework means rewriting the card with a mnemonic or converting it to a cloze, which resets its state. Quarantine without rework permanently hides the hardest words — the opposite of what's wanted.
- **Daily caps:** 20 new, 200 reviews. New cards are introduced only after reviews are cleared.

### 4.6 Phases and gates

Six phases. Each has an exit condition; do not begin the next until the gate passes.

**Phase 0 — Harness.** Repo, CI, deploy pipeline, `CLAUDE.md`, `docs/DECISIONS.md`, empty app shell.
*Gate:* a blank page deploys to Pages from a merged PR, CI green.

**Phase 1 — Core engine, no UI whatsoever.** Scheduler, session queue, progress store.
*Gate:* a **seeded simulation harness** runs two years of synthetic reviews across 500 cards at ~85% recall and asserts:
- no NaN, no negative or zero intervals
- ease remains within `[1.3, 2.7]`
- no card starves — every card is reviewed at least once per its interval plus slack
- the queue never returns the same card twice within a session
- replaying an identical seed produces byte-identical final state

This harness is the highest-value artifact in the project. It is what makes it safe to accept an agent's PR after skimming rather than auditing line by line.

**Phase 2 — Content pipeline and 30-card pilot.** Schema validator wired into CI, deck build script, 30 real cards.
*Gate:* those 30 cards — **phonetics and grammar notes both** — reviewed by a native Dane or a tutor. Record the error rate. Above roughly 10% means the generation approach needs changing, not scaling. This gate sits early deliberately: it is the project's real risk, and clearing it late wastes the most work.

**Phase 3 — Minimum usable app.** Mode A only, offline-capable, installable.
*Gate:* **seven consecutive days of actual daily use.** This is behavioural, not technical, and it is not negotiable — an app that isn't opened is a failed app regardless of scheduler quality.

**Phase 4 — Audio, offline generation only.** `scripts/build-audio.ts` runs locally, reads the API key from `.env` (never committed, never shipped to the client), writes `public/audio/<hash>.mp3` where the hash covers text + voice + provider, and updates `audio-manifest.json`. Anything already in the manifest is skipped, so unchanged cards are never re-billed. Roughly 500 clips at ~15KB is under 10MB committed — fine for git, no LFS needed. Forvo for single words, TTS for phrases.
*Gate:* airplane mode, complete session, all audio plays.

**Phase 5 — Modes B and C.** Active spelling with an æ/ø/å button row above the input and `ae`/`oe`/`aa` accepted as equivalent; dictation mode. Promotion to spelling at `repetitions >= 2`. Particle cards implemented as a distinct type using contrastive minimal pairs.

**Phase 6 — Scale to 500 cards**, in themed batches of ~50, each batch given the same native-speaker check at a reduced sampling rate.

---

## 5. On the commercial framing (closed)

The original business document proposed selling generated per-user language apps, favouring a B2B corporate-relocation vector at $500–2,000 per employee onboarding cycle.

Two problems: Danish municipalities already provide subsidised Danish instruction to residents (*danskuddannelse*), with only a refundable deposit for workers and students — so the state substantially covers what would be sold, and the pricing assumption needs verification against current rules before it means anything. And a generated PWA per employee has essentially no moat; the defensible asset is content quality, which is the expensive part the document treated as already solved.

**Decision: build the personal app on its own terms. Do not architect for multi-tenancy, configurability, or productisation.** Those are a different program, and carrying their assumptions makes this one worse.

---

## 6. Working agreement for Claude Code sessions

- **`CLAUDE.md` carries:** the commands (`npm test`, `npm run validate`); the `core/` purity rule; "never call `Date.now()` in core — `now` is always a parameter"; "never edit files in `content/` — propose changes in the PR description instead"; "do not add dependencies without asking"; and a pointer to `docs/DECISIONS.md` as authoritative for scheduler behaviour.
- **One issue, one PR.** Write acceptance criteria as **test names**, not prose. An agent given a failing test converges; an agent given a description negotiates.
- **Branch protection with CI required**, including the Phase 1 simulation soak.
- **`docs/DECISIONS.md` gets an entry per non-obvious choice** — day-number due dates, leech-at-8, ease floor, pregenerated audio, emoji-first visuals. Sessions have no memory of the reasoning; without this, the same well-intentioned reversions recur.
- **Keep files under ~200 lines.** Not aesthetics — it determines how much of a file survives in context when a session is also holding the test file and the spec.

---

## 7. Revision 1.1 — autonomous build-out (2026-08-06)

The working agreement above described a process with no execution engine
(REVIEW.md A.12). Revision 1.1 adds the machinery proven in
FifiWifi04/Building_app, adapted for a smaller executor model:

- **`AUTON_ORDERS.md`** — standing orders per scheduled firing: sync,
  kill switch (`AUTON_HOLD`), entry regression, take the topmost
  unblocked queue item, ONE workstream per session, STOP list, tiered
  verification, push-and-prove, status update. The routine prompt to arm
  the trigger is quoted at the top of that file.
- **`AUTON_STATUS.md`** — the queue (~24 items covering Phases 0–5 plus
  the Udtale lab), the gate registry (G1 content review, G2 audio
  generated, G3 seven-day usage; D-DEP1/D-AUD1 decisions), the iteration
  log, the fixes log, and DECISIONS-NEEDED. The single pane of glass;
  the owner steers by editing it.
- **`PLAN_*.md`** (seven files) — executor-grade: exact paths, exported
  signatures, hand-written scheduler transition table, acceptance
  criteria as test names, per-WS Playwright smokes. The executor
  implements to failing tests; it never designs.
- **`OWNER_INPUTS.md`** — the complete, bounded list of what the owner
  must do; everything absent from it is the routine's job.
- **`PARKED_GATES.md`** — dialogues, Forvo, diagrams, scoring, sync,
  grammar module, LFS, commercialisation: never started autonomously.
- **The content firewall** — generated content is always
  `status:"draft"` and visibly badged; only owner-supplied review
  verdicts flip it to `reviewed`; agents never edit reviewed content.
  This is §3.7 turned into a mechanical rule.

Feature deltas over the original plan (rationale in REVIEW.md Part A):
the Udtale pronunciation lab with mechanical articulation instructions,
minimal-pair perception drills, and self-record/compare (A.2); progress
export/import + backup nudge (A.3); TTS-only audio default, Forvo parked
on licensing (A.4); session log + stats making the Phase-3 gate
measurable (A.5); PWA update toast (A.6); pinned scheduler rep semantics
(A.7); `priority`-ordered new-card introduction (A.8); leech rework
list, in-review card flagging, undo (A.9); the `idb` dependency proposal
(A.10); dialogue blocks parked, not lost (A.11).
