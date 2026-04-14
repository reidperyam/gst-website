# Regression Test Plan — Platform Hardening V1

Manual regression test plan for the GST website after Platform Hardening V1 (236 files changed across 9 phases). Execute against the local dev server (`npm run dev` at http://localhost:4321).

**Scope**: CSS architecture, data validation, CI/CD, accessibility, SEO, analytics, Sentry monitoring, security headers, and cleanup.

**Agent instructions**: Use Playwright MCP browser tools. Capture screenshots on failure. Check browser console for errors on every page load.

---

## 1. Cross-Cutting Features

Test on **every page** listed below. For efficiency, open each page once and verify all items before moving to the next.

**Pages** (19 routes):

| #   | URL                                         | Name                           |
| --- | ------------------------------------------- | ------------------------------ |
| 1   | `/`                                         | Homepage                       |
| 2   | `/about`                                    | About                          |
| 3   | `/services`                                 | Services                       |
| 4   | `/brand`                                    | Brand Style Reference          |
| 5   | `/ma-portfolio`                             | M&A Portfolio                  |
| 6   | `/hub`                                      | Hub Gateway                    |
| 7   | `/hub/tools`                                | Tools Index                    |
| 8   | `/hub/radar`                                | The Radar                      |
| 9   | `/hub/tools/techpar`                        | TechPar                        |
| 10  | `/hub/tools/regulatory-map`                 | Regulatory Map                 |
| 11  | `/hub/tools/diligence-machine`              | Diligence Machine              |
| 12  | `/hub/tools/tech-debt-calculator`           | Tech Debt Calculator           |
| 13  | `/hub/tools/infrastructure-cost-governance` | Infrastructure Cost Governance |
| 14  | `/hub/library`                              | Library Index                  |
| 15  | `/hub/library/business-architectures`       | Business Architectures         |
| 16  | `/hub/library/vdr-structure`                | VDR Structure                  |
| 17  | `/privacy`                                  | Privacy Policy                 |
| 18  | `/terms`                                    | Terms & Conditions             |
| 19  | `/nonexistent-page`                         | 404 Error Page                 |

**For each page**:

- [ ] Page loads without JavaScript console errors
- [ ] Header: GST logo links to `/`
- [ ] Header: nav links work (Services → `/services`, M&A → `/ma-portfolio`, Hub → `/hub`, About → `/about`)
- [ ] Header: active nav item highlighted for current section
- [ ] Breadcrumbs: present on all pages except homepage; links navigate correctly; last item is plain text (not a link)
- [ ] Footer: LinkedIn link opens external URL
- [ ] Footer: Privacy and Terms links navigate correctly
- [ ] Footer: theme toggle button visible and functional
- [ ] Theme toggle: clicking toggles `dark-theme` class on `<html>`, visual change is immediate
- [ ] Theme persistence: after toggling, reload page — theme persists
- [ ] No horizontal scrollbar at any viewport width (check at 1280px and 375px)

---

## 2. Responsive Breakpoints

Spot-check on 5 key pages at 5 viewport widths.

**Pages**: `/`, `/ma-portfolio`, `/hub/tools/techpar`, `/hub/tools/regulatory-map`, `/brand`

**Viewports**: 1280px, 1024px, 768px, 480px, 375px

**For each page x viewport**:

- [ ] Layout reflows correctly (grids collapse from multi-column to single-column)
- [ ] All text readable, no overflow or clipping
- [ ] Buttons and interactive elements have touch targets >= 44px at mobile widths (480px, 375px)
- [ ] No content hidden unintentionally (sections not collapsed or cut off)
- [ ] Images scale without distortion

---

## 3. Dark Theme Visual Verification

Toggle to dark theme, then visit **every page** and verify:

- [ ] All backgrounds use dark tokens — no white/light flashes or unstyled sections
- [ ] Text has sufficient contrast against dark backgrounds (readable without squinting)
- [ ] Borders visible — not disappearing into the dark background
- [ ] `/about`: founder photo shows dark variant; signature shows dark variant
- [ ] Color-primary (#05cd99 teal) still prominent on buttons, links, accents
- [ ] Frosted glass effects visible on buttons and cards (semi-transparent with blur)
- [ ] Modals and overlays use dark backgrounds (test on `/ma-portfolio` project modal)
- [ ] Input fields have visible borders and readable placeholder text
- [ ] Filter chips and badges readable in dark theme

---

## 4. Page-Specific Functional Tests

### 4.1 Homepage (`/`)

- [ ] Hero section renders with headline and two CTAs
- [ ] "Schedule an Intro Call" links to Calendly (external)
- [ ] "View Advisory Services" links to `/services`
- [ ] Stats bar displays numeric figures (not empty or NaN)
- [ ] All content sections visible: Who We Support, What We Do, Why Clients Trust Us
- [ ] CTA at bottom of page renders

### 4.2 About (`/about`)

- [ ] Founder photo visible and links to LinkedIn (external)
- [ ] In light theme: light signature variant visible, dark variant hidden
- [ ] Toggle to dark theme: dark signature variant visible, light variant hidden
- [ ] Credentials section lists professional certifications
- [ ] Founder photo click fires GA4 event (check Network tab for `founder_profile_click`)

### 4.3 Services (`/services`)

- [ ] 3 service cards render: M&A Advisory, Product Development, Technical Leadership
- [ ] Audience cards render: PE Firms, SaaS Companies, Performance-Conscious Leaders
- [ ] FAQ `<details>` elements expand on click, collapse on second click
- [ ] FAQ toggle fires GA4 `faq_interaction` event (check Network tab)
- [ ] CTA section renders at bottom

### 4.4 M&A Portfolio (`/ma-portfolio`)

- [ ] 57 project cards render in grid layout
- [ ] Stats bar shows: combined ARR, industries count, global markets, year span
- [ ] **Search**: type "cyber" — cards filter to matching projects in real-time
- [ ] **Search**: clear input — all cards return
- [ ] **Growth Stage filter**: click a stage chip — cards filter, badge shows count
- [ ] **Engagement Type filter**: click a type chip — cards filter correctly
- [ ] **Industry filter**: click an industry chip — cards filter
- [ ] **Theme filter**: click a theme chip — cards filter
- [ ] **Year filter**: click a year chip — cards filter
- [ ] **Filter drawer** (mobile/tablet): toggle opens drawer with overlay, overlay click closes it
- [ ] **Filter badge**: shows count of active filters, updates on filter change
- [ ] **Clear filters**: clicking "Clear" resets to all cards visible
- [ ] **Project modal**: click any card — modal opens with project details (title, industry, ARR, summary, technologies)
- [ ] **Modal close**: click X button or backdrop — modal closes
- [ ] **Multiple filter combination**: apply 2+ filters simultaneously — results are intersection

### 4.5 Hub Gateway (`/hub`)

- [ ] 3 hub cards visible: Tools, Library, Radar
- [ ] Each card links to correct sub-page
- [ ] FAQ section expandable
- [ ] CTA buttons render

### 4.6 TechPar (`/hub/tools/techpar`)

**Profile tab**:

- [ ] 5 stage cards visible (Seed, Series A, Series B-C, PE-backed, Enterprise)
- [ ] Clicking a stage highlights it (active class applied)
- [ ] Industry selector visible (SaaS, Fintech, Marketplace, Infra/HW, Other)
- [ ] Currency selector visible (USD, EUR, GBP, CAD, AUD)
- [ ] ARR input with chip shortcuts ($10M, $25M, $50M, $100M, $250M)
- [ ] "Enter technology costs" button navigates to Costs tab

**Costs tab**:

- [ ] Infrastructure input with monthly/annual toggle
- [ ] R&D OpEx input visible
- [ ] R&D CapEx input visible
- [ ] CapEx toggle row hidden when rdCapEx = 0, visible when > 0
- [ ] Engineering FTE field visible in Quick mode

**Analysis tab** (requires stage + ARR + infra inputs):

- [ ] KPI hero number displays (e.g., "36%")
- [ ] Zone pill shows label (e.g., "At par")
- [ ] Benchmark table renders with active stage row highlighted
- [ ] Methodology section collapsed by default, opens on click, contains "KeyBanc" and "36-month"
- [ ] Save Scenario button visible
- [ ] Export PDF button visible

**Trajectory tab** (requires costs entered):

- [ ] Chart canvas renders
- [ ] For Series B-C stage: legend shows "Monthly revenue"
- [ ] For PE-backed stage: no "Monthly revenue" in legend

**Scenarios**:

- [ ] Save 1 scenario — "Scenario 1" chip appears in list, comparison table visible
- [ ] Save 2 more — "Scenario 2" and "Scenario 3" appear
- [ ] Save button disabled at 3 scenarios
- [ ] Remove a scenario — list updates correctly

**Regression tests**:

- [ ] Enter infra value in annual mode → reload page → value persists unchanged
- [ ] Click Reset → shows "Click again to reset" → click again → all inputs cleared, returns to Profile tab
- [ ] URL params update when inputs change (check address bar for `?h=...&a=...`)

### 4.7 Regulatory Map (`/hub/tools/regulatory-map`)

- [ ] D3 world map renders with countries highlighted in color
- [ ] Click a highlighted country (e.g., Germany) → compliance panel opens with regulation cards
- [ ] Panel shows country name, regulation count, individual regulation cards
- [ ] **Category filters**: "All" active by default
- [ ] Click "AI Governance" chip → fewer countries highlighted, panel updates
- [ ] Click "Data Privacy" chip → different set of countries highlighted
- [ ] Search input filters regulations by text
- [ ] Timeline section renders with year groups
- [ ] FAQ section expandable

**Mobile (375px viewport)**:

- [ ] Tap a country → tap bar appears with "View details" button
- [ ] Tap "View details" → bottom sheet panel opens with drag handle
- [ ] Quick-zoom buttons visible and functional (4 region buttons)
- [ ] Legend renders inline (not overlapping map)

**URL bookmarking**:

- [ ] Select Germany + "Data Privacy" → URL shows `?region=DEU&filter=data-privacy`
- [ ] Copy URL, open in new tab → Germany selected with Data Privacy filter active

### 4.8 Diligence Machine (`/hub/tools/diligence-machine`)

- [ ] Wizard loads at step 1 with options visible
- [ ] Click an option → auto-advances to step 2
- [ ] Back button returns to previous step with selection preserved
- [ ] Progress bar updates as steps are completed
- [ ] Complete all required steps → Generate button becomes enabled
- [ ] Click Generate → report renders with questions and attention areas
- [ ] Reload page → wizard state restored from localStorage (same step)

### 4.9 Tech Debt Calculator (`/hub/tools/tech-debt-calculator`)

- [ ] Page loads with default slider values
- [ ] Moving a slider updates calculated cost values in real-time
- [ ] Results section shows cost metrics (monthly/annual)
- [ ] Reload page → slider values persist from localStorage

### 4.10 Infrastructure Cost Governance (`/hub/tools/infrastructure-cost-governance`)

- [ ] Landing view shows methodology section with delta icon decoration
- [ ] Start assessment → 6 domain steps render
- [ ] Answer questions in each domain → maturity scores calculate
- [ ] Results show recommendations with correct trigger thresholds
- [ ] Methodology `<details>` section expands/collapses

### 4.11 Radar (`/hub/radar`)

- [ ] Page loads with feed items (may take a moment for server-deferred content)
- [ ] FYI items show annotation/GST Take section
- [ ] Wire items show source and date
- [ ] Category filter buttons toggle categories on/off
- [ ] Breadcrumb shows "The GST Hub / Radar" and links back to Hub
- [ ] Page title contains "Radar"
- [ ] Meta description present and > 20 chars

### 4.12 Library Pages

**Business Architectures** (`/hub/library/business-architectures`):

- [ ] Page loads with full article content
- [ ] Table of contents generates sublists from h3 headings
- [ ] TOC sublist item count matches h3 count in corresponding section

**VDR Structure** (`/hub/library/vdr-structure`):

- [ ] Page loads with full article content
- [ ] TOC sublist bullet icons render at 10x10px

### 4.13 Legal Pages

**Privacy** (`/privacy`):

- [ ] Page loads with all sections visible
- [ ] Heading hierarchy logical (no jumps)

**Terms** (`/terms`):

- [ ] Page loads with all sections visible
- [ ] Links within content are functional

### 4.14 Error Pages

- [ ] Navigate to `/nonexistent-page` → 404 page renders
- [ ] 404 page has "Return Home" and "View Services" CTAs that link correctly
- [ ] 404 page renders correctly in both light and dark themes

---

## 5. CSS Architecture Regression

These tests verify Phase 3 (CSS migration) and Phase 9 (vendor prefix removal, specimen migration) didn't break visual rendering.

### Frosted Glass Effects

- [ ] `/` — Hero section buttons have semi-transparent background with blur
- [ ] `/ma-portfolio` — Filter button has frosted glass effect
- [ ] `/ma-portfolio` — Modal backdrop has blur overlay
- [ ] Any page — buttons site-wide have subtle frosted glass (semi-transparent bg + blur)

### Vendor Prefix Verification (test in Firefox)

- [ ] Header text is not user-selectable (`user-select: none` working)
- [ ] TechPar sliders render without native browser styling (`appearance: none` working)
- [ ] Tech Debt Calculator sliders render without native styling
- [ ] Delta icon decorations visible on methodology sections (`mask-image` working)

### light-dark() Pilot

- [ ] In light theme: success/green color shows as #2e8b57 (darker green)
- [ ] In dark theme: success/green color shows as #3da868 (brighter green)
- [ ] Verify on: TechPar zone "Ahead" pill, ICG "Optimizing" maturity label

### Brand Specimen Styles (migrated from global.css to brand.astro)

On `/brand`, scroll to specimen section:

- [ ] Search input specimen renders with icon and placeholder
- [ ] Filter chip specimens render (including active state with primary color fill)
- [ ] Filter button + badge specimen renders
- [ ] Modal specimen renders with clip-path angled corners
- [ ] Filter drawer demo renders with border-left accent
- [ ] Stats bar specimen renders with 4-column grid
- [ ] CTA box specimen renders with primary border
- [ ] All specimens responsive at 768px viewport
- [ ] All specimens responsive at 480px viewport

---

## 6. Palette System (`/brand`)

- [ ] Panel toggle button opens palette panel
- [ ] Panel toggle button closes palette panel
- [ ] **Palette 0 (Current)**: teal primary + amber secondary active by default
- [ ] **Palette 1 (Steel Authority)**: click tab → colors change site-wide to cobalt/magenta
- [ ] **Palette 2 (Indigo Signal)**: click tab → violet/lime colors
- [ ] **Palette 3 (Copper Forge)**: click tab → rust/cyan colors
- [ ] **Palette 4 (Jade Edge)**: click tab → emerald/rose colors
- [ ] **Palette 5 (Shadow Garden)**: click tab → forest green/violet colors
- [ ] Color picker: click a swatch picker → picker dialog opens, changing color updates CSS variable
- [ ] Hex input: type `#22cc88` → picker and RGB sliders update to match
- [ ] RGB sliders: drag R/G/B → hex input and picker update
- [ ] Alpha slider: on semi-transparent swatch, changing hex preserves alpha value
- [ ] Reset All button: clears all color overrides, returns to palette defaults
- [ ] Pop-out toggle: panel floats independently
- [ ] Resize handle: drag right edge between 280px and 900px
- [ ] Theme toggle in panel: toggles dark/light theme
- [ ] **Persistence**: switch to Palette 3, reload → Palette 3 still active
- [ ] **Persistence**: pop out panel, reload → panel still popped out
- [ ] **Cross-theme**: each palette works correctly in both light and dark themes (switch theme while palette active)

---

## 7. Analytics Events

Open DevTools → Network tab → filter by "collect" or "google-analytics".

- [ ] **Page view**: navigate to any page → GA request fires with page path
- [ ] **Navigation click**: click a header nav link → `navigation_click` event fires
- [ ] **Theme toggle**: click theme button → `theme_toggle` event fires with `theme` param
- [ ] **FAQ interaction**: on `/services`, expand a FAQ → `faq_interaction` event fires with `action: open`
- [ ] **TechPar start**: on TechPar, select first stage → `tp_start` event fires
- [ ] **TechPar complete**: enter costs and view analysis → `tp_complete` event fires with zone
- [ ] **Regulatory Map start**: click first country → `rm_start` event fires
- [ ] **Regulatory Map select**: click a country → `rm_region_select` event fires
- [ ] **Portfolio search**: type in search box → `portfolio_search` event fires
- [ ] **Portfolio modal**: click project card → modal tracking event fires

---

## 8. SEO Verification

Spot-check on: `/`, `/about`, `/services`, `/hub/tools/techpar`, `/hub/tools/regulatory-map`

For each, view page source (`Ctrl+U` or `curl http://localhost:4321/page`):

- [ ] `<title>` tag present and descriptive (not generic/empty)
- [ ] `<meta name="description">` present, content is under 160 characters
- [ ] `<meta property="og:title">` present
- [ ] `<meta property="og:description">` present
- [ ] `<meta property="og:image">` present with absolute URL (starts with `https://`)
- [ ] `<meta name="twitter:card" content="summary_large_image">` present
- [ ] `<link rel="canonical">` present with correct URL
- [ ] `<script type="application/ld+json">` present and contains valid JSON
- [ ] Non-homepage pages: JSON-LD includes `BreadcrumbList` type
- [ ] Pages with FAQ: JSON-LD includes `FAQPage` type

---

## 9. Security Headers

Run `npm run build && npm run preview`, then check response headers:

```bash
curl -I http://localhost:4321/
```

- [ ] `X-Frame-Options: DENY` present
- [ ] `X-Content-Type-Options: nosniff` present
- [ ] `Referrer-Policy: strict-origin-when-cross-origin` present
- [ ] `X-DNS-Prefetch-Control: on` present
- [ ] No console errors from blocked resources (visit 3-4 pages and check)
- [ ] Google Analytics still loads (not blocked by headers)

---

## 10. Accessibility Spot-Check

Test on: `/`, `/ma-portfolio`, `/hub/tools/techpar`

- [ ] **Skip link**: press Tab on page load → "Skip to main content" link appears
- [ ] **Tab order**: tab through all interactive elements — focus ring visible on each
- [ ] **Focus visible**: focus outline appears on buttons, links, inputs in both themes
- [ ] **Filter badge** (`/ma-portfolio`): apply a filter → badge count updates (should be announced by `aria-live="polite"`)
- [ ] **Modal focus** (`/ma-portfolio`): open project modal → focus moves into modal
- [ ] **Buttons**: all icon-only buttons have `aria-label` (theme toggle, filter toggle, modal close)
- [ ] **Expandable sections**: `<details>` elements have proper `aria-expanded` behavior
- [ ] **Heading hierarchy**: no skipped heading levels (h1 → h3 without h2)

---

## 11. Print Layout

Test on: `/ma-portfolio` and `/hub/tools/techpar`

Open print preview (Ctrl+P):

- [ ] Header and footer hidden
- [ ] Filter controls, buttons, and interactive UI hidden
- [ ] Content is readable and properly laid out
- [ ] No cards cut in half across page breaks
- [ ] No backdrop-filter visual artifacts (broken blur renders)
- [ ] Grid layout adjusts for print width

---

## Execution Notes

- **Dev server**: `npm run dev` — tests execute against `http://localhost:4321`
- **Console errors**: check browser console on every page load — report any errors
- **Screenshots**: capture on any failure for evidence
- **Dark theme**: click footer theme toggle before running Section 3
- **Mobile viewports**: resize browser window (or use device emulation) for responsive tests
- **Firefox testing**: Section 5 (vendor prefixes) specifically requires Firefox
- **Analytics**: requires GA measurement ID in env (`PUBLIC_GA_MEASUREMENT_ID`) — if not set, skip Section 7
- **Security headers**: Section 9 requires production build (`npm run build && npm run preview`), not dev server

---

_Created: April 13, 2026 — Platform Hardening V1 regression testing_
