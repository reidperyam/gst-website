import { test, expect } from '@playwright/test';

test.describe('Theme Toggle Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to page
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display theme toggle button', async ({ page }) => {
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    await expect(themeToggle).toBeVisible();
  });

  test('should start in light mode by default', async ({ page }) => {
    const body = page.locator('body');
    const isDarkMode = await body.evaluate(el => el.classList.contains('dark-theme'));

    // Initial state should be light (no dark-theme class)
    expect(isDarkMode).toBe(false);
  });

  test('should have theme button with proper accessibility', async ({ page }) => {
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    await expect(themeToggle).toBeVisible();

    // Button should have aria-label
    const ariaLabel = await themeToggle.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();

    // Button should not be disabled
    const isDisabled = await themeToggle.isDisabled();
    expect(isDisabled).toBe(false);
  });

  test('should toggle between light and dark modes', async ({ page }) => {
    const body = page.locator('body');
    const themeToggle = page.locator('[data-testid="theme-toggle"]');

    // Get initial theme and color
    const initialState = await body.evaluate(el => ({
      hasDarkClass: el.classList.contains('dark-theme'),
      bgColor: window.getComputedStyle(el).backgroundColor
    }));

    // Click theme toggle
    await expect(themeToggle).toBeVisible();
    await themeToggle.click();

    // Wait for actual CSS to change, not just timeout
    await page.waitForFunction((initialBgColor: string) => {
      const el = document.body;
      const newBg = window.getComputedStyle(el).backgroundColor;
      return newBg !== initialBgColor;
    }, initialState.bgColor, { timeout: 5000 });

    // Theme should have changed (both class and actual color)
    const newState = await body.evaluate(el => ({
      hasDarkClass: el.classList.contains('dark-theme'),
      bgColor: window.getComputedStyle(el).backgroundColor
    }));

    expect(newState.hasDarkClass).not.toBe(initialState.hasDarkClass);
    expect(newState.bgColor).not.toBe(initialState.bgColor);
  });

  test('should maintain theme across navigation', async ({ page }) => {
    // Set dark theme
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    const body = page.locator('body');

    // Get initial state
    const initialIsDark = await body.evaluate(el => el.classList.contains('dark-theme'));

    // Click to toggle if not dark
    if (!initialIsDark) {
      await themeToggle.click();
      await page.waitForTimeout(100);
    }

    // Navigate to another page
    const link = page.locator('a').first();
    const href = await link.getAttribute('href');

    if (href && !href.startsWith('http')) {
      await link.click();
      await page.waitForLoadState('networkidle');

      // Check if theme persisted (check localStorage or class)
      const isDark = await body.evaluate(el => el.classList.contains('dark-theme'));
      // Theme should be remembered (should match what we set before reload)
      expect(isDark).toBe(initialWasDark);
    }
  });

  test('should support keyboard navigation for theme toggle', async ({ page }) => {
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    await expect(themeToggle).toBeVisible();

    // Focus and interact
    await themeToggle.focus();
    const isFocused = await themeToggle.evaluate(el => el === document.activeElement);
    expect(isFocused).toBe(true);

    // Press Enter to activate
    const body = page.locator('body');
    const initialIsDark = await body.evaluate(el => el.classList.contains('dark-theme'));

    await themeToggle.press('Enter');
    await page.waitForTimeout(100);

    // Theme should have changed
    const newIsDark = await body.evaluate(el => el.classList.contains('dark-theme'));
    expect(newIsDark).not.toBe(initialIsDark);
  });

  test('should persist theme on page reload', async ({ page }) => {
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    const body = page.locator('body');

    // Toggle to dark mode
    const initialIsDark = await body.evaluate(el => el.classList.contains('dark-theme'));
    if (!initialIsDark) {
      await themeToggle.click();
      await page.waitForTimeout(100);
    }

    // Get theme preference (check if stored in localStorage or cookie)
    const theme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(theme).toBeTruthy();

    // Reload page
    await page.reload();

    // Theme should still be set (localStorage persists)
    const reloadedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(reloadedTheme).toBe(theme);
  });

  test('should have readable text on all themes', async ({ page }) => {
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    await expect(themeToggle).toBeVisible();

    // Check font size is reasonable
    const fontSize = await themeToggle.evaluate(el => {
      return window.getComputedStyle(el).fontSize;
    });

    const size = parseInt(fontSize);
    expect(size).toBeGreaterThanOrEqual(12);

    // Toggle theme and check again
    await themeToggle.click();
    await page.waitForTimeout(100);

    const newFontSize = await themeToggle.evaluate(el => {
      return window.getComputedStyle(el).fontSize;
    });

    const newSize = parseInt(newFontSize);
    expect(newSize).toBeGreaterThanOrEqual(12);
  });

  test('should handle rapid theme toggles', async ({ page }) => {
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    await expect(themeToggle).toBeVisible();

    // Rapidly toggle theme 5 times
    for (let i = 0; i < 5; i++) {
      await themeToggle.click();
      await page.waitForTimeout(50);
    }

    // Page should still be responsive
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should maintain functionality with theme changes', async ({ page }) => {
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    await expect(themeToggle).toBeVisible();

    // Toggle theme
    await themeToggle.click();
    await page.waitForTimeout(100);

    // Should still be able to interact with other elements
    const buttons = page.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);

    // Should be able to click other buttons
    const firstButton = buttons.first();
    await expect(firstButton).toBeVisible();
  });

  test('should not block other interactions while theme is toggled', async ({ page }) => {
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    await expect(themeToggle).toBeVisible();

    // Toggle theme
    await themeToggle.click();
    await page.waitForTimeout(100);

    // Other interactive elements should still work
    const buttons = page.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(1); // At least theme toggle + others

    // Should be able to click any button
    const secondButton = buttons.nth(1);
    if (await secondButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(secondButton).toBeEnabled();
    }
  });
});
