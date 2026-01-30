/**
 * Analytics utility for tracking user interactions
 * Provides a type-safe interface for Google Analytics 4 events
 */

export type EventCategory = 'navigation' | 'portfolio' | 'engagement' | 'ui';

export interface AnalyticsEvent {
  event: string;
  category: EventCategory;
  label?: string;
  value?: number | string;
  [key: string]: any;
}

/**
 * Track a custom event in Google Analytics
 * @param eventData - The event data to track
 */
export function trackEvent(eventData: AnalyticsEvent): void {
  if (typeof window !== 'undefined' && window.gtag) {
    const { event, category, ...params } = eventData;
    window.gtag('event', event, {
      event_category: category,
      ...params,
    });
  }
}

/**
 * Track navigation link clicks
 * @param destination - The href of the clicked link
 * @param label - Human-readable label for the link
 */
export function trackNavigation(destination: string, label: string): void {
  trackEvent({
    event: 'navigation_click',
    category: 'navigation',
    label,
    destination,
  });
}

/**
 * Track portfolio project interactions
 * @param action - The action performed (view, filter, etc.)
 * @param projectId - The ID of the project (if applicable)
 * @param projectName - The name of the project
 */
export function trackPortfolioInteraction(
  action: 'view_details' | 'close_modal' | 'apply_filter',
  projectId?: string,
  projectName?: string
): void {
  trackEvent({
    event: `portfolio_${action}`,
    category: 'portfolio',
    project_id: projectId,
    project_name: projectName,
  });
}

/**
 * Track CTA (Call-to-Action) button clicks
 * @param ctaType - Type of CTA (calendly, email, etc.)
 * @param location - Where the CTA is located on the page
 */
export function trackCTA(ctaType: string, location: string): void {
  trackEvent({
    event: 'cta_click',
    category: 'engagement',
    cta_type: ctaType,
    location,
  });
}

/**
 * Track filter actions on the portfolio
 * @param filterType - The type of filter applied (stage, theme, year, etc.)
 * @param filterValue - The value of the filter
 */
export function trackFilterAction(filterType: string, filterValue: string): void {
  trackEvent({
    event: 'filter_applied',
    category: 'portfolio',
    filter_type: filterType,
    filter_value: filterValue,
  });
}

/**
 * Track theme toggle (dark mode)
 * @param theme - The theme that was switched to
 */
export function trackThemeToggle(theme: 'light' | 'dark'): void {
  trackEvent({
    event: 'theme_toggle',
    category: 'ui',
    theme,
  });
}

// Declare gtag on window for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}
