/**
 * Google Analytics 4 Unit Tests
 * Tests the analytics utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  trackEvent,
  trackNavigation,
  trackPortfolioInteraction,
  trackCTA,
  trackFilterAction,
  trackThemeToggle,
} from '../../src/utils/analytics';

describe('Analytics Utility Functions', () => {
  describe('Function Exports', () => {
    it('should export trackEvent function', () => {
      expect(typeof trackEvent).toBe('function');
    });

    it('should export trackNavigation function', () => {
      expect(typeof trackNavigation).toBe('function');
    });

    it('should export trackPortfolioInteraction function', () => {
      expect(typeof trackPortfolioInteraction).toBe('function');
    });

    it('should export trackCTA function', () => {
      expect(typeof trackCTA).toBe('function');
    });

    it('should export trackFilterAction function', () => {
      expect(typeof trackFilterAction).toBe('function');
    });

    it('should export trackThemeToggle function', () => {
      expect(typeof trackThemeToggle).toBe('function');
    });
  });

  describe('Functions should not throw', () => {
    it('trackEvent should handle being called', () => {
      expect(() => {
        trackEvent({ event: 'test', category: 'navigation' });
      }).not.toThrow();
    });

    it('trackNavigation should handle being called', () => {
      expect(() => {
        trackNavigation('/test', 'Test');
      }).not.toThrow();
    });

    it('trackPortfolioInteraction should handle being called', () => {
      expect(() => {
        trackPortfolioInteraction('view_details');
      }).not.toThrow();
    });

    it('trackCTA should handle being called', () => {
      expect(() => {
        trackCTA('calendly', 'hero');
      }).not.toThrow();
    });

    it('trackFilterAction should handle being called', () => {
      expect(() => {
        trackFilterAction('stage', 'Growth');
      }).not.toThrow();
    });

    it('trackThemeToggle should handle being called', () => {
      expect(() => {
        trackThemeToggle('dark');
      }).not.toThrow();
    });
  });
});
