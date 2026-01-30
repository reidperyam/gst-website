# Google Analytics 4 Testing Guide

This document provides comprehensive guidance on testing the Google Analytics 4 implementation across unit, integration, and end-to-end tests.

## Overview

The GA4 testing suite consists of three levels:

1. **Unit Tests** - Test analytics utility functions in isolation
2. **Integration Tests** - Test GA4 script initialization and DOM event tracking
3. **E2E Tests** - Test real user journeys and event firing in live pages

## Unit Tests

**Location:** `tests/unit/analytics.test.ts`

### Running Unit Tests

```bash
# Run all unit tests
npm run test:run

# Run analytics tests only
npm run test -- analytics.test.ts

# Run with coverage
npm run test:coverage
```

### Test Coverage

Unit tests cover:
- ✅ `trackEvent()` - Basic event firing with parameters
- ✅ `trackNavigation()` - Navigation click tracking
- ✅ `trackPortfolioInteraction()` - Project view/close tracking
- ✅ `trackCTA()` - Call-to-action click tracking
- ✅ `trackFilterAction()` - Portfolio filter tracking
- ✅ `trackThemeToggle()` - Theme preference tracking
- ✅ Error handling and edge cases
- ✅ Multiple rapid event firing
- ✅ Custom parameter handling

### Unit Test Examples

```typescript
// Test basic event tracking
it('should call window.gtag with correct event structure', () => {
  const eventData: AnalyticsEvent = {
    event: 'test_event',
    category: 'navigation',
    label: 'test',
  };

  trackEvent(eventData);

  expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {
    event_category: 'navigation',
    label: 'test',
  });
});

// Test navigation tracking
it('should track navigation click with correct parameters', () => {
  trackNavigation('/ma-portfolio', 'M&A Portfolio');

  expect(mockGtag).toHaveBeenCalledWith('event', 'navigation_click', {
    event_category: 'navigation',
    label: 'M&A Portfolio',
    destination: '/ma-portfolio',
  });
});
```

## Integration Tests

**Location:** `tests/integration/analytics-integration.test.ts`

### Running Integration Tests

```bash
# Run all integration tests
npm run test:run tests/integration/

# Run analytics integration tests
npm run test -- analytics-integration.test.ts

# With coverage
npm run test:coverage
```

### Test Coverage

Integration tests cover:
- ✅ GA4 script loading and initialization
- ✅ dataLayer initialization
- ✅ gtag function creation
- ✅ Event firing with DOM interactions
- ✅ Link click tracking
- ✅ Button click tracking
- ✅ localStorage integration
- ✅ Event batching to dataLayer
- ✅ Page view tracking
- ✅ Custom parameters
- ✅ Consent mode
- ✅ Error recovery
- ✅ Measurement ID handling
- ✅ User ID and properties

### Integration Test Examples

```typescript
// Test GA4 initialization
it('should initialize dataLayer on window', () => {
  window.dataLayer = [];
  const dataLayerPush = vi.spyOn(window.dataLayer, 'push');

  window.gtag = function() {
    window.dataLayer!.push(arguments as any);
  };

  expect(window.dataLayer).toBeDefined();
  expect(Array.isArray(window.dataLayer)).toBe(true);
});

// Test DOM event tracking
it('should track click events on navigation links', () => {
  const nav = document.createElement('nav');
  const link = document.createElement('a');
  link.href = '/ma-portfolio';
  link.textContent = 'M&A Portfolio';
  nav.appendChild(link);
  document.body.appendChild(nav);

  link.addEventListener('click', () => {
    window.gtag!('event', 'navigation_click', {
      event_category: 'navigation',
      label: 'M&A Portfolio',
      destination: '/ma-portfolio',
    });
  });

  link.click();

  expect(window.gtag).toHaveBeenCalledWith('event', 'navigation_click', {
    event_category: 'navigation',
    label: 'M&A Portfolio',
    destination: '/ma-portfolio',
  });
});
```

## End-to-End Tests

