# PLAN — Phase 2: content pipeline + 30-card pilot (+ gated scale-up)

Executor-grade. Content correctness is the project's real risk (HANDOFF
§3.7); everything here is built to surface errors early and to keep
unreviewed content visibly untrusted.

## WS-A — schema + validator

`content/` files, all JSON, all with top-level
`{v: 1, type: "vocab"|"particle"|"pronunciation", items: [...]}`.

**vocab item** (`content/deck.v1.json`):

```
id            slug "theme.word" (unique across ALL content files)
status        "draft" | "reviewed"
priority      int ≥ 1 (1 = introduce first)
danish        string
english       string
polish        string
phoneticPl    Polish-ear approximation, e.g. "rŏnstyge"
emojiAnchor   1–2 emoji
imageUrl      optional, hand-picked only
grammarNote   optional, Polish-contrastive, ≤ 200 chars
clozeSentence optional; must contain "___"
clozeTarget   required iff clozeSentence present; must equal danish or an inflected form
soundTags     optional string[] of pronunciation item ids
contentHash   sha256 hex over danish + "|" + (clozeTarget ?? "")
```

**particle item** (`content/particles.v1.json`): `id, status, priority,
particle, pairs: [{withoutIt, withIt, socialEffect_pl}] (≥ 2 pairs),
note_pl, soundTags?` — contrastive minimal pairs per HANDOFF §3.6.

**pronunciation item**: see `PLAN_PRONUNCIATION.md` WS-A.

`scripts/validate-deck.ts` (run via `npm run validate`, wired into CI in
this WS): validates every field above, uniqueness of ids, contentHash
correctness (recompute and compare), soundTags referential integrity,
emoji-ness of emojiAnchor, and that **no file mixes draft and reviewed
edits in one PR** is NOT checkable here — that's the firewall rule in
CLAUDE.md instead.

**Tests:** `validate: accepts the fixture deck`, `validate: rejects
duplicate id`, `validate: rejects bad contentHash`, `validate: rejects
cloze without target`, `validate: rejects unknown soundTag`.

## WS-B — the 30-card pilot deck

Generate `content/deck.v1.json` with exactly 30 vocab items,
`status: "draft"` on every one. Composition is pre-made:

- 10 survival nouns/verbs with high daily frequency (bakery, transport,
  greetings context): rundstykke, dankort, tak, hej/hejsa, undskyld,
  at hedde, at bo, at arbejde, brød, kaffe.
- 10 conversational verbs/phrases in present tense (at snakke, at synes,
  at gide, "det ved jeg ikke", "hvad så?", "det er fint", at hygge,
  at glæde sig, "vi ses", "hav det godt").
- 10 items chosen for **sound coverage**: at least 3 with stød, 3 with
  soft d, 2 with front rounded vowels (y/ø), 2 with vocalized r — tag
  them with `soundTags` so the Udtale links light up.

Authoring rules (binding): `phoneticPl` uses Polish orthography
conventions only (no IPA); `grammarNote` only where Polish and Danish
genuinely diverge (en/et gender, V2 word order, definite suffix);
`clozeSentence` on at least 15 cards, everyday register. After
generating, run `npm run validate` and fix until green.

**This WS does NOT clear the content gate.** The deck ships draft; the
G1 review protocol is in OWNER_INPUTS.md. Do not generate beyond 30.

## WS-C — scale to 500 (**blocked: G1 + G3**)

Only after the owner records a passing G1 error rate AND G3. Batches of
~50, one batch = one firing, themed (food, work, home, small talk,
weather, feelings, town, time), same authoring rules, always draft, and
each batch's item list appended to the G1-review sampling list in
`AUTON_STATUS.md` (reduced sampling per HANDOFF Phase 6).

## WS-D — review verdict application (**blocked: G1**)

The owner pastes reviewer verdicts (per-card: ok / correction) into
`AUTON_STATUS.md` DECISIONS-NEEDED. This WS applies corrections, flips
`status` to `reviewed` for passing cards, recomputes contentHash where
meaning-bearing fields changed, runs validate, and records the error
rate. This is the ONE sanctioned path from draft to reviewed — and it
consumes owner-provided text; it never invents corrections.
