# PLAN — Phase 1: core engine (no UI whatsoever)

Executor-grade. The transition table in WS-B is **authoritative** over
every prose description of the scheduler, including HANDOFF §4.5.
Everything in this plan lives in `src/core/` (pure — CLAUDE.md rule 1)
except the IndexedDB adapter (`src/data/`).

## Shared types (`src/core/types.ts`) — implement exactly

```ts
export type Rating = 'again' | 'hard' | 'good';
export type CardState = 'new' | 'learning' | 'review' | 'relearning' | 'suspended';
export interface Progress {
  id: string;            // content id, e.g. "bakery.rundstykke"
  state: CardState;
  step: number;          // index into learning/relearning steps, else 0
  reps: number;          // successful REVIEW-state answers (graduation resets to 0)
  lapses: number;
  ease: number;          // [1.3, 2.7]
  intervalDays: number;  // 0 while learning
  dueDay: number;        // day number (see time.ts); learning steps use dueMinute
  dueMinute: number | null; // absolute minutes since epoch for intra-session steps
  isLeech: boolean;      // true ⇒ state 'suspended', shown in rework list
  contentHash: string;   // last-seen hash; mismatch ⇒ needsReviewFlag
  flagged: string | null; // user flag reason or null
}
export interface ScheduleInput { progress: Progress; rating: Rating; nowMinute: number; today: number; }
export interface Session { queue: string[]; newIntroduced: number; reviewsDone: number; }
```

## WS-A — time + RNG (`src/core/time.ts`, `src/core/rng.ts`)

- `dayNumber(nowMs: number, tzOffsetMinutes: number): number` — integer
  days since Unix epoch with a **4 am local cutoff** (i.e. subtract 4 h
  after applying the offset, floor by 24 h). Callers pass
  `new Date().getTimezoneOffset()` — core never reads the clock.
- `minuteNumber(nowMs: number): number` — floor(nowMs / 60000).
- `mulberry32(seed: number): () => number` — the standard mulberry32;
  deterministic across runs.

**Tests (hand-write expected values first):**
`time: 03:59 local belongs to previous day`, `time: 04:00 starts new day`,
`time: DST offset change shifts cutoff consistently`,
`rng: same seed same first 5 values`, `rng: values in [0,1)`.

## WS-B — scheduler (`src/core/scheduler.ts`)

`schedule(input: ScheduleInput): Progress` (returns a NEW object). The
authoritative transition table — implement row by row, test row by row:

| # | state | rating | result |
|---|---|---|---|
| 1 | new (first shown) | any | state=learning, step=0, due nowMinute+1 |
| 2 | learning step 0 | again | stay step 0, due +1 min |
| 3 | learning step 0 | good | step 1, due +10 min |
| 4 | learning step 1 | again | step 0, due +1 min |
| 5 | learning step 1 | good | GRADUATE: state=review, reps=0, interval=1, dueDay=today+1, dueMinute=null |
| 6 | learning any | hard | repeat current step, due +5 min (mean of steps; a pinned decision) |
| 7 | review reps=0 | good | reps=1, interval=6, dueDay=today+6 |
| 8 | review reps≥1 | good | reps+1, interval=round(interval×ease), dueDay=today+interval |
| 9 | review any | hard | interval=max(prev+1, round(interval×1.2)), ease=max(1.3, ease−0.15), reps+1, NOT a lapse |
| 10 | review any | again | lapses+1, ease=max(1.3, ease−0.20), state=relearning, step=0, due +10 min; store pendingInterval=max(1, round(interval×0.5)) in intervalDays |
| 11 | relearning | good | state=review, dueDay=today+intervalDays (the halved one), reps unchanged |
| 12 | relearning | again | stay, due +10 min (no extra lapse — one failure, one lapse) |
| 12b | relearning | hard | GRADUATE conservatively: intervalDays=max(1, round(intervalDays × 0.5)) (halving the already-halved pending interval), state=review, dueDay=today+intervalDays, reps unchanged, **ease unchanged**, not a lapse |
| 13 | any | — | after row application: ease clamped [1.3, 2.7]; interval clamped [1, 365]; if lapses ≥ 8 ⇒ isLeech=true, state=suspended |

