# OWNER_INPUTS — everything that needs the owner, in one place

The autonomous build needs exactly the items below from you. Everything
else is the routine's job. Answer by editing `AUTON_STATUS.md`'s gate
registry (and this file's checkboxes) from anywhere — firings re-read
both.

## Decisions

- [ ] **D-DEP1 — approve `idb`?** A ~1.5 kB promise wrapper over
  IndexedDB. Recommended **yes**: raw IndexedDB is the most likely place
  for the build model to burn sessions on transaction-lifetime bugs.
  Declining is fine — the store interface doesn't change, the adapter is
  just written against the raw API.
- [ ] **D-AUD1 — audio provider.** Recommended **TTS-only v1** (one
  provider: ElevenLabs Multilingual, or Azure neural Danish which is
  cheaper — either works with the same script contract). Forvo human
  recordings are PARKED for licensing reasons (REVIEW.md A.4): their API
  terms don't allow redistribution, and a public repo redistributes.
  Revisit only with a licensing check or a private repo.
- [ ] **D-REPO1 — repo stays public?** On a free GitHub plan, Pages needs
  a public repo, and public + committed third-party audio is what makes
  Forvo a licensing problem. Default assumption: **public repo, TTS
  audio**.
- [ ] **Routine cadence + model** when arming the trigger (Building_app
  used every 6 h; this queue is ~24 items, so at 6 h it drains in roughly
  a week of clean firings).

## One-time GitHub settings (one click each)

- [ ] Enable **GitHub Pages** with source "GitHub Actions" (repo →
  Settings → Pages) — item 1's deploy stays `live-verify DEFERRED` until
  this is done.
- [ ] Optional but recommended: **branch protection** on the build branch
  with CI required, per HANDOFF §6.

## Recurring / gate clearances

- [ ] **G1 — arrange the native review** of the 30-card pilot: phonetics
  AND grammar notes AND the pronunciation guide's mechanics, plus
  *listening* to the stød-critical audio clips. A tutor or native Dane;
  an italki session is enough. Record the error rate in `AUTON_STATUS.md`.
  Above ~10 % ⇒ the generation approach changes, not the scale (HANDOFF
  §3.7 — this is the project's real risk).
- [ ] **G2 — run the audio build once, locally:** put the provider key in
  `.env` (never committed), `npm run build-audio`, commit
  `public/audio/` + the manifest. Re-runs only bill new/changed clips.
- [ ] **G3 — attest seven consecutive days of daily use** with one line
  in `AUTON_STATUS.md`. The stats view (item 11) shows your streak so
  this is a glance, not bookkeeping.

## Explicitly NOT needed from you

Code review of every PR (the simulation soak + CI + the plans' test-name
acceptance criteria are the safety net — skim, don't audit); any API keys
in GitHub (audio generation is local-only by design); content authoring
(you review, the routine drafts).
