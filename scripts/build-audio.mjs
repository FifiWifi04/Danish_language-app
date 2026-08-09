#!/usr/bin/env node
// Owner-run only (CLAUDE.md rule 7, PLAN_PHASE4_AUDIO.md WS-A): reads a
// TTS key from .env, synthesizes every utterance in content/*.json that
// isn't already in the manifest, and writes public/audio/<hash>.mp3 +
// scripts/audio-manifest.json. Plain ESM JS, run with bare `node`
// (CLAUDE.md rule 4b) — never invoked by the autonomous routine or CI.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { collectUtterances, planSynthesis, runSynthesis } from './audio-lib.mjs';
import { synthesize as fakeSynthesize } from './providers/fake.mjs';
import { synthesize as elevenlabsSynthesize } from './providers/elevenlabs.mjs';

const ROOT = process.cwd();
const CONTENT_DIR = join(ROOT, 'content');
const AUDIO_DIR = join(ROOT, 'public/audio');
// Lives under public/, not scripts/, so PHASE4 WS-B's `src/ui/audio.ts` can
// fetch it at runtime and the PWA precache glob (already covering `json`,
// item 10) picks it up automatically — `scripts/` is never served.
const MANIFEST_PATH = join(ROOT, 'public/audio-manifest.json');

const PROVIDERS = { elevenlabs: elevenlabsSynthesize, fake: fakeSynthesize };

function loadEnv() {
  const envPath = join(ROOT, '.env');
  const fromFile = {};
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const match = /^\s*([A-Z_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (match) fromFile[match[1]] = match[2];
    }
  }
  return {
    provider: process.env.TTS_PROVIDER ?? fromFile.TTS_PROVIDER ?? 'elevenlabs',
    key: process.env.TTS_API_KEY ?? fromFile.TTS_API_KEY ?? '',
    voice: process.env.TTS_VOICE ?? fromFile.TTS_VOICE ?? '',
  };
}

function readContentFiles() {
  if (!existsSync(CONTENT_DIR)) return [];
  return readdirSync(CONTENT_DIR)
    .filter((name) => name.endsWith('.json'))
    .map((name) => ({
      path: join(CONTENT_DIR, name),
      data: JSON.parse(readFileSync(join(CONTENT_DIR, name), 'utf8')),
    }));
}

function readManifest() {
  return existsSync(MANIFEST_PATH) ? JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) : {};
}

function writeManifest(manifest) {
  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
}

async function main() {
  const { provider, key, voice } = loadEnv();
  const synthesize = PROVIDERS[provider];
  if (!synthesize) {
    console.error(`Unknown TTS_PROVIDER "${provider}" — expected one of: ${Object.keys(PROVIDERS).join(', ')}`);
    process.exitCode = 1;
    return;
  }

  const utterances = collectUtterances(readContentFiles());
  const manifest = readManifest();
  mkdirSync(AUDIO_DIR, { recursive: true });
  const existingFiles = new Set(readdirSync(AUDIO_DIR));

  const { toSynthesize, skipped } = planSynthesis(utterances, manifest, voice, provider, existingFiles);
  console.log(
    `${utterances.length} utterance(s): ${skipped.length} already generated, ${toSynthesize.length} to synthesize`,
  );

  const { manifestUpdates, failures } = await runSynthesis(toSynthesize, synthesize, voice, provider, key, {
    onSuccess: (item, buffer, entry) => {
      writeFileSync(join(AUDIO_DIR, item.filename), buffer);
      manifest[item.text] = entry;
      writeManifest(manifest);
    },
  });

  console.log(`Synthesized ${Object.keys(manifestUpdates).length} clip(s).`);

  if (failures.length > 0) {
    console.error(`${failures.length} utterance(s) failed:`);
    for (const failure of failures) console.error(`  - "${failure.text}": ${failure.error}`);
    process.exitCode = 1;
  }
}

main();
