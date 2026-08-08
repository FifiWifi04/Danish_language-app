// Pure validation logic for content/*.json — no TS, no fs, no runner
// dependency (CLAUDE.md rule 4b). Callers (tests, future authoring
// scripts) read files from disk and pass parsed JSON in.

import {
  isNonEmptyString,
  isStringArray,
  validateVocabItem,
  validateParticleItem,
  validatePronunciationItem,
} from './content-item-schemas.mjs';

export { computeContentHash } from './content-item-schemas.mjs';

const VALID_TYPES = ['vocab', 'particle', 'pronunciation'];
const STATUSES = ['draft', 'reviewed'];

// files: [{ path: string, data: unknown }] — parsed JSON, one entry per
// content/*.json file. Validates each file's shape, every item per its
// type's schema, id uniqueness across ALL files, and soundTags
// referential integrity against pronunciation item ids.
export function validateContent(files) {
  const errors = [];
  const idsSeen = new Map();
  const pronunciationIds = new Set();
  const soundTagRefs = [];

  for (const file of files) {
    const { path, data } = file;
    if (!data || typeof data !== 'object') {
      errors.push(`${path}: file is not a JSON object`);
      continue;
    }
    if (data.v !== 1) {
      errors.push(`${path}: top-level "v" must be 1`);
    }
    if (!VALID_TYPES.includes(data.type)) {
      errors.push(`${path}: top-level "type" must be one of ${VALID_TYPES.join(', ')}`);
      continue;
    }
    if (!Array.isArray(data.items)) {
      errors.push(`${path}: top-level "items" must be an array`);
      continue;
    }

    data.items.forEach((item, index) => {
      const label = `${path}#${index}`;
      if (!item || typeof item !== 'object') {
        errors.push(`${label}: item is not an object`);
        return;
      }

      if (!isNonEmptyString(item.id)) {
        errors.push(`${label}: "id" must be a non-empty string`);
      } else {
        const existing = idsSeen.get(item.id);
        if (existing) {
          errors.push(`${label}: duplicate id "${item.id}" (also in ${existing})`);
        } else {
          idsSeen.set(item.id, label);
        }
        if (data.type === 'pronunciation') pronunciationIds.add(item.id);
      }

      if (!STATUSES.includes(item.status)) {
        errors.push(`${label}: "status" must be "draft" or "reviewed"`);
      }

      if (data.type === 'vocab') {
        errors.push(...validateVocabItem(item, label));
      } else if (data.type === 'particle') {
        errors.push(...validateParticleItem(item, label));
      } else if (data.type === 'pronunciation') {
        errors.push(...validatePronunciationItem(item, label));
      }

      if (item.soundTags !== undefined) {
        if (!isStringArray(item.soundTags)) {
          errors.push(`${label}: "soundTags" must be an array of strings`);
        } else {
          for (const tag of item.soundTags) {
            soundTagRefs.push({ label, tag });
          }
        }
      }
    });
  }

  for (const { label, tag } of soundTagRefs) {
    if (!pronunciationIds.has(tag)) {
      errors.push(`${label}: soundTags references unknown pronunciation id "${tag}"`);
    }
  }

  return { ok: errors.length === 0, errors };
}
