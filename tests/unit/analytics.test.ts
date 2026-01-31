/**
 * Google Analytics 4 Unit Tests
 * Tests the analytics utility functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  trackEvent,
  trackNavigation,
  trackPortfolioInteraction,
  trackCTA,
  trackFilterAction,
  trackThemeToggle,
} from '@/utils/analytics';

describe('Analytics Utility Functions', () => {
  let gtagMock: any;

  beforeEach(() => {
    // Create mock gtag function
    gtagMock = vi.fn();
    (global as any).window = {
      gtag: gtagMock,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('trackEvent', () => {
    it('should call gtag with event command', () => {
      trackEvent({ event: 'test_event', category: 'navigation' });

      expect(gtagMock).toHaveBeenCalledWith('event', 'test_event', {
        event_category: 'navigation',
      });
    });

    it('should include all event data in gtag call', () => {
      trackEvent({
        event: 'test_event',
        category: 'navigation',
        label: 'Test Label',
        value: 42,
      });

      expect(gtagMock).toHaveBeenCalledWith('event', 'test_event', {
        event_category: 'navigation',
        label: 'Test Label',
        value: 42,
      });
    });

    it('should not call gtag if window.gtag is not available', () => {
      (global as any).window = {};

      trackEvent({ event: 'test', category: 'navigation' });

      expect(gtagMock).not.toHaveBeenCalled();
    });
  });

  describe('trackNavigation', () => {
    it('should track navigation_click event', () => {
      trackNavigation('/services', 'Services Link');

      expect(gtagMock).toHaveBeenCalledWith('event', 'navigation_click', {
        event_category: 'navigation',
        label: 'Services Link',
        destination: '/services',
      });
    });

    it('should include destination URL in event data', () => {
      trackNavigation('/portfolio', 'Portfolio');

      const callArgs = gtagMock.mock.calls[0];
      expect(callArgs[2].destination).toBe('/portfolio');
    });
  });

  describe('trackPortfolioInteraction', () => {
    it('should track portfolio_view_details event', () => {
      trackPortfolioInteraction('view_details', 'proj-123', 'Project Name');

      expect(gtagMock).toHaveBeenCalledWith('event', 'portfolio_view_details', {
        event_category: 'portfolio',
        project_id: 'proj-123',
        project_name: 'Project Name',
      });
    });

    it('should track portfolio_close_modal event', () => {
      trackPortfolioInteraction('close_modal');

      expect(gtagMock).toHaveBeenCalledWith('event', 'portfolio_close_modal', {
        event_category: 'portfolio',
        project_id: undefined,
        project_name: undefined,
      });
    });

    it('should track portfolio_apply_filter event', () => {
      trackPortfolioInteraction('apply_filter');

      expect(gtagMock).toHaveBeenCalledWith('event', 'portfolio_apply_filter', {
        event_category: 'portfolio',
        project_id: undefined,
        project_name: undefined,
      });
    });
  });

  describe('trackCTA', () => {
    it('should track cta_click event with type and location', () => {
      trackCTA('calendly', 'hero');

      expect(gtagMock).toHaveBeenCalledWith('event', 'cta_click', {
        event_category: 'engagement',
        cta_type: 'calendly',
        location: 'hero',
      });
    });

    it('should include CTA type in event data', () => {
      trackCTA('email', 'footer');

      const callArgs = gtagMock.mock.calls[0];
      expect(callArgs[2].cta_type).toBe('email');
      expect(callArgs[2].location).toBe('footer');
    });
  });

  describe('trackFilterAction', () => {
    it('should track filter_applied event', () => {
      trackFilterAction('stage', 'Growth');

      expect(gtagMock).toHaveBeenCalledWith('event', 'filter_applied', {
        event_category: 'portfolio',
        filter_type: 'stage',
        filter_value: 'Growth',
      });
    });

    it('should track different filter types', () => {
      trackFilterAction('theme', 'AI');

      expect(gtagMock).toHaveBeenCalledWith('event', 'filter_applied', {
        event_category: 'portfolio',
        filter_type: 'theme',
        filter_value: 'AI',
      });
    });
  });

  describe('trackThemeToggle', () => {
    it('should track theme_toggle event with theme value', () => {
      trackThemeToggle('dark');

      expect(gtagMock).toHaveBeenCalledWith('event', 'theme_toggle', {
        event_category: 'ui',
        theme: 'dark',
      });
    });

    it('should track light theme toggle', () => {
      trackThemeToggle('light');

      expect(gtagMock).toHaveBeenCalledWith('event', 'theme_toggle', {
        event_category: 'ui',
        theme: 'light',
      });
    });
  });

  describe('Error Handling', () => {
    it('should gracefully handle gtag not being available', () => {
      (global as any).window = undefined;

      expect(() => {
        trackEvent({ event: 'test', category: 'navigation' });
      }).not.toThrow();
    });

    it('should not break if window is undefined', () => {
      (global as any).window = undefined;

      expect(() => {
        trackNavigation('/test', 'Test');
      }).not.toThrow();
    });
  });

  describe('Event Categories', () => {
    it('navigation events should use navigation category', () => {
      trackNavigation('/test', 'Test');

      const callArgs = gtagMock.mock.calls[0];
      expect(callArgs[2].event_category).toBe('navigation');
    });

    it('portfolio events should use portfolio category', () => {
      trackPortfolioInteraction('view_details');

      const callArgs = gtagMock.mock.calls[0];
      expect(callArgs[2].event_category).toBe('portfolio');
    });

    it('CTA events should use engagement category', () => {
      trackCTA('calendly', 'hero');

      const callArgs = gtagMock.mock.calls[0];
      expect(callArgs[2].event_category).toBe('engagement');
    });

    it('theme events should use ui category', () => {
      trackThemeToggle('dark');

      const callArgs = gtagMock.mock.calls[0];
      expect(callArgs[2].event_category).toBe('ui');
    });
  });
});
