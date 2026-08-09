import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

const PORT = 4173;
const BASE = `http://localhost:${String(PORT)}/Danish_language-app/`;

// This sandbox pre-installs Chromium at a fixed path instead of the version
// @playwright/test would normally download; use it only when present so CI
// and other machines fall back to their own `playwright install`.
const SANDBOX_CHROMIUM = '/opt/pw-browsers/chromium';
const executablePath = existsSync(SANDBOX_CHROMIUM) ? SANDBOX_CHROMIUM : undefined;

export default defineConfig({
  testDir: 'tests/e2e',
  use: {
    baseURL: BASE,
    launchOptions: {
      ...(executablePath ? { executablePath } : {}),
      // PRON WS-D's self-record smoke needs a mic without a real device or a
      // permission-prompt click; harmless to specs that don't touch media.
      args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
    },
  },
  webServer: {
    command: `npm run preview -- --port ${String(PORT)} --strictPort`,
    url: BASE,
    reuseExistingServer: !process.env['CI'],
    timeout: 30_000,
  },
});
