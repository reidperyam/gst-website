# Quick Reference Card - CI/CD & Testing

## What Was Created

| File | Purpose | Status |
|------|---------|--------|
| `.github/workflows/test.yml` | Main test workflow | ✅ Ready |
| `.github/workflows/deploy-preview.yml` | PR feedback | ✅ Ready |
| `.github/workflows/deployment-status.yml` | Status updates | ✅ Ready |
| `TEST_STRATEGY.md` | Complete strategy | ✅ Done |
| `GITHUB_ACTIONS_SETUP.md` | Quick start guide | ✅ Done |
| `BRANCH_PROTECTION_CONFIG.md` | Branch rules | ✅ Done |
| `CI_CD_SUMMARY.md` | Architecture overview | ✅ Done |

## Next Steps (In Order)

```
1. Read TEST_STRATEGY.md (30 min)
   ↓
2. Commit workflows to .github/workflows/ (1 min)
   ↓
3. Follow GITHUB_ACTIONS_SETUP.md (15 min)
   ↓
4. Setup branch protection (BRANCH_PROTECTION_CONFIG.md) (10 min)
   ↓
5. Install test dependencies (5 min)
   ↓
6. Create test configs from TEST_STRATEGY.md (15 min)
   ↓
7. Write tests (ongoing)
```

## Installation Commands

```bash
# Install test dependencies
npm install --save-dev \
  vitest \
  playwright \
  @playwright/test \
  jsdom \
  @vitest/ui \
  @vitest/coverage-v8

# Add to package.json (copy from TEST_STRATEGY.md section 6)
# Then:

# Run tests
npm test                # Watch mode
npm run test:run       # Single run
npm run test:coverage  # With coverage
npm run test:e2e       # E2E only
npm run test:all       # Everything
```

## How It Works

### On Push to Main
```
1. Tests start (3-5 min after push)
2. Vercel deployment starts (simultaneously)
3. Tests finish → results posted to Actions tab
4. Vercel finishes → site deployed
```

### On Pull Request
```
1. Tests start immediately
2. Vercel preview created
3. Tests posted as comment
4. ❌ Fail? Can't merge
5. ✅ Pass? Mergeable
```

## File Structure to Create

```
tests/
├── setup.ts                    (test setup)
├── unit/
│   ├── data-validation.test.ts
│   ├── abbreviate.test.ts
│   └── ...
├── integration/
│   ├── portfolio-filtering.test.ts
│   ├── portfolio-grid.test.ts
│   └── ...
├── e2e/
│   ├── discover-project.test.ts
│   ├── view-project-details.test.ts
│   └── ...
└── fixtures/
    ├── mock-projects.ts
    └── test-data.ts

Config files:
├── vitest.config.ts
└── playwright.config.ts
```

## Key Commands

```bash
# Development
npm run dev          # Start dev server

# Testing
npm test            # Watch mode
npm run test:run    # Single run all
npm run test:coverage # With coverage report
npm run test:e2e    # E2E tests only
npm run test:all    # Everything (CI command)

# Building
npm run build       # Build for production
npm run preview     # Preview production build

# CI/CD
npm run test:ui    # Visual test UI
npm run test:e2e:ui # E2E visual UI
npm run test:e2e:debug # Debug E2E
```

## Testing Quick Reference

### Unit Test Template
```typescript
import { describe, it, expect } from 'vitest';

describe('My Function', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

### Integration Test Template
```typescript
import { test, expect, Page } from '@playwright/test';

test('should filter results', async ({ page }) => {
  await page.goto('/ma-portfolio');
  await page.fill('[data-testid="search"]', 'term');
  const results = page.locator('[data-testid="result"]');
  expect(await results.count()).toBeGreaterThan(0);
});
```

### E2E Test Template
```typescript
import { test, expect } from '@playwright/test';

test.describe('User Journey', () => {
  test('should complete task', async ({ page }) => {
    // Arrange
    await page.goto('/');

    // Act
    await page.click('[data-testid="button"]');

    // Assert
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
  });
});
```

## Component Data-TestID Examples

```html
<!-- Search -->
<input data-testid="search-input" />
<button data-testid="search-clear" />

<!-- Filters -->
<button data-testid="filter-growth" />
<button data-testid="filter-mature" />
<button data-testid="filter-clear-all" />

<!-- Grid -->
<div data-testid="project-card" />
<div data-testid="project-card-123" />

<!-- Modal -->
<dialog data-testid="project-modal" />
<button data-testid="modal-close" />

