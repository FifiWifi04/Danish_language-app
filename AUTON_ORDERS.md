# AUTON_ORDERS — standing orders for each autonomous iteration

Written 2026-08-06 (REVIEW.md Part B is the rationale; this file is the
procedure). Every scheduled firing follows this file top to bottom,
literally. One firing = at most ONE workstream. When in doubt: flag and
stop — a skipped iteration costs one cadence interval; a wrong guess costs
trust.

**Usage-limit resilience:** firings may silently fail when the owner's
usage limits are exhausted. Expected and harmless — all state lives on
origin; the next successful firing continues the queue. Never compensate
for missed firings with extra workstreams; the one-WS bound stands.

**Self-healing mandate (least-involvement mode):** a BUG found while
working — failing test, wrong behaviour, doc drift — may be fixed
autonomously when the fix is small, in-scope, and touches none of the
step-5 STOP areas. Every such fix gets an entry in `AUTON_STATUS.md`'s
"Solutions & fixes log" (what broke, root cause, fix, commit, what to
double-check). Too big / risky / STOP-gated → log `UNFIXED — needs owner`
instead. Fixes are logged, never silent.

## Routine prompt (what the trigger sends; keep it this short)

> You are executing the DanmarksLiv autonomous build run. Work ONLY on
> branch `claude/danish-app-design-review-z48b7e` in
> FifiWifi04/Danish_language-app. First: `git fetch origin` and hard-reset
> the branch to its origin tip, verify HEAD equals origin. Then open
> `AUTON_ORDERS.md` at the repo root and follow it exactly. At most one
> workstream this session. Push everything before ending. Never
> force-push, never touch another branch.

(If the owner rebinds the build to a different branch, edit the branch
name HERE and in the routine prompt in the same commit.)

## Step 0 — orient

Read, in this order, every session: this file; `AUTON_STATUS.md`;
`CLAUDE.md`; `REVIEW.md` Part A; the `PLAN_*.md` for the item you take.
The plan's text is authoritative over your instincts. If the plan and
reality disagree (an API changed, a file isn't where the plan says, a
step is impossible): STOP, log it under DECISIONS-NEEDED, end.

## Step 1 — sync (never skip, never reorder)

```bash
git fetch origin claude/danish-app-design-review-z48b7e
git checkout -B claude/danish-app-design-review-z48b7e \
    origin/claude/danish-app-design-review-z48b7e
test "$(git rev-parse HEAD)" = \
     "$(git rev-parse origin/claude/danish-app-design-review-z48b7e)" \
  || { echo "SYNC FAILED — stop"; exit 1; }
```

## Step 2 — kill switch

If `AUTON_HOLD` exists at the repo root on origin: append a "held" line
to `AUTON_STATUS.md`, push it, end the session. Do nothing else.

## Step 3 — entry regression

Before building anything (skip only while item 0 — no package.json yet —
is the current item):

```bash
npm ci
npm test && npx tsc --noEmit && npm run build
```

All green or this iteration becomes FIX-OR-REVERT: identify the offending
origin commit, `git revert` it (never reset, never force), verify green,
push, log, stop. The queue waits; origin is never left red.

## Step 4 — pick work

Open `AUTON_STATUS.md`. Take the TOPMOST item whose state is `todo` and
whose gate (if any) is marked cleared. The file is only updated on push
(step 8) — unpushed edits don't exist.

**Never start anything in `PARKED_GATES.md`.** A gate opening is an owner
judgement, expressed by the owner editing `AUTON_STATUS.md`. A parked
item is not "available work".

**Drained queue = end silently.** If no item is todo-and-unblocked:
append ONE drained line to the iteration log **only if the previous log
line is not already a drained line**; otherwise make NO commit and end.
Do not invent work, do not tidy, do not pull work forward.

## Step 5 — build (one workstream)

Follow the item's `PLAN_*.md` workstream text exactly. Binding
conventions (from `CLAUDE.md` — read it, these are headlines): core stays
pure (no Date.now/Math.random/DOM/I-O); scheduler changes need a
DECISIONS entry; generated content is always `"status":"draft"`; day
numbers not timestamps; files under ~200 lines; write the expected
values of scheduler/queue tests BY HAND first, then code until green.

STOP-and-flag (move the item to `blocked` in STATUS, take the next one)
the moment the workstream requires: adding ANY dependency; editing
reviewed content (`"status":"reviewed"`); changing scheduler behaviour
beyond the plan's table; touching `.env`, keys, or secrets; deleting or
migrating user progress data; a GitHub setting you cannot reach; a
product judgement the plan didn't pre-make; or a third attempt at the
same failing test.

## Step 6 — verify

- **Tier 1 (always):** `npm test` (all suites incl. the simulation soak
  once it exists) + `npx tsc --noEmit` + `npm run build` + `npm run
  validate` if content or schema was touched.
- **Tier 2 (any UI/PWA/service-worker workstream):** `npm run build &&
  npm run preview` and a Playwright smoke against the preview URL
  asserting the workstream's acceptance behaviour (each plan names the
  smoke test). Offline/PWA claims are verified with Playwright's offline
  mode, not by assertion.
- **Tier 3 (deploy):** after CI/Pages workstreams, check the live Pages
  URL if reachable; otherwise record `live-verify DEFERRED` honestly.
  Never mark VERIFIED LIVE without a real pass.

## Step 7 — pre-commit revert check

```bash
git fetch origin claude/danish-app-design-review-z48b7e
test "$(git merge-base HEAD origin/claude/danish-app-design-review-z48b7e)" = \
     "$(git rev-parse origin/claude/danish-app-design-review-z48b7e)" || {
  git diff > ../ws.patch
  git checkout -B claude/danish-app-design-review-z48b7e \
      origin/claude/danish-app-design-review-z48b7e
  git apply ../ws.patch   # then re-run step 6 before continuing
}
```

Never commit unless HEAD's base IS origin's tip. If the patch does not
apply cleanly: keep the patch, flag in STATUS, stop the item.

## Step 8 — commit, push, prove it

- One WS = one commit. Message: `<plan-shortname> <WS>: <what> (tier-N
  verified[, live-verify deferred])`.
- `git push -u origin claude/danish-app-design-review-z48b7e`; on network
  failure retry after 2/4/8/16 s. Then PROVE it:

```bash
test "$(git rev-parse HEAD)" = \
     "$(git ls-remote origin refs/heads/claude/danish-app-design-review-z48b7e | cut -f1)"
```

- Update `AUTON_STATUS.md`: flip the item's state (`done@<sha>` /
  `blocked(<reason>)` / `deferred(<reason>)`), append one iteration-log
  line (UTC timestamp, item, tier reached, flags), add any
  DECISIONS-NEEDED entries. Commit (`auton: status update`), push,
  re-verify the same way. An iteration whose status update is not on
  origin DID NOT HAPPEN — the next session will redo it.

## Step 9 — end

End the session. No second workstream, no "just clean up", no
opportunistic refactor. The next firing continues from origin.
