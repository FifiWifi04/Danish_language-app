/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { VitePWA } from 'vite-plugin-pwa';

const pkg = JSON.parse(
  readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf-8'),
) as { version: string };

const BASE = '/Danish_language-app/';

export default defineConfig({
  base: BASE,
  define: {
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(pkg.version),
  },
  plugins: [
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,json,mp3}'],
        globIgnores: ['e2e-fixtures/**'],
      },
      manifest: {
        name: 'DanmarksLiv',
        short_name: 'DanmarksLiv',
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        theme_color: '#C8102E',
        background_color: '#C8102E',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts'],
  },
});
