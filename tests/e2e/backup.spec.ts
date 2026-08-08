import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

interface ExportPayload {
  v: number;
  progress: { id: string; state: string }[];
}

test('backup: export, clear, import restores progress', async ({ page }) => {
  await page.goto('?e2eDeck=1');

  for (let i = 0; i < 3; i++) {
    const card = page.locator('.review-card');
    await expect(card).toBeVisible();
    await card.click();
    await page.getByRole('button', { name: 'Good' }).click();
  }
  await expect(page.getByText('Session complete')).toBeVisible();

  await page.getByRole('button', { name: 'Stats' }).click();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export backup' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^danmarksliv-backup-\d{4}-\d{2}-\d{2}\.json$/);
  const path = await download.path();
  if (!path) throw new Error('download had no path');
  const exported = JSON.parse(await readFile(path, 'utf-8')) as ExportPayload;
  expect(exported.progress.map((p) => p.id).sort()).toEqual(['fixture.one', 'fixture.three', 'fixture.two']);

  // Clear progress via the store already exposed for e2e (a page script,
  // not the UI) so the import step below has something to restore.
  await page.evaluate(async () => {
    const w = window as unknown as { __e2eStore?: { importAll(json: string): Promise<void> } };
    if (!w.__e2eStore) throw new Error('e2e store not exposed');
    await w.__e2eStore.importAll(JSON.stringify({ v: 1, exportedAt: 0, progress: [], sessionLog: [] }));
  });

  await page.reload();
  await page.getByRole('button', { name: 'Stats' }).click();

  page.once('dialog', (dialog) => void dialog.accept());
  await page.locator('input[type=file]').setInputFiles(path);

  await expect(page.getByText('Import complete.')).toBeVisible();

  const restored = await page.evaluate(async () => {
    const w = window as unknown as { __e2eStore?: { all(): Promise<{ id: string }[]> } };
    if (!w.__e2eStore) throw new Error('e2e store not exposed');
    return w.__e2eStore.all();
  });
  expect(restored.map((p) => p.id).sort()).toEqual(['fixture.one', 'fixture.three', 'fixture.two']);
});
