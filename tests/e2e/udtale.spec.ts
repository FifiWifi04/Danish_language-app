import { test, expect } from '@playwright/test';

test('udtale: opening "stød" from the list shows its mechanics steps', async ({ page }) => {
  await page.goto('?e2eDeck=1');
  await page.getByRole('button', { name: 'Udtale' }).click();

  await page.getByRole('button', { name: /Stød/ }).click();
  await expect(page.locator('.mechanics-steps li').first()).toBeVisible();
});

test('udtale: a soundTag chip on a card back navigates to the matching detail view', async ({ page }) => {
  await page.goto('?e2eDeck=1');

  const card = page.locator('.review-card');
  await expect(card).toBeVisible();
  await card.click();

  await page.getByRole('button', { name: 'stoed', exact: true }).click();
  await expect(page.locator('h3')).toContainText('Stød');
  await expect(page.locator('.mechanics-steps li').first()).toBeVisible();
});
