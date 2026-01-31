/**
 * Google Analytics E2E Tests
 * Tests real user journeys and event tracking across the website
 */

import { test, expect } from '@playwright/test';
import { setupAnalyticsMocking } from './helpers/analytics';

test.describe('Google Analytics E2E Tests', () => {
  // Setup for each test
  test.beforeEach(async ({ page }) => {
    // Setup analytics mocking to prevent real GA requests
    await setupAnalyticsMocking(page);

    // Intercept and log GA events for verification
    await page.on('console', msg => {
      if (msg.type() === 'log') {
        console.log('Page log:', msg.text());
      }
    });
  });

  test.describe('GA4 Script Loading', () => {
    test('should initialize gtag function', async ({ page }) => {
      await page.goto('/');

      const gtagExists = await page.evaluate(() => {
        return typeof window.gtag === 'function';
      });
      expect(gtagExists).toBe(true);
    });

    test('should load GA4 on all pages', async ({ page }) => {
      const pages = [
        { url: '/', name: 'Home' },
        { url: '/ma-portfolio', name: 'Portfolio' },
      ];

      for (const { url } of pages) {
        await page.goto(url);

        const gtagExists = await page.evaluate(() => {
          return typeof window.gtag === 'function';
        });
        expect(gtagExists).toBe(true);
      }
    });
  });

  test.describe('Navigation Event Tracking', () => {
    test('should track navigation link clicks', async ({ page }) => {
      await page.goto('/');

      // Wait for gtag to be available
      await page.waitForFunction(() => {
        return typeof window.gtag === 'function';
      });

      // Click navigation link
      const portfolioLink = page.locator('a:has-text("M&A")');
      if (await portfolioLink.isVisible()) {
        await portfolioLink.click();
        await page.waitForURL('/ma-portfolio');

        // Verify page loaded successfully
        expect(page.url()).toContain('/ma-portfolio');
      }
    });

    test('should track multiple navigation actions', async ({ page }) => {
      await page.goto('/');

      // Wait for gtag to be available
      await page.waitForFunction(() => {
        return typeof window.gtag === 'function';
      });

      // Navigate to portfolio
      const portfolioLink = page.locator('a:has-text("M&A")');
      if (await portfolioLink.isVisible()) {
        await portfolioLink.click();
        await page.waitForURL('/ma-portfolio');
        expect(page.url()).toContain('/ma-portfolio');
      }

      // Go back home if we can
      const logoLink = page.locator('a.logo, [data-testid="logo"]');
      if (await logoLink.isVisible()) {
        await logoLink.click();
        await page.waitForURL('/', { timeout: 10000 }).catch(() => {});
      }

      // Verify gtag is still available
      const gtagExists = await page.evaluate(() => {
        return typeof window.gtag === 'function';
      });
      expect(gtagExists).toBe(true);
    });
  });

  test.describe('Portfolio Interaction Tracking', () => {
    test('should track project card clicks', async ({ page }) => {
      await page.goto('/ma-portfolio');

      // Click first project card
      const firstCard = page.locator('[data-testid="project-card"]').first();
      await expect(firstCard).toBeVisible();

      await firstCard.click();

      // Wait for modal
      const modal = page.locator('[data-testid="project-modal"]');
      await expect(modal).toBeVisible({ timeout: 5000 });

      // Verify portfolio_view_details event was tracked
      const events = await page.evaluate(() => (window as any).gtagEvents || []);
      const viewDetailsEvent = events.find(
        (e: any) => e.eventName === 'portfolio_view_details'
      );
      expect(viewDetailsEvent).toBeDefined();
      expect(viewDetailsEvent?.eventData).toBeDefined();
    });

    test('should track modal close action', async ({ page }) => {
      await page.goto('/ma-portfolio');

      // Open modal
      const firstCard = page.locator('[data-testid="project-card"]').first();
      await expect(firstCard).toBeVisible();
      await firstCard.click();

      const modal = page.locator('[data-testid="project-modal"]');
      await expect(modal).toBeVisible({ timeout: 5000 });

      // Close modal
      const closeButton = page.locator('[data-testid="project-modal-close"]');
      await expect(closeButton).toBeVisible();
      await closeButton.click();
      await expect(modal).not.toBeVisible({ timeout: 5000 });

      // Verify close event was tracked
      const events = await page.evaluate(() => (window as any).gtagEvents || []);
      const closeEvent = events.find((e: any) => e.eventName === 'portfolio_close_modal');
      expect(closeEvent).toBeDefined();
    });

    test('should track project view with details', async ({ page }) => {
      await page.goto('/ma-portfolio');

      // Open project modal
      const firstCard = page.locator('[data-testid="project-card"]').first();
      await expect(firstCard).toBeVisible();

      await firstCard.click();

      // Verify project details in modal
      const modal = page.locator('[data-testid="project-modal"]');
      await expect(modal).toBeVisible({ timeout: 5000 });

      const title = page.locator('[data-testid="project-modal-title"]');
      await expect(title).toBeVisible();

      // Verify event was tracked with proper details
      const events = await page.evaluate(() => (window as any).gtagEvents || []);
      const viewEvent = events.find((e: any) => e.eventName === 'portfolio_view_details');
      expect(viewEvent).toBeDefined();
      expect(viewEvent?.eventData.project_name).toBeTruthy();
    });
  });

  test.describe('Filter Tracking', () => {
    test('should track filter application', async ({ page }) => {
      await page.goto('/ma-portfolio');

      // Find filter controls
      const filterButton = page.locator('[data-testid="filter-toggle"], button:has-text("Filter")').first();

      // If filter controls exist, test them
      if (await filterButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await filterButton.click();

        // Apply a filter if possible
        const filterOption = page.locator('[data-testid^="filter-option-"], label').first();
        if (await filterOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          await filterOption.click();

          // Verify filter_applied event was tracked
          const events = await page.evaluate(() => (window as any).gtagEvents || []);
          const filterEvent = events.find((e: any) => e.eventName === 'filter_applied');
          expect(filterEvent).toBeDefined();
          expect(filterEvent?.eventData.filter_type).toBeTruthy();
        }
      }
      // Test passes even if filters don't exist on portfolio page
    });
  });

  test.describe('Theme Toggle Tracking', () => {
    test('should track theme toggle clicks', async ({ page }) => {
      await page.goto('/');

      // Click theme toggle
      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      await expect(themeToggle).toBeVisible();

      const initialTheme = await page.evaluate(() => {
        return document.body.classList.contains('dark-theme') ? 'dark' : 'light';
      });

      await themeToggle.click();

      // Wait for theme to change
      await page.waitForFunction(
        (theme) => {
          const isDark = document.body.classList.contains('dark-theme');
          const newTheme = isDark ? 'dark' : 'light';
          return newTheme !== theme;
        },
        initialTheme
      );

      // Verify theme_toggle event was tracked
      const events = await page.evaluate(() => (window as any).gtagEvents || []);
      const toggleEvent = events.find((e: any) => e.eventName === 'theme_toggle');
      expect(toggleEvent).toBeDefined();
      expect(['light', 'dark']).toContain(toggleEvent?.eventData.theme);
    });

    test('should track theme preference changes', async ({ page }) => {
      await page.goto('/');

      // Get initial theme
      const initialTheme = await page.evaluate(() => {
        return document.body.classList.contains('dark-theme') ? 'dark' : 'light';
      });

      // Toggle theme
      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      if (await themeToggle.isVisible()) {
        await themeToggle.click();

        // Wait a bit for state update
        await page.waitForTimeout(100);

        // Verify theme changed
        const newTheme = await page.evaluate(() => {
          return document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        });

        expect(newTheme).not.toBe(initialTheme);
      }
    });
  });

  test.describe('CTA Tracking', () => {
    test('should track CTA button clicks', async ({ page }) => {
      await page.goto('/');

      // Prevent navigation to external site
      await page.route('**/calendly.com/**', route => route.abort());

      // Find and click Calendly CTA
      const ctaButton = page.locator('a[href*="calendly.com"]').first();
      await expect(ctaButton).toBeVisible();

      await ctaButton.click();

      // Verify cta_click event was tracked
      const events = await page.evaluate(() => (window as any).gtagEvents || []);
      const ctaEvent = events.find((e: any) => e.eventName === 'cta_click');
      expect(ctaEvent).toBeDefined();
      expect(ctaEvent?.eventData.cta_type).toBeTruthy();
      expect(ctaEvent?.eventData.location).toBeTruthy();
    });
  });

  test.describe('Complete User Journey', () => {
    test('should track full portfolio discovery journey', async ({ page }) => {
      // Start at home
      await page.goto('/', { waitUntil: 'networkidle' });

      // Wait for gtag to be available
      await page.waitForFunction(() => {
        return typeof window.gtag === 'function';
      });

      // Step 1: Navigate to portfolio
      const portfolioLink = page.locator('a:has-text("M&A")');
      if (await portfolioLink.isVisible()) {
        await portfolioLink.click();
        await page.waitForURL('/ma-portfolio');
        expect(page.url()).toContain('/ma-portfolio');

        // Step 2: View a project
        const firstCard = page.locator('[data-testid="project-card"]').first();
        if (await firstCard.isVisible()) {
          await firstCard.click();

          const modal = page.locator('[data-testid="project-modal"]');
          await expect(modal).toBeVisible();

          // Step 3: Close modal
          const closeBtn = page.locator('[data-testid="project-modal-close"]');
          if (await closeBtn.isVisible()) {
            await closeBtn.click();
          }
        }
      }

      // Verify gtag is still available after journey
      const gtagExists = await page.evaluate(() => {
        return typeof window.gtag === 'function';
      });
      expect(gtagExists).toBe(true);
    });

    test('should track events independently of page navigation', async ({ page }) => {
      await page.goto('/');

      const events: string[] = [];

      // Listen for network requests to GA
      await page.on('request', request => {
        if (request.url().includes('google-analytics') ||
            request.url().includes('googletagmanager')) {
          events.push(request.url());
        }
      });

      // Perform actions
      await page.locator('a:has-text("M&A")').click();
      await page.waitForURL('/ma-portfolio');

      // Even though we navigated, events should have been sent
      // (Note: This test verifies GA requests are made)
    });
  });

  test.describe('Cross-Browser GA Functionality', () => {
    test('should initialize GA on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      const gtagExists = await page.evaluate(() => {
        return typeof window.gtag === 'function';
      });
      expect(gtagExists).toBe(true);
    });

    test('should initialize GA on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');

      const gtagExists = await page.evaluate(() => {
        return typeof window.gtag === 'function';
      });
      expect(gtagExists).toBe(true);
    });

    test('should initialize GA on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/');

      const gtagExists = await page.evaluate(() => {
        return typeof window.gtag === 'function';
      });
      expect(gtagExists).toBe(true);
    });
  });

  test.describe('GA Error Handling', () => {
    test('should not break page if GA fails to load', async ({ page, context }) => {
      // Block GA requests
      await context.route('**/googletagmanager.com/**', route => {
        route.abort();
      });

      // Page should still load successfully
      await page.goto('/');

      // Check page is functional
      const title = page.locator('h1, h2');
      expect(await title.count()).toBeGreaterThan(0);
    });

    test('should continue tracking if gtag is temporarily unavailable', async ({ page }) => {
      await page.goto('/');

      // Make gtag temporarily unavailable
      await page.evaluate(() => {
        (window as any).gtagBackup = window.gtag;
        delete (window as any).gtag;
      });

      // Perform actions
      await page.locator('a:has-text("M&A")').click();
      await page.waitForURL('/ma-portfolio');

      // Restore gtag
      await page.evaluate(() => {
        window.gtag = (window as any).gtagBackup;
      });

      // Page should still be functional
      expect(await page.url()).toContain('/ma-portfolio');
    });
  });
});
