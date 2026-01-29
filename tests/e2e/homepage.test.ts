import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');

    // Verify the page loaded
    const pageTitle = page.locator('title');
    await expect(pageTitle).toBeTruthy();

    // Verify body exists
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should have main content', async ({ page }) => {
    await page.goto('/');

    // Basic check that page has some content
    const html = await page.content();
    expect(html.length).toBeGreaterThan(100);
  });
});