Every (state, rating) pair the engine can receive has a row — `schedule()`
is total over `Rating`, so there is no "unreachable" combination to leave
undefined. If a future change introduces a state, it needs a row per
rating before any code is written.

**Tests:** one named test per row (`sched: row 7 first review good gives 6 days`,
…, `sched: row 12b relearning hard graduates at half the pending interval`),
plus `sched: ease never leaves [1.3,2.7] under 100 random ratings`,
`sched: interval never exceeds 365`, `sched: leech at 8th lapse suspends`,
`sched: schedule is pure (input object unmutated)`, and
`sched: every (state, rating) pair returns a valid Progress` (a loop over
all 5 states × 3 ratings asserting no throw, no NaN, interval ≥ 1).

## WS-C — session queue (`src/core/session.ts`)

`buildSession(all: Progress[], contentOrder: Map<string, {priority: number, index: number}>, today: number, nowMinute: number, caps = {newPerDay: 20, reviewsPerDay: 200}, rng: () => number): Session`

Rules (each is a named test):
- due learning/relearning steps (dueMinute ≤ now) come first;
- then due reviews (dueDay ≤ today), shuffled with `rng`, capped at
  `reviewsPerDay`;
- new cards only after all due reviews are cleared, ordered by
  `(priority asc, index asc)`, capped at `newPerDay` minus already
  introduced today;
- a card id never appears twice in one queue;
- suspended/leech cards never appear.

## WS-D — progress store (`src/core/store.ts` + `src/data/idb.ts` + `src/data/memory.ts`)

`interface ProgressStore { get(id): Promise<Progress|undefined>; put(p: Progress): Promise<void>; all(): Promise<Progress[]>; putSessionLog(e: SessionLogEntry): Promise<void>; sessionLog(): Promise<SessionLogEntry[]>; exportAll(): Promise<string>; importAll(json: string): Promise<void>; }`

- Interface + `MemoryStore` are pure-adjacent (no IDB import) so every
  core test runs on memory. `src/data/idb.ts` implements the same
  interface with `idb` (if D-DEP1 confirmed) or raw IndexedDB; DB name
  `danmarksliv`, stores `progress` (key `id`) and `sessionLog`
  (autoincrement). Unknown content ids get default Progress on first
  touch; progress rows without content are ignored (HANDOFF §4.4).
- `exportAll` returns versioned JSON `{v: 1, exportedAt, progress: [],
  sessionLog: []}`; `importAll` validates `v` and replaces atomically.

**Tests:** interface contract suite run against MemoryStore (`store:
roundtrip`, `store: export/import identity`, `store: import rejects bad
version`). IDB adapter gets a happy-dom + `fake-indexeddb`? — NO: no new
deps. The IDB adapter is verified in PHASE3 WS-A's Playwright smoke
instead; keep it thin (pure delegation, no logic).

## WS-E — simulation soak (`tests/simulation.test.ts`)

Seeded harness per HANDOFF Phase 1 gate: 500 synthetic cards, 730
simulated days, simulated learner answers good with p=0.85 (rng), hard
p=0.05, again p=0.10. Each simulated day: build session, answer
everything, advance day. Assertions (each a named test or assert):
- no NaN, no interval < 1 or > 365 on any review card;
- ease within [1.3, 2.7] for every card every day;
- no starvation: every non-suspended card reviewed at least once per
  (interval + 30) days;
- no duplicate card within any single session;
- **byte-identical final state for the same seed** (run twice, compare
  `JSON.stringify`);
- runtime under ~10 s (keep it in `npm test`, not a separate script).
