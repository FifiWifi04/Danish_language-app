import { test, expect } from '@playwright/test';

test('stats: after a session, the Stats tab shows a streak and the session row', async ({ page }) => {
  await page.goto('?e2eDeck=1');

  for (let i = 0; i < 3; i++) {
    const card = page.locator('.review-card');
    await expect(card).toBeVisible();
    await card.click();
    await page.getByRole('button', { name: 'Good' }).click();
  }
  await expect(page.getByText('Session complete')).toBeVisible();

  await page.getByRole('button', { name: 'Stats' }).click();

  await expect(page.getByText(/^Streak: [1-9]\d* days?$/)).toBeVisible();
  await expect(page.locator('.session-row')).toHaveCount(1);
  await expect(page.locator('.session-row').first()).toContainText('3 reviewed');
});
