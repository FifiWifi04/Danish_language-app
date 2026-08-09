# CLAUDE.md — DanmarksLiv (personal Danish-learning PWA)

Single-user PWA, Vite + TypeScript + vanilla DOM + Vitest, deployed to
GitHub Pages. Read `HANDOFF.md` for context, `REVIEW.md` Part A for
binding corrections, `AUTON_STATUS.md` for the work queue, and the
relevant `PLAN_*.md` before writing code.

## Commands

```bash
npm ci               # install (never npm install in CI-adjacent work)
npm test             # Vitest, includes the Phase-1 simulation soak
npx tsc --noEmit     # type check (strict mode is on; keep it green)
npm run validate     # content schema validator over content/*.json
npm run build        # production build (fails on type errors)
npm run preview      # serve the built bundle for smoke tests
```

## Hard rules (violating these breaks decisions already reasoned through)

1. **`src/core/` is pure.** No DOM, no I/O, no imports from `ui/` or
   `data/`, and no `Date.now()` — `now` is always an explicit parameter.
   No `Math.random()` either — randomness comes from the seeded RNG in
   `src/core/rng.ts`, passed in.
2. **Scheduler behaviour is defined by `docs/DECISIONS.md` and the
   transition table in `PLAN_PHASE1_ENGINE.md`.** Do not alter it without
   a new decision entry. The simulation soak must stay in CI.
3. **The content firewall.** Never edit a file under `content/` whose
   entries carry `"status": "reviewed"`. New generated content is always
   `"status": "draft"`. If reviewed content looks wrong, flag it in
   `AUTON_STATUS.md` (DECISIONS-NEEDED) — do not fix it.
4. **No new dependencies.** The approved runtime list is: `idb` (D-DEP1
   CONFIRMED yes, 2026-08-07). Dev list: vite, typescript, vitest,
   happy-dom, vite-plugin-pwa, @playwright/test. Anything else: STOP and
   flag.
4b. **There is no TypeScript script runner, and we are not adding one**
   (decision 2026-08-07, replacing the `vite-node` reference the plans
   originally carried). Therefore: `src/` is TypeScript, and **`scripts/`
   is plain ESM JavaScript (`.mjs`) runnable with bare `node`**. Anything
   in `scripts/` that deserves tests exports pure functions from a
   `.mjs` module, and a Vitest test imports it — Vitest reads plain JS
   fine. `npm run validate` is a Vitest run, not a standalone binary.
5. **Content and progress never mix.** Progress lives in IndexedDB keyed
   by card `id`; content files are read-only at runtime. Deck updates
   must never require a progress migration.
6. **Due dates are day numbers** (integer days since epoch, 4 am local
   cutoff), never timestamps.
7. **No secrets in the client or the repo.** `scripts/build-audio.mjs`
   reads keys from `.env` (gitignored) and runs locally only.
8. **Keep files under ~200 lines.** Split rather than grow.
9. **Danish/Polish/English strings**: UI chrome is English; learning
   content is da/pl per the schema. Don't invent new Danish content
   outside a content-generation workstream.
10. **Vite `base` must remain `'/<repo-name>/'`** or Pages breaks.

## Autonomous firings

If you are a scheduled routine firing, `AUTON_ORDERS.md` is your
procedure — follow it top to bottom, one workstream per session.
