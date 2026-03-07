import { test, expect } from '@playwright/test';

test.describe('Regulatory Map E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/hub/tools/regulatory-map', { waitUntil: 'networkidle' });
  });

  test.describe('1. Page Load & Initial State', () => {
    test('should load the page with map container visible', async ({ page }) => {
      await expect(page.locator('[data-testid="map-container"]')).toBeVisible();
      await expect(page.locator('#mapSvg')).toBeVisible();
    });

    test('should have compliance panel hidden initially', async ({ page }) => {
      const panel = page.locator('[data-testid="compliance-panel"]');
      await expect(panel).toBeHidden();
    });

    test('should display the CTA prompt', async ({ page }) => {
      const cta = page.locator('#mapCta');
      await expect(cta).toBeVisible();
      await expect(cta).toContainText('Select a highlighted region');
    });

    test('should display zoom controls', async ({ page }) => {
      await expect(page.locator('#zoomIn')).toBeVisible();
      await expect(page.locator('#zoomOut')).toBeVisible();
      await expect(page.locator('#zoomReset')).toBeVisible();
    });

    test('should display map legend', async ({ page }) => {
      const legend = page.locator('.map-legend');
      await expect(legend).toBeVisible();
      await expect(legend).toContainText('Regulation coverage');
      await expect(legend).toContainText('No data');
    });

    test('should have Back to The Workbench link', async ({ page }) => {
      const backLink = page.locator('a.back-link');
      await expect(backLink).toBeVisible();
      await expect(backLink).toContainText('Back to The Workbench');
      expect(await backLink.getAttribute('href')).toBe('/hub/tools');
    });
  });

  test.describe('2. Map Interaction — Country Selection', () => {
    test('should show compliance panel when clicking a highlighted country', async ({ page }) => {
      // Click a large, easily-clickable country with regulations (Brazil)
      const activePath = page.locator('.country-path--active').first();
      await activePath.click();

      const panel = page.locator('[data-testid="compliance-panel"]');
      await expect(panel).toBeVisible();
    });

    test('should display country name and regulation count in panel', async ({ page }) => {
      const activePath = page.locator('.country-path--active').first();
      await activePath.click();

      const countryName = page.locator('#panelCountryName');
      await expect(countryName).not.toBeEmpty();

      const regCount = page.locator('#panelRegCount');
      await expect(regCount).toContainText('regulation');
    });

    test('should display regulation cards with details', async ({ page }) => {
      const activePath = page.locator('.country-path--active').first();
      await activePath.click();

      const cards = page.locator('.reg-card');
      expect(await cards.count()).toBeGreaterThan(0);

      const firstCard = cards.first();
      await expect(firstCard.locator('.reg-card__name')).not.toBeEmpty();
      await expect(firstCard.locator('.reg-card__summary')).not.toBeEmpty();
    });

    test('should hide CTA prompt after selection', async ({ page }) => {
      const cta = page.locator('#mapCta');
      await expect(cta).toBeVisible();

      const activePath = page.locator('.country-path--active').first();
      await activePath.click();

      await expect(cta).toBeHidden();
    });

    test('should update panel when clicking a different country', async ({ page }) => {
      const activePaths = page.locator('.country-path--active');
      const firstPath = activePaths.first();
      const secondPath = activePaths.nth(1);

      await firstPath.click();
      const firstName = await page.locator('#panelCountryName').textContent();

      await secondPath.click();
      const secondName = await page.locator('#panelCountryName').textContent();

      expect(firstName).not.toBe(secondName);
    });
  });

  test.describe('3. Map Interaction — US State Selection', () => {
    test('should show state-level regulation when clicking a highlighted US state', async ({ page }) => {
      // Click a large highlighted US state (Texas is large and has TDPSA)
      const activeState = page.locator('.state-path--active').first();

      if (await activeState.count() > 0) {
        await activeState.click();

        const panel = page.locator('[data-testid="compliance-panel"]');
        await expect(panel).toBeVisible();

        const countryName = page.locator('#panelCountryName');
        const name = await countryName.textContent();
        // Should show state name, not "United States"
        expect(name).not.toBe('United States');
      }
    });
  });

  test.describe('4. Zoom Controls', () => {
    test('should zoom in when clicking zoom in button', async ({ page }) => {
      const g = page.locator('#mapSvg g').first();
      const transformBefore = await g.getAttribute('transform');

      await page.locator('#zoomIn').click();
      await page.waitForTimeout(400); // wait for transition

      const transformAfter = await g.getAttribute('transform');
      expect(transformAfter).not.toBe(transformBefore);
    });

    test('should reset zoom when clicking reset button', async ({ page }) => {
      // Zoom in first
      await page.locator('#zoomIn').click();
      await page.waitForTimeout(400);

      // Reset
      await page.locator('#zoomReset').click();
      await page.waitForTimeout(400);

      const g = page.locator('#mapSvg g').first();
      const transform = await g.getAttribute('transform');
      // After reset, transform should be identity or null
      expect(transform === null || transform?.includes('scale(1')).toBeTruthy();
    });
  });

  test.describe('5. Navigation', () => {
    test('should navigate back to The Workbench', async ({ page }) => {
      await page.locator('a.back-link').click();
      await page.waitForURL('**/hub/tools');
      await expect(page).toHaveURL(/\/hub\/tools$/);
    });

    test('should have Regulatory Map card on Workbench page', async ({ page }) => {
      await page.goto('/hub/tools', { waitUntil: 'networkidle' });
      const regMapLink = page.locator('a[href="/hub/tools/regulatory-map"]');
      await expect(regMapLink).toBeVisible();
    });
  });
});
