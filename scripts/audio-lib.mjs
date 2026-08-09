// Pure helpers for scripts/build-audio.mjs — no fs, no network. Split out
// so Vitest can exercise the hashing/collection/planning/failure-handling
// logic with fake data (CLAUDE.md rule 4b: scripts/ is plain ESM JS).

import { createHash } from 'node:crypto';

export function hashUtterance(text, voice, provider) {
  return createHash('sha256')
    .update(`${text}|${voice}|${provider}`, 'utf8')
    .digest('hex')
    .slice(0, 16);
}

// files: [{ path, data }] parsed content/*.json files. Collects every
// utterance the plan names: vocab "danish", particle pair sentences,
// pronunciation practice words + minimal pairs (both sides) + example
// sentences. Returns a deduped array (order: first-seen).
export function collectUtterances(files) {
  const seen = new Set();
  for (const { data } of files) {
    if (!data || !Array.isArray(data.items)) continue;
    if (data.type === 'vocab') {
      for (const item of data.items) {
        if (item.danish) seen.add(item.danish);
      }
    } else if (data.type === 'particle') {
      for (const item of data.items) {
        for (const pair of item.pairs ?? []) {
          if (pair.withoutIt) seen.add(pair.withoutIt);
          if (pair.withIt) seen.add(pair.withIt);
        }
      }
    } else if (data.type === 'pronunciation') {
      for (const item of data.items) {
        for (const pw of item.practiceWords ?? []) {
          if (pw.word) seen.add(pw.word);
        }
        for (const mp of item.minimalPairs ?? []) {
          if (mp.a) seen.add(mp.a);
          if (mp.b) seen.add(mp.b);
        }
        if (item.exampleSentence?.danish) seen.add(item.exampleSentence.danish);
      }
    }
  }
  return [...seen];
}

// manifest: { [text]: {filename, voice, provider, generatedAt} }.
// existingFiles: Set<string> of filenames actually present in
// public/audio (passed in so this stays pure — the caller does the fs
// listing). A manifest hit only skips synthesis when the voice+provider
// still match AND the file is still on disk.
export function planSynthesis(utterances, manifest, voice, provider, existingFiles) {
  const toSynthesize = [];
  const skipped = [];
  for (const text of utterances) {
    const hash = hashUtterance(text, voice, provider);
    const filename = `${hash}.mp3`;
    const entry = manifest[text];
    const hit =
      entry && entry.voice === voice && entry.provider === provider && existingFiles.has(entry.filename);
    if (hit) {
      skipped.push(text);
    } else {
      toSynthesize.push({ text, hash, filename });
    }
  }
  return { toSynthesize, skipped };
}

// Runs synthesize(text, voice, key) over every planned item. A failure is
// recorded and processing continues — the manifest only ever gains
// entries for utterances that actually succeeded, so a mid-run crash (or
// a caller that stops after this returns) never leaves a manifest row
// pointing at an mp3 that was never written. `onSuccess(item, buffer)` is
// called for each success so the caller can write the file + persist the
// manifest incrementally; `now` is injectable for deterministic tests.
export async function runSynthesis(toSynthesize, synthesize, voice, provider, key, { onSuccess, now } = {}) {
  const nowFn = now ?? (() => new Date().toISOString());
  const manifestUpdates = {};
  const failures = [];
  for (const item of toSynthesize) {
    try {
      const buffer = await synthesize(item.text, voice, key);
      const entry = { filename: item.filename, voice, provider, generatedAt: nowFn() };
      manifestUpdates[item.text] = entry;
      onSuccess?.(item, buffer, entry);
    } catch (err) {
      failures.push({ text: item.text, error: err instanceof Error ? err.message : String(err) });
    }
  }
  return { manifestUpdates, failures };
}
