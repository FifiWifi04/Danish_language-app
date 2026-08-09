import { test, expect } from '@playwright/test';

test('flag: flagging a card surfaces it in the Stats copyable block', async ({ page }) => {
  await page.goto('?e2eDeck=1');

  const card = page.locator('.review-card');
  await expect(card).toBeVisible();
  await card.click(); // reveal fixture.one's back

  await page.getByRole('button', { name: '🚩 Flag' }).click();
  await page.getByRole('button', { name: 'Content wrong' }).click();
  await expect(page.getByText('Flagged: content')).toBeVisible();

  // finish the session so the flag persists to the store
  for (let i = 0; i < 3; i++) {
    const c = page.locator('.review-card');
    await expect(c).toBeVisible();
    await c.click();
    await page.getByRole('button', { name: 'Good' }).click();
  }
  await expect(page.getByText('Session complete')).toBeVisible();

  await page.getByRole('button', { name: 'Stats' }).click();

  const textarea = page.locator('.flagged-block textarea');
  await expect(textarea).toHaveValue('fixture.one: content');
});
