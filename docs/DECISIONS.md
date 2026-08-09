# DECISIONS — authoritative record of non-obvious choices

One entry per decision that a later session (with no memory of the
reasoning) could plausibly reverse by accident. `PLAN_PHASE1_ENGINE.md`'s
transition table is the source of truth for scheduler mechanics; this file
records *why*. Do not alter scheduler behaviour without adding an entry
here first.

## 2026-08-07 — Due dates are day numbers, not timestamps

`dueDay` is an integer count of days since epoch, computed against a
4am local cutoff. Eliminates the late-evening-review problem (a card
reviewed at 23:50 shouldn't come due again at 00:10) and makes scheduler
tests deterministic without mocking wall-clock time. Source: HANDOFF §4.4.

## 2026-08-07 — Learning steps: 1 min, 10 min

New and relapsed cards pass through two short steps before graduating to
the review state. Graduating interval is 1 day. Source: HANDOFF §4.5.

## 2026-08-07 — Good ladder: rep 0 → 1 day, rep 1 → 6 days, then interval × ease

Graduation from learning sets `reps = 0, interval = 1`. The first
review-state Good sets `reps = 1, interval = 6`. Every Good after that is
`round(interval × ease)`. This resolves the ambiguity in the original
handoff over whether graduation counts as a rep — it does not.
Source: HANDOFF §4.5, REVIEW.md A.7; table in `PLAN_PHASE1_ENGINE.md` is
authoritative over this prose.

## 2026-08-07 — Ease clamped to [1.3, 2.7], interval capped at 365 days

Standard SM-2-style bounds. Prevents ease collapsing toward zero on a bad
streak and prevents intervals drifting past a year, which would starve a
card from ever coming due again inside a season the user still cares
about. Source: HANDOFF §4.5.

## 2026-08-07 — Leech at 8 lapses → suspended to a rework list, never quarantined-and-forgotten

A card reaching 8 lapses is pulled from the active queue and pushed to a
rework list rather than silently hidden. Rework means rewriting the card
(mnemonic, or converting to cloze), which resets its state. Quarantine
without rework would permanently hide the hardest words — the opposite of
the goal. Source: HANDOFF §4.5, §3 (original spec commentary).

## 2026-08-07 — Daily caps: 20 new, 200 reviews; new cards only after reviews clear

Prevents the new-card queue from crowding out due reviews on a heavy day.
Source: HANDOFF §4.5.

## 2026-08-07 — Audio is pregenerated offline; no runtime API keys in the client

`scripts/build-audio.ts` runs locally against `.env` (gitignored, never
committed) and writes static clips + a manifest at build time. The
shipped client never holds a provider key — this is a public GitHub Pages
deployment, so a client-side key would be exposed to anyone who opens
devtools. Source: HANDOFF §4.6 Phase 4, CLAUDE.md rule 7.

## 2026-08-07 — TTS-only for v1 audio (not Forvo)

Forvo's API terms do not permit redistributing their audio, and a public
repo + GitHub Pages deployment is redistribution. Correction over the
original handoff, which preferred Forvo human recordings: default to
TTS-only generation (ElevenLabs, confirmed by owner — D-AUD1) for v1,
and manage the stød-correctness risk via native-reviewer spot-checks at
the G1 gate rather than via source recordings. Forvo is parked in
`PARKED_GATES.md` pending an explicit licensing check or a private-repo
decision (D-REPO1). Source: REVIEW.md A.4.

## 2026-08-07 — Emoji-first visuals, not a keyword-to-image pipeline

The originally specified "fetch a photo by keyword" tier has no working
implementation to fetch from — the old public keyword-image endpoints are
gone, and authenticated alternatives return semantically wrong images
often enough to actively mislead a learner. The emoji anchor becomes the
**primary** visual, with hand-picked real images reserved for the small
subset of cards where a photograph teaches something an emoji can't.
Source: HANDOFF §3.5.

## 2026-08-07 — New cards introduced in `priority` order

Content carries an integer `priority` field (1 = highest). The session
queue introduces new cards ordered by `(priority, position in file)`.
With 500 cards at 20/day, *which* 20 come first matters for months;
putting the ordering decision in content (where it's reviewable) rather
than in code keeps frequency-and-need judgements out of the scheduler.
Source: REVIEW.md A.8.

## 2026-08-07 — Content firewall: reviewed content is never edited by the agent

Files under `content/` whose entries carry `"status": "reviewed"` are
never edited by an autonomous session, full stop. Newly generated content
is always `"status": "draft"` and renders with a draft badge until the
owner flips it after the G1 native-review gate. If reviewed content looks
wrong, the fix is a flag in `AUTON_STATUS.md`'s DECISIONS-NEEDED section,
not a direct edit. Source: REVIEW.md Part B item 3, HANDOFF §3.7.

## 2026-08-07 — Relearning + Hard graduates at half the pending interval (row 12b)

The original transition table covered `relearning` only for Good (row 11)
and Again (row 12), leaving `relearning + hard` undefined — caught by the
first firing to attempt PHASE1 WS-B, which correctly stopped rather than
inventing behaviour. Resolved as a new row 12b: Hard graduates the card to
`review` with `intervalDays = max(1, round(intervalDays × 0.5))`, halving
the already-halved pending interval from row 10, with `reps` unchanged,
**no further ease change**, and no additional lapse.

Why this and not the alternatives:

- **Hard is a weaker Good, not a stronger Again.** That is already the
  pattern in the review state (row 9: Hard multiplies by 1.2 where Good
  multiplies by ease), so relearning should read the same way. The result
  is a strict, intuitive ordering: Again returns the card in 10 minutes,
  Hard returns it in half of Good's interval, Good uses the full pending
  interval.
- **"Repeat the step" was rejected.** Mirroring row 6 (learning + Hard
  repeats the current step) fails here because relearning has exactly ONE
  step, so repeating it is byte-identical to Again — Hard would become a
  button with no distinct effect, and a learner pressing it could never
  leave relearning within the session. In the learning state the same rule
  works only because a second step exists to advance to.
- **No second ease penalty.** The lapse that entered relearning already
  applied ease − 0.20 (row 10). Charging another 0.15 would punish one
  failure episode twice and accelerate the drift toward the 1.3 floor that
  HANDOFF §3.1 identified as a real degradation mode.

Edge case, intended: when the pending interval is already 1 day, Hard and
Good coincide. The interval floor of 1 wins over the halving.

## 2026-08-09 — Audio manifest lives at `public/audio-manifest.json`, not `scripts/`

`PLAN_PHASE4_AUDIO.md` WS-A originally wrote the manifest to `scripts/
audio-manifest.json`, matching HANDOFF §4.2's repo-shape sketch. WS-B's
`playFor` (`src/ui/audio.ts`) needs to `fetch` it at runtime, and Vite
only serves `public/` (plus the bundled `src/`) — `scripts/` never
reaches `dist/`. Moved the write target in `scripts/build-audio.mjs` to
`public/audio-manifest.json` (already covered by the existing PWA
precache `json` glob, so no `vite.config.ts` change was needed). Not a
scheduler or content-shape change; `HANDOFF.md` §4.2/§4.6 and
`PLAN_PHASE4_AUDIO.md` updated to match. Source: AUTON_STATUS item 16 log
entry.

## 2026-08-09 — Rework-list "Unsuspend & retry" resets schedule, not history

`PLAN_PHASE5_MODES.md` WS-D's rework list lets the owner pull a leech (8+
lapses, `state:'suspended'`, `isLeech:true`) back into the active review
queue. The plan's own text flags this as needing a decision: "lapses→0?
NO — lapses keep history." Resolved: `unsuspendForRework` (`src/core/
rework.ts`) touches only `isLeech` (→false), `state` (→`review`), `step`
(→0), `intervalDays` (→1), `dueDay` (→today+1), `dueMinute` (→null).
`lapses`, `reps`, and `ease` are left exactly as they were — the card
comes back in tomorrow, at review-state day-1 scheduling, but with its
full lapse count intact, so an 8th relapse would immediately re-leech it
rather than resetting the counter to buy eight more free failures. This
is not a `schedule()` change (the transition table is untouched); it is a
separate, explicit user action outside the rating flow, so no table row
was added — `schedule()` never sees a `suspended` card by construction
(the session queue excludes leeches), and this function is the only path
back out of suspension. Source: PLAN_PHASE5_MODES.md WS-D, REVIEW.md A.9.
