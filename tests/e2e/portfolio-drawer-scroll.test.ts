import { test, expect } from '@playwright/test';
import { openFilterDrawer } from './helpers/portfolio';

test.describe('Filter Drawer Background Scroll - MA Portfolio Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ma-portfolio', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => (window as any).__portfolioInitialized === true, {
      timeout: 10000,
    });
  });

  test('should allow background scrolling while filter drawer is open', async ({ page }) => {
    // 1. Record initial scroll position
    const initialScrollY = await page.evaluate(() => window.scrollY);

    // 2. Open the filter drawer
    await openFilterDrawer(page);

    // 3. Verify body overflow is NOT locked
    const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(bodyOverflow).not.toBe('hidden');

    // 4. Scroll the page via mouse wheel
    await page.mouse.wheel(0, 300);

    // 5. Wait for scroll position to change
    await page.waitForFunction((initialY: number) => window.scrollY > initialY, initialScrollY, {
      timeout: 5000,
    });

    // 6. Verify the page actually scrolled
    const newScrollY = await page.evaluate(() => window.scrollY);
    expect(newScrollY).toBeGreaterThan(initialScrollY);

    // 7. Verify drawer is still open (scrolling didn't close it)
    const drawerStillOpen = await page.evaluate(() => {
      const drawer = document.querySelector('[data-testid="portfolio-filter-drawer"]');
      return drawer?.classList.contains('open');
    });
    expect(drawerStillOpen).toBe(true);
  });

  test('should keep overlay pointer-events none when drawer is open', async ({ page }) => {
    await openFilterDrawer(page);

    // Verify the overlay does not intercept pointer events
    const pointerEvents = await page.evaluate(() => {
      const overlay = document.querySelector('[data-testid="portfolio-filter-overlay"]');
      if (!overlay) return null;
      return window.getComputedStyle(overlay).pointerEvents;
    });
    expect(pointerEvents).toBe('none');
  });

  test('should close drawer via click outside (document-level handler)', async ({ page }) => {
    await openFilterDrawer(page);

    // Verify drawer is open
    const drawerOpen = await page.evaluate(() => {
      const drawer = document.querySelector('[data-testid="portfolio-filter-drawer"]');
      return drawer?.classList.contains('open');
    });
    expect(drawerOpen).toBe(true);

    // Click on an area outside the drawer (left side of viewport)
    await page.mouse.click(50, 300);

    // Wait for the drawer to close
    await page.waitForFunction(
      () => {
        const drawer = document.querySelector('[data-testid="portfolio-filter-drawer"]');
        return drawer && !drawer.classList.contains('open');
      },
      { timeout: 5000 }
    );

    // Verify drawer is closed
    const drawerClosed = await page.evaluate(() => {
      const drawer = document.querySelector('[data-testid="portfolio-filter-drawer"]');
      return !drawer?.classList.contains('open');
    });
    expect(drawerClosed).toBe(true);

    // Verify aria-expanded is false on the toggle
    const ariaExpanded = await page
      .locator('[data-testid="portfolio-filter-toggle"]')
      .getAttribute('aria-expanded');
    expect(ariaExpanded).toBe('false');
  });

  test('should close drawer via Escape key', async ({ page }) => {
    await openFilterDrawer(page);

    // Verify drawer is open
    const drawerOpen = await page.evaluate(() => {
      const drawer = document.querySelector('[data-testid="portfolio-filter-drawer"]');
      return drawer?.classList.contains('open');
    });
    expect(drawerOpen).toBe(true);

    // Press Escape
    await page.keyboard.press('Escape');

    // Wait for the drawer to close
    await page.waitForFunction(
      () => {
        const drawer = document.querySelector('[data-testid="portfolio-filter-drawer"]');
        return drawer && !drawer.classList.contains('open');
      },
      { timeout: 5000 }
    );

    // Verify drawer is closed
    const drawerClosed = await page.evaluate(() => {
      const drawer = document.querySelector('[data-testid="portfolio-filter-drawer"]');
      return !drawer?.classList.contains('open');
    });
    expect(drawerClosed).toBe(true);
  });
});
