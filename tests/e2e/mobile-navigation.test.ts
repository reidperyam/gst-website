import { test, expect, devices } from '@playwright/test';

// Run these tests with mobile viewport
test.use({ ...devices['iPhone 12'] });

test.describe('Mobile Navigation Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ma-portfolio');
  });

  test('should display responsive layout on mobile', async ({ page }) => {
    // Check viewport is mobile
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeLessThan(500);

    // Page should be visible
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should have touchable buttons on mobile', async ({ page }) => {
    // Find buttons
    const buttons = page.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);

    // First button should be visible and enabled
    const firstButton = buttons.first();
    await expect(firstButton).toBeVisible();
    await expect(firstButton).toBeEnabled();
  });

  test('should allow scrolling portfolio on mobile', async ({ page }) => {
    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 300));

    // Get scroll position
    const scrollPos = await page.evaluate(() => window.scrollY);
    expect(scrollPos).toBeGreaterThan(0);

    // Should be able to scroll back up
    await page.evaluate(() => window.scrollBy(0, -300));

    const newScrollPos = await page.evaluate(() => window.scrollY);
    expect(newScrollPos).toBeLessThan(scrollPos);
  });

  test('should display search box on mobile', async ({ page }) => {
    // Search input should be visible
    const searchInput = page.locator('[data-testid="portfolio-search-input"]');
    await expect(searchInput).toBeVisible();

    const box = await searchInput.boundingBox();
    expect(box).toBeTruthy();
  });

  test('should open filter drawer on mobile', async ({ page }) => {
    // Click filter toggle
    const filterToggle = page.locator('[data-testid="portfolio-filter-toggle"]');
    await expect(filterToggle).toBeVisible();
    await filterToggle.click();

    // Drawer should open
    const drawer = page.locator('[data-testid="portfolio-filter-drawer"]');
    await expect(drawer).toBeVisible({ timeout: 5000 });
  });

  test('should allow typing in search on mobile', async ({ page }) => {
    // Focus search input
    const searchInput = page.locator('[data-testid="portfolio-search-input"]');
    await expect(searchInput).toBeVisible();

    // Clear and type
    await searchInput.fill('');
    await searchInput.type('fintech', { delay: 50 });

    // Value should update
    const value = await searchInput.inputValue();
    expect(value).toContain('fintech');
  });

  test('should allow project card click on mobile', async ({ page }) => {
    // Find first project card
    const card = page.locator('[data-testid="project-card"]').first();
    await expect(card).toBeVisible();

    // Click card
    await card.click();

    // Modal should open
    const modal = page.locator('[data-testid="project-modal"]');
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  test('should display modal full width on mobile', async ({ page }) => {
    // Open modal
    const card = page.locator('[data-testid="project-card"]').first();
    await expect(card).toBeVisible();
    await card.click();

    const modal = page.locator('[data-testid="project-modal"]');
    await expect(modal).toBeVisible({ timeout: 5000 });

    const box = await modal.boundingBox();
    const viewport = page.viewportSize();

    // Modal should take up most of viewport width
    expect(box).toBeTruthy();
    if (box && viewport) {
      expect(box.width / viewport.width).toBeGreaterThan(0.7);
    }
  });

  test('should close modal easily on mobile', async ({ page }) => {
    // Open modal
    const card = page.locator('[data-testid="project-card"]').first();
    await expect(card).toBeVisible();
    await card.click();

    const modal = page.locator('[data-testid="project-modal"]');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Close button should be accessible
    const closeBtn = page.locator('[data-testid="project-modal-close"]');
    await expect(closeBtn).toBeVisible();

    const closeBox = await closeBtn.boundingBox();
    expect(closeBox).toBeTruthy();

    // Should be large enough to tap
    if (closeBox) {
      expect(closeBox.height).toBeGreaterThan(30);
    }
  });

  test('should handle vertical scrolling in modal on mobile', async ({ page }) => {
    // Open modal
    const card = page.locator('[data-testid="project-card"]').first();
    await expect(card).toBeVisible();
    await card.click();

    const modal = page.locator('[data-testid="project-modal"]');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Should be able to scroll within modal
    await page.evaluate(() => {
      const modal = document.querySelector('[data-testid="project-modal"]');
      if (modal) {
        modal.scrollTop = 100;
      }
    });

    const scrolled = await page.evaluate(() => {
      const modal = document.querySelector('[data-testid="project-modal"]');
      return modal ? modal.scrollTop : 0;
    });

    expect(scrolled).toBeGreaterThan(0);
  });

  test('should maintain functionality with touch gestures', async ({ page }) => {
    // Find interactive button
    const buttons = page.locator('button');
    const firstButton = buttons.first();

    await expect(firstButton).toBeVisible();

    // Tap button
    await firstButton.tap();

    // Page should still be functional
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should handle orientation change gracefully', async ({ page }) => {
    // Simulate orientation change (landscape)
    await page.setViewportSize({ width: 812, height: 375 });

    // Page should still be functional
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Change back to portrait
    await page.setViewportSize({ width: 375, height: 812 });

    // Page should still work
    await expect(body).toBeVisible();
  });

  test('should have readable text on mobile', async ({ page }) => {
    // Check font size is reasonable on first button
    const firstButton = page.locator('button').first();
    await expect(firstButton).toBeVisible();

    const fontSize = await firstButton.evaluate(el => {
      return window.getComputedStyle(el).fontSize;
    });

    // Font should be at least 12px
    const size = parseInt(fontSize);
    expect(size).toBeGreaterThanOrEqual(12);
  });
});
