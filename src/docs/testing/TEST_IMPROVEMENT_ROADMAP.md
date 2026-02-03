# E2E Test Improvement Roadmap

**Document Version:** 1.0
**Last Updated:** February 2, 2026
**Status:** Active - In Progress

---

## Overview

This document provides a prioritized roadmap for improving the remaining E2E tests that were identified as weak or problematic during the comprehensive audit conducted on 2026-02-02.

**Current Status:**
- ✅ **Critical bug fixed:** Filter selector mismatch resolved
- ✅ **69 filter tests added:** All passing across all browsers
- ✅ **4 test files improved:** False positives eliminated, behavior verification added
- ⚠️ **5 test files remaining:** Improvements needed (this roadmap)
- ✅ **Best practices documented:** See [TEST_BEST_PRACTICES.md](./TEST_BEST_PRACTICES.md)

---

## Context for Next Developer

### What Happened

The project had a critical situation where:
1. **Feature was broken:** Filter toggles on ma-portfolio page were completely non-functional
2. **Tests passed:** All 180+ E2E tests passed despite broken functionality
3. **Root cause:** CSS class selector mismatch (HTML used `.filter-chip`, JS used `.chip`)
4. **Test gap:** Tests checked UI presence, not actual behavior

### What Was Fixed

1. **Bug Fix:** Updated 5+ selectors in PortfolioHeader.astro (Commit: ffdcf8d)
2. **Test Additions:** Added 69 comprehensive filter tests (Commit: ffdcf8d)
3. **Test Improvements:** Fixed 4 test files, removed false positives (Commit: 99b287e)
4. **Documentation:** Created comprehensive best practices guide (Commit: 727c6d9)

### Key Learning

**Tests must verify behavior, not just UI presence.** The pattern is:
1. **Setup** - Get initial state
2. **Interact** - Perform user action
3. **Wait** - For actual state change (not arbitrary timeout)
4. **Verify** - Check results match expectations

See [TEST_BEST_PRACTICES.md](./TEST_BEST_PRACTICES.md) for detailed patterns.

---

## Test Files Status

### Already Improved ✅

| File | Issues Found | Fixes Applied |
|------|--------------|----------------|
| `portfolio-discovery.test.ts` | 2 false positives, weak filter tests | ✅ FIXED |
| `theme-toggle.test.ts` | 1 false positive, class-only checks | ✅ FIXED |
| `about-page.test.ts` | 1 false positive | ✅ FIXED |
| `mobile-navigation.test.ts` | Weak state verification | ✅ FIXED |
| `portfolio-filtering.test.ts` | Weak integration tests | ✅ FIXED |

### Needs Improvement ⚠️

| File | Quality | Issues | Priority |
|------|---------|--------|----------|
| `homepage.test.ts` | WEAK | 2 tests, only checks UI presence | Medium |
| `project-details.test.ts` | WEAK | 6 tests, brittle HTML searches | High |
| `analytics.test.ts` | MIXED | Some good, some with false positives | Medium |
| `about-page.test.ts` (partial) | MIXED | Some tests still check only classes | Low |
| `theme-toggle.test.ts` (partial) | MIXED | Some tests check classes not CSS | Low |

---

## Detailed Improvement Tasks

### TASK 1: Fix `homepage.test.ts` (Priority: Medium)

**File:** `tests/e2e/homepage.test.ts`

**Current Status:** 2 weak tests

**Issues Found:**
1. **"should load the homepage"** (line 10-18)
   - Only checks if title exists
   - No verification of specific page content
   - No error state checking

2. **"should have main content"** (line 20-27)
   - Only checks HTML length > 100
   - Could be error page and still pass

**What to Fix:**

```typescript
// BEFORE - Line 10-18
test('should load the homepage', async ({ page }) => {
  const pageTitle = page.locator('h1, title, [role="heading"]');
  await expect(pageTitle).toBeTruthy(); // ❌ Always passes
  const body = page.locator('body');
  await expect(body).toBeVisible();
});

// AFTER - Should verify specific content
test('should load the homepage', async ({ page }) => {
  // Wait for content to fully load
  await page.waitForLoadState('domcontentloaded');

  // Verify page has proper structure
  const nav = page.locator('header, nav');
  await expect(nav).toBeVisible();

  // Verify no error messages appear
  const errors = page.locator('[role="alert"], .error, .error-message');
  expect(await errors.count()).toBe(0);

  // Verify specific homepage content (e.g., hero section, CTA)
  const mainContent = page.locator('main, [role="main"]');
  await expect(mainContent).toBeVisible();
});
```