**Location:** `tests/e2e/analytics.test.ts`

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run analytics E2E tests only
npm run test:e2e -- analytics.test.ts

# Run with UI
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug
```

### Test Coverage

E2E tests cover:
- ✅ GA4 script loads on real pages
- ✅ gtag function initialized globally
- ✅ Navigation link tracking
- ✅ Portfolio card clicks tracked
- ✅ Modal open/close tracked
- ✅ Project details tracked
- ✅ Filter applications tracked
- ✅ Theme toggle tracked
- ✅ CTA button tracking
- ✅ Complete user journeys
- ✅ Cross-browser functionality
- ✅ Mobile/tablet/desktop viewports
- ✅ Error handling and graceful degradation

### E2E Test Examples

```typescript
// Test GA script loading
test('should load GA4 script on homepage', async ({ page }) => {
  await page.goto('/');

  const gtagScripts = await page.locator('script[src*="googletagmanager.com"]').count();
  expect(gtagScripts).toBeGreaterThan(0);

  const dataLayerExists = await page.evaluate(() => {
    return typeof window.dataLayer !== 'undefined';
  });
  expect(dataLayerExists).toBe(true);
});

// Test real user journey
test('should track full portfolio discovery journey', async ({ page }) => {
  await page.goto('/');

  // Navigate to portfolio
  await page.locator('a:has-text("M&A")').click();
  await page.waitForURL('/ma-portfolio');

  // View a project
  const firstCard = page.locator('[data-testid="project-card"]').first();
  if (await firstCard.isVisible()) {
    await firstCard.click();

    const modal = page.locator('[data-testid="project-modal"]');
    await expect(modal).toBeVisible();

    // Close modal
    await page.locator('[data-testid="project-modal-close"]').click();
  }

  // Verify events were tracked
  const eventLog = await page.evaluate(() => {
    return (window as any).recordedEvents.length;
  });
  expect(eventLog).toBeGreaterThan(0);
});
```

## Testing Best Practices

### 1. Mock gtag in Unit Tests

Always mock `window.gtag` to verify correct function calls:

```typescript
const mockGtag = vi.fn();
(window as any).gtag = mockGtag;

trackEvent(eventData);

expect(mockGtag).toHaveBeenCalledWith('event', eventName, eventParams);
```

### 2. Test Event Parameters

Verify all event parameters are correct:

```typescript
it('should include project details in event', () => {
  trackPortfolioInteraction('view_details', 'proj-1', 'TechCorp');

  expect(mockGtag).toHaveBeenCalledWith('event', 'portfolio_view_details', {
    event_category: 'portfolio',
    project_id: 'proj-1',
    project_name: 'TechCorp',
  });
});
```

### 3. Test Error Handling

Verify graceful handling when gtag is unavailable:

```typescript
it('should not throw if gtag is not available', () => {
  delete (window as any).gtag;

  expect(() => {
    trackEvent({ event: 'test', category: 'navigation' });
  }).not.toThrow();
});
```

### 4. Test Complete User Journeys

Combine multiple events to test realistic user flows:

```typescript
it('should track user journey: navigation -> view -> filter -> cta', () => {
  trackNavigation('/ma-portfolio', 'M&A Portfolio');
  trackPortfolioInteraction('view_details', 'proj-1', 'TechCorp');
  trackFilterAction('theme', 'AI');
  trackCTA('calendly', 'cta-section');

  expect(mockGtag).toHaveBeenCalledTimes(4);
});
```

### 5. Use data-testid for E2E Selectors

Reference components by data-testid in E2E tests:

```typescript
const firstCard = page.locator('[data-testid="project-card"]').first();
const modal = page.locator('[data-testid="project-modal"]');
const themeToggle = page.locator('[data-testid="theme-toggle"]');
```

## Testing Checklist

- [ ] **Unit Tests**
  - [ ] `trackEvent()` with various event types
  - [ ] Navigation tracking for all links
  - [ ] Portfolio interaction tracking (view, close, filter)
  - [ ] CTA tracking with different types/locations
  - [ ] Theme toggle tracking
  - [ ] Error handling and edge cases

- [ ] **Integration Tests**
  - [ ] GA4 script initialization
  - [ ] dataLayer creation
  - [ ] gtag function availability
  - [ ] DOM event listener integration
  - [ ] Event batching
  - [ ] localStorage integration
  - [ ] Consent mode handling
  - [ ] Error recovery

- [ ] **E2E Tests**
  - [ ] GA4 loads on all pages
  - [ ] Navigation links fire events
  - [ ] Portfolio cards fire events
  - [ ] Modals fire open/close events
  - [ ] Filters fire tracking events
  - [ ] Theme toggle fires events
  - [ ] CTA buttons fire events
  - [ ] Complete journeys work
  - [ ] Mobile/tablet/desktop viewports
  - [ ] Graceful degradation

## Debugging GA Events

### View Raw Events in Tests

```typescript
// Record events for inspection
await page.evaluateHandle(() => {
  const originalGtag = window.gtag;
  (window as any).recordedEvents = [];
  window.gtag = function() {
    (window as any).recordedEvents.push(arguments);
    return originalGtag.apply(this, arguments as any);
  };
});

