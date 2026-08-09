import { test, expect } from '@playwright/test';

test('audio: the play button appears and plays a clip when the manifest has one', async ({ page }) => {
  await page.goto('?e2eDeck=1');

  const card = page.locator('.review-card');
  await expect(card).toBeVisible();
  await card.click(); // fixture.one ("et") — the fixture manifest has a clip for it

  const playButton = page.getByRole('button', { name: '🔊 Play' });
  await expect(playButton).toBeVisible();
  await playButton.click();

  await expect
    .poll(() =>
      page.evaluate(() => {
        const w = window as unknown as { __e2eAudio?: () => HTMLAudioElement | null };
        return w.__e2eAudio?.()?.paused;
      }),
    )
    .toBe(false);
});

test('audio: the play button stays hidden when the manifest has no clip for the card', async ({ page }) => {
  await page.goto('?e2eDeck=1');

  const card = page.locator('.review-card');
  await expect(card).toBeVisible();
  await card.click(); // fixture.one ("et") — has a clip, rate it away first
  await page.getByRole('button', { name: 'Good' }).click();

  await expect(card).toBeVisible();
  await card.click(); // fixture.two ("to") — no clip in the fixture manifest

  await expect(page.getByRole('button', { name: 'Good' })).toBeVisible(); // back side revealed
  await expect(page.getByRole('button', { name: '🔊 Play' })).toBeHidden();
});
