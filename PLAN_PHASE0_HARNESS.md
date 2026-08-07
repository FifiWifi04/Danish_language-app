# PLAN — Phase 0: harness (scaffold + CI + Pages deploy)

Executor-grade: every decision pre-made; if reality contradicts, STOP and
report. Read `CLAUDE.md` first.

## WS-A — scaffold

1. `npm create vite@latest . -- --template vanilla-ts` layout, adjusted to:

```
index.html
vite.config.ts        base: '/Danish_language-app/', vite-plugin-pwa registered later (WS = PHASE3 WS-B)
tsconfig.json         "strict": true, "noUncheckedIndexedAccess": true
package.json          scripts: dev, build ("tsc --noEmit && vite build"), preview,
                      test ("vitest run"), validate ("vite-node scripts/validate-deck.ts")
src/main.ts           mounts the shell
src/ui/shell.ts       app shell: header "DanmarksLiv", a nav with tabs
                      Review · Udtale · Stats (buttons switching a single
                      <main> region; hash-based, no router lib), footer
                      with the app version (from package.json via
                      import.meta.env)
src/core/             empty except index.ts re-exports (filled in Phase 1)
docs/DECISIONS.md     seeded — see below
tests/smoke.test.ts   asserts shell exports render without throwing (happy-dom)
.gitignore            MUST include .env and .env.* — see below
.env.example          committed placeholder: TTS_PROVIDER=elevenlabs,
                      TTS_API_KEY=, TTS_VOICE= (names only, never values)
```

**`.gitignore` is security-critical and is created in THIS workstream,
not Phase 4.** Vite's template `.gitignore` covers `*.local` but NOT
`.env`, so a `.env` dropped in later would be committable. Write it
explicitly: `node_modules`, `dist`, `*.local`, `.env`, `.env.*`,
`!.env.example`, `.DS_Store`. The owner's ElevenLabs key lives in `.env`
on their machine only (OWNER_INPUTS G2); it must never become a tracked
file, and no routine firing ever creates one.

2. Dev deps ONLY from the approved list (`CLAUDE.md` rule 4). Vitest
   environment: `happy-dom` (add as dev dep — it is part of the vitest
   stack, allowed).
3. Seed `docs/DECISIONS.md` with one dated entry each, copied from
   HANDOFF §4.4/§4.5 and REVIEW.md Part A: day-number due dates (4 am
   cutoff); learning steps 1 min/10 min; Good ladder 1 d → 6 d →
   interval×ease; ease clamp [1.3, 2.7]; interval cap 365 d; leech at 8
   lapses → rework list; daily caps 20 new/200 reviews, new only after
   reviews; pregenerated audio, no runtime keys; emoji-first visuals;
   TTS-only v1 audio (REVIEW A.4); `priority`-ordered new-card intro
   (REVIEW A.8); content firewall draft/reviewed (REVIEW B.3).

**Acceptance (test names):** `smoke: shell renders three tabs`,
`smoke: tab switch swaps main region`. Plus tier-1 green.

## WS-B — CI + Pages deploy

1. `.github/workflows/ci.yml`: on push + PR — `npm ci`, `npm test`,
   `npx tsc --noEmit`, `npm run build`. Node 22, cache npm. Plus a
   **secret-tracking guard** as the first step, so a committed key fails
   CI loudly instead of sitting in history:

```yaml
- name: no secrets tracked
  run: |
    if git ls-files --error-unmatch .env >/dev/null 2>&1; then
      echo "::error::.env is tracked — remove it and rotate the key"; exit 1
    fi
```
2. `.github/workflows/deploy.yml`: on push to the build branch — build,
   `actions/upload-pages-artifact` on `dist/`, `actions/deploy-pages`
   (permissions `pages: write`, `id-token: write`, environment
   `github-pages`).
3. Pages needs the owner's one-click setting (OWNER_INPUTS). If the
   deploy run fails on that, record `live-verify DEFERRED` — do NOT
   change repo settings via API, do NOT retry-loop.

**Acceptance:** CI workflow green on the pushed commit (check the run via
the GitHub MCP tools if available; otherwise defer honestly). Gate for
the phase (from HANDOFF): a blank shell deploys to Pages — may stay
DEFERRED until the owner enables Pages.
