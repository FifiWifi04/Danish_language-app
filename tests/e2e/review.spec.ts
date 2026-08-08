import { test, expect } from '@playwright/test';

interface ExportPayload {
  v: number;
  progress: { id: string; state: string }[];
}

test('review: completes a 3-card session with the fixture deck', async ({ page }) => {
  await page.goto('?e2eDeck=1');

  for (let i = 0; i < 3; i++) {
    const card = page.locator('.review-card');
    await expect(card).toBeVisible();
    await card.click();
    await page.getByRole('button', { name: 'Good' }).click();
  }

  await expect(page.locator('.review-card')).toHaveCount(0);
  await expect(page.getByText('Session complete')).toBeVisible();

  const exported = await page.evaluate(async () => {
    const w = window as unknown as { __e2eStore?: { exportAll(): Promise<string> } };
    if (!w.__e2eStore) throw new Error('e2e store not exposed');
    return w.__e2eStore.exportAll();
  });
  const payload = JSON.parse(exported) as ExportPayload;

  expect(payload.progress).toHaveLength(3);
  expect(payload.progress.map((p) => p.id).sort()).toEqual([
    'fixture.one',
    'fixture.three',
    'fixture.two',
  ]);
  for (const p of payload.progress) {
    expect(p.state).toBe('learning');
  }
});
