# @gst/mcp-server

Local-stdio Model Context Protocol server that exposes GST's pure-engine utilities to MCP-aware clients (Claude Desktop, Claude Code, Cursor).

> **Architecture and rationale**: [`src/docs/development/MCP_SERVER_ARCHITECTURE_BL-031.md`](../src/docs/development/MCP_SERVER_ARCHITECTURE_BL-031.md). Sibling initiatives (BL-031.5 Resources, BL-031.75 Prompts, BL-032/.5/.75 Remote, BL-033 Hardening) are tracked in [`BACKLOG.md`](../src/docs/development/BACKLOG.md).

---

## Why this exists (use cases)

You already have the same engines on the website — what does the MCP server give you that opening `globalstrategic.tech/hub/tools/diligence-machine` doesn't? **It puts those engines inside the conversation you're already having with Claude.** No browser tab switch, no copy-paste from wizard output into a draft, no re-typing inputs to iterate. You describe the deal in prose and the engine output streams into the same thread that's writing your proposal, prepping your call notes, or summarizing the dataset for a prospect.

Three canonical scenarios drive the design:

### 1. Live agenda drafting

You're prepping for a partner meeting on a real opportunity. Type the deal description in natural language:

> "Generate a diligence agenda. Target is a B2B SaaS company, ~$30M ARR, ~150 employees, modern cloud-native (AWS, K8s), 8 years old, scaling stage, US + EU footprint, productized platform, moderate scale intensity, actively modernizing a legacy section, high data sensitivity (handles PII), product-aligned eng teams. We're considering a majority stake."

Claude calls `generate_diligence_agenda` with the right enums extracted from the prose, returns topic-grouped questions plus attention-area summaries plus a trigger map showing which input dimensions caused which questions to surface. You iterate in the same thread: _"now regenerate it for a carve-out instead of majority-stake, same other inputs"_ — same engine, instant re-run, no wizard restart.

**Time saved per session**: 10–15 minutes of browser-tab juggling and manual transcription per agenda draft.

### 2. Comparable-deal recall (mid-call analogical anchoring)

You're on a call with a prospect or partner and want to reference relevant past engagements without breaking flow:

> "Pull GST's past Buy-Side engagements in healthcare. Anything that touched RCM or PHI handling specifically?"

Claude calls `search_portfolio` with the right filter combination, returns codenames, ARRs, tech stacks, challenge / solution paragraphs — content you can read aloud or paste into the chat to ground the analogy. Combine free-text search with `theme` and `engagement` filters in plain English; Claude maps your phrasing to the schema.

### 3. Pitch / scope mapping

You're explaining GST's coverage to a new prospect, partner, or analyst onboarding:

> "What industries and engagement types are represented across our portfolio? Show me the rough distribution."

Claude calls `list_portfolio_facets` to get the deduplicated themes / engagement categories / growth stages / years, then optionally layers in `search_portfolio` counts for depth. Useful when composing an introductory email, building a pitch deck, or briefing someone on what kinds of deals GST is positioned for.

### What it does NOT replace

- The website wizard's visual scaffolding remains the right surface for stakeholders who want to _see_ the question hierarchy and tweak inputs interactively. The MCP path is for users already in a Claude conversation who'd rather not leave it.
- This is an internal tool today — no client-facing endpoints. Remote HTTP, OAuth, and rate-limiting are tracked under BL-032 / BL-033.

> **Want to see one of these scenarios end-to-end?** [`src/docs/diligence/HYPOTHETICAL_USAGE.md`](src/docs/diligence/HYPOTHETICAL_USAGE.md) walks through scenario #1 (live agenda drafting) for a hypothetical PE majority-stake TDD — full prose prompt, schema mapping, engine output, trigger map, comparable engagements, and iteration patterns.

---

## What's exposed

| Tool                        | Purpose                                                                                        | Input                                                                                                                |
| --------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `generate_diligence_agenda` | Wraps `generateScript` — returns the full Inquisitor's Script for a deal profile               | 13-field `UserInputs` payload — full reference in [`src/docs/diligence/CONTRACT.md`](src/docs/diligence/CONTRACT.md) |
| `search_portfolio`          | Wraps `filterProjects` — searches the 61-project anonymized M&A dataset                        | `{ search?, theme? = 'all', engagement? = 'all', limit? = 20 }` (max 61) — _contract: planned, BL-031.5_             |
| `list_portfolio_facets`     | Returns the deduplicated themes / engagement categories / growth stages / years in the dataset | `{}` (no parameters) — _contract: planned, BL-031.5_                                                                 |

Same engines, same outputs as the website — calling via MCP eliminates the browser round-trip. Remote HTTP transport, OAuth, and Workers deployment are tracked separately as BL-032 / BL-032.5 / BL-032.75 / BL-033.

Per-tool input contracts live alongside their domain in [`src/docs/<tool>/CONTRACT.md`](src/docs/contracts/README.md). The contracts registry at [`src/docs/contracts/README.md`](src/docs/contracts/README.md) tracks all of them and explains the pattern.

