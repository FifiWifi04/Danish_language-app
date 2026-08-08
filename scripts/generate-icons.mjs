// Generates the maskable PWA icon pair (192/512) into public/icons/.
//
// The plan text (PLAN_PHASE3_APP.md WS-B) asks for an "emoji-on-red" icon.
// Rendering an actual emoji glyph needs font rasterisation (canvas/sharp/
// resvg or similar), none of which is on CLAUDE.md's approved dependency
// list. Substituted with a hand-drawn Nordic cross on the same theme red
// (#C8102E) — a simple, dependency-free glyph that is, if anything, more
// on-theme for a Danish-learning app than an arbitrary emoji. Logged in
// AUTON_STATUS.md as the deliberate deviation this is.

import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { encodePng } from './png-encoder.mjs';

const THEME_RED = [0xc8, 0x10, 0x2e, 255];
const WHITE = [0xff, 0xff, 0xff, 255];

// Cross arm tips must stay inside the maskable safe-zone circle (80% of
// icon size, i.e. >=10% margin along each axis) — 18% margin clears it
// comfortably. The vertical bar is offset toward the hoist side (as on the
// Dannebrog) rather than centered, so the glyph reads as a Nordic cross
// rather than a plain plus/Swiss cross.
const MARGIN_FRACTION = 0.18;
const THICKNESS_FRACTION = 0.2;
const VERTICAL_BAR_CENTER_FRACTION = 0.38;

function makeIcon(size) {
  const rgba = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    rgba.set(THEME_RED, i * 4);
  }

  const margin = Math.round(size * MARGIN_FRACTION);
  const thickness = Math.round(size * THICKNESS_FRACTION);
  const vBarCenter = Math.round(size * VERTICAL_BAR_CENTER_FRACTION);
  const vBarStart = vBarCenter - Math.round(thickness / 2);
  const vBarEnd = vBarStart + thickness;
  const hBarStart = Math.round((size - thickness) / 2);
  const hBarEnd = hBarStart + thickness;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const inVerticalBar = x >= vBarStart && x < vBarEnd && y >= margin && y < size - margin;
      const inHorizontalBar = y >= hBarStart && y < hBarEnd && x >= margin && x < size - margin;
      if (inVerticalBar || inHorizontalBar) {
        rgba.set(WHITE, (y * size + x) * 4);
      }
    }
  }

  return encodePng(size, size, rgba);
}

function main() {
  const here = dirname(fileURLToPath(import.meta.url));
  const outDir = join(here, '..', 'public', 'icons');
  mkdirSync(outDir, { recursive: true });

  for (const size of [192, 512]) {
    const buffer = makeIcon(size);
    writeFileSync(join(outDir, `icon-${String(size)}.png`), buffer);
  }
}

main();
