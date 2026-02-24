# GST Radar: Curated Intelligence Feed

## Overview

The Radar is a curated intelligence feed on the GST Strategic Intelligence Hub at `/hub/radar`. It aggregates technology and M&A news from practitioner-grade sources, layered with editorial commentary.

**URL:** `https://globalstrategic.tech/hub/radar`

## Architecture

### Content Tiers

| Tier | Name | Source | Effort | Value |
|------|------|--------|--------|-------|
| 1 | Stream | Automated RSS via Inoreader folders | Zero per item | Source curation signal |
| 2 | Featured | Inoreader annotated items (highlights + notes) | Seconds per item | Practitioner commentary |
| 3 | Signals | Original markdown posts in `src/content/signals/` | 30-60 min per post | Original indexed content |

### Rendering Model

- **Radar page** (`/hub/radar`): Server-rendered with Vercel ISR (6-hour cache)
- **Signal posts** (`/hub/radar/signals/[slug]`): Static HTML at build time
- **All other pages**: Unchanged, remain fully static

### Data Flow

```
Inoreader API ──► Astro SSR page ──► Vercel ISR cache (6h) ──► Visitors
                       ▲
src/content/signals/ ──┘ (markdown, at build time)
```

No GitHub Action crons. No auto-committed JSON files. No manual rebuilds for feed content.

## Environment Variables

Set in Vercel project settings and local `.env`:

| Variable | Purpose |
|----------|---------|
| `INOREADER_APP_ID` | Inoreader developer app ID |
| `INOREADER_APP_KEY` | Inoreader developer app key |
| `INOREADER_ACCESS_TOKEN` | OAuth access token |
| `INOREADER_REFRESH_TOKEN` | OAuth refresh token |
| `INOREADER_FOLDER_PREFIX` | Folder prefix filter (default: `GST-`) |

## Inoreader Setup

### Prerequisites
- Inoreader Pro plan (~$7.50/month)
- Register app at https://www.inoreader.com/developers/

### OAuth Setup

The script reads `INOREADER_APP_ID` and `INOREADER_APP_KEY` from the project root `.env` file automatically.

```bash
node scripts/inoreader-auth.mjs setup        # 1. Prints auth URL to open in browser
node scripts/inoreader-auth.mjs exchange CODE # 2. Exchange auth code for access + refresh tokens
node scripts/inoreader-auth.mjs refresh       # 3. Manual fallback if refresh token needs rotation
```

Do steps 1-2 quickly back-to-back — auth codes expire within minutes. The exchange command prints both `INOREADER_ACCESS_TOKEN` and `INOREADER_REFRESH_TOKEN` to add to `.env` and Vercel env vars.

### Folder Organization

Create folders in Inoreader prefixed with `GST-`:

| Folder | Category | Content |
|--------|----------|---------|
| `GST-PE-MA` | PE & M&A | Deal activity, fund strategies |
| `GST-Enterprise-Tech` | Enterprise Tech | Cloud, infrastructure, platforms |
| `GST-AI-Automation` | AI & Automation | Enterprise AI, ML ops |
| `GST-Security` | Security | Cybersecurity, regulatory |
| `GST-Verticals` | Industry | Healthcare IT, fintech, vertical SaaS |

### Annotation Workflow (Publishing to Featured)

1. Read an article in Inoreader
2. Highlight a key passage
3. Add a note with practitioner context (becomes "Δ GST Take")
4. Optionally tag with `gst-[category]` for category override

## File Structure

```
src/
├── content/signals/              # Tier 3: Signal markdown posts
├── components/radar/
│   ├── RadarHeader.astro         # Page header with breadcrumb
│   ├── SignalCard.astro          # Signal post preview card
│   ├── FeaturedItem.astro        # Annotated item with GST Take
│   ├── StreamItem.astro          # Compact feed item
│   └── CategoryFilter.astro     # Client-side filter pills
├── lib/inoreader/
│   ├── types.ts                  # TypeScript interfaces
│   ├── client.ts                 # API client (fetch wrappers)
│   └── transform.ts             # Data transformation + categories
├── pages/hub/radar/
│   ├── index.astro               # Main Radar page (SSR + ISR)
│   └── signals/[...slug].astro  # Signal post detail pages
scripts/
└── inoreader-auth.mjs           # OAuth setup helper
```

## Adding a Signal Post

1. Create a markdown file in `src/content/signals/`:

```markdown
---
title: "Your Signal Title"
description: "Brief description for card preview."
publishedAt: 2026-02-23
category: "ai-automation"
tags: ["tag1", "tag2"]
---

Your full post content here...
```

2. Push to trigger Vercel build
3. The post appears on the Radar page and gets its own URL

## Token Management

The API client handles token refresh automatically at runtime:

1. Each API call uses the stored `INOREADER_ACCESS_TOKEN`
2. If Inoreader returns **401** (token expired), the client automatically uses `INOREADER_REFRESH_TOKEN` to obtain a new access token
3. The refreshed token is cached in memory for the remainder of that SSR render
4. Subsequent API calls in the same page render reuse the refreshed token

**No manual token rotation needed.** As long as the refresh token remains valid (long-lived, typically months), the client self-heals on every ISR revalidation cycle.

The manual refresh script (`node scripts/inoreader-auth.mjs refresh`) is available as a fallback if the refresh token itself expires, which would require re-running the full OAuth flow.

## Error Handling

- **API down**: Radar page renders with empty Featured/Stream sections; Signals still show
- **Token expired**: Automatic refresh via refresh token; no manual intervention needed
- **Refresh token expired**: Re-run OAuth flow (`node scripts/inoreader-auth.mjs setup`) and update Vercel env vars
- **No env vars**: Radar page shows "Intelligence feed is currently being refreshed" fallback
- **ISR cache**: Vercel serves last good render even during API outages

## Category Inference

Priority order:
1. Explicit `gst-*` tag on the Inoreader item
2. GST-* folder membership
3. Keyword matching from article title
4. Default: `enterprise-tech`
