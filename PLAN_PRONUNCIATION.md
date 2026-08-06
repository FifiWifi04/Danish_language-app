# PLAN — the Udtale (Pronunciation) Lab

Executor-grade. Added by REVIEW.md A.2 — the owner's explicit request: a
tab teaching how Danish-specific sounds are physically produced (tongue,
lips, jaw, throat), written contrastively for a native Polish speaker,
plus perception training. ALL linguistic content below is an
author-provided DRAFT inventory: ship it `status: "draft"` and route it
through the same G1 native review as the deck — the mechanics
descriptions especially, because a wrong articulation instruction
practised daily is worse than none.

## WS-A — content file (`content/pronunciation.v1.json`)

Item schema (validator support lands in PHASE2 WS-A; if this WS runs
first, extend the validator here):

```
id               slug, e.g. "stoed", "soft-d"
status           "draft" | "reviewed"
title_da / title_pl
whatItIs_pl      2–3 sentences, plain Polish, no IPA jargon
mechanics_pl     ordered steps: tongue/lips/jaw/throat instructions
polishTrap_pl    what a Polish speaker's mouth does instead, and why it's wrong
anchor_pl        the closest Polish/known sound to start from ("say i, now…")
practiceWords    [{word, gloss_pl}] 4–8 items
minimalPairs     [{a, b, gloss_a_pl, gloss_b_pl}] 0–4 pairs (drilled in WS-C)
exampleSentence  optional {danish, gloss_pl}
```

Seed the file with these ~12 items (summaries below are the DRAFT source
material — expand each into the schema, keeping mechanics concrete and
imperative):

1. **stød** — the glottal catch. Mechanics: mid-vowel, briefly tighten
   the vocal folds as in the middle of English "uh-oh", but lighter — a
   creak, not a full stop; the sound continues through it. Polish trap:
   Polish has nothing like it; Poles either skip it (merging word pairs)
   or over-do it into a hard stop. Pairs: *hun/hund, man/mand,
   bønner/bønder, mor/mord*.
2. **soft d (blødt d)** — *mad, gade, hvad, hedder*. Mechanics: tongue
   TIP stays DOWN touching the back of the lower teeth; the middle of
   the tongue rises slightly; air flows freely — no contact with the
   ridge. To Polish ears it resembles a dark "ł/l" — but the tip never
   touches. Trap: substituting Polish [d] or [l], or English "th"
   (friction — there is none).
3. **r at syllable start** — *rød, rigtig*. Mechanics: back of the
   tongue pulls toward the uvula/throat, like a very weak gargle
   position; no vibration, no trill. Trap: the Polish front trilled r —
   the single strongest Polish accent marker in Danish.
4. **vocalised r (after a vowel)** — *mor, er, her, over*. Mechanics:
   the r is not a consonant at all — it becomes a low "a"-like glide
   (*mor* ≈ "moa"). Trap: pronouncing any consonant there.
5. **y** — *ny, lys, syv*. Mechanics: say Polish "i", freeze the tongue,
   round the lips hard as for "u". Trap: unrounding to "i" or backing
   to "u". Pair: *ny/ni*.
6. **ø** — *øl, købe, sød*. Mechanics: say Polish "e", freeze the
   tongue, round the lips. Trap: Polish "e" or "o".
7. **the å/o/u ladder** — *år, sol, hus*. Danish o is tighter/closer
   than Polish o; å sits where Polish o roughly is; u is very close and
   tight. Learn as a three-step jaw ladder, not three unrelated vowels.
8. **the i/e/æ/a ladder** — the four-step front ladder *mile/mele/mæle/
   male*: tongue high→low in even steps; Danish e and æ are two
   different steps where Polish has one "e". Drill the ladder as one
   gesture.
9. **soft g / silent g** — *dag, meget, bage*: after a vowel, g weakens
   to a glide or vanishes. Rule of thumb: never a hard [g] after a
   vowel.
10. **silent letters** — h before v (*hvad, hvem*), d after l/n/r
    (*guld, mand, bord*), and the written -et/-ede endings that reduce.
    Presented as reading rules with examples.
11. **b/d/g vs p/t/k** — Danish "b d g" are unvoiced (they are lax
    [p t k]); "p t k" are strongly aspirated, and t has an s-ish release
    (*tid* ≈ "tsid"). Trap: Polish fully-voiced b/d/g make *bage/bakke*
    style pairs collapse; the real cue is aspiration, not voicing.
12. **schwa-swallowing & rhythm** — unstressed -e disappears into the
    neighbouring consonant (*gade* has no clear final vowel); spoken
    Danish deletes far more than the spelling shows. Includes 3
    slow-vs-natural example sentences (audio pairs once G2 lands).

**Tests:** validator green over the file; `pron: every minimalPair word
also appears in practiceWords or the deck` is NOT required (pairs may be
drill-only) — instead `pron: ids referenced by deck soundTags all exist`.

## WS-B — the Udtale tab (`src/ui/udtale.ts`)

- List view: the 12 items, title_da + title_pl, draft badge where draft.
- Detail view: whatItIs → anchor → numbered mechanics steps (large
  type — this is read mid-practice) → polishTrap in a warning box →
  practice words as tappable chips (chip = play audio when the manifest
  has it, PHASE4 WS-B's `playFor`; no fallback) → minimal pairs table →
  "drill this sound" button (→ WS-C when unblocked, hidden until then).
- Vocab cards with `soundTags` render small chips on the back linking
  into the matching detail view.

**Smoke:** open Udtale, open "stød", assert mechanics steps render;
from a fixture card back, tap a soundTag chip, assert navigation.

## WS-C — minimal-pair perception drill (**blocked: G2**)

Real recordings only — perception training against a TTS clip with a
wrong stød would train the wrong contrast; `speechSynthesis` is
forbidden here (same reasoning as PHASE4 WS-B).

- Drill: pick a phenomenon (or "all"); 10 rounds; each round plays ONE
  clip from a randomly chosen pair (rng-seeded per session) and shows
  two buttons (*hun* / *hund*); instant right/wrong feedback with
  replay; end screen shows per-phenomenon accuracy; results append to
  the session log as `mode: 'perception', tag, correct, total`.
- Accuracy history per phenomenon shows on the item's detail page (last
  5 drills) — this is the measurable half of pronunciation.
- Dictation (PHASE5 WS-B) reads these stats for its weighting.

**Tests:** `drill: round never plays both sides`, `drill: rng-seeded
sequence deterministic`, `drill: log row shape`. **Smoke:** fixture
clips, one full drill, assert accuracy screen.

## WS-D — self-record & compare

- On an item detail page and on card backs with audio: a record button
  (MediaRecorder, mic permission requested on first use with a plain
  explanation); records ≤ 5 s to an in-memory blob; UI then offers
  "yours / reference" A/B replay buttons. Nothing is uploaded and
  nothing persists (in-memory only — pinned; recordings are transient
  practice, not data). No scoring of any kind (PARKED_GATES).
- Feature-detect: no MediaRecorder (older iOS) ⇒ the button hides.

**Smoke:** Playwright with fake media stream (`--use-fake-device-for-
media-stream` launch flag), record, assert the "yours" replay button
becomes enabled.
