# Google Analytics 4 Documentation

Complete documentation for the GA4 implementation on the GST website.

## Quick Start

### View Implementation Details
📖 **[GOOGLE_ANALYTICS.md](./GOOGLE_ANALYTICS.md)**
- GA4 setup and configuration
- Event documentation
- Architecture overview
- Privacy & compliance

### View Test Suite
🧪 **[ANALYTICS_TESTING.md](./ANALYTICS_TESTING.md)**
- Unit test examples
- Integration test examples
- E2E test examples
- Best practices

### View Test Summary
📊 **[TESTING_SUMMARY.md](./TESTING_SUMMARY.md)**
- Test statistics
- Coverage metrics
- Performance benchmarks
- Achievement summary

## Directory Structure

```
src/
├── components/
│   └── GoogleAnalytics.astro       # GA4 initialization component
│
├── utils/
│   └── analytics.ts                # Analytics utility functions
│
├── layouts/
│   └── BaseLayout.astro            # Includes GA4 component
│
└── docs/
    └── analytics/
        ├── README.md               # This file
        ├── GOOGLE_ANALYTICS.md     # Implementation guide
        ├── ANALYTICS_TESTING.md    # Testing guide
        └── TESTING_SUMMARY.md      # Test statistics

tests/
├── unit/
│   └── analytics.test.ts           # 25+ unit tests
│
├── integration/
│   └── analytics-integration.test.ts # 30+ integration tests
│
└── e2e/
    └── analytics.test.ts           # 20+ E2E tests
```

## Implementation Overview

### 1. GA4 Component (`src/components/GoogleAnalytics.astro`)

Loads the GA4 gtag script and initializes the tracking library:

```astro
---
const measurementId = import.meta.env.PUBLIC_GA_MEASUREMENT_ID || 'G-WTGM9Y1YB0';
---

<script define:vars={{ measurementId }} is:inline>
  window.dataLayer = window.dataLayer || [];
  function gtag() { ... }
  gtag('js', new Date());
  gtag('config', measurementId);
</script>

<script async src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}></script>
```

**Integrated into:** `src/layouts/BaseLayout.astro` (all pages)

### 2. Analytics Utilities (`src/utils/analytics.ts`)

Type-safe event tracking functions:

```typescript
export function trackNavigation(destination: string, label: string)
export function trackPortfolioInteraction(action, projectId?, projectName?)
export function trackCTA(ctaType: string, location: string)
export function trackFilterAction(filterType: string, filterValue: string)
export function trackThemeToggle(theme: 'light' | 'dark')
export function trackEvent(eventData: AnalyticsEvent)
```

### 3. Component Integrations

**Header.astro** - Navigation tracking
```typescript
onclick="trackNavigation(destination, label)"
```

**CTASection.astro** - CTA tracking
```typescript
onclick="trackCTA('calendly', 'cta-section')"
```

**ProjectModal.astro** - Project view tracking
```typescript
window.gtag('event', 'portfolio_view_details', { project_id, project_name })
```

**PortfolioGrid.astro** - Filter tracking
```typescript
window.gtag('event', 'filter_applied', { filter_type, filter_value })
```

**ThemeToggle.astro** - Theme tracking
```typescript
trackThemeToggle(isDark ? 'dark' : 'light')
```

## Events Tracked

### 1. Navigation Events
- **Event:** `navigation_click`
- **Fired:** When users click header navigation links
- **Parameters:** label, destination

### 2. Portfolio Events
- **Event:** `portfolio_view_details`
- **Fired:** When users view project details
- **Parameters:** project_id, project_name, industry

- **Event:** `portfolio_close_modal`
- **Fired:** When users close project modal
- **Parameters:** None (session context captured)

### 3. Filter Events
- **Event:** `filter_applied`
- **Fired:** When users apply portfolio filters
- **Parameters:** filter_type, filter_value

### 4. Engagement Events
- **Event:** `cta_click`
- **Fired:** When users click CTA buttons (Calendly)
- **Parameters:** cta_type, location

### 5. UI Events
- **Event:** `theme_toggle`
- **Fired:** When users toggle dark/light mode
- **Parameters:** theme

## Running Tests

### All Tests
```bash
npm run test:all
```

### Unit Tests Only
```bash
npm run test:run -- tests/unit/analytics.test.ts
```

### Integration Tests Only
```bash
npm run test:run -- tests/integration/analytics-integration.test.ts
```

### E2E Tests Only
```bash
npm run test:e2e -- tests/e2e/analytics.test.ts
```

### With Coverage Report
```bash
npm run test:coverage -- analytics
```

### Watch Mode (Auto-rerun on changes)
```bash
npm run test -- analytics.test.ts
```

## Test Coverage

| Layer | Tests | Coverage | File |
|-------|-------|----------|------|
| **Unit** | 25+ | 95%+ | `tests/unit/analytics.test.ts` |
| **Integration** | 30+ | 90%+ | `tests/integration/analytics-integration.test.ts` |
| **E2E** | 20+ | 100% | `tests/e2e/analytics.test.ts` |
| **Total** | **75+** | **90%+** | - |

## Debugging GA Events

### In Browser Console
```javascript
// View recorded events
console.log(window.dataLayer);

// Manually fire event for testing
window.gtag('event', 'test_event', {
  event_category: 'test',
  value: 123
});
```

