# PLAN — Phase 3: minimum usable app (Mode A, PWA, stats, backup)

Executor-grade. Every WS here is UI ⇒ tier-2 verification (Playwright
smoke against `npm run preview`) is mandatory; each WS names its smoke.

## WS-A — Mode A review UI (`src/ui/review.ts`)

- The Review tab drives a session from `buildSession` + the IDB store:
  card front = `danish` large + emojiAnchor (imageUrl if present);
  tap/space reveals back = english, polish, phoneticPl, grammarNote,
  audio button (wired in PHASE4 WS-B — render disabled until then);
  three buttons **Again / Hard / Good** (thumb-reach row, min 48 px).
- Draft cards render a small "DRAFT — unverified" badge (content
  firewall, REVIEW B.3). Cards whose stored `contentHash` differs from
  content's render a "content changed — re-check" badge and clear it on
  next Good.
- Session end screen: counts done, streak so far, "backup is N days old"
  nudge when > 7 days (from the export timestamp in the store).
- No settings UI. Caps and steps are constants from core.

**Smoke (`tests/e2e/review.spec.ts`):** loads preview, completes a
3-card session with the fixture deck, asserts the queue empties and a
rating writes a Progress row (via the export blob).

## WS-B — PWA (`vite.config.ts` + `src/pwa.ts`)

- `vite-plugin-pwa`, `registerType: 'prompt'`; manifest: name
  "DanmarksLiv", da-flag-red theme `#C8102E`, maskable icon (generate a
  simple emoji-on-red PNG pair 192/512 into `public/icons/` with a
  script, checked in); precache includes `content/*.json` and
  `public/audio/**` (verify the glob actually matches in the generated
  manifest — HANDOFF §4.1 calls this out).
- Update flow: `onNeedRefresh` shows a toast "New version — reload";
  accept calls `updateSW(true)`. `onOfflineReady` shows a one-time
  "works offline now" toast.

**Smoke:** Playwright: load preview, go `context.setOffline(true)`,
reload, assert the shell still renders and a session can start (fixture
deck cached).

## WS-C — stats + session log (`src/ui/stats.ts`)

- Every completed session appends `{day, mode, reviewed, newIntroduced,
  againCount, hardCount, goodCount, durationSec}` via
  `putSessionLog` (already in the store interface).
- Stats tab shows: due today / new remaining today; current streak
  (consecutive day numbers with ≥ 1 review); last-30-days bar strip
  (plain divs, no chart lib); overall retention (good+hard)/(all) over
  the last 30 days; leech count linking to the rework list (PHASE5
  WS-D); last-backup age.
- This log is what makes gate G3 attestable at a glance.

**Smoke:** complete a session, open Stats, assert streak ≥ 1 and the
session row exists.

## WS-D — export/import (`src/ui/backup.ts`)

- Stats tab buttons: **Export backup** → `exportAll()` string downloaded
  as `danmarksliv-backup-<date>.json` (Blob + a[download]); **Import
  backup** → file input, `importAll` after a confirm dialog stating it
  replaces current progress; store the last-export timestamp.
- Import errors surface verbatim (bad version, parse error) — never
  half-import.

**Smoke:** export → clear IDB via page script → import → assert a known
Progress row is back.
