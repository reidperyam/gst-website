# Typography Reference Guide

Complete guide to the typography system and semantic text utilities used in the GST Website.

---

## Typography Philosophy

The typography system provides **semantic, reusable utility classes** that eliminate duplicated text styling across components. Instead of hardcoding font sizes and weights, use the provided classes and variables.

**Benefits:**
- Consistent text hierarchy across the site
- Easy theme support (colors automatically switch with dark/light modes)
- Maintainable - change font sizes in one place
- Accessible - built-in line heights and spacing

---

## Heading Utilities

Semantic heading classes for different scales. Use these instead of hardcoding font sizes.

### `.heading-xl`
- **Font Size**: `2.5rem` (40px)
- **Font Weight**: Bold (700)
- **Color**: `--text-light-primary` (switches with theme)
- **Usage**: Page titles, hero headlines
- **Example**: Site main title, hero section headline

```html
<h1 class="heading-xl">Global Strategic Technologies</h1>
```

```css
.heading-xl {
  font-size: 2.5rem;
  font-weight: var(--font-weight-bold);
  color: var(--text-light-primary);
}
```

### `.heading-lg`
- **Font Size**: `2rem` (32px)
- **Font Weight**: Bold (700)
- **Color**: `--text-light-primary`
- **Usage**: Section titles, major headings
- **Example**: "Our Services", "Portfolio", "About GST"

```html
<h2 class="heading-lg">Our Services</h2>
```

```css
.heading-lg {
  font-size: 2rem;
  font-weight: var(--font-weight-bold);
  color: var(--text-light-primary);
}
```

### `.heading-md`
- **Font Size**: `1.35rem` (21.6px)
- **Font Weight**: Semibold (600)
- **Color**: `--text-light-primary`
- **Usage**: Subsection titles, card titles
- **Example**: Service card titles, feature headings

```html
<h3 class="heading-md">Engagement Services</h3>
```

```css
.heading-md {
  font-size: 1.35rem;
  font-weight: var(--font-weight-semibold);
  color: var(--text-light-primary);
}
```

### `.heading-sm`
- **Font Size**: `1.1rem` (17.6px)
- **Font Weight**: Semibold (600)
- **Color**: `--text-light-primary`
- **Usage**: Small headings, subsections
- **Example**: Table headers, form sections

```html
<h4 class="heading-sm">Project Details</h4>
```

```css
.heading-sm {
  font-size: 1.1rem;
  font-weight: var(--font-weight-semibold);
  color: var(--text-light-primary);
}
```

---

## Body Text Utilities

Utilities for body copy and main text content.

### `.text-base`
- **Font Size**: `1rem` (16px)
- **Font Weight**: Normal (400)
- **Color**: `--text-light-secondary`
- **Usage**: Main body text, paragraphs
- **Example**: Article content, descriptions

```html
<p class="text-base">
  Global Strategic Technologies provides comprehensive engagement services...
</p>
```

```css
.text-base {
  font-size: var(--text-base);
  font-weight: var(--font-weight-normal);
  color: var(--text-light-secondary);
}
```

### `.text-small`
- **Font Size**: `0.875rem` (14px)
- **Font Weight**: Normal (400)
- **Color**: `--text-light-secondary`
- **Usage**: Secondary text, smaller descriptions
- **Example**: Metadata, supplementary info

```html
<p class="text-small">Published on February 3, 2026</p>
```

```css
.text-small {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-normal);
  color: var(--text-light-secondary);
}
```

### `.text-tiny`
- **Font Size**: `0.75rem` (12px)
- **Font Weight**: Normal (400)
- **Color**: `--text-light-muted`
- **Usage**: Very small text, hints, captions
- **Example**: Form hints, timestamps, badges

```html
<span class="text-tiny">Updated 2 hours ago</span>
```

```css
.text-tiny {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-normal);
  color: var(--text-light-muted);
}
```

---

## Label Utilities

Utilities for labels, badges, and emphasized small text.

### `.label`
- **Font Size**: `0.75rem` (12px)
- **Font Weight**: Bold (700)
- **Text Transform**: UPPERCASE
- **Letter Spacing**: 0.1em (2px extra)
- **Color**: `--text-light-muted`
- **Usage**: Form labels, category labels, badges
- **Example**: "FEATURED", "NEW", category tags

```html
<span class="label">Featured</span>
<label class="label">Email Address</label>
```

```css
.label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-light-muted);
}
```

### `.label-small`
- **Font Size**: `0.65rem` (10.4px)
- **Font Weight**: Bold (700)
- **Text Transform**: UPPERCASE
- **Letter Spacing**: 0.05em (1px extra)
- **Color**: `--text-light-muted`
- **Usage**: Very small labels, micro labels
- **Example**: Status badges, tiny tags

