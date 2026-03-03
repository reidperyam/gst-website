/**
 * 404 Page E2E Tests
 * Tests for page rendering, navigation CTAs, HTTP status, and shared layout elements
 */

import { test, expect } from '@playwright/test';

test.describe('404 Page', () => {
  test.beforeEach(async ({ page }) => {
    // Block external GA requests
    await page.route('**/googletagmanager.com/**', route => {
      route.abort();
    });
    await page.route('**/google-analytics.com/**', route => {
      route.abort();
    });

    // Navigate to a non-existent route
    await page.goto('/this-page-does-not-exist', { waitUntil: 'networkidle' });
  });

  test.describe('Page Load & Structure', () => {
    test('should return 404 status for non-existent routes', async ({ page }) => {
      const response = await page.goto('/another-nonexistent-route');
      expect(response?.status()).toBe(404);
    });

    test('should have correct page title', async ({ page }) => {
      const title = await page.title();
      expect(title).toContain('404');
      expect(title).toContain('Page Not Found');
    });

    test('should display the hero section with 404 heading', async ({ page }) => {
      const hero = page.locator('.hero');
      await expect(hero).toBeVisible();

      const heading = hero.locator('h1');
      await expect(heading).toContainText('404');
      await expect(heading).toContainText('Page Not Found');
    });

    test('should display a description message', async ({ page }) => {
      const description = page.locator('.hero p').first();
      await expect(description).toBeVisible();

      const text = await description.textContent();
      expect(text!.length).toBeGreaterThan(10);
    });

    test('should include site header and footer', async ({ page }) => {
      const header = page.locator('.site-header');
      await expect(header).toBeVisible();

      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    });
  });

  test.describe('Navigation CTAs', () => {
    test('should display "Return Home" button linking to /', async ({ page }) => {
      const homeButton = page.locator('.hero a.cta-button', { hasText: 'Return Home' });
      await expect(homeButton).toBeVisible();

      const href = await homeButton.getAttribute('href');
      expect(href).toBe('/');
    });

    test('should display "View Services" button linking to /services', async ({ page }) => {
      const servicesButton = page.locator('.hero a.cta-button', { hasText: 'View Services' });
      await expect(servicesButton).toBeVisible();

      const href = await servicesButton.getAttribute('href');
      expect(href).toBe('/services');
    });

    test('should navigate to homepage when "Return Home" is clicked', async ({ page }) => {
      const homeButton = page.locator('.hero a.cta-button', { hasText: 'Return Home' });
      await homeButton.click();

      await page.waitForURL('/');
      expect(page.url()).toContain('/');

      // Verify the homepage loaded with actual content
      const main = page.locator('main');
      await expect(main).toBeVisible();
      const text = await main.textContent();
      expect(text!.length).toBeGreaterThan(50);
    });

    test('should navigate to services page when "View Services" is clicked', async ({ page }) => {
      const servicesButton = page.locator('.hero a.cta-button', { hasText: 'View Services' });
      await servicesButton.click();

      await page.waitForURL('**/services');

      // Verify the services page loaded with actual content
      const main = page.locator('main');
      await expect(main).toBeVisible();
      const text = await main.textContent();
      expect(text!.length).toBeGreaterThan(50);
    });
  });
});
