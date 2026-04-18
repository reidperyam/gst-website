import { test, expect } from '@playwright/test';

/**
 * Dispatch a pointerdown on the theme toggle button.
 * Uses dispatchEvent to avoid Playwright's coordinate hit-testing issues
 * with the oversized bounding box on the toggle button.
 */
async function pressDown(page: import('@playwright/test').Page): Promise<void> {
  await page.evaluate(() => {
    document
      .getElementById('themeToggle')
      ?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
  });
}

/** Dispatch a pointerup on the theme toggle button. */
async function pressUp(page: import('@playwright/test').Page): Promise<void> {
  await page.evaluate(() => {
    document
      .getElementById('themeToggle')
      ?.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
  });
}

/** Dispatch a click on the theme toggle button (fires after pointerup in real interactions). */
async function clickToggle(page: import('@playwright/test').Page): Promise<void> {
  await page.evaluate(() => {
    document
      .getElementById('themeToggle')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

/** Check whether the holding animation class is present. */
async function hasHoldingClass(page: import('@playwright/test').Page): Promise<boolean> {
  return page.evaluate(
    () =>
      document.getElementById('themeToggle')?.classList.contains('theme-toggle--holding') ?? false
  );
}

// ─── All-browser tests (interaction logic, no haptic assertions) ─────────────

test.describe('Theme Toggle — Long-Press Easter Egg', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure palette is not popped out
    await page.addInitScript(() => localStorage.removeItem('palette-popped-out'));
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-testid="theme-toggle"]')).toBeVisible();
  });

  test('short click still toggles theme', async ({ page }) => {
    const before = await page.evaluate(() =>
      document.documentElement.classList.contains('dark-theme')
    );

    await pressDown(page);
    await page.waitForTimeout(100);
    await pressUp(page);
    await clickToggle(page);

    await page.waitForFunction(
      (was: boolean) => document.documentElement.classList.contains('dark-theme') !== was,
      before
    );

    const after = await page.evaluate(() =>
      document.documentElement.classList.contains('dark-theme')
    );
    expect(after).not.toBe(before);
  });

  test('long-press pops out palette panel and does not toggle theme', async ({ page }) => {
    const themeBefore = await page.evaluate(() =>
      document.documentElement.classList.contains('dark-theme')
    );

    await pressDown(page);

    // Wait for the long-press to fire (5s + margin)
    await page.waitForFunction(
      () => document.documentElement.classList.contains('palette-popped-out'),
      undefined,
      { timeout: 7000 }
    );

    await pressUp(page);
    await clickToggle(page);

    // Palette should be popped out
    const isPopped = await page.evaluate(() =>
      document.documentElement.classList.contains('palette-popped-out')
    );
    expect(isPopped).toBe(true);

    // Theme should NOT have toggled (long-press suppresses click)
    const themeAfter = await page.evaluate(() =>
      document.documentElement.classList.contains('dark-theme')
    );
    expect(themeAfter).toBe(themeBefore);
  });

  test('early release cancels popout and toggles theme', async ({ page }) => {
    const before = await page.evaluate(() =>
      document.documentElement.classList.contains('dark-theme')
    );

    await pressDown(page);
    await page.waitForTimeout(2000);
    await pressUp(page);
    await clickToggle(page);

    // Should NOT pop out
    const isPopped = await page.evaluate(() =>
      document.documentElement.classList.contains('palette-popped-out')
    );
    expect(isPopped).toBe(false);

    // Theme SHOULD have toggled
    const after = await page.evaluate(() =>
      document.documentElement.classList.contains('dark-theme')
    );
    expect(after).not.toBe(before);
  });

  test('visual hold feedback appears after 3s', async ({ page }) => {
    await pressDown(page);

    // Well before 3s — no holding class yet
    await page.waitForTimeout(2500);
    expect(await hasHoldingClass(page)).toBe(false);

    // Wait for the holding class to appear (setTimeout at 3s + drift)
    await page.waitForFunction(
      () =>
        document.getElementById('themeToggle')?.classList.contains('theme-toggle--holding') ??
        false,
      undefined,
      { timeout: 2000 }
    );
    expect(await hasHoldingClass(page)).toBe(true);

    await pressUp(page);
    await clickToggle(page);
  });

  test('holding class removed after long-press fires', async ({ page }) => {
    await pressDown(page);

    // Wait for long-press to complete
    await page.waitForFunction(
      () => document.documentElement.classList.contains('palette-popped-out'),
      undefined,
      { timeout: 7000 }
    );

    // Holding class should be removed after popout fires
    expect(await hasHoldingClass(page)).toBe(false);

    await pressUp(page);
    await clickToggle(page);
  });

  test('no-op when palette already popped out', async ({ page }) => {
    // Pop out the palette first
    await page.evaluate(() => {
      localStorage.setItem('palette-popped-out', 'true');
      document.documentElement.classList.add('palette-popped-out');
    });

    const themeBefore = await page.evaluate(() =>
      document.documentElement.classList.contains('dark-theme')
    );

    // Long-press should not trigger easter egg behavior
    await pressDown(page);
    await page.waitForTimeout(5200);

    // No holding class (startPress was never called)
    expect(await hasHoldingClass(page)).toBe(false);

    await pressUp(page);
    await clickToggle(page);

    // Theme should still toggle normally via click
    const themeAfter = await page.evaluate(() =>
      document.documentElement.classList.contains('dark-theme')
    );
    expect(themeAfter).not.toBe(themeBefore);
  });
});

// ─── Chromium-only tests (haptic feedback via navigator.vibrate) ─────────────

test.describe('Theme Toggle — Haptic Feedback (Chromium only)', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Vibration API is Chromium-only');

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem('palette-popped-out'));
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-testid="theme-toggle"]')).toBeVisible();

    // Install a spy on navigator.vibrate to capture calls
    await page.evaluate(() => {
      (window as any).__vibrateCalls = [] as number[];
      navigator.vibrate = (pattern: number | number[]) => {
        const ms = typeof pattern === 'number' ? pattern : pattern[0];
        (window as any).__vibrateCalls.push(ms);
        return true;
      };
    });
  });

  test('haptic pulses fire during hold', async ({ page }) => {
    await pressDown(page);

    // Wait past the 4s mark (4 pulses scheduled at 1s, 2s, 3s, 4s)
    await page.waitForTimeout(4200);

    const calls: number[] = await page.evaluate(() => (window as any).__vibrateCalls);

    // Should have at least 4 haptic pulses (50, 75, 100, 150)
    expect(calls.length).toBeGreaterThanOrEqual(4);
    expect(calls).toContain(50);
    expect(calls).toContain(75);
    expect(calls).toContain(100);
    expect(calls).toContain(150);

    await pressUp(page);
    await clickToggle(page);
  });

  test('success haptic fires at 5s', async ({ page }) => {
    await pressDown(page);

    // Wait for the long-press to complete
    await page.waitForFunction(
      () => document.documentElement.classList.contains('palette-popped-out'),
      undefined,
      { timeout: 7000 }
    );

    const calls: number[] = await page.evaluate(() => (window as any).__vibrateCalls);

    // Should include the 300ms success buzz
    expect(calls).toContain(300);

    await pressUp(page);
    await clickToggle(page);
  });

  test('no haptic calls on short click', async ({ page }) => {
    await pressDown(page);
    await page.waitForTimeout(50);
    await pressUp(page);
    await clickToggle(page);

    // Allow any pending microtasks to flush
    await page.waitForTimeout(100);

    const calls: number[] = await page.evaluate(() => (window as any).__vibrateCalls);
    expect(calls.length).toBe(0);
  });
});
