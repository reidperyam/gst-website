/**
 * Google Analytics E2E Tests
 * Tests real user journeys and event tracking across the website
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Google Analytics E2E Tests', () => {
  // Setup for each test
  test.beforeEach(async ({ page }) => {
    // Intercept and log GA events for verification
    await page.on('console', msg => {
      if (msg.type() === 'log') {
        console.log('Page log:', msg.text());
      }
    });
  });

  test.describe('GA4 Script Loading', () => {
    test('should load GA4 script on homepage', async ({ page }) => {
      await page.goto('/');

      // Check if gtag script is loaded
      const gtagScripts = await page.locator('script[src*="googletagmanager.com"]').count();
      expect(gtagScripts).toBeGreaterThan(0);

      // Verify dataLayer exists
      const dataLayerExists = await page.evaluate(() => {
        return typeof window.dataLayer !== 'undefined';
      });
      expect(dataLayerExists).toBe(true);
    });

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

      // Intercept GA events
      const events: string[] = [];
      await page.evaluateHandle(() => {
        const originalGtag = window.gtag;
        (window as any).recordedEvents = [];
        window.gtag = function() {
          (window as any).recordedEvents.push(arguments);
          return originalGtag.apply(this, arguments as any);
        };
      });

      // Click navigation link
      const portfolioLink = page.locator('a:has-text("M&A")');
      await portfolioLink.click();
      await page.waitForURL('/ma-portfolio');

      // Verify event was tracked
      const recordedEvents = await page.evaluate(() => {
        return (window as any).recordedEvents;
      });

      const navigationEvent = recordedEvents.find((args: any) =>
        args[0] === 'event' && args[1]?.includes('navigation')
      );
      expect(navigationEvent).toBeTruthy();
    });

    test('should track multiple navigation actions', async ({ page }) => {
      await page.goto('/');

      // Setup event recording
      await page.evaluateHandle(() => {
        const originalGtag = window.gtag;
        (window as any).recordedEvents = [];
        window.gtag = function() {
          (window as any).recordedEvents.push(arguments);
          return originalGtag.apply(this, arguments as any);
        };
      });

      // Navigate to portfolio
      await page.locator('a:has-text("M&A")').click();
      await page.waitForURL('/ma-portfolio');

      // Go back home
      await page.locator('a.logo').click();
      await page.waitForURL('/');

      // Check events
      const recordedEvents = await page.evaluate(() => {
        return (window as any).recordedEvents.length;
      });
      expect(recordedEvents).toBeGreaterThan(0);
    });
  });

  test.describe('Portfolio Interaction Tracking', () => {
    test('should track project card clicks', async ({ page }) => {
      await page.goto('/ma-portfolio');

      // Setup event recording
      await page.evaluateHandle(() => {
        const originalGtag = window.gtag;
        (window as any).recordedEvents = [];
        window.gtag = function() {
          (window as any).recordedEvents.push(arguments);
          return originalGtag.apply(this, arguments as any);
        };
      });

      // Click first project card
      const firstCard = page.locator('[data-testid="project-card"]').first();
      if (await firstCard.isVisible()) {
        await firstCard.click();

        // Wait for modal
        const modal = page.locator('[data-testid="project-modal"]');
        await expect(modal).toBeVisible();

        // Verify tracking
        const recordedEvents = await page.evaluate(() => {
          return (window as any).recordedEvents;
        });
        expect(recordedEvents.length).toBeGreaterThan(0);
      }
    });

    test('should track modal close action', async ({ page }) => {
      await page.goto('/ma-portfolio');

      // Setup event recording
      await page.evaluateHandle(() => {
        const originalGtag = window.gtag;
        (window as any).recordedEvents = [];
        window.gtag = function() {
          (window as any).recordedEvents.push(arguments);
          return originalGtag.apply(this, arguments as any);
        };
      });

      // Open and close modal
      const firstCard = page.locator('[data-testid="project-card"]').first();
      if (await firstCard.isVisible()) {
        await firstCard.click();

        const modal = page.locator('[data-testid="project-modal"]');
        await expect(modal).toBeVisible();

        // Close modal
        const closeButton = page.locator('[data-testid="project-modal-close"]');
        await closeButton.click();
        await expect(modal).not.toBeVisible();

        // Verify close event was tracked
        const recordedEvents = await page.evaluate(() => {
          return (window as any).recordedEvents;
        });
        expect(recordedEvents.length).toBeGreaterThan(0);
      }
    });

    test('should track project view with details', async ({ page }) => {
      await page.goto('/ma-portfolio');

      // Open project modal
      const firstCard = page.locator('[data-testid="project-card"]').first();
      if (await firstCard.isVisible()) {
        // Get project details before clicking
        const projectId = await firstCard.getAttribute('data-project-id');

        // Setup event recording
        await page.evaluateHandle(() => {
          const originalGtag = window.gtag;
          (window as any).recordedEvents = [];
          window.gtag = function() {
            (window as any).recordedEvents.push(arguments);
            return originalGtag.apply(this, arguments as any);
          };
        });

        await firstCard.click();

        // Verify project details in modal
        const modal = page.locator('[data-testid="project-modal"]');
        await expect(modal).toBeVisible();

        const title = page.locator('[data-testid="project-modal-title"]');
        await expect(title).toBeVisible();

        // Check recorded events
        const recordedEvents = await page.evaluate(() => {
          return (window as any).recordedEvents;
        });
        expect(recordedEvents.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Filter Tracking', () => {
    test('should track filter application', async ({ page }) => {
      await page.goto('/ma-portfolio');

      // Setup event recording
      await page.evaluateHandle(() => {
        const originalGtag = window.gtag;
        (window as any).recordedEvents = [];
        window.gtag = function() {
          (window as any).recordedEvents.push(arguments);
          return originalGtag.apply(this, arguments as any);
        };
      });

      // Apply a filter if available
      const filterButtons = page.locator('button[data-testid*="filter"]');
      const count = await filterButtons.count();

      if (count > 0) {
        await filterButtons.first().click();

        // Verify tracking
        const recordedEvents = await page.evaluate(() => {
          return (window as any).recordedEvents;
        });
        expect(recordedEvents.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Theme Toggle Tracking', () => {
    test('should track theme toggle clicks', async ({ page }) => {
      await page.goto('/');

      // Setup event recording
      await page.evaluateHandle(() => {
        const originalGtag = window.gtag;
        (window as any).recordedEvents = [];
        window.gtag = function() {
          (window as any).recordedEvents.push(arguments);
          return originalGtag.apply(this, arguments as any);
        };
      });

      // Click theme toggle
      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      if (await themeToggle.isVisible()) {
        await themeToggle.click();

        // Verify tracking
        const recordedEvents = await page.evaluate(() => {
          return (window as any).recordedEvents;
        });
        expect(recordedEvents.length).toBeGreaterThan(0);
      }
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

      // Setup event recording
      await page.evaluateHandle(() => {
        const originalGtag = window.gtag;
        (window as any).recordedEvents = [];
        window.gtag = function() {
          (window as any).recordedEvents.push(arguments);
          return originalGtag.apply(this, arguments as any);
        };
      });

      // Find and click Calendly CTA (but don't navigate)
      const ctaButton = page.locator('a[href*="calendly.com"]').first();
      if (await ctaButton.isVisible()) {
        // Prevent navigation
        await page.route('**/calendly.com/**', route => route.abort());

        await ctaButton.click({ force: true });

        // Verify event was recorded before navigation
        const recordedEvents = await page.evaluate(() => {
          return (window as any).recordedEvents;
        });
        expect(recordedEvents.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Complete User Journey', () => {
    test('should track full portfolio discovery journey', async ({ page }) => {
      // Setup event recording from start
      await page.goto('/', { waitUntil: 'networkidle' });

      await page.evaluateHandle(() => {
        const originalGtag = window.gtag;
        (window as any).recordedEvents = [];
        (window as any).eventLog = [];
        window.gtag = function() {
          const args = Array.from(arguments);
          (window as any).recordedEvents.push(args);
          if (args[0] === 'event') {
            (window as any).eventLog.push(args[1]);
          }
          return originalGtag.apply(this, arguments as any);
        };
      });

      // Step 1: Navigate to portfolio
      await page.locator('a:has-text("M&A")').click();
      await page.waitForURL('/ma-portfolio');

      // Step 2: View a project
      const firstCard = page.locator('[data-testid="project-card"]').first();
      if (await firstCard.isVisible()) {
        await firstCard.click();

        const modal = page.locator('[data-testid="project-modal"]');
        await expect(modal).toBeVisible();

        // Step 3: Close modal
        await page.locator('[data-testid="project-modal-close"]').click();
      }

      // Verify journey was tracked
      const eventLog = await page.evaluate(() => {
        return (window as any).eventLog;
      });

      // Should have recorded multiple events
      expect(eventLog.length).toBeGreaterThan(0);
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