<!-- Other -->
<button data-testid="theme-toggle" />
<div data-testid="sticky-controls" />
```

## GitHub Status Checks

When you create a PR or push:

```
✅ Unit & Integration Tests (18.x)     → MUST PASS
✅ Unit & Integration Tests (20.x)     → MUST PASS
✅ Build Verification                  → MUST PASS
⚠️  E2E Tests                           → SHOULD PASS

If any MUST PASS fails:
→ PR can't merge
→ Must fix and push again
```

## Coverage Targets

| Category | Target |
|----------|--------|
| Overall | 70% |
| Critical Components | 85-95% |
| Utility Functions | 90%+ |
| Portfolio Filtering | 85% |
| Modals | 85% |
| Theme Toggle | 95% |

## Viewing Results

| Where | How | What |
|-------|-----|------|
| **GitHub Actions** | Actions tab | Test logs, artifacts |
| **PR Comments** | PR page | Test summary |
| **Coverage** | `coverage/index.html` | Line-by-line coverage |
| **E2E Report** | Artifacts → Playwright | Screenshots, traces |
| **Codecov** | codecov.io | Coverage trends |

## Troubleshooting

### Tests fail locally
```bash
# Try clean install
rm -rf node_modules package-lock.json
npm ci

# Check Node version
node --version  # Should be 18.x or 20.x

# Run specific test
npm run test tests/unit/my.test.ts
```

### Build fails
```bash
# Clean build
npm run build

# Check what broke
npm run build -- --verbose
```

### E2E tests timeout
Edit `playwright.config.ts`:
```typescript
use: {
  timeout: 30000,  // Increase from default
}
```

### Tests pass locally but fail in CI
- Check Node version matches
- Try `npm ci` (not `npm install`)
- Add explicit waits (not sleeps)
- Use `data-testid` (not selectors)

## Vercel Integration

**Current:** Vercel auto-deploys main on push
**New:** Vercel auto-deploys, tests run in parallel

```
Both are INDEPENDENT:
- Tests don't block Vercel
- Vercel doesn't wait for tests
- Tests provide feedback
- You see results in Actions tab

On PRs:
- Tests MUST pass to merge
- Vercel preview created
- Both finish independently
```

## Team Workflow

```
Developer:
1. Create feature branch
2. Make changes
3. Push to PR
4. Wait for tests (5-10 min)
5. Await review

Reviewer:
1. See test results on PR
2. Review code
3. Try Vercel preview
4. Approve when ready

Developer:
1. Merge PR
2. Main branch tests run
3. Vercel deploys
4. Done!
```

## Emergency: Bypass Tests

**Not recommended**, but if absolutely needed:

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Vercel will redeploy previous version
# (Cleaner than forcing)
```

## Resources

- **Comprehensive Guide:** `TEST_STRATEGY.md`
- **Quick Setup:** `GITHUB_ACTIONS_SETUP.md`
- **Branch Rules:** `BRANCH_PROTECTION_CONFIG.md`
- **Architecture:** `CI_CD_SUMMARY.md`
- **This Document:** `QUICK_REFERENCE.md`

## Key Agents Available

When implementing tests, use these agents:

- **test-strategy-architect** - Design test structure
- **test-automation-specialist** - Write test suites
- **javascript-typescript-expert** - Code quality
- **code-reviewer** - Review test code
- **performance-testing-expert** - Monitor test speed
- **ui-ux-playwright-reviewer** - Review UI tests

## Common Patterns

### Testing filtering logic
```typescript
it('should filter by search term', async () => {
  // Arrange
  const page = await browser.newPage();
  await page.goto('/ma-portfolio');

  // Act
  await page.fill('[data-testid="search"]', 'tech');
  await page.waitForTimeout(400);  // Wait for debounce

  // Assert
  const count = await page.locator('[data-testid="result"]').count();
  expect(count).toBeLessThan(51);
});
```

### Testing modals
```typescript
it('should open modal on click', async () => {
  await page.click('[data-testid="project-card"]');
  const modal = page.locator('[data-testid="project-modal"]');
  await expect(modal).toBeVisible();

  // Close
  await page.click('[data-testid="modal-close"]');
  await expect(modal).not.toBeVisible();
});
```

### Testing theme toggle
```typescript
it('should toggle theme', async () => {
  const isDark = await page.evaluate(() =>
    document.body.classList.contains('dark-theme')
  );

  await page.click('[data-testid="theme-toggle"]');

  const isDarkAfter = await page.evaluate(() =>
    document.body.classList.contains('dark-theme')
  );

  expect(isDarkAfter).toBe(!isDark);
});
```

---

**Last Updated:** 2026-01-28
**Print this card and post it near your workspace**