```html
<span class="label-small">v1.0</span>
```

```css
.label-small {
  font-size: 0.65rem;
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-light-muted);
}
```

---

## Navigation Link Utilities

Utilities for navigation and interactive link styling.

### `.nav-link`
- **Font Size**: `0.9rem` (14.4px)
- **Font Weight**: Bold (700)
- **Text Transform**: UPPERCASE
- **Letter Spacing**: 0.1em (1.4px extra)
- **Color**: `--text-light-secondary`
- **Default**: No underline
- **Hover**: Changes to `--color-primary` with underline
- **Focus**: 2px solid outline
- **Usage**: Header navigation, main menu links
- **Example**: Header nav items, breadcrumbs

```html
<nav>
  <a href="/" class="nav-link active">Home</a>
  <a href="/portfolio" class="nav-link">Portfolio</a>
  <a href="/about" class="nav-link">About</a>
</nav>
```

```css
.nav-link {
  font-size: 0.9rem;
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-light-secondary);
  text-decoration: none;
  transition: color var(--transition-fast), border-bottom var(--transition-fast);
  position: relative;
  padding-bottom: 0.25rem;
  border-bottom: 2px solid transparent;
}

.nav-link:hover {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.nav-link:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 0.25rem;
}

.nav-link.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}
```

---

## Button Text Utilities

Utilities for button and call-to-action text styling.

### `.button-text`
- **Font Size**: `0.75rem` (12px)
- **Font Weight**: Bold (700)
- **Text Transform**: UPPERCASE
- **Letter Spacing**: 0.05em (0.6px extra)
- **Font Family**: `--font-family` (Helvetica)
- **Usage**: Small buttons, compact CTAs
- **Example**: "Filter", "Clear", "Close"

```html
<button class="button-text">Filter Results</button>
```

```css
.button-text {
  font-size: 0.75rem;
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: var(--font-family);
}
```

### `.button-text-lg`
- **Font Size**: `0.95rem` (15.2px)
- **Font Weight**: Bold (700)
- **Text Transform**: UPPERCASE
- **Letter Spacing**: 0.08em (0.76px extra)
- **Font Family**: `--font-family` (Helvetica)
- **Usage**: Larger buttons, prominent CTAs
- **Example**: "Learn More", "Get Started", "Contact Us"

```html
<a href="/contact" class="button-text-lg">Get Started</a>
```

```css
.button-text-lg {
  font-size: 0.95rem;
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-family: var(--font-family);
}
```

---

## Typography System Sizes

Quick reference for all available text sizes:

| Class/Variable | Size | Typical Usage |
|---|---|---|
| `.heading-xl` / `--text-2xl` | 2.5rem (40px) | Page titles |
| `.heading-lg` | 2rem (32px) | Section titles |
| `.heading-md` | 1.35rem (21.6px) | Card titles |
| `.heading-sm` | 1.1rem (17.6px) | Subsection titles |
| `.text-base` / `--text-base` | 1rem (16px) | Body text |
| `--text-lg` | 1.1rem (17.6px) | Large text |
| `--text-xl` | 1.25rem (20px) | Larger text |
| `--text-2xl` | 1.5rem (24px) | Extra-large text |
| `.text-small` / `--text-sm` | 0.875rem (14px) | Secondary text |
| `.nav-link` | 0.9rem (14.4px) | Navigation |
| `.button-text-lg` | 0.95rem (15.2px) | Large buttons |
| `.label` / `--text-xs` | 0.75rem (12px) | Labels, badges |
| `.button-text` | 0.75rem (12px) | Small buttons |
| `.label-small` | 0.65rem (10.4px) | Micro labels |
| `.text-tiny` | 0.75rem (12px) | Captions |

---

## Dark Theme Text Colors

All text utilities automatically switch colors in dark mode:

| Utility | Light Color | Dark Color |
|---|---|---|
| `.heading-*` | `--text-light-primary` | `--text-dark-primary` |
| `.text-base` | `--text-light-secondary` | `--text-dark-secondary` |
| `.text-small` | `--text-light-secondary` | `--text-dark-secondary` |
| `.text-tiny` | `--text-light-muted` | `--text-dark-muted` |
| `.label` | `--text-light-muted` | `--text-dark-muted` |
| `.label-small` | `--text-light-muted` | `--text-dark-muted` |
| `.nav-link` | `--text-light-secondary` | `--text-dark-secondary` |

**No component CSS changes needed** - the utilities handle theme switching automatically.

---

## Typography Patterns

### Heading Hierarchy Example

