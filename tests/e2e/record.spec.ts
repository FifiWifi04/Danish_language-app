import { test, expect } from '@playwright/test';

test.use({ permissions: ['microphone'] });

test('record: recording yourself enables the "yours" replay button', async ({ page }) => {
  await page.goto('?e2eDeck=1');

  const card = page.locator('.review-card');
  await expect(card).toBeVisible();
  await card.click(); // fixture.one ("et") — has a clip, so the record control renders alongside it

  const recordButton = page.locator('.record-button');
  const yoursButton = page.locator('.record-yours-button');
  await expect(recordButton).toBeVisible();
  await expect(yoursButton).toBeDisabled();

  await recordButton.click();
  await expect(recordButton).toHaveText('⏹ Stop recording');
  await recordButton.click(); // manual early stop, well under the 5s cap

  await expect(yoursButton).toBeEnabled();
});