**Acceptance Criteria:**
- ✅ Test verifies page navigation exists
- ✅ Test checks for absence of error states
- ✅ Test confirms main content is visible
- ✅ No arbitrary UI presence checks

**Estimated Effort:** 30 minutes

---

### TASK 2: Fix `project-details.test.ts` (Priority: High)

**File:** `tests/e2e/project-details.test.ts`

**Current Status:** 6 weak tests

**Issues Found:**

1. **"should display project information sections"** (line 30-49)
   - Searches page HTML for text strings
   - Extremely brittle - could be in comments, hidden elements, wrong context
   - No structural verification

2. **"should have technology information displayed"** (line 51-63)
   - Searches for tech keywords in page content
   - No actual tech display element verification
   - False positives if tech appears elsewhere

3. **"should support keyboard interaction for details"** (line 65-82)
   - Has false positive: `expect(isFocused || true).toBeTruthy();` ✅ ALREADY FIXED
   - Doesn't verify modal content changes

4. **"should handle rapid interaction"** (line 84-108)
   - Clicks multiple cards but never verifies different project details
   - Only checks body visibility at end

5. **"should maintain page responsiveness during interaction"** (line 141-162)
   - Tests browser's native scroll, not app responsiveness
   - Doesn't verify modal stays accessible after scroll

6. **"should display founder photo in landscape layout"** (line 66-77)
   - Only checks width > height attributes
   - Doesn't verify image loads/renders at those dimensions

**What to Fix Example:**

```typescript
// BEFORE
test('should display project information sections', async ({ page }) => {
  // Gets raw HTML content - extremely brittle
  const content = await page.content();

  const hasARR = content.includes('ARR') || content.includes('arr');
  const hasIndustry = content.includes('Industry') || content.includes('industry');

  expect(hasARR || hasIndustry).toBeTruthy(); // ❌ Searches entire page
});

// AFTER - Target specific elements
test('should display project information sections', async ({ page }) => {
  // Open a project
  const card = page.locator('[data-testid="project-card"]').first();
  await card.click();

  const modal = page.locator('[data-testid="project-modal"]');
  await expect(modal).toBeVisible();

  // Verify specific information sections exist in modal
  const arrSection = modal.locator('[data-testid*="arr"], h3:has-text("ARR")');
  const industrySection = modal.locator('[data-testid*="industry"], h3:has-text("Industry")');

  // At least one section should exist
  const hasContent = await arrSection.isVisible() || await industrySection.isVisible();
  expect(hasContent).toBe(true);

  // Verify content is not empty
  const sectionText = await modal.locator('[data-testid="project-details"]').textContent();
  expect(sectionText?.length).toBeGreaterThan(10);
});
```

**Acceptance Criteria:**
- ✅ Tests target specific DOM elements, not raw HTML
- ✅ Modal interaction is verified (open → verify content)
- ✅ Different projects show different details
- ✅ No brittle string searches
- ✅ Proper keyboard interaction testing
- ✅ Responsiveness verified with actual behavior, not native scroll

**Estimated Effort:** 2-3 hours

---

### TASK 3: Fix `analytics.test.ts` (Priority: Medium)

**File:** `tests/e2e/analytics.test.ts`

**Current Status:** 30+ tests, MIXED quality

**Issues Found:**

1. **"should track filter application"** (line 220-243)
   - Has multiple `.catch(() => false)` that swallow errors
   - Comment: "Test passes even if filters don't exist"
   - Should skip or explicitly fail if filters missing

2. **"should track events independently of page navigation"** (line 365-384)
   - No actual assertions, just logs
   - Comment: "No assertions" on line 376
   - Test always passes

3. **"should continue tracking if gtag is temporarily unavailable"** (line 434-454)
   - Deletes gtag, performs action, restores gtag
   - Only checks final URL, not event tracking
   - Doesn't verify events were tracked after restoration

**What to Fix Example:**

```typescript
// BEFORE
test('should track filter application', async ({ page }) => {
  // ... setup ...

  // Has defensive code that allows test to pass if feature missing
  const filterChips = await page.locator('[data-testid*="filter-chip"]').count()
    .catch(() => 0);

  if (filterChips > 0) {
    // Test only runs if filters exist
    // Test passes even if filter click doesn't track
  }
  // ❌ If filters don't exist, test passes silently
});

// AFTER - Fail explicitly or skip
test('should track filter application', async ({ page }) => {
  // ... setup ...

  // Explicitly check prerequisites
  const filterChips = page.locator('[data-testid*="filter-chip"]');
  const chipCount = await filterChips.count();

  // FAIL if feature doesn't exist (don't silently pass)
  expect(chipCount).toBeGreaterThan(0);

  // Then test tracking
  const events: any[] = [];
  page.on('console', (msg) => {
    if (msg.text().includes('gtag')) {
      events.push(msg.text());
    }
  });

  await filterChips.first().click();

  // Wait and verify event was tracked
  expect(events.length).toBeGreaterThan(0);
  expect(events[0]).toContain('filter');
});
```

