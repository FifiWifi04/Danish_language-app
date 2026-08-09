import { test, expect } from '@playwright/test';

interface StoreProgress {
  id: string;
  state: string;
  reps: number;
}

const SPELL_PROGRESS = {
  id: 'fixture.two',
  state: 'review',
  step: 0,
  reps: 2,
  lapses: 0,
  ease: 2.5,
  intervalDays: 6,
  dueDay: 0,
  dueMinute: null,
  isLeech: false,
  contentHash: 'fixture-two',
  flagged: null,
};

async function seedModeBCard(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('?e2eDeck=1');
  await expect(page.locator('.review-card')).toBeVisible();
  await page.evaluate(async (progress) => {
    const w = window as unknown as { __e2eStore?: { put(p: unknown): Promise<void> } };
    if (!w.__e2eStore) throw new Error('e2e store not exposed');
    await w.__e2eStore.put(progress);
  }, SPELL_PROGRESS);
  await page.reload();
}

test('spell: typing oe for ø is accepted as an exact match', async ({ page }) => {
  await seedModeBCard(page);

  const input = page.getByLabel('Danish spelling');
  await expect(input).toBeVisible();
  await input.fill('toe'); // fixture.two's danish is "tø" — oe→ø equivalence

  await page.getByRole('button', { name: 'Check answer' }).click();

  // Accepted: session advances past the spelling card to the next (normal reveal) card.
  await expect(page.locator('.review-card')).toBeVisible();

  const progress = await page.evaluate(async () => {
    const w = window as unknown as { __e2eStore?: { all(): Promise<StoreProgress[]> } };
    if (!w.__e2eStore) throw new Error('e2e store not exposed');
    return w.__e2eStore.all();
  });
  const updated = progress.find((p) => p.id === 'fixture.two');
  expect(updated?.state).toBe('review');
  expect(updated?.reps).toBe(3); // row 8: reps+1 on a Good review answer
});

test('spell: a mismatch shows a diff and lets the user self-rate', async ({ page }) => {
  await seedModeBCard(page);

  const input = page.getByLabel('Danish spelling');
  await input.fill('forkert');
  await page.getByRole('button', { name: 'Check answer' }).click();

  await expect(page.locator('.spell-char-wrong').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Again' })).toBeVisible();

  await page.getByRole('button', { name: 'Hard' }).click();
  await expect(page.locator('.review-card')).toBeVisible();

  const progress = await page.evaluate(async () => {
    const w = window as unknown as { __e2eStore?: { all(): Promise<StoreProgress[]> } };
    if (!w.__e2eStore) throw new Error('e2e store not exposed');
    return w.__e2eStore.all();
  });
  const updated = progress.find((p) => p.id === 'fixture.two');
  expect(updated?.state).toBe('review'); // row 9: hard is not a lapse, stays in review
  expect(updated?.reps).toBe(3);
});
