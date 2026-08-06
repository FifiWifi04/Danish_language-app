# PLAN — Phase 5: Modes B/C, particle cards, rework & flags & undo

Executor-grade. Four independent workstreams.

## WS-A — Mode B: active spelling

- Promotion rule: a vocab card is eligible for Mode B when
  `reps >= 2` (pinned — HANDOFF §3.8). Session queue marks eligible
  review cards; the review UI renders a text input instead of reveal
  for them (Mode B is not a separate tab — it's what a due card becomes).
- Input: a button row `æ ø å Æ Ø Å` above the field inserting at caret;
  comparison normalises `ae→æ, oe→ø, aa→å` (both directions), trims,
  case-insensitive. Exact match ⇒ auto-Good prompt; mismatch shows a
  character-level diff (simple per-char highlight) and the user rates
  honestly (Again/Hard/Good all available — self-graded, like Anki).
- Escape hatch: a "show answer" link that reveals and rates as normal
  (bad typing days must not corrupt scheduling).

**Tests:** `spell: ae oe aa equivalence`, `spell: case and trim
insensitive`, `spell: diff marks first wrong char`. **Smoke:** type an
answer with `oe` for `ø`, assert accepted.

## WS-B — Mode C: dictation (**blocked: G2 — real clips required**)

- A separate practice entry on the Review tab ("Dictation (10)") — plays
  a clip (audio only, no text), user types what they heard, same
  normalisation as WS-A, reveal + self-rate. Dictation ratings do NOT
  feed the scheduler (a listening drill, not a memory event) — they
  append to the session log with `mode: 'dictation'`.
- Card selection: review-state cards with audio, weighted toward
  `soundTags` the user fails most in the perception drill (simple count
  from the session log; ties → rng).

**Smoke:** fixture audio, complete one dictation item, assert a
`dictation` log row and no Progress change.

## WS-C — particle cards

- Render `particle` items as their own card type in Mode A flow: front
  shows the particle + the *withoutIt* sentence; reveal shows the pairs
  side by side with `socialEffect_pl` under each, and the note. Rated
  and scheduled exactly like vocab (same Progress shape — the scheduler
  does not know card types).
- Pilot content: `content/particles.v1.json` with 6 draft items — *da,
  jo, lige, vel, nok, godt* — each ≥ 2 contrastive pairs
  (HANDOFF §3.6 pattern: "Kom nu" / "Kom da" / "Kom lige"), Polish
  social-effect glosses. Draft-flagged, G1-review sampled.

**Tests:** validator already covers the shape; `particles: renders both
pair sides`. **Smoke:** a particle card appears and rates.

## WS-D — leech rework list, card flagging, undo

- **Rework list** (linked from Stats): all `isLeech` cards; per card,
  actions "Unsuspend & retry" (state→review, lapses→0? NO — lapses keep
  history; just isLeech=false, state=review, interval=1, due today+1 —
  add a DECISIONS entry) and "Needs rewrite" (sets `flagged:
  'rework-request'`).
- **Flag button** on every card back: choices `content wrong / audio
  wrong / phonetic wrong / other` stored in `Progress.flagged`; flagged
  ids surface in the export AND in a copyable block on the Stats tab so
  the owner can paste them into `AUTON_STATUS.md` DECISIONS-NEEDED (the
  user is the only error detector — capture at the moment of detection,
  REVIEW A.9).
- **Undo**: the review UI keeps the pre-rating Progress of the last
  rated card in memory; an Undo button restores it and returns the card
  to the queue front. One level deep, session-local — pinned.

**Tests:** `rework: unsuspend resets schedule not history`, `undo:
restores exact prior progress`. **Smoke:** flag a card, assert it in the
Stats copyable block.