**Acceptance Criteria:**
- ✅ No `.catch(() => false)` swallowing errors
- ✅ Tests fail explicitly if prerequisites missing
- ✅ Actual event tracking is verified
- ✅ All assertions have meaningful checks

**Estimated Effort:** 1-2 hours

---

### TASK 4: Finish `about-page.test.ts` (Priority: Low)

**File:** `tests/e2e/about-page.test.ts`

**Current Status:** Mostly strong, 2 remaining issues

**Issues Found:**

1. **"should display founder photo in landscape layout"** (line 66-77)
   - Only checks width > height attributes
   - Doesn't verify image actually loads and renders

2. **"should maintain signature aspect ratio across themes"** (line 205-231)
   - Checks CSS width property, not actual aspect ratio
   - Doesn't verify width/height ratio is maintained

**What to Fix:**

```typescript
// BEFORE
test('should display founder photo in landscape layout', async ({ page }) => {
  const img = page.locator('img[alt*="founder"]');
  const width = await img.getAttribute('width');
  const height = await img.getAttribute('height');

  const w = parseInt(width || '0');
  const h = parseInt(height || '0');

  expect(w > h).toBe(true); // ❌ Only checks attributes, not actual render
});

// AFTER - Verify actual rendering
test('should display founder photo in landscape layout', async ({ page }) => {
  const img = page.locator('img[alt*="founder"]');

  // Wait for image to load
  await expect(img).toBeVisible();

  // Get actual rendered dimensions
  const box = await img.boundingBox();
  expect(box).toBeTruthy();

  if (box) {
    // Verify landscape aspect ratio
    expect(box.width > box.height).toBe(true);

    // Verify reasonable size
    expect(box.width).toBeGreaterThan(100);
    expect(box.height).toBeGreaterThan(50);
  }
});
```

**Acceptance Criteria:**
- ✅ Images verified to be loaded and visible
- ✅ Actual rendered dimensions checked, not attributes
- ✅ Aspect ratio calculation is correct

**Estimated Effort:** 30 minutes

---

### TASK 5: Finish `theme-toggle.test.ts` (Priority: Low)

**File:** `tests/e2e/theme-toggle.test.ts`

**Current Status:** Mostly improved, 2-3 remaining weak tests

**Issues Found:**

1. **"should have readable text on all themes"** (line 128-150)
   - Checks computed font size >= 12px
   - Doesn't check actual visibility or contrast

2. **"should handle rapid theme toggles"** (line 152-165)
   - Toggles 5 times with 50ms waits
   - Only final check is body visibility
   - Doesn't verify theme state is correct after rapid toggles

3. **"should not block other interactions while theme is toggled"** (line 185-203)
   - Only checks button count >= 2
   - Doesn't actually click another button

**What to Fix:**

```typescript
// BEFORE
test('should have readable text on all themes', async ({ page }) => {
  // ... toggle theme ...

  const fontSize = await card.evaluate(el =>
    window.getComputedStyle(el).fontSize
  );

  const size = parseInt(fontSize);
  expect(size).toBeGreaterThanOrEqual(12); // ❌ Only font size, no contrast
});

// AFTER - Check actual visibility
test('should have readable text on all themes', async ({ page }) => {
  // ... toggle theme ...

  const card = page.locator('[data-testid="project-card"]').first();

  // Check font size
  const fontSize = await card.evaluate(el =>
    window.getComputedStyle(el).fontSize
  );
  const size = parseInt(fontSize);
  expect(size).toBeGreaterThanOrEqual(12);

  // Check contrast (simplified - just verify colors are different)
  const textColor = await card.evaluate(el =>
    window.getComputedStyle(el).color
  );
  const bgColor = await card.evaluate(el =>
    window.getComputedStyle(el).backgroundColor
  );

  expect(textColor).not.toBe(bgColor);
});
```

**Acceptance Criteria:**
- ✅ Font size is checked
- ✅ Basic contrast verification (colors different)
- ✅ Rapid toggles verify final state is correct
- ✅ Other interactions are actually tested

**Estimated Effort:** 1 hour

