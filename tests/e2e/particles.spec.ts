import { test, expect } from '@playwright/test';

test('particles: a particle card appears in the queue, reveals its pairs, and rates', async ({ page }) => {
  await page.goto('?e2eDeck=1&e2eParticles=1');

  // Queue order (priority, then deck index): fixture.one, fixture.particle.da, fixture.two, fixture.three.
  const first = page.locator('.review-card');
  await expect(first).toBeVisible();
  await first.click();
  await page.getByRole('button', { name: 'Good' }).click();

  const particleCard = page.locator('.particle-card');
  await expect(particleCard).toBeVisible();
  await expect(particleCard).toContainText('da');
  await expect(particleCard).toContainText('Kom nu.');

  await particleCard.click();
  await expect(page.locator('.particle-pairs')).toContainText('Kom nu da.');
  await expect(page.locator('.particle-pairs')).toContainText('Fixture effect one.');
  await expect(page.locator('.particle-pairs')).toContainText('Han er her da ikke!');
  await page.getByRole('button', { name: 'Good' }).click();

  for (let i = 0; i < 2; i++) {
    const card = page.locator('.review-card');
    await expect(card).toBeVisible();
    await card.click();
    await page.getByRole('button', { name: 'Good' }).click();
  }

  await expect(page.locator('.review-card')).toHaveCount(0);
  await expect(page.getByText('Session complete')).toBeVisible();
});