// Later, inspect events
const recordedEvents = await page.evaluate(() => {
  return (window as any).recordedEvents;
});
console.log('Recorded events:', recordedEvents);
```

### Verify Event Parameters

```typescript
const portfolioViewEvent = recordedEvents.find((args: any) =>
  args[0] === 'event' && args[1] === 'portfolio_view_details'
);

console.log('Portfolio view event:', portfolioViewEvent);
// Expected: ['event', 'portfolio_view_details', {
//   event_category: 'portfolio',
//   project_id: '...',
//   project_name: '...'
// }]
```

### Monitor Network Requests

```typescript
// Log GA requests in E2E tests
await page.on('request', request => {
  if (request.url().includes('google-analytics') ||
      request.url().includes('googletagmanager')) {
    console.log('GA request:', request.url());
  }
});
```

## CI/CD Integration

### GitHub Actions Configuration

```yaml
jobs:
  test-analytics:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:run -- analytics.test.ts

      - name: Run integration tests
        run: npm run test:run -- analytics-integration.test.ts

      - name: Run E2E tests
        run: npm run test:e2e -- analytics.test.ts

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Coverage Reports

### Generate Coverage Report

```bash
# Generate HTML coverage report
npm run test:coverage -- analytics

# View report
open coverage/index.html
```

### Expected Coverage

- **Unit Tests:** 95%+ coverage of `src/utils/analytics.ts`
- **Integration Tests:** 90%+ coverage of GA4 initialization
- **E2E Tests:** 100% coverage of critical user journeys

## Troubleshooting

### gtag is undefined in E2E tests

**Cause:** GA4 script may not have loaded yet
**Solution:** Wait for script to load before testing

```typescript
await page.waitForFunction(() => {
  return typeof window.gtag === 'function';
});
```

### Events not being tracked in E2E

**Cause:** Element not visible or selector incorrect
**Solution:** Use `data-testid` attributes and wait for visibility

```typescript
const element = page.locator('[data-testid="my-element"]');
await expect(element).toBeVisible();
await element.click();
```

### Flaky E2E tests

**Cause:** Timing issues with event firing
**Solution:** Use proper wait conditions

```typescript
// Instead of: page.waitForTimeout(1000)
// Use: wait for specific condition
await page.waitForFunction(() => {
  return (window as any).recordedEvents?.length > 0;
});
```

## Resources

- [Google Analytics 4 Documentation](https://support.google.com/analytics/topic/12154439)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [GA4 Event Reference](https://support.google.com/analytics/answer/9322688)

## Further Reading

- See [GOOGLE_ANALYTICS.md](./GOOGLE_ANALYTICS.md) for GA4 implementation details
- See [TEST_STRATEGY.md](../testing/TEST_STRATEGY.md) for overall testing strategy
