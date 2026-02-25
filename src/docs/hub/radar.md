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

## Vercel Caching & ISR Details

### How ISR Works for the Radar

The Radar page uses **Incremental Static Regeneration** configured in `astro.config.mjs`:

```js
adapter: vercel({
  isr: {
    expiration: 60 * 60 * 6, // 6 hours (21,600 seconds)
  },
})
```

Because the page sets `export const prerender = false`, Astro delegates it to a Vercel serverless function (`_isr.func`) rather than generating static HTML at build time.

### Cache Lifecycle

1. **First request after deploy** — Vercel invokes the ISR function:
   - Fetches Stream items from Inoreader API (up to 30 across `GST-` folders)
   - Fetches Featured items from Inoreader annotated stream (up to 30)
   - Loads Signals from the content collection (markdown, resolved at build time)
   - Renders full HTML and **caches the result for 6 hours**
2. **Requests within 6 hours** — Vercel serves the **cached HTML from CDN**. No serverless function runs, no Inoreader API calls.
3. **First request after 6 hours** — **Stale-while-revalidate** pattern:
   - The visitor **immediately gets the stale cached version** (no wait)
   - Vercel **re-renders the page in the background** with fresh API calls
   - The **next visitor** after the background render completes gets fresh content
4. **If background render fails** — Vercel continues serving the last successfully cached version until the next revalidation attempt.

### What Refreshes When

| Content | Refresh Trigger | Frequency |
|---------|----------------|-----------|
| Stream (RSS feeds) | ISR revalidation | Every 6 hours |
| Featured (annotated items) | ISR revalidation | Every 6 hours |
| Signals (original posts) | Vercel deployment | On each push/deploy |
| Static assets (JS/CSS) | Vercel deployment | Immutable, 1-year cache |

### Vercel Routing

Vercel generates routing rules that send `/hub/radar` requests to the ISR function:

```
/hub/radar → /_isr?x_astro_path=/hub/radar
```

The prerender config (`.vercel/output/functions/_isr.prerender-config.json`) sets:
- `expiration: 21600` (6 hours)
- `allowQuery: ["x_astro_path"]`
- `passQuery: true`

## Error Handling

- **API down**: Radar page renders with empty Featured/Stream sections; Signals still show
- **Token expired**: Automatic refresh via refresh token; no manual intervention needed
- **Refresh token expired**: Re-run OAuth flow (`node scripts/inoreader-auth.mjs setup`) and update Vercel env vars
- **No env vars**: Radar page shows "Intelligence feed is currently being refreshed" fallback
- **ISR cache**: Vercel serves last good render even during API outages

### Failure Scenarios in Detail

| Scenario | User Sees | ISR Cache Impact | Logged |
|----------|-----------|------------------|--------|
| Inoreader API temporarily down | Signals only + fallback message | Degraded page cached for 6h | `[Radar] Inoreader API error: {status}` |
| Access token expired (refresh works) | **Normal page** — auto-heals | Good page cached | `[Radar] Access token expired, attempting refresh...` + success |
| Refresh token revoked/expired | Signals only + fallback message | Degraded page cached for 6h | `[Radar] Token refresh failed: {status}` |
| Both tokens invalid | Signals only + fallback message | Degraded page cached for 6h | `[Radar] Token refresh failed` |
| Env vars missing entirely | **Page render crashes** | No cache generated | `Inoreader credentials not configured` error |
| Network timeout to Inoreader | Signals only + fallback message | Degraded page cached for 6h | `[Radar] Stream fetch failed` / `Folder fetch failed` |

**Key risk:** If tokens go permanently bad, Vercel ISR caches the degraded page for 6 hours, then re-renders another degraded page for another 6 hours, indefinitely — with no automatic alerting.

## Production Observability & Troubleshooting

### Current Logging

The Inoreader client (`src/lib/inoreader/client.ts`) logs to `console.error` / `console.warn` / `console.log` with a `[Radar]` prefix at every failure point. These logs are captured by Vercel's serverless function runtime.

**Log messages to watch for:**

| Log Message | Severity | Meaning |
|-------------|----------|---------|
| `[Radar] Access token expired, attempting refresh...` | Warn | Normal — token rotation in progress |
| `[Radar] Access token refreshed successfully` | Info | Normal — self-healed |
| `[Radar] Token refresh failed: {status}` | Error | **Action needed** — refresh token may be revoked |
| `[Radar] No refresh token available` | Error | **Action needed** — env var missing |
| `[Radar] Request failed after token refresh: {status}` | Error | API issue persists after token refresh |
| `[Radar] Inoreader API error: {status} {statusText}` | Error | Inoreader returned non-200 |
| `[Radar] Stream fetch failed` | Error | Network error fetching folders |
| `[Radar] No folders found with prefix "GST-"` | Warn | No matching folders — check Inoreader organization |

### How to View Logs

1. **Vercel Dashboard** → Project → **Logs** tab
2. Filter by function: `_isr`
3. Search for `[Radar]` to isolate Radar-specific logs
4. Logs are available for ~24–72 hours depending on Vercel plan

### Verifying It's Working

**Quick manual check:**
- Visit `/hub/radar` — if Featured and Stream sections are populated, it's working
- Empty Featured/Stream with only Signals visible indicates an API or token problem

**Vercel dashboard checks:**
- **Logs tab**: Filter for `[Radar]` errors in recent ISR invocations
- **Functions tab**: Check that the `_isr` function is being invoked and returning 200
- **Deployments tab**: View function logs for a specific deployment

### What Does NOT Exist (Current Gaps)

- No Sentry or external error tracking integration
- No alerting (Slack, email, PagerDuty) on API failures
- No health check endpoint (e.g., `/api/radar-health`)
- No structured logging (only console output)
- No retry logic — single attempt per API call, then returns `null`

### Troubleshooting Playbook

**Symptom: Featured and Stream sections are empty on the live site**

1. Go to Vercel Dashboard → Logs → filter for `[Radar]`
2. Look for `Token refresh failed` → refresh token is dead
   - Fix: Re-run OAuth flow and update Vercel env vars:
     ```bash
     node scripts/inoreader-auth.mjs setup        # Get new auth URL
     node scripts/inoreader-auth.mjs exchange CODE # Get new tokens
     ```
   - Update `INOREADER_ACCESS_TOKEN` and `INOREADER_REFRESH_TOKEN` in Vercel project settings
   - Redeploy or wait up to 6 hours for ISR to pick up the new env vars
3. Look for `Inoreader API error: 429` → rate limited
   - Wait and let the next ISR cycle retry (6 hours)
4. Look for `Stream fetch failed` or `Folder fetch failed` → network issue
   - Usually transient; next ISR cycle should recover
5. Look for `No folders found with prefix "GST-"` → Inoreader folder naming issue
   - Verify folders in Inoreader are prefixed with `GST-`

**Symptom: Page crashes / 500 error**

1. Check Vercel function logs for the error
2. Most likely cause: missing environment variables
3. Verify all five env vars are set in Vercel project settings

**Symptom: Content is stale (not updating)**

1. Content refreshes every 6 hours via ISR — wait for the next cycle
2. To force a refresh: trigger a redeployment from Vercel dashboard
3. Signal posts (markdown) only update on deploy — push a commit to trigger

## Category Inference

Priority order:
1. Explicit `gst-*` tag on the Inoreader item
2. GST-* folder membership
3. Keyword matching from article title
4. Default: `enterprise-tech`
