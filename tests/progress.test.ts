import { describe, it, expect } from 'vitest';
import { newProgress, materializeProgress } from '../src/core/progress';

describe('progress', () => {
  it('progress: newProgress starts a card at state=new with the given contentHash', () => {
    const p = newProgress('greetings.hej', 'abc123');
    expect(p.state).toBe('new');
    expect(p.contentHash).toBe('abc123');
    expect(p.ease).toBe(2.5);
    expect(p.lapses).toBe(0);
  });

  it('progress: materializeProgress keeps stored rows and fills in missing ones as new', () => {
    const stored = [newProgress('a', 'hash-a')];
    stored[0]!.state = 'review';
    stored[0]!.reps = 3;

    const result = materializeProgress(
      [
        { id: 'a', contentHash: 'hash-a' },
        { id: 'b', contentHash: 'hash-b' },
      ],
      stored,
    );

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(stored[0]);
    expect(result[1]?.id).toBe('b');
    expect(result[1]?.state).toBe('new');
    expect(result[1]?.contentHash).toBe('hash-b');
  });
});
