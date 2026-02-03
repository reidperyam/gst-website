# E2E Test Best Practices Guide

This guide documents best practices for writing E2E tests that actually verify functionality, based on issues found during the audit of the ma-portfolio filter bug.

## Critical Issues to Avoid

### 1. ❌ False-Positive Assertions

**Bad:**
```typescript
// Always passes - count is always >= 0
expect(cardCount).toBeGreaterThanOrEqual(0);

// Always passes - || true makes it always true
expect(isFocused || true).toBeTruthy();

// Always passes - typeof is always 'boolean'
expect(typeof isDark).toBe('boolean');
```

**Good:**
```typescript
// Verifies elements actually exist
expect(cardCount).toBeGreaterThan(0);

// Verifies the actual value
expect(isFocused).toBe(true);

// Verifies the actual state
expect(isDark).toBe(expectedValue);
```

### 2. ❌ Testing UI Presence, Not Behavior

**Bad:**
```typescript
test('should apply filter', async ({ page }) => {
  const chip = page.locator('[data-testid="filter-chip"]');
  await chip.click();

  // Only checks if class applied, not if filtering works
  await expect(chip).toHaveClass(/active/);
});
```

**Good:**
```typescript
test('should apply filter', async ({ page }) => {
  const chip = page.locator('[data-testid="filter-chip"]');
  await chip.click();

  // Verify class applied (visual feedback)
  await expect(chip).toHaveClass(/active/);

  // Verify actual filtering works (behavioral verification)
  await page.waitForFunction(() => {
    const state = (window as any).portfolioState;
    return state && state.filters && state.filters.stage === 'growth-category';
  });

  // Get filtered results and verify they changed
  const filteredCards = page.locator('[data-testid="project-card"]');
  const filteredCount = await filteredCards.count();
  expect(filteredCount).toBeGreaterThan(0);
});
```

### 3. ❌ Placeholder Timeouts Instead of State Waits

**Bad:**
```typescript
// Arbitrary 100ms wait - might not be enough, tests fragile
await page.waitForTimeout(100);
const hasClass = await body.evaluate(el => el.classList.contains('dark-theme'));
expect(hasClass).toBe(true);
```

**Good:**
```typescript
// Wait for actual state change
await page.waitForFunction((initialColor) => {
  const bg = window.getComputedStyle(document.body).backgroundColor;
  return bg !== initialColor;
}, initialBgColor, { timeout: 5000 });

const newBg = await body.evaluate(el =>
  window.getComputedStyle(el).backgroundColor
);
expect(newBg).not.toBe(initialBgColor);
```

### 4. ❌ Checking CSS Classes, Not Actual CSS Properties

**Bad:**
```typescript
test('should apply dark theme', async ({ page }) => {
  const body = page.locator('body');
  await themeToggle.click();

  // Only checks class name
  const hasDarkClass = await body.evaluate(el =>
    el.classList.contains('dark-theme')
  );
  expect(hasDarkClass).toBe(true);
});
```

**Good:**
```typescript
test('should apply dark theme with correct styling', async ({ page }) => {
  const body = page.locator('body');

  const initialBg = await body.evaluate(el =>
    window.getComputedStyle(el).backgroundColor
  );

  await themeToggle.click();

  // Wait for actual CSS to change
  await page.waitForFunction((initialColor) => {
    const bg = window.getComputedStyle(document.body).backgroundColor;
    return bg !== initialColor;
  }, initialBg);

  // Verify both class AND actual CSS properties changed
  const darkClass = await body.evaluate(el =>
    el.classList.contains('dark-theme')
  );
  const bgColor = await body.evaluate(el =>
    window.getComputedStyle(el).backgroundColor
  );

  expect(darkClass).toBe(true);
  expect(bgColor).not.toBe(initialBg);
  expect(['rgb(0, 0, 0)', 'rgb(26, 26, 26)']).toContain(bgColor);
});
```

## Best Practices

### 1. Test User Interactions → Results

Every test should follow this pattern:
1. Setup (get initial state)
2. Interact (user action)
3. Wait (for actual state change)
4. Verify (results match expectations)

