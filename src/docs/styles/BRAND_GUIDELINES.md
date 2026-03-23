# GST Brand Color & Style Guidelines

Documented brand palette and usage rules for the GST website. Items marked **TBD** require stakeholder design decisions.

---

## Brand Colors

### Primary Palette

| Role | Hex | Variable | Usage |
|------|-----|----------|-------|
| **Primary Teal** | `#05cd99` | `--color-primary` | Links, borders, buttons, active states, brand accent |
| **Primary Teal Dark** | `#04a87a` | `--color-primary-dark` | Hover/pressed states, emphasis |
| **Secondary Amber** | `#CC8800` (light) / `#FFAA33` (dark) | `--color-secondary` | Secondary accents, warnings, alternative highlights |

### Neutral Backgrounds

| Role | Hex | Variable | Usage |
|------|-----|----------|-------|
| **White** | `#ffffff` | `--bg-light` | Primary page background (light theme) |
| **Off-white** | `#f5f5f5` | `--bg-light-alt` | Secondary background — sections, cards |
| **Light gray** | `#eeeeee` | `--services-bg`, `--footer-bg` | Services section, footer |
| **Near black** | `#0a0a0a` | `--bg-dark` | Primary background (dark theme) |
| **Dark gray** | `#1a1a1a` | `--bg-dark-secondary` | Secondary dark background |
| **Dark charcoal** | `#141414` | `--bg-dark-tertiary` | Tertiary dark background |

### Text Colors

Text colors use opacity-based rgba values for consistent contrast against backgrounds. See [VARIABLES_REFERENCE.md](./VARIABLES_REFERENCE.md#text-colors) for full values.

| Role | Light Theme | Dark Theme |
|------|-------------|------------|
| Primary | `rgba(26,26,26, 0.95)` | `rgba(245,245,245, 0.95)` |
| Secondary | `rgba(26,26,26, 0.7)` | `rgba(200,200,200, 0.8)` |
| Muted | `rgba(26,26,26, 0.6)` | `rgba(200,200,200, 0.6)` |
| Faded | `rgba(26,26,26, 0.5)` | `rgba(200,200,200, 0.5)` |

---

## Typography

| Property | Value |
|----------|-------|
| **Font family** | Helvetica Neue, Arial, sans-serif |
| **Normal weight** | 400 |
| **Semibold weight** | 600 |
| **Bold weight** | 700 |

See [TYPOGRAPHY_REFERENCE.md](./TYPOGRAPHY_REFERENCE.md) for the full set of semantic text utility classes.

---

## Brand Asset: Delta Icon

The GST delta triangle icon is the primary brand mark. It appears as:
- Navigation logo element
- Collapse/expand toggle indicator (`.delta-chevron` in `interactions.css`)
- CSS pseudo-element decorator via mask-image technique

**SVG source**: `/images/logo/gst-delta-icon-teal-stroke-thick.svg`

**Usage rules**:
- Always render in `--color-primary` (teal) or `currentColor` — never in off-brand colors
- Use the stroke variant for inline/decorative uses
- Scale proportionally; do not distort aspect ratio
- See [STYLES_GUIDE.md — Brand Assets in CSS](./STYLES_GUIDE.md#brand-assets-in-css) for the CSS mask-image pattern

---

## Design Grid

- **Checkerboard pattern**: 50px grid, rendered via `body::before` with `--checkerboard-line` color
- Light theme: `rgba(0,0,0, 0.08)` — subtle dark lines on white
- Dark theme: `rgba(255,255,255, 0.08)` — subtle light lines on dark

---

## Domain Color Families

These colors are tool-specific, not brand-level. They are defined as CSS variables for consistency and dark theme support but are not part of the core brand palette.

### Authority Blue (Shared: Diligence Machine + ICG)

| Theme | Value | Variable |
|-------|-------|----------|
| Light | `#5b7a9d` | `--hub-authority-blue` |
| Dark | `#7a9dbd` | `--hub-authority-blue` |

Used for authority/expertise-themed elements across hub tools.

### Diligence Machine Domain Colors

See [VARIABLES_REFERENCE.md — Diligence Machine Domain Colors](./VARIABLES_REFERENCE.md#diligence-machine-domain-colors).

### ICG Maturity Colors

See [VARIABLES_REFERENCE.md — ICG Maturity Colors](./VARIABLES_REFERENCE.md#icg-maturity-colors).

### TechPar Zone & Chart Colors

See [VARIABLES_REFERENCE.md — TechPar Variables](./VARIABLES_REFERENCE.md#techpar-variables).

---

## Accessibility

- **Contrast**: All text/background combinations should meet WCAG 2.1 AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
- **Focus indicators**: 2px solid `--color-primary` outline via `.focus-outline` utility
- **Color alone**: Never use color as the sole indicator of state — always pair with text, icons, or patterns

---

## TBD — Pending Stakeholder Decisions

The following items are not yet formalized:

- [ ] Complete brand color palette (tertiary colors, extended accent palette)
- [ ] Approved color combinations for data visualization (charts, gauges, status indicators)
- [ ] Formal rules for when to use brand colors vs. neutral/semantic colors
- [ ] Color contrast audit and compliance certification
- [ ] Extended brand asset usage guidelines (logo clearance, minimum sizes, prohibited uses)

---

## Related Documentation

- [STYLES_GUIDE.md](./STYLES_GUIDE.md) — CSS conventions, component patterns
- [VARIABLES_REFERENCE.md](./VARIABLES_REFERENCE.md) — Complete design token catalog
- [TYPOGRAPHY_REFERENCE.md](./TYPOGRAPHY_REFERENCE.md) — Typography utility classes
- [STYLES_REMEDIATION_ROADMAP.md](./STYLES_REMEDIATION_ROADMAP.md) — Tracked remediation initiatives

---

**Created**: March 23, 2026
**Status**: Partial — existing palette documented, stakeholder decisions pending
