import { test, expect } from '@playwright/test';

// Uses the real production deck (not the e2e fixture) — the fixture lives
// under public/e2e-fixtures and is deliberately excluded from the
// production precache (vite.config.ts globIgnores) so test-only content
// never ships to real users. The production deck is bundled straight into
// the JS chunk, so it's already offline-available without that fixture.
test('pwa: shell and a session are available fully offline after first visit', async ({
  page,
  context,
}) => {
  await page.goto('');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });

  await context.setOffline(true);
  await page.reload();

  await expect(page.locator('nav button')).toHaveCount(3);
  await expect(page.locator('.review-card')).toBeVisible();
});
