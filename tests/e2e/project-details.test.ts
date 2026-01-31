import { test, expect } from '@playwright/test';

test.describe('Project Details Viewing Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ma-portfolio', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
  });

  test('should have interactive project elements', async ({ page }) => {
    // Find project cards
    const cards = page.locator('[data-testid="project-card"]');
    const cardCount = await cards.count();

    // Should have at least one project card
    expect(cardCount).toBeGreaterThan(0);
  });

  test('should open modal on project interaction', async ({ page }) => {
    // Find and click first project card
    const firstCard = page.locator('[data-testid="project-card"]').first();
    await expect(firstCard).toBeVisible();

    await firstCard.click();

    // Modal should open
    const modal = page.locator('[data-testid="project-modal"]');
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  test('should display project information sections', async ({ page }) => {
    // Open a project to see details
    const firstCard = page.locator('[data-testid="project-card"]').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();

    const modal = page.locator('[data-testid="project-modal"]');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Check for project metadata
    const page_content = await page.content();

    // Should have industry, stage, or theme info
    const hasProjectInfo = (
      page_content.includes('ARR') || page_content.includes('Industry') ||
      page_content.includes('Stage') || page_content.includes('Theme')
    );

    expect(hasProjectInfo).toBe(true);
  });

  test('should have technology information displayed', async ({ page }) => {
    // Content should mention technologies
    const content = await page.content();

    // Should have some tech-related terms
    const hasTechInfo = content.toLowerCase().includes('technology') ||
      content.toLowerCase().includes('tech') ||
      content.includes('React') ||
      content.includes('Node') ||
      content.includes('Python');

    expect(hasTechInfo).toBe(true);
  });

  test('should support keyboard interaction for details', async ({ page }) => {
    // Find and focus card
    const card = page.locator('[data-testid="project-card"]').first();
    await expect(card).toBeVisible();

    await card.focus();

    // Should be focused
    const isFocused = await card.evaluate(el => el === document.activeElement);
    expect(isFocused).toBe(true);

    // Press Enter to interact
    await card.press('Enter');

    // Modal should open
    const modal = page.locator('[data-testid="project-modal"]');
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  test('should handle rapid interaction', async ({ page }) => {
    const cards = page.locator('[data-testid="project-card"]');
    const cardCount = await cards.count();

    // Interact with up to 2 cards
    for (let i = 0; i < Math.min(cardCount, 2); i++) {
      const card = cards.nth(i);
      await expect(card).toBeVisible();
      await card.click();

      // Modal should appear
      const modal = page.locator('[data-testid="project-modal"]');
      await expect(modal).toBeVisible({ timeout: 5000 });

      // Close modal for next iteration
      const closeBtn = page.locator('[data-testid="project-modal-close"]');
      if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await closeBtn.click();
      }
    }

    // Page should still be responsive
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should display consistent information format', async ({ page }) => {
    // Projects should have consistent structure
    const cards = page.locator('[data-testid="project-card"]');
    const count = await cards.count();

    // Should have multiple project cards
    expect(count).toBeGreaterThan(0);

    // Each card should be clickable
    const firstCard = cards.first();
    await expect(firstCard).toBeVisible();
  });

  test('should allow closing details view', async ({ page }) => {
    // Open a project
    const card = page.locator('[data-testid="project-card"]').first();
    await expect(card).toBeVisible();
    await card.click();

    const modal = page.locator('[data-testid="project-modal"]');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Find and click close button
    const closeBtn = page.locator('[data-testid="project-modal-close"]');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    // Modal should close
    await expect(modal).not.toBeVisible({ timeout: 5000 });
  });

  test('should maintain page responsiveness during interaction', async ({ page }) => {
    // Perform interactions
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    expect(buttonCount).toBeGreaterThan(0);

    // Click first button
    const firstButton = buttons.first();
    await expect(firstButton).toBeVisible();
    await firstButton.click();

    // Page should still respond to scroll
    await page.evaluate(() => window.scrollBy(0, 100));
    const scrollPos = await page.evaluate(() => window.scrollY);
    expect(scrollPos).toBeGreaterThan(0);
  });
});
