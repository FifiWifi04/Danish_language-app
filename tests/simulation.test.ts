import { describe, it, expect, beforeAll } from 'vitest';
import { runSimulation, SIM_NUM_CARDS, SIM_NUM_DAYS } from './simulation-harness';
import type { SimulationReport } from './simulation-harness';

const SEED = 42;

let report: SimulationReport;
let repeatReport: SimulationReport;
let elapsedMs = 0;

beforeAll(() => {
  const start = performance.now();
  report = runSimulation(SEED);
  elapsedMs = performance.now() - start;
  repeatReport = runSimulation(SEED);
});

describe(`simulation soak: ${SIM_NUM_CARDS} cards x ${SIM_NUM_DAYS} days`, () => {
  it('sim: introduces every card over the run', () => {
    expect(report.finalProgress).toHaveLength(SIM_NUM_CARDS);
    expect(report.totalReviews).toBeGreaterThan(0);
  });

  it('sim: no NaN and no interval outside [1,365] on any review card', () => {
    const bad = report.violations.filter(
      (v) => v.reason.includes('NaN') || v.reason.includes('interval'),
    );
    expect(bad).toEqual([]);
  });

  it('sim: ease stays within [1.3, 2.7] for every card every day', () => {
    const bad = report.violations.filter((v) => v.reason.includes('ease'));
    expect(bad).toEqual([]);
  });

  it('sim: no card is starved beyond interval + 30 days', () => {
    expect(report.starvationViolations).toEqual([]);
  });

  it('sim: no duplicate card within any single session', () => {
    const bad = report.violations.filter((v) => v.reason.includes('duplicate'));
    expect(bad).toEqual([]);
  });

  it('sim: final state is byte-identical for the same seed', () => {
    expect(JSON.stringify(repeatReport.finalProgress)).toBe(JSON.stringify(report.finalProgress));
  });

  it('sim: runs in well under 10s', () => {
    expect(elapsedMs).toBeLessThan(10_000);
  });
});