---

## Implementation Order

### Week 1
1. **TASK 1:** Fix `homepage.test.ts` (Medium priority, quick win)
2. **TASK 2:** Start `project-details.test.ts` (High priority, longer task)

### Week 2
2. **TASK 2 (continued):** Finish `project-details.test.ts`
3. **TASK 3:** Fix `analytics.test.ts` (Medium priority)

### Week 3
4. **TASK 4:** Finish `about-page.test.ts` (Low priority, quick)
5. **TASK 5:** Finish `theme-toggle.test.ts` (Low priority, quick)
6. Run full E2E test suite and verify all tests pass

---

## Testing Guidelines

### Before Starting Any Task

1. **Read** [TEST_BEST_PRACTICES.md](./TEST_BEST_PRACTICES.md)
2. **Reference** the "Red Flags" section (10 items to avoid)
3. **Follow** the pattern: Setup → Interact → Wait → Verify

### While Implementing

1. **Follow the pattern:**
   ```typescript
   // 1. Setup - Get initial state
   const initialState = await element.evaluate(...);

   // 2. Interact - User action
   await button.click();

   // 3. Wait - For actual state change
   await page.waitForFunction(() => {
     return actualStateChanged;
   });

   // 4. Verify - Check results
   expect(newState).not.toBe(initialState);
   ```

2. **Avoid these patterns:**
   - ❌ `expect(value).toBeGreaterThanOrEqual(0)` - Always passes
   - ❌ `expect(value || true).toBeTruthy()` - Always passes
   - ❌ `page.waitForTimeout(100)` - Arbitrary wait
   - ❌ Only checking CSS classes, not actual CSS properties
   - ❌ Testing UI presence without behavior

3. **Use proper waits:**
   - ✅ `await expect(element).toBeVisible()`
   - ✅ `await page.waitForSelector('[data-testid="...]')`
   - ✅ `await page.waitForFunction(() => condition)`

### After Implementing Each Task

1. **Run the specific test file:**
   ```bash
   npx playwright test tests/e2e/FILENAME.test.ts
   ```

2. **Verify all tests pass:**
   - Run across all browsers (chromium, firefox, webkit)
   - Check output for 3 PASSED per test (one per browser)

3. **Run full test suite:**
   ```bash
   npm run test:e2e
   ```

4. **Commit with descriptive message:**
   ```bash
   git commit -m "Improve E2E tests: task name and what was fixed"
   ```

---

## Helpful References

### Test Best Practices
- Location: [src/docs/testing/TEST_BEST_PRACTICES.md](./TEST_BEST_PRACTICES.md)
- Covers: Common patterns, red flags, debugging tips

### Test Strategy Documentation
- Location: [src/docs/testing/TEST_STRATEGY.md](./TEST_STRATEGY.md)
- Covers: Overall testing approach and philosophy

### Common Commands

```bash
# Run unit/integration tests
npm run test

# Run all E2E tests
npm run test:e2e

# Run specific E2E test file
npx playwright test tests/e2e/FILENAME.test.ts

# Run with headed browser (see what happens)
npx playwright test --headed

# Run single test with verbose output
npx playwright test -g "test name" --verbose

# Generate HTML report
npx playwright test && npx playwright show-report
```

---

## Git History (For Reference)

```
3e9257f - Move TEST_BEST_PRACTICES.md to src/docs/testing directory
727c6d9 - Add comprehensive E2E test best practices guide
99b287e - Audit and fix E2E tests - eliminate false positives and strengthen assertions
ffdcf8d - Fix critical filter selector bug and add comprehensive filter tests
```

All fixes follow the pattern: Fix → Test → Document → Commit

---

## Contact Points

If you get stuck or have questions:

1. **Review TEST_BEST_PRACTICES.md** - Most questions answered there
2. **Check recent commits** - See how similar tests were fixed
3. **Run tests with --headed** - Watch what actually happens in browser
4. **Use page.pause()** - Pause execution to inspect state

---

## Success Criteria for This Roadmap

When all tasks are complete:

1. ✅ All 9 E2E test files are Strong quality
2. ✅ Zero false-positive assertions
3. ✅ All tests verify behavior, not just presence
4. ✅ All tests use proper waiting mechanisms
5. ✅ Full E2E test suite passes across all browsers
6. ✅ Future developers can reference best practices doc

---

**Document Owner:** Previous developer audit
**Last Updated:** 2026-02-02
**Next Review:** After all roadmap tasks complete

Good luck! You've got this. The patterns are well-established, and you have excellent reference documentation.
