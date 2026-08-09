import { describe, it, expect } from 'vitest';
// @ts-expect-error -- scripts/ is plain ESM JS, no type declarations (CLAUDE.md rule 4b)
import { hashUtterance, collectUtterances, planSynthesis, runSynthesis } from '../scripts/audio-lib.mjs';
// @ts-expect-error -- scripts/ is plain ESM JS, no type declarations (CLAUDE.md rule 4b)
import { synthesize as fakeSynthesize } from '../scripts/providers/fake.mjs';

describe('audio: build-audio helpers', () => {
  it('audio: hash covers text+voice+provider', () => {
    const base = hashUtterance('hej', 'voice-a', 'elevenlabs');
    expect(hashUtterance('hejsa', 'voice-a', 'elevenlabs')).not.toBe(base);
    expect(hashUtterance('hej', 'voice-b', 'elevenlabs')).not.toBe(base);
    expect(hashUtterance('hej', 'voice-a', 'fake')).not.toBe(base);
    expect(hashUtterance('hej', 'voice-a', 'elevenlabs')).toBe(base);
  });

  it('audio: manifest hit skips synthesis', () => {
    const utterances = ['hej', 'tak'];
    const manifest = {
      hej: { filename: 'hej-file.mp3', voice: 'voice-a', provider: 'elevenlabs', generatedAt: 't0' },
    };
    const existingFiles = new Set(['hej-file.mp3']);
    const { toSynthesize, skipped } = planSynthesis(utterances, manifest, 'voice-a', 'elevenlabs', existingFiles);
    expect(skipped).toEqual(['hej']);
    expect(toSynthesize.map((item: { text: string }) => item.text)).toEqual(['tak']);

    // A stale manifest entry whose file is missing (or whose voice/provider
    // changed) is NOT a hit — it must be re-synthesized.
    const { toSynthesize: reSynth } = planSynthesis(utterances, manifest, 'voice-a', 'elevenlabs', new Set());
    expect(reSynth.map((item: { text: string }) => item.text)).toEqual(['hej', 'tak']);
  });

  it('audio: utterance collection finds vocab+pairs+practice', () => {
    const files = [
      {
        path: 'content/deck.v1.json',
        data: { v: 1, type: 'vocab', items: [{ id: 'greetings.hej', danish: 'hej' }] },
      },
      {
        path: 'content/particles.v1.json',
        data: {
          v: 1,
          type: 'particle',
          items: [{ id: 'jo', pairs: [{ withoutIt: 'Det er sandt.', withIt: 'Det er jo sandt.' }] }],
        },
      },
      {
        path: 'content/pronunciation.v1.json',
        data: {
          v: 1,
          type: 'pronunciation',
          items: [
            {
              id: 'stoed',
              practiceWords: [{ word: 'hund' }, { word: 'mand' }],
              minimalPairs: [{ a: 'hun', b: 'hund' }],
              exampleSentence: { danish: 'Min ven har en hund.' },
            },
          ],
        },
      },
    ];
    const utterances = collectUtterances(files);
    expect(utterances).toEqual([
      'hej',
      'Det er sandt.',
      'Det er jo sandt.',
      'hund',
      'mand',
      'hun',
      'Min ven har en hund.',
    ]);
  });

  it('audio: failure keeps manifest consistent', async () => {
    const toSynthesize = [
      { text: 'hej', hash: 'aaaa', filename: 'aaaa.mp3' },
      { text: 'boom', hash: 'bbbb', filename: 'bbbb.mp3' },
      { text: 'tak', hash: 'cccc', filename: 'cccc.mp3' },
    ];
    const flaky = async (text: string) => {
      if (text === 'boom') throw new Error('provider exploded');
      return fakeSynthesize(text, 'voice-a', 'key');
    };
    const { manifestUpdates, failures } = await runSynthesis(
      toSynthesize,
      flaky,
      'voice-a',
      'elevenlabs',
      'key',
      { now: () => 't0' },
    );
    expect(Object.keys(manifestUpdates).sort()).toEqual(['hej', 'tak']);
    expect(manifestUpdates.boom).toBeUndefined();
    expect(failures).toEqual([{ text: 'boom', error: 'provider exploded' }]);
  });
});