```typescript
test('should update project list when filter applied', async ({ page }) => {
  // 1. Setup - Get initial state
  const initialCards = page.locator('[data-testid="project-card"]');
  const initialCount = await initialCards.count();

  // 2. Interact - User action
  const filterButton = page.locator('[data-testid="filter-chip"]');
  await filterButton.click();

  // 3. Wait - For actual state change
  await page.waitForFunction(() => {
    const state = (window as any).portfolioState;
    return state && state.filters && state.filters.stage === 'growth';
  }, { timeout: 5000 });

  // 4. Verify - Results
  const filteredCards = page.locator('[data-testid="project-card"]');
  const filteredCount = await filteredCards.count();

  // Count may be same or different depending on data
  // But state MUST have changed
  const filterState = await page.evaluate(() =>
    (window as any).portfolioState?.filters?.stage
  );
  expect(filterState).toBe('growth');
});
```

### 2. Verify State Changes Before/After

Always compare state before and after actions:

```typescript
test('should toggle theme', async ({ page }) => {
  const body = page.locator('body');

  // Get BEFORE state
  const beforeState = await body.evaluate(el => ({
    hasDarkClass: el.classList.contains('dark-theme'),
    bgColor: window.getComputedStyle(el).backgroundColor
  }));

  // Action
  await page.locator('[data-testid="theme-toggle"]').click();

  // Wait for change
  await page.waitForFunction((before) => {
    const now = window.getComputedStyle(document.body).backgroundColor;
    return now !== before;
  }, beforeState.bgColor);

  // Get AFTER state
  const afterState = await body.evaluate(el => ({
    hasDarkClass: el.classList.contains('dark-theme'),
    bgColor: window.getComputedStyle(el).backgroundColor
  }));

  // VERIFY they're different
  expect(afterState.hasDarkClass).not.toBe(beforeState.hasDarkClass);
  expect(afterState.bgColor).not.toBe(beforeState.bgColor);
});
```

### 3. Use Proper Waiting Mechanisms

**Bad:**
```typescript
await page.waitForTimeout(100); // Arbitrary wait
```

**Good:**
```typescript
// Wait for specific element
await page.waitForSelector('[data-testid="modal"]');

// Wait for element to be visible
await expect(page.locator('[data-testid="modal"]')).toBeVisible();

// Wait for function (custom state check)
await page.waitForFunction(() => {
  const state = (window as any).portfolioState;
  return state && state.filters && state.filters.active === 'growth';
});

// Wait for specific condition with timeout
await page.waitForFunction(() => {
  return document.querySelectorAll('.active').length > 0;
}, { timeout: 5000 });
```

### 4. Test Behavioral Features, Not Implementation Details

**Bad:**
```typescript
// Tests implementation detail (class name)
test('should add active class', async ({ page }) => {
  await chip.click();
  expect(chip).toHaveClass('active');
});
```

**Good:**
```typescript
// Tests observable behavior
test('should highlight selected filter', async ({ page }) => {
  // Verify filter is clickable
  await expect(chip).toBeEnabled();

  // Click it
  await chip.click();

  // Verify it's now selected (could be class, attribute, or anything)
  expect(await chip.evaluate(el => {
    return el.classList.contains('active') ||
           el.getAttribute('aria-selected') === 'true';
  })).toBe(true);

  // Verify other filters are deselected
  const otherChips = page.locator('[data-testid="filter-chip"]').not(chip);
  for (const other of await otherChips.all()) {
    expect(await other.evaluate(el =>
      el.classList.contains('active')
    )).toBe(false);
  }
});
```

### 5. Add Explicit Assertions for Expected Values

**Bad:**
```typescript
// Vague - could be any badge
const badge = page.locator('[data-testid="filter-badge"]');
await expect(badge).toBeVisible();
```

**Good:**
```typescript
// Explicit - verify exact content
const badge = page.locator('[data-testid="filter-badge"]');
const badgeText = await badge.textContent();
expect(badgeText).toBe('1'); // Exactly 1 filter applied

// Or for more complex scenarios:
const badgeVisible = await badge.isVisible();
const badgeCount = parseInt(await badge.textContent() || '0');
expect(badgeVisible && badgeCount > 0).toBe(true);
```

## Common Test Patterns

### Pattern 1: Filter/Search Interaction

