import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
// @ts-expect-error -- scripts/ is plain ESM JS, no type declarations (CLAUDE.md rule 4b)
import { validateContent, computeContentHash } from '../scripts/validate-content.mjs';

const CONTENT_DIR = join(process.cwd(), 'content');

function loadContentFiles() {
  if (!existsSync(CONTENT_DIR)) return [];
  return readdirSync(CONTENT_DIR)
    .filter((name) => name.endsWith('.json'))
    .map((name) => ({
      path: `content/${name}`,
      data: JSON.parse(readFileSync(`${CONTENT_DIR}/${name}`, 'utf-8')),
    }));
}

function fixtureVocabItem(overrides: Record<string, unknown> = {}) {
  const danish = (overrides.danish as string) ?? 'hej';
  const clozeTarget = overrides.clozeSentence !== undefined ? (overrides.clozeTarget as string) : undefined;
  const base = {
    id: 'greetings.hej',
    status: 'draft',
    priority: 1,
    danish,
    english: 'hi',
    polish: 'cześć',
    phoneticPl: 'haj',
    emojiAnchor: '👋',
    contentHash: computeContentHash(danish, clozeTarget),
  };
  return { ...base, ...overrides };
}

function fixtureDeck(items: Record<string, unknown>[]) {
  return { path: 'content/fixture-deck.v1.json', data: { v: 1, type: 'vocab', items } };
}

describe('validate: content schema validator', () => {
  it('validate: accepts the fixture deck', () => {
    const result = validateContent([fixtureDeck([fixtureVocabItem()])]);
    expect(result).toEqual({ ok: true, errors: [] });
  });

  it('validate: rejects duplicate id', () => {
    const dup = fixtureVocabItem({ id: 'greetings.hej' });
    const dup2 = fixtureVocabItem({ id: 'greetings.hej', danish: 'hejsa' });
    const result = validateContent([fixtureDeck([dup, dup2])]);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e: string) => e.includes('duplicate id "greetings.hej"'))).toBe(true);
  });

  it('validate: rejects bad contentHash', () => {
    const item = fixtureVocabItem({ contentHash: 'not-a-real-hash' });
    const result = validateContent([fixtureDeck([item])]);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e: string) => e.includes('"contentHash"'))).toBe(true);
  });

  it('validate: rejects cloze without target', () => {
    const item = fixtureVocabItem({ clozeSentence: 'Jeg siger ___.' });
    const result = validateContent([fixtureDeck([item])]);
    expect(result.ok).toBe(false);
    expect(
      result.errors.some((e: string) => e.includes('"clozeTarget" is required')),
    ).toBe(true);
  });

  it('validate: rejects unknown soundTag', () => {
    const item = fixtureVocabItem({ soundTags: ['does-not-exist'] });
    const result = validateContent([fixtureDeck([item])]);
    expect(result.ok).toBe(false);
    expect(
      result.errors.some((e: string) => e.includes('unknown pronunciation id "does-not-exist"')),
    ).toBe(true);
  });

  it('validate: accepts a soundTag that resolves to a pronunciation item in another file', () => {
    const pronunciationFile = {
      path: 'content/pronunciation.v1.json',
      data: {
        v: 1,
        type: 'pronunciation',
        items: [
          {
            id: 'stoed',
            status: 'draft',
            title_da: 'Stød',
            title_pl: 'Zwarcie krtaniowe',
            whatItIs_pl: 'Krótkie zatrzymanie w środku samogłoski.',
            mechanics_pl: ['Napnij fałdy głosowe na chwilę.'],
            polishTrap_pl: 'Polacy zwykle je pomijają.',
            anchor_pl: 'jak polskie „uh-oh", ale lżej',
            practiceWords: [
              { word: 'hund', gloss_pl: 'pies' },
              { word: 'mand', gloss_pl: 'mężczyzna' },
              { word: 'mor', gloss_pl: 'matka' },
              { word: 'bønder', gloss_pl: 'rolnicy' },
            ],
          },
        ],
      },
    };
    const vocabItem = fixtureVocabItem({ soundTags: ['stoed'] });
    const result = validateContent([pronunciationFile, fixtureDeck([vocabItem])]);
    expect(result).toEqual({ ok: true, errors: [] });
  });

  it('validate: every content file is clean', () => {
    const files = loadContentFiles();
    const result = validateContent(files);
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
  });
});
