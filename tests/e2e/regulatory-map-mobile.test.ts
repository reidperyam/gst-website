import { test, expect, devices } from '@playwright/test';

// Run all tests in this file with iPhone 12 viewport
test.use({ ...devices['iPhone 12'] });

/**
 * Helper: click an SVG path element via dispatchEvent.
 */
async function clickSvgPath(page: import('@playwright/test').Page, selector: string): Promise<void> {
  await page.locator(selector).first().waitFor({ state: 'attached' });
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, selector);
}

/**
 * Wait for D3 map paths to finish rendering.
 */
async function waitForMapReady(page: import('@playwright/test').Page): Promise<void> {
  await page.waitForFunction(() => document.querySelectorAll('.country-path').length > 0);
}

test.describe('Regulatory Map — Mobile UX', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/hub/tools/regulatory-map', { waitUntil: 'networkidle' });
    await waitForMapReady(page);
  });

  test.describe('1. Bottom Sheet Panel', () => {
    test('should open bottom sheet when selecting a region on mobile', async ({ page }) => {
      const panel = page.locator('[data-testid="compliance-panel"]');

      // Two-tap flow: first tap shows tap bar, "View details" opens bottom sheet
      await clickSvgPath(page, '[data-alpha3="BRA"].country-path--active');

      // Tap bar should appear
      const tapBar = page.locator('#mapTapBar');
      await page.waitForFunction(() => {
        const el = document.getElementById('mapTapBar');
        return el && !el.hidden;
      });
      await expect(tapBar).toBeVisible();

      // Click "View details" to open bottom sheet
      await page.locator('#tapBarAction').click();

      // Panel should slide up with bottom-sheet--open class
      await page.waitForFunction(() => {
        const el = document.getElementById('compliancePanel');
        return el && el.classList.contains('bottom-sheet--open');
      });

      // Panel should be visible and contain regulation content
      await expect(panel).toBeVisible();
      const cards = await page.locator('.reg-card').count();
      expect(cards).toBeGreaterThan(0);
    });

    test('should show overlay when bottom sheet opens', async ({ page }) => {
      // Select region via two-tap flow
      await clickSvgPath(page, '[data-alpha3="BRA"].country-path--active');
      await page.waitForFunction(() => {
        const el = document.getElementById('mapTapBar');
        return el && !el.hidden;
      });
      await page.locator('#tapBarAction').click();

      // Overlay should become visible
      await page.waitForFunction(() => {
        const el = document.getElementById('bottomSheetOverlay');
        return el && el.classList.contains('visible');
      });

      const overlay = page.locator('#bottomSheetOverlay');
      await expect(overlay).toBeVisible();
    });

    test('should close bottom sheet when clicking overlay', async ({ page }) => {
      // Open bottom sheet
      await clickSvgPath(page, '[data-alpha3="BRA"].country-path--active');
      await page.waitForFunction(() => {
        const el = document.getElementById('mapTapBar');
        return el && !el.hidden;
      });
      await page.locator('#tapBarAction').click();
      await page.waitForFunction(() => {
        const el = document.getElementById('compliancePanel');
        return el && el.classList.contains('bottom-sheet--open');
      });

      // Click overlay to dismiss
      await page.locator('#bottomSheetOverlay').click({ force: true });

      // Bottom sheet should close
      await page.waitForFunction(() => {
        const el = document.getElementById('compliancePanel');
        return el && !el.classList.contains('bottom-sheet--open');
      });
    });

    test('should display drag handle on mobile', async ({ page }) => {
      // Open bottom sheet
      await clickSvgPath(page, '[data-alpha3="BRA"].country-path--active');
      await page.waitForFunction(() => {
        const el = document.getElementById('mapTapBar');
        return el && !el.hidden;
      });
      await page.locator('#tapBarAction').click();
      await page.waitForFunction(() => {
        const el = document.getElementById('compliancePanel');
        return el && el.classList.contains('bottom-sheet--open');
      });

      // Drag handle should be visible on mobile
      const handle = page.locator('#bottomSheetHandle');
      const display = await handle.evaluate(el => window.getComputedStyle(el).display);
      expect(display).not.toBe('none');
    });
  });

  test.describe('2. Tap Bar (Two-Tap Flow)', () => {
    test('should show tap bar with region name on first tap', async ({ page }) => {
      await clickSvgPath(page, '[data-alpha3="BRA"].country-path--active');

      await page.waitForFunction(() => {
        const el = document.getElementById('mapTapBar');
        return el && !el.hidden;
      });

      const tapBarName = page.locator('#tapBarName');
      await expect(tapBarName).toHaveText('Brazil');
    });

    test('should show "View details" button in tap bar', async ({ page }) => {
      await clickSvgPath(page, '[data-alpha3="BRA"].country-path--active');

      await page.waitForFunction(() => {
        const el = document.getElementById('mapTapBar');
        return el && !el.hidden;
      });

      const actionBtn = page.locator('#tapBarAction');
      await expect(actionBtn).toBeVisible();
      await expect(actionBtn).toHaveText('View details');
    });

    test('should remove CTA prompt after first tap interaction', async ({ page }) => {
      // CTA should exist initially
      const cta = page.locator('#mapCta');
      await expect(cta).toBeVisible();

      // First tap on a region
      await clickSvgPath(page, '[data-alpha3="BRA"].country-path--active');

      // CTA should be removed from the DOM
      await page.waitForFunction(() => !document.getElementById('mapCta'));
      await expect(cta).toBeHidden();
    });
  });

  test.describe('3. Quick-Zoom Buttons', () => {
    test('should display quick-zoom buttons on mobile', async ({ page }) => {
      const quickZoom = page.locator('#mapQuickZoom');
      const display = await quickZoom.evaluate(el => window.getComputedStyle(el).display);
      expect(display).not.toBe('none');
    });

    test('should have all four region buttons', async ({ page }) => {
      const buttons = page.locator('.quick-zoom-btn');
      const count = await buttons.count();
      expect(count).toBe(4);

      const texts = await buttons.allTextContents();
      expect(texts).toContain('Americas');
      expect(texts).toContain('Europe');
      expect(texts).toContain('Asia-Pacific');
      expect(texts).toContain('Africa/ME');
    });

    test('should zoom the map when clicking a quick-zoom button', async ({ page }) => {
      const mapGroup = page.locator('#mapSvg g').first();
      const transformBefore = await mapGroup.getAttribute('transform');

      // Click "Europe" quick-zoom
      await page.locator('.quick-zoom-btn[data-region="europe"]').click();

      // Wait for D3 zoom transition to change the transform
      await page.waitForFunction((before) => {
        const g = document.querySelector('#mapSvg g');
        return g && g.getAttribute('transform') !== before;
      }, transformBefore);

      const transformAfter = await mapGroup.getAttribute('transform');
      expect(transformAfter).not.toBe(transformBefore);
    });
  });

  test.describe('4. Zoom Button Touch Targets', () => {
    test('should have 44px minimum zoom button size for touch accessibility', async ({ page }) => {
      const zoomIn = page.locator('#zoomIn');
      const box = await zoomIn.boundingBox();

      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    });
  });

  test.describe('5. Legend Positioning', () => {
    test('should render legend inline (not overlapping map) on mobile', async ({ page }) => {
      const legend = page.locator('.map-legend');
      const position = await legend.evaluate(el => window.getComputedStyle(el).position);

      // On mobile, legend should be static (inline) not absolute/fixed
      expect(position).toBe('static');
    });
  });

  test.describe('6. Filter Deselection on Mobile', () => {
    test('should close bottom sheet when filter removes selected region regulations', async ({ page }) => {
      // Two-tap to select Brazil
      await clickSvgPath(page, '[data-alpha3="BRA"].country-path--active');
      await page.waitForFunction(() => {
        const el = document.getElementById('mapTapBar');
        return el && !el.hidden;
      });
      await page.locator('#tapBarAction').click();
      await page.waitForFunction(() => {
        const el = document.getElementById('compliancePanel');
        return el && el.classList.contains('bottom-sheet--open');
      });

      // Switch to Industry Compliance — Brazil has no industry regs
      await page.locator('.filter-chip[data-category="industry-compliance"]').click();

      // Bottom sheet should close
      await page.waitForFunction(() => {
        const el = document.getElementById('compliancePanel');
        return el && !el.classList.contains('bottom-sheet--open');
      });

      // Panel should be hidden
      const panel = page.locator('[data-testid="compliance-panel"]');
      await expect(panel).toBeHidden();
    });
  });
});
