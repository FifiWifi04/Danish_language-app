import { describe, it, expect } from 'vitest';
import { captureSnapshot, applyUndo } from '../src/core/undo';
import { newProgress } from '../src/core/progress';
import { schedule } from '../src/core/scheduler';

describe('undo', () => {
  it('undo: restores exact prior progress', () => {
    const original = newProgress('card-1', 'hash-1');
    const snapshot = captureSnapshot(original.id, original, 'good');

    // simulate what onRate does next: derive an updated Progress via schedule()
    const updated = schedule({ progress: original, rating: 'good', nowMinute: 100, today: 10 });
    expect(updated).not.toEqual(original);

    const restored = applyUndo(snapshot);
    expect(restored).toEqual(original);
    expect(restored).not.toEqual(updated);
  });
});