```typescript
test('should filter projects by stage', async ({ page }) => {
  // Initialize
  await page.waitForFunction(() => (window as any).__portfolioInitialized);

  // Get initial count
  const allCards = await page.locator('[data-testid="project-card"]').count();

  // Open and apply filter
  await page.locator('[data-testid="filter-toggle"]').click();
  await page.locator('[data-testid="filter-chip-stage-growth"]').click();

  // Wait for filter to apply
  await page.waitForFunction(() => {
    const state = (window as any).portfolioState;
    return state?.filters?.stage === 'growth-category';
  });

  // Verify visual feedback
  await expect(
    page.locator('[data-testid="filter-chip-stage-growth"]')
  ).toHaveClass(/active/);

  // Verify "All" is no longer active
  await expect(
    page.locator('[data-testid="filter-chip-stage-all"]')
  ).not.toHaveClass(/active/);
});
```

### Pattern 2: Theme Toggle

```typescript
test('should toggle between light and dark themes', async ({ page }) => {
  const body = page.locator('body');

  // Get initial state
  const before = await body.evaluate(el => ({
    class: el.className,
    bg: window.getComputedStyle(el).backgroundColor
  }));

  // Toggle theme
  await page.locator('[data-testid="theme-toggle"]').click();

  // Wait for actual CSS change (not class change)
  await page.waitForFunction((initialBg) => {
    return window.getComputedStyle(document.body).backgroundColor !== initialBg;
  }, before.bg);

  // Get new state
  const after = await body.evaluate(el => ({
    class: el.className,
    bg: window.getComputedStyle(el).backgroundColor
  }));

  // Verify both changed
  expect(before.class).not.toBe(after.class);
  expect(before.bg).not.toBe(after.bg);
});
```

### Pattern 3: Modal Interaction

```typescript
test('should open modal with correct project details', async ({ page }) => {
  // Get initial state
  expect(await page.locator('[data-testid="project-modal"]').isVisible()).toBe(false);

  // Click to open
  await page.locator('[data-testid="project-card"]').first().click();

  // Wait for modal to open AND content to load
  const modal = page.locator('[data-testid="project-modal"]');
  await expect(modal).toBeVisible();

  // Wait for specific content
  await page.waitForFunction(() => {
    return document.querySelector('[data-testid="project-title"]')?.textContent?.length > 0;
  });

  // Verify content
  const title = await modal.locator('[data-testid="project-title"]').textContent();
  expect(title).toBeTruthy();
  expect(title?.length).toBeGreaterThan(0);
});
```

## Red Flags - Tests to Fix

If your test has any of these, it's likely a false positive:

1. ✗ `expect(...).toBeGreaterThanOrEqual(0)` - Always passes
2. ✗ `expect(value || true).toBeTruthy()` - Always passes
3. ✗ `expect(typeof x).toBe('boolean')` - Always passes
4. ✗ Only checks UI presence (isVisible, exists) without behavior
5. ✗ No `.waitForFunction()` before checking results
6. ✗ Only verifies CSS classes, not actual applied styles
7. ✗ Uses arbitrary `waitForTimeout()` waits
8. ✗ Clicks element but never checks result of click
9. ✗ Gets initial state but never compares to final state
10. ✗ Comments like "allow for X not working" that silence failures

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test tests/e2e/portfolio-discovery.test.ts

# Run with headed browser to see what's happening
npx playwright test --headed

# Run single test
npx playwright test portfolio-discovery.test.ts -g "should apply stage filter"

# Run with verbose output
npx playwright test --verbose

# Generate HTML report
npx playwright test && npx playwright show-report
```

## Debugging Tests

1. **Add console logs**:
   ```typescript
   const state = await page.evaluate(() => (window as any).portfolioState);
   console.log('Portfolio state:', state);
   ```

2. **Take screenshots**:
   ```typescript
   await page.screenshot({ path: 'screenshot.png' });
   ```

3. **Use headed mode**:
   ```bash
   npx playwright test --headed
   ```

4. **Pause on failure**:
   ```typescript
   await page.pause(); // Execution pauses, you can inspect
   ```

## Summary

The key principle: **Test what users experience, not implementation details.**

- ✅ Test user interactions and their results
- ✅ Verify state changes (before/after)
- ✅ Wait for actual state changes, not arbitrary timeouts
- ✅ Check both visual feedback (classes) AND actual behavior (CSS, state, data)
- ✅ Use explicit assertions with expected values
- ✗ Don't test UI presence without behavior
- ✗ Don't use meaningless assertions
- ✗ Don't use arbitrary timeouts
- ✗ Don't assume CSS classes mean functionality works