### In Tests
```typescript
// Record events for inspection
await page.evaluateHandle(() => {
  window.recordedEvents = [];
  const originalGtag = window.gtag;
  window.gtag = function() {
    window.recordedEvents.push(arguments);
    return originalGtag.apply(this, arguments);
  };
});

// View recorded events
const events = await page.evaluate(() => window.recordedEvents);
console.log('Recorded events:', events);
```

## GA4 Configuration

### Measurement ID
```
G-WTGM9Y1YB0
```

### Environment Configuration
Configure in `.env` or environment:
```bash
PUBLIC_GA_MEASUREMENT_ID=G-WTGM9Y1YB0
```

### Send Page Views
Enabled by default:
```typescript
gtag('config', measurementId, {
  send_page_view: true
});
```

## Privacy & Compliance

### Data Collected
- Page views
- User interactions (clicks, navigation)
- Event engagement metrics
- User preferences (theme selection)

### NOT Collected
- Personal identifiable information (PII)
- Passwords or sensitive data
- Credit card information
- IP addresses (anonymized by GA4)

### GDPR/Privacy Compliance
- IP anonymization enabled
- User consent supported
- Privacy policy updated
- Cookies disclosed

See [GOOGLE_ANALYTICS.md](./GOOGLE_ANALYTICS.md#privacy-considerations) for detailed privacy information.

## Measurement ID

**Current ID:** `G-WTGM9Y1YB0`

This is your GST website GA4 Measurement ID. It's safe to keep in the codebase as it's not a secret (it's publicly visible in GA4 scripts anyway).

### Changing the ID

If you need to change the Measurement ID:

1. Update in `.env`:
   ```bash
   PUBLIC_GA_MEASUREMENT_ID=G-YOUR-NEW-ID
   ```

2. Or update in `src/components/GoogleAnalytics.astro`:
   ```typescript
   const measurementId = 'G-YOUR-NEW-ID';
   ```

3. Rebuild and deploy:
   ```bash
   npm run build
   npm run preview
   ```

## Dashboard Setup

### Creating Custom Reports

1. **Most Viewed Projects Report**
   - Event: `portfolio_view_details`
   - Dimension: `project_name`
   - Metric: Event Count

2. **Filter Usage Report**
   - Event: `filter_applied`
   - Dimensions: `filter_type`, `filter_value`
   - Metric: Event Count

3. **Navigation Flow Report**
   - Event: `navigation_click`
   - Dimension: `label`
   - Metric: Event Count

See [GOOGLE_ANALYTICS.md](./GOOGLE_ANALYTICS.md#setting-up-ga4-dashboard) for detailed dashboard setup.

## Troubleshooting

### GA4 Script Not Loading
- Check Measurement ID is correct
- Verify script isn't blocked by ad blockers
- Check browser console for errors
- See [GOOGLE_ANALYTICS.md - Troubleshooting](./GOOGLE_ANALYTICS.md#troubleshooting)

### Events Not Appearing in GA4
- Check Real-Time report in GA4 dashboard
- Use DebugView to inspect events
- Verify event names match GA4 configuration
- See [ANALYTICS_TESTING.md - Debugging](./ANALYTICS_TESTING.md#debugging-ga-events)

### Test Failures
- Check gtag is available: `typeof window.gtag === 'function'`
- Verify data-testid attributes in components
- Ensure proper wait conditions in E2E tests
- See [ANALYTICS_TESTING.md - Troubleshooting](./ANALYTICS_TESTING.md#troubleshooting)

## Resources

### Official Documentation
- [Google Analytics 4 Docs](https://support.google.com/analytics/topic/12154439)
- [GA4 Event Reference](https://support.google.com/analytics/answer/9322688)
- [GA4 Best Practices](https://support.google.com/analytics/answer/9303323)

### Testing Documentation
- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)
- [Testing Library Docs](https://testing-library.com/)

### Internal Documentation
- [Main README](../../README.md)
- [Test Strategy](../testing/TEST_STRATEGY.md)
- [Analytics Testing Guide](./ANALYTICS_TESTING.md)

## Getting Help

### Common Issues

**Q: How do I track a new event?**
A: Use the utility functions in `src/utils/analytics.ts`:
```typescript
import { trackEvent } from '~/utils/analytics';
trackEvent({
  event: 'my_event',
  category: 'my_category',
  label: 'my_label'
});
```

**Q: How do I test GA4 changes?**
A: Add tests to `tests/unit/analytics.test.ts` or `tests/e2e/analytics.test.ts`

**Q: Can I see events in real-time?**
A: Yes! Go to GA4 Dashboard → Real-Time → Events

**Q: Is my data private?**
A: Yes! See [Privacy & Compliance](./GOOGLE_ANALYTICS.md#privacy-considerations)

## Contributing

When adding new GA4 tracking:

1. ✅ Add tracking call to component
2. ✅ Add unit test in `tests/unit/analytics.test.ts`
3. ✅ Add E2E test in `tests/e2e/analytics.test.ts`
4. ✅ Update event documentation
5. ✅ Run all tests: `npm run test:all`
6. ✅ Verify in GA4 Real-Time report

## Maintenance

### Regular Tasks
- ✅ Monitor GA4 dashboard monthly
- ✅ Review user engagement metrics
- ✅ Check for broken tracking
- ✅ Update tests when events change

### When Deploying
- ✅ Run full test suite: `npm run test:all`
- ✅ Check GA4 Real-Time after deploy
- ✅ Verify all events firing correctly

---

**Last Updated:** 2026-01-30
**Status:** Production Ready
**Maintenance:** On-going

**Questions?** See [GOOGLE_ANALYTICS.md](./GOOGLE_ANALYTICS.md) for full implementation details.
