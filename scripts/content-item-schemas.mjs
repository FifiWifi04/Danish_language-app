// Per-type item validators + shared field helpers for
// scripts/validate-content.mjs. Split out to keep both files under
// CLAUDE.md's ~200-line guideline.

import { createHash } from 'node:crypto';

const VOCAB_ID_RE = /^[a-z0-9]+(?:[-_][a-z0-9]+)*\.[a-z0-9]+(?:[-_][a-z0-9]+)*$/;
const EMOJI_RE = /\p{Extended_Pictographic}/u;

export function isNonEmptyString(x) {
  return typeof x === 'string' && x.length > 0;
}

export function isStringArray(x) {
  return Array.isArray(x) && x.every(isNonEmptyString);
}

export function computeContentHash(danish, clozeTarget) {
  const input = `${danish}|${clozeTarget ?? ''}`;
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

function isEmojiAnchor(value) {
  if (typeof value !== 'string' || value.length === 0) return false;
  const graphemes = [...new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(value)].map(
    (s) => s.segment,
  );
  if (graphemes.length < 1 || graphemes.length > 2) return false;
  return graphemes.every((g) => EMOJI_RE.test(g));
}

export function validateVocabItem(item, label) {
  const errors = [];
  if (isNonEmptyString(item.id) && !VOCAB_ID_RE.test(item.id)) {
    errors.push(`${label}: vocab "id" must look like "theme.word" (got "${item.id}")`);
  }
  if (!Number.isInteger(item.priority) || item.priority < 1) {
    errors.push(`${label}: "priority" must be an integer >= 1`);
  }
  for (const field of ['danish', 'english', 'polish', 'phoneticPl']) {
    if (!isNonEmptyString(item[field])) {
      errors.push(`${label}: "${field}" must be a non-empty string`);
    }
  }
  if (!isEmojiAnchor(item.emojiAnchor)) {
    errors.push(`${label}: "emojiAnchor" must be 1-2 emoji`);
  }
  if (item.imageUrl !== undefined && !isNonEmptyString(item.imageUrl)) {
    errors.push(`${label}: "imageUrl" must be a non-empty string when present`);
  }
  if (item.grammarNote !== undefined) {
    if (!isNonEmptyString(item.grammarNote)) {
      errors.push(`${label}: "grammarNote" must be a non-empty string when present`);
    } else if (item.grammarNote.length > 200) {
      errors.push(`${label}: "grammarNote" must be <= 200 chars`);
    }
  }
  const hasCloze = item.clozeSentence !== undefined;
  if (hasCloze) {
    if (!isNonEmptyString(item.clozeSentence) || !item.clozeSentence.includes('___')) {
      errors.push(`${label}: "clozeSentence" must be a string containing "___"`);
    }
    if (!isNonEmptyString(item.clozeTarget)) {
      errors.push(`${label}: "clozeTarget" is required when "clozeSentence" is present`);
    }
  } else if (item.clozeTarget !== undefined) {
    errors.push(`${label}: "clozeTarget" is only valid alongside "clozeSentence"`);
  }
  if (!isNonEmptyString(item.contentHash)) {
    errors.push(`${label}: "contentHash" must be a non-empty string`);
  } else {
    const expected = computeContentHash(item.danish, item.clozeTarget);
    if (item.contentHash !== expected) {
      errors.push(
        `${label}: "contentHash" does not match sha256(danish + "|" + (clozeTarget ?? ""))`,
      );
    }
  }
  return errors;
}

export function validateParticleItem(item, label) {
  const errors = [];
  if (!Number.isInteger(item.priority) || item.priority < 1) {
    errors.push(`${label}: "priority" must be an integer >= 1`);
  }
  if (!isNonEmptyString(item.particle)) {
    errors.push(`${label}: "particle" must be a non-empty string`);
  }
  if (!Array.isArray(item.pairs) || item.pairs.length < 2) {
    errors.push(`${label}: "pairs" must be an array with at least 2 entries`);
  } else {
    item.pairs.forEach((pair, i) => {
      for (const field of ['withoutIt', 'withIt', 'socialEffect_pl']) {
        if (!isNonEmptyString(pair?.[field])) {
          errors.push(`${label}: pairs[${i}].${field} must be a non-empty string`);
        }
      }
    });
  }
  if (!isNonEmptyString(item.note_pl)) {
    errors.push(`${label}: "note_pl" must be a non-empty string`);
  }
  return errors;
}

export function validatePronunciationItem(item, label) {
  const errors = [];
  for (const field of ['title_da', 'title_pl', 'whatItIs_pl', 'polishTrap_pl', 'anchor_pl']) {
    if (!isNonEmptyString(item[field])) {
      errors.push(`${label}: "${field}" must be a non-empty string`);
    }
  }
  if (!isStringArray(item.mechanics_pl) || item.mechanics_pl.length === 0) {
    errors.push(`${label}: "mechanics_pl" must be a non-empty array of strings`);
  }
  if (
    !Array.isArray(item.practiceWords) ||
    item.practiceWords.length < 4 ||
    item.practiceWords.length > 8
  ) {
    errors.push(`${label}: "practiceWords" must have 4-8 entries`);
  } else {
    item.practiceWords.forEach((pw, i) => {
      for (const field of ['word', 'gloss_pl']) {
        if (!isNonEmptyString(pw?.[field])) {
          errors.push(`${label}: practiceWords[${i}].${field} must be a non-empty string`);
        }
      }
    });
  }
  if (item.minimalPairs !== undefined) {
    if (!Array.isArray(item.minimalPairs) || item.minimalPairs.length > 4) {
      errors.push(`${label}: "minimalPairs" must be an array with at most 4 entries`);
    } else {
      item.minimalPairs.forEach((mp, i) => {
        for (const field of ['a', 'b', 'gloss_a_pl', 'gloss_b_pl']) {
          if (!isNonEmptyString(mp?.[field])) {
            errors.push(`${label}: minimalPairs[${i}].${field} must be a non-empty string`);
          }
        }
      });
    }
  }
  if (item.exampleSentence !== undefined) {
    const es = item.exampleSentence;
    if (!es || !isNonEmptyString(es.danish) || !isNonEmptyString(es.gloss_pl)) {
      errors.push(`${label}: "exampleSentence" must be {danish, gloss_pl} strings when present`);
    }
  }
  return errors;
}
