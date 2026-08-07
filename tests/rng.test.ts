import { describe, it, expect } from 'vitest';
import { mulberry32 } from '../src/core/rng';

describe('rng', () => {
  it('rng: same seed same first 5 values', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const aValues = Array.from({ length: 5 }, () => a());
    const bValues = Array.from({ length: 5 }, () => b());
    expect(aValues).toEqual(bValues);
  });

  it('rng: values in [0,1)', () => {
    const next = mulberry32(1234);
    for (let i = 0; i < 1000; i++) {
      const v = next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});