```html
<!-- Page Level -->
<h1 class="heading-xl">Global Strategic Technologies</h1>

<!-- Section Level -->
<h2 class="heading-lg">Our Services</h2>

<!-- Subsection Level -->
<h3 class="heading-md">Engagement Services</h3>

<!-- Small Section -->
<h4 class="heading-sm">Project Details</h4>

<!-- Body Copy -->
<p class="text-base">
  We provide comprehensive engagement services for...
</p>

<!-- Secondary Information -->
<p class="text-small">Published on February 3, 2026</p>

<!-- Caption/Hint -->
<span class="text-tiny">Updated 2 hours ago</span>
```

### Form Labels and Input

```html
<form>
  <label class="label" for="email">Email Address</label>
  <input type="email" id="email" class="search-input" />
  <p class="text-tiny">We'll never share your email</p>
</form>
```

### Button with Text Utility

```html
<!-- Small button with .button-text -->
<button class="button-text" style="padding: 0.5rem 1rem;">
  Filter
</button>

<!-- Large button with .button-text-lg -->
<button class="button-text-lg" style="padding: 1.2rem 3rem;">
  Get Started
</button>
```

### Navigation with Active State

```html
<nav>
  <a href="/" class="nav-link active">Home</a>
  <a href="/portfolio" class="nav-link">Portfolio</a>
  <a href="/about" class="nav-link">About</a>
</nav>
```

### Card Title Structure

```html
<div class="card">
  <h3 class="heading-md">Service Title</h3>
  <p class="text-base">Service description goes here...</p>
  <span class="label">Featured</span>
</div>
```

---

## Usage Guidelines

### Do's ✅

- **Use semantic utilities** instead of hardcoding sizes
  ```css
  /* ✅ GOOD */
  <p class="text-base">Body text</p>
  <h2 class="heading-lg">Section title</h2>
  ```

- **Combine utilities as needed**
  ```html
  <!-- ✅ GOOD - Combining utilities -->
  <h2 class="heading-lg">Title with <span class="label">badge</span></h2>
  ```

- **Use spacing utilities with text utilities**
  ```css
  .card {
    padding: var(--spacing-lg);
  }

  .card .heading-md {
    margin-bottom: var(--spacing-md);
  }
  ```

### Don'ts ❌

- **Don't hardcode font sizes**
  ```css
  /* ❌ BAD */
  .title { font-size: 32px; }
  .label { font-size: 12px; }
  ```

- **Don't ignore dark theme**
  ```css
  /* ❌ BAD - Hardcoded color */
  .text { color: #1a1a1a; }

  /* ✅ GOOD - Uses variable, switches with theme */
  .text { color: var(--text-light-primary); }
  ```

- **Don't create new text utilities** without checking if existing ones work
  ```css
  /* ❌ BAD - Unnecessary new class */
  .my-special-size { font-size: 0.95rem; }
  /* Use .button-text-lg instead! */
  ```

---

## Responsive Typography

Font sizes can be adjusted at different breakpoints:

```css
.heading-lg {
  font-size: 2rem;  /* Mobile */
}

@media (min-width: 768px) {
  .heading-lg {
    font-size: 2.5rem;  /* Desktop */
  }
}
```

However, the provided utilities are designed to work well across all screen sizes without modification. If responsive text changes are needed, add them in component-specific stylesheets.

---

## Accessibility Considerations

All typography utilities include:

- **Adequate line height** (1.5+) for readability
- **Color contrast** meeting WCAG AA standards (4.5:1 minimum)
- **Letter spacing** for uppercase text (improves readability)
- **Font weights** that ensure distinction between elements

When adding new typography:
1. Ensure 4.5:1 contrast ratio in both light and dark modes
2. Use adequate line height (minimum 1.5)
3. Keep font sizes readable (minimum 12px for body text)

---

## Quick Reference: What to Use When

### "I have a page title"
→ Use `.heading-xl` or `.heading-lg`

### "I have a section heading"
→ Use `.heading-lg` or `.heading-md`

### "I have normal paragraph text"
→ Use `.text-base`

### "I have secondary/supporting text"
→ Use `.text-small` or `.text-tiny`

### "I have a label or badge"
→ Use `.label` or `.label-small`

### "I have navigation links"
→ Use `.nav-link` with `.nav-link.active` for current page

### "I have button text"
→ Use `.button-text` or `.button-text-lg`

### "I need to emphasize text within paragraph"
→ Wrap in `<strong>` or `<em>`, or use color variables

---

## Font Family Customization

The entire site uses: `'Helvetica Neue', Arial, sans-serif`

To change the font globally:
1. Update `--font-family` in `src/styles/variables.css`
2. All components automatically use the new font

To use a different font for a specific component:
```css
.my-component {
  font-family: 'Georgia', serif;  /* Override site default */
}
```

---

**Last Updated**: February 3, 2026
**Version**: 1.0
**Total Utilities**: 11 semantic text classes
**Theme Coverage**: 100% (all text utilities switch colors with theme)
