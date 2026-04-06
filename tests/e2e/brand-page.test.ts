import { test, expect } from '@playwright/test';

test.describe('Brand Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/brand', { waitUntil: 'domcontentloaded' });
  });

  test.describe('Page Structure', () => {
    test('should render all 11 content sections', async ({ page }) => {
      const sectionIds = [
        'identity', 'colors', 'typography', 'spacing', 'shadows',
        'transitions', 'components', 'component-states',
        'accessibility', 'responsive-demos', 'ui-library',
      ];
      for (const id of sectionIds) {
        const section = page.locator(`#${id}`);
        await expect(section).toBeAttached();
      }
    });

    test('should set data-palette-always attribute on html', async ({ page }) => {
      const hasAttr = await page.evaluate(() =>
        document.documentElement.hasAttribute('data-palette-always')
      );
      expect(hasAttr).toBe(true);
    });
  });

  test.describe('Table of Contents - Desktop', () => {
    test('should display sidebar TOC with section links', async ({ page }) => {
      const toc = page.getByTestId('brand-toc');
      await expect(toc).toBeVisible();

      const links = page.getByTestId('brand-toc-list').locator('> li a');
      const count = await links.count();
      expect(count).toBeGreaterThanOrEqual(11);
    });

    test('should generate sublists from h3 headings', async ({ page }) => {
      // Wait for JS to build sublists
      await page.waitForFunction(() =>
        document.querySelectorAll('.brand-toc__sublist').length > 0
      );

      // Identity section has 3 h3s (brand-voice, wordmark, logo-usage)
      const identitySubs = page.locator('.brand-toc__layer[data-section="identity"] .brand-toc__sublist li');
      const count = await identitySubs.count();
      expect(count).toBe(3);
    });

    test('should NOT have is-collapsed class on desktop viewport', async ({ page }) => {
      const isCollapsed = await page.evaluate(() =>
        document.querySelector('.brand-toc')?.classList.contains('is-collapsed')
      );
      expect(isCollapsed).toBe(false);
    });
  });

  test.describe('Table of Contents - Mobile', () => {
    test('should start collapsed on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 480, height: 800 });
      // Wait for matchMedia listener to apply collapsed state
      await page.waitForFunction(() =>
        document.querySelector('.brand-toc')?.classList.contains('is-collapsed')
      );
    });

    test('should expand TOC when heading is clicked on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 480, height: 800 });
      await page.waitForFunction(() =>
        document.querySelector('.brand-toc')?.classList.contains('is-collapsed')
      );

      // Click heading to expand
      await page.evaluate(() => {
        document.querySelector('.brand-toc__heading')?.dispatchEvent(
          new MouseEvent('click', { bubbles: true })
        );
      });

      await page.waitForFunction(() =>
        !document.querySelector('.brand-toc')?.classList.contains('is-collapsed')
      );
    });

    test('should collapse TOC again on second click', async ({ page }) => {
      await page.setViewportSize({ width: 480, height: 800 });
      await page.waitForFunction(() =>
        document.querySelector('.brand-toc')?.classList.contains('is-collapsed')
      );

      // Expand
      await page.evaluate(() => {
        document.querySelector('.brand-toc__heading')?.dispatchEvent(
          new MouseEvent('click', { bubbles: true })
        );
      });
      await page.waitForFunction(() =>
        !document.querySelector('.brand-toc')?.classList.contains('is-collapsed')
      );

      // Collapse again
      await page.evaluate(() => {
        document.querySelector('.brand-toc__heading')?.dispatchEvent(
          new MouseEvent('click', { bubbles: true })
        );
      });
      await page.waitForFunction(() =>
        document.querySelector('.brand-toc')?.classList.contains('is-collapsed')
      );
    });
  });

  test.describe('Scroll Spy', () => {
    test('should highlight first section link on initial load', async ({ page }) => {
      await page.waitForFunction(() =>
        document.querySelector('.brand-toc__list a.is-active')?.getAttribute('href') === '#identity'
      );
    });

    test('should only have one active link at a time', async ({ page }) => {
      const activeCount = await page.evaluate(() =>
        document.querySelectorAll('.brand-toc__list a.is-active').length
      );
      expect(activeCount).toBe(1);
    });
  });
});