---

## Install & build

| Step                  | Where to run it                                                                                                                                                                                                                                       | Command                                                                                                               |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Install dependencies  | **Repo root** (`<repo>/`) — the `workspaces` field is in the root `package.json`, so install must run there. It installs root + `mcp-server` deps in one pass and hoists shared packages (zod, typescript, vitest) into the top-level `node_modules`. | `npm install`                                                                                                         |
| Build the server      | **Either** the workspace dir **or** the root via `npm -w`.                                                                                                                                                                                            | `cd mcp-server && npm run build`<br>— or —<br>`npm -w @gst/mcp-server run build`                                      |
| Smoke-test the binary | **Repo root** (path is repo-relative).                                                                                                                                                                                                                | `node mcp-server/dist/index.js < /dev/null`<br>→ prints `[gst-mcp] connected on stdio` and exits because stdin closed |

`npm run build` runs `tsc --noEmit && node build.mjs` — see [Build pipeline](#build-pipeline) below for what each step does and why bundling.

When stdin is open (a real MCP client connection), the process stays alive and speaks JSON-RPC over stdout.

---

## Configure clients

Replace `<ABSOLUTE_PATH_TO_REPO>` with the absolute path to your local clone (e.g. `/Users/you/code/gst-website` or `C:\\Code\\gst-website`).

### Claude Code

The repo ships an [`.mcp.json`](../.mcp.json) at the root that auto-registers this server when you open the project in Claude Code. **No manual configuration required** — just `npm run build` once and the tools become available.

If you want the server available outside this repo, add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "gst": {
      "command": "node",
      "args": ["<ABSOLUTE_PATH_TO_REPO>/mcp-server/dist/index.js"]
    }
  }
}
```

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "gst": {
      "command": "node",
      "args": ["<ABSOLUTE_PATH_TO_REPO>/mcp-server/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop. The `gst` server should appear in the tool picker.

### Cursor

Edit `~/.cursor/mcp.json` (or use Cursor Settings → MCP):

```json
{
  "mcpServers": {
    "gst": {
      "command": "node",
      "args": ["<ABSOLUTE_PATH_TO_REPO>/mcp-server/dist/index.js"]
    }
  }
}
```

---

## Worked examples

### `generate_diligence_agenda`

Sample call (paste into a Claude conversation that has `gst` enabled — Claude figures out tool invocation from natural language; this is roughly the schema):

```json
{
  "transactionType": "majority-stake",
  "productType": "b2b-saas",
  "techArchetype": "modern-cloud-native",
  "headcount": "51-200",
  "revenueRange": "5-25m",
  "growthStage": "scaling",
  "companyAge": "5-10yr",
  "geographies": ["us", "eu"],
  "businessModel": "productized-platform",
  "scaleIntensity": "moderate",
  "transformationState": "actively-modernizing",
  "dataSensitivity": "high",
  "operatingModel": "product-aligned-teams"
}
```

Returns a `GeneratedScript` with `topics[]`, `attentionAreas[]`, `triggerMap`, and `metadata`. See [`src/utils/diligence-engine.ts`](../src/utils/diligence-engine.ts) for the full output shape.

### `search_portfolio`

```json
{ "search": "platform", "limit": 3 }
```

Returns `{ matches: Project[], totalMatched: number, returned: number }` — the `"platform"` query currently surfaces 42 matches across the dataset; tighten with `theme` or `engagement` (`"Buy-Side"` / `"Sell-Side"`) to narrow.

### `list_portfolio_facets`

```json
{}
```

Returns `{ themes, engagementCategories, growthStages, years }` — a snapshot of every distinct value present in the dataset, useful before composing a `search_portfolio` query.

---

## Smoke test (manual parity check)

> **Last verified**: April 27, 2026 — all three tools invoked from Claude Code with `gst` server registered via [`.mcp.json`](../.mcp.json). Recorded outputs:
>
> - `generate_diligence_agenda` (canonical 13-field payload from this README, with `geographies: ["us", "eu"]`): returned **20 questions across 4 topics**, **4 attention areas** (3 high-relevance: Cross-Border Data Compliance, AI Commodity Risk, Sensitive Data Breach Liability; 1 medium-relevance: Data Classification Maturity Gap), complete `triggerMap` with dimension labels matching [`src/docs/diligence/CONTRACT.md`](src/docs/diligence/CONTRACT.md) field-overview, full `metadata.inputSummary` echo. `topics[]` non-empty.
> - `search_portfolio { search: "platform", limit: 3 }`: returned `totalMatched: 42, returned: 3` — top three matches **Voss** (Cross-Border Payments, Sell-Side, $156M ARR), **Ecological Eagle** (Government Affairs, Buy-Side, $74M ARR), **Atlas** (Healthcare RCM, Buy-Side, $67M ARR).
> - `list_portfolio_facets {}`: returned **15 themes**, **2 engagement categories** (`Buy-Side`, `Sell-Side`), **6 growth stages**, years **2022-2026**.
> - Invalid-input rejection (`generate_diligence_agenda` with `transactionType: "blow-job"`): clean `Input validation error: Invalid arguments for tool generate_diligence_agenda: transactionType: Invalid option: expected one of "full-acquisition"|"majority-stake"|"business-integration"|"carve-out"|"venture-series"` — no stack trace, valid options listed inline.
> - Binary smoke (`node mcp-server/dist/index.js < /dev/null`): printed `[gst-mcp] connected on stdio` to stderr, exited cleanly when stdin closed.
>
> Continuous regression coverage: 33 vitest cases (24 unit + 9 integration via in-process protocol-roundtrip transport) running on every push that touches `mcp-server/**` (see [`.github/workflows/test-mcp-server.yml`](../.github/workflows/test-mcp-server.yml)).

After a build, with a real MCP client connected:

1. Run `generate_diligence_agenda` with the example payload above. Compare the topic list to `https://globalstrategic.tech/hub/tools/diligence-machine` filled with the same answers — outputs should be byte-identical.
2. Run `search_portfolio` with `{ "search": "platform", "limit": 3 }`. Compare to `https://globalstrategic.tech/ma-portfolio` with "platform" in the search box — the first 3 matches should align (current dataset returns 42 total matches).
3. Run `list_portfolio_facets` — themes/years should match the M&A portfolio page's filter chips.

> **Note on free-text search behavior**: `search` is a substring match across `codeName`, `industry`, `summary`, and `technologies`. Combining it with an `engagement` filter applies AND semantics, so a narrow term (e.g. `"CRM"`) paired with the wrong engagement may legitimately return zero — verify against `list_portfolio_facets` and the unfiltered count first.

Engine parity with zero behavioral divergence is the explicit BL-031 outcome.

---

## How this fits with sibling initiatives

| BL        | Adds                                                                     | File-system footprint                                         | Status  |
| --------- | ------------------------------------------------------------------------ | ------------------------------------------------------------- | ------- |
| BL-031    | Local stdio + diligence + portfolio tools (this)                         | `mcp-server/src/{index,schemas}.ts`, `mcp-server/src/tools/*` | ✅ Done |
| BL-031.5  | Resources primitive (Library, Regulations, Radar, hub-tool content)      | `mcp-server/src/resources/`, `mcp-server/src/content/`        | Backlog |
| BL-031.75 | Prompts primitive (`gst_*` slash-commands)                               | `mcp-server/src/prompts/`, `mcp-server/tests/prompts/`        | Backlog |
| BL-032    | HTTP transport on Cloudflare Workers                                     | `mcp-server/src/worker.ts`, `mcp-server/src/auth/`            | Backlog |
| BL-032.5  | Remote Resources + Prompts, scope catalog, Worker Cron for radar refresh | `mcp-server/src/cache/`, `mcp-server/src/cron/`               | Backlog |
| BL-032.75 | Production observability maturity (SLOs, dashboards, alerts)             | `mcp-server/src/metrics/`, `mcp-server/observability/`        | Backlog |
| BL-033    | OAuth, audit logs, prompt-injection hardening                            | `mcp-server/src/auth/oauth/`                                  | Backlog |

The `src/` layout is additive — sibling work drops in alongside `tools/` without restructuring.

---

## Troubleshooting

- **Server won't start under Claude Desktop.** Logs are stderr-only — stdout is reserved for the MCP protocol. Check the desktop client's MCP log panel or run `node mcp-server/dist/index.js` standalone to see startup output.
- **Tool changes not appearing.** Claude Desktop caches the server tool list. Quit and relaunch the app (not just close the window).
- **`generate_diligence_agenda` returns "validation failed".** The 13-field input must use the exact enum values from [`src/data/diligence-machine/wizard-config.ts`](../src/data/diligence-machine/wizard-config.ts) — `TRANSACTION_TYPE_IDS`, `PRODUCT_TYPE_IDS`, etc. Run the website wizard at `/hub/tools/diligence-machine` to inspect valid IDs.
- **Stale data after `projects.json` edit.** Portfolio data is bundled at build time — re-run `npm run build` in `mcp-server/` after editing `src/data/ma-portfolio/projects.json`.
- **`@cfworker/json-schema` not found.** v2 alpha SDK quirk — the pkg is declared as an optional peer but imported unconditionally. Resolved by adding it as a direct dep of `@gst/mcp-server`. Already in `mcp-server/package.json`.

---

## Build pipeline

`npm run build` runs two steps:

1. `tsc --noEmit` — strict type-check across the whole import graph (mcp-server src + the website schemas/utils it pulls in).
2. `node build.mjs` — esbuild bundles `src/index.ts` into a single `dist/index.js`. The MCP SDK and zod stay external (resolved from `node_modules` at runtime); everything else is inlined, including the 61-row `projects.json`.

Why bundle instead of vanilla `tsc`? The website source uses extensionless imports (Astro convention). Plain `tsc --moduleResolution NodeNext` rejects those at runtime. Bundling sidesteps the resolution issue cleanly.

---

_Last Updated: 2026-04-27_
