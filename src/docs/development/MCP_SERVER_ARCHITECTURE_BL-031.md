# MCP Server — Architecture & Phase 1 Plan (BL-031)

> **Backlog initiative**: [BL-031: MCP Server — Internal Prototype (Phase 1)](BACKLOG.md#bl-031-mcp-server--internal-prototype-phase-1)
>
> **Scope**: this document covers the GST Model Context Protocol (MCP) server initiative end-to-end, with the implementation plan for Phase 1 ([BL-031](BACKLOG.md#bl-031-mcp-server--internal-prototype-phase-1)) as the actionable section. Phases 2 ([BL-032](BACKLOG.md#bl-032-mcp-server--internal-remote-phase-2)) and 3 ([BL-033](BACKLOG.md#bl-033-mcp-server--external-pilot-phase-3)) are summarized for context; their detailed acceptance criteria live in [BACKLOG.md](BACKLOG.md).
>
> **Companion documents** (local-stdio surface extensions):
>
> - [MCP_SERVER_HUB_SURFACE_BL-031_5.md](MCP_SERVER_HUB_SURFACE_BL-031_5.md) — extends the surface to remaining Hub tool engines, Library, Radar (introduces MCP **Resources**)
> - [MCP_SERVER_PROMPTS_BL-031_75.md](MCP_SERVER_PROMPTS_BL-031_75.md) — adds MCP **Prompts** as named consultant workflows on top of the Tools+Resources surface
>
> **Phase 2 documents** (remote HTTP / Workers):
>
> - [MCP_SERVER_REMOTE_RESOURCES_PROMPTS_BL-032_5.md](MCP_SERVER_REMOTE_RESOURCES_PROMPTS_BL-032_5.md) — ports Resources + Prompts to remote HTTP with caching, scope gating, and URI-stability discipline
> - [MCP_SERVER_OBSERVABILITY_BL-032_75.md](MCP_SERVER_OBSERVABILITY_BL-032_75.md) — production observability maturity (SLOs, dashboards, alerting) backing BL-033's contractual SLA
>
> **Status**: Phase 1 — open, ready for implementation. Phases 2/3 — open, depend on Phase 1.

---

## Context

GST has two production-grade pure-TypeScript engines that today are reachable only through the website's UI: the **diligence-agenda generator** ([`generateScript`](../../utils/diligence-engine.ts)) and the **portfolio search** ([`filterProjects`](../../utils/filterLogic.ts)). Both are pure functions, both have stable Zod schemas, both are unit-tested, and both have zero DOM/Astro coupling.

Every interactive use of these engines today is gated by a browser context-switch: open a tab, fill a wizard, copy the output back into the document being drafted. For someone drafting a client proposal, agenda, or pitch in Claude Desktop, that round-trip dominates the work. The Model Context Protocol (MCP) lets us expose these engines as native tools to any Claude surface, eliminating the round-trip and turning the engines into composable building blocks of agentic workflows.

BL-031 is the smallest, lowest-risk slice of that vision: a **local stdio MCP server** that any GST team member can install in 60 seconds, used as a private internal tool. It is the de-risking step before BL-032 (remote, internal HTTP) and BL-033 (external pilot with OAuth + audit logging). The acceptance criteria are scoped to "wrap two pure functions, expose them, run from Claude Desktop / Claude Code, no auth, no HTTP."

This document also addresses two design questions that shape the entire MCP roadmap: **repo placement** (monorepo vs. separate) and **lifecycle coupling** (evolves with the website vs. independently).

---

## MCP Architecture & Design — Introduction

### What MCP is

The Model Context Protocol is an open JSON-RPC-based standard (originally published by Anthropic, now adopted by Claude, Cursor, OpenAI's MCP-compatible mode, and others) for connecting AI assistants to external context and tools. An MCP **server** publishes capabilities; an MCP **client** (Claude Desktop, Claude Code, Cursor, etc.) discovers and invokes them.

A server can expose three kinds of capabilities — for BL-031 we use only the first:

| Primitive     | Purpose                                                   | BL-031 use?     |
| ------------- | --------------------------------------------------------- | --------------- |
| **Tools**     | Functions the model can call with structured input/output | ✅ both engines |
| **Resources** | Read-only data (file-like) the model can fetch            | ❌ not needed   |
| **Prompts**   | Pre-written templates a user can invoke                   | ❌ not needed   |

### Transports

| Transport           | Use case                                                                     | Auth                       | Phase          |
| ------------------- | ---------------------------------------------------------------------------- | -------------------------- | -------------- |
| **stdio**           | Client spawns the server as a child process; communication over stdin/stdout | None (process-level trust) | **BL-031**     |
| **Streamable HTTP** | Client opens a long-lived HTTP connection to a remote endpoint               | Bearer token / OAuth       | BL-032, BL-033 |

The same tool registry serves both transports — register-once, connect-twice — which is precisely why BL-031 (stdio) is a sound foundation for BL-032 (HTTP) and BL-033 (OAuth + audit).

### Value GST gets from this architecture

1. **Tools follow the user.** Every Claude surface — Desktop, Code, mobile app, IDE extensions — can call the same tools. The "I need to be at my desk with the website open" constraint disappears.
2. **Composability across servers.** GST tools sit alongside filesystem, GitHub, Slack, and Linear MCP servers in the same Claude session. An agent drafting a client memo can pull a comparable engagement (`search_portfolio`), generate an agenda (`generate_diligence_agenda`), and write the result into a Google Doc — one model, three tool sources.
3. **Distribution leverage at BL-033.** Public MCP directories (Anthropic registry, MCPMarket, Cursor catalog) become a no-cost discovery channel for technically-sophisticated buyers — the kind of inbound funnel a boutique advisory firm normally cannot afford to build.
4. **Transport-agnostic investment.** Tool implementations are written once. Transport, auth, and rate-limiting are layered on top in BL-032/033. The work in BL-031 is not throwaway scaffolding.
5. **Schema as contract.** Every tool ships a Zod input schema. That schema is the contract — clients (human or model) can introspect it, validate it client-side, and detect drift before invocation. This is more disciplined than the website's wizard, which encodes the same shape in JSX.

### Critical SDK note

The original [BACKLOG.md](BACKLOG.md) BL-031 text references `@modelcontextprotocol/sdk`. **This package name is stale.** As of late 2025 / early 2026 the TypeScript SDK has split into a v2 package family:

- `@modelcontextprotocol/server` — server-side primitives (`McpServer`, `StdioServerTransport`, `registerTool`)
- `@modelcontextprotocol/client` — client-side
- `@modelcontextprotocol/hono` — HTTP transport adapter (relevant only for BL-032)
- The legacy single-package `@modelcontextprotocol/sdk` is maintained on a `v1.x` branch but is not the new-work default

The plan below targets **v2 (`@modelcontextprotocol/server`)**. The v2 SDK accepts Zod schemas natively (no `zod-to-json-schema` shim needed), uses `server.registerTool(name, config, handler)`, and surfaces tool errors via `{ isError: true, content: [...] }` in the `CallToolResult` — which is exactly the "structured MCP error, not a thrown exception" the backlog calls for.

---

## Repo placement — single repo (recommended)

|                        | Same repo (chosen)                                           | Separate repo                                               |
| ---------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- |
| Engine sync            | Direct relative imports — single source of truth, atomic PRs | Requires npm publish, submodule, or copy-paste — drift risk |
| CI                     | One workflow gains one workspace; ~1 min added               | Two pipelines, two release processes                        |
| Onboarding             | `git clone gst-website && cd mcp-server && npm install`      | `git clone gst-website && git clone gst-mcp && link them`   |
| IP isolation           | None — fine while server is internal                         | Helpful if MCP source needs to be shared/audited externally |
| Independent versioning | Not yet needed                                               | Premature for a 1–2 day prototype with one consumer         |

**Decision: monorepo via npm workspaces.** Add `"workspaces": [".", "mcp-server"]` to root `package.json`; create `mcp-server/` with its own `package.json`, `tsconfig.json`, and `README.md`. The Astro build is untouched (Astro's tsconfig already excludes the directory by virtue of the workspace boundary).

**Re-evaluation trigger for splitting at BL-033 (not now):**

- External clients require source-code review and we can't expose the website
- Compliance scope (SOC 2, pen test) becomes easier with a smaller blast radius
- IP licensing posture demands a clean commercial boundary
- A second consumer of the engines emerges (e.g. a Slack bot, a Retool app)

Until any of those triggers fires, the same-repo cost (zero) dominates the future-flexibility cost (negligible — splitting later is mechanical).

---

## Lifecycle and evolution

| Phase      | Coupling to website                 | Versioning                                     | Why                                                                                                                                                                     |
| ---------- | ----------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BL-031** | **Tight — relative imports**        | Website git SHA                                | Engine drift is the dominant risk; single-source-of-truth eliminates it.                                                                                                |
| **BL-032** | **Tight engines, loose deployment** | Website git SHA + `wrangler` deploy id         | Engines still imported relatively; deployment moves to Cloudflare Workers (separate from Vercel — explicit blast-radius isolation).                                     |
| **BL-033** | **Loose — schema as contract**      | Independent semver applied to tool I/O schemas | External clients pin a tool-schema version; engines may evolve faster than the public contract. The MCP server becomes a translation/versioning layer over the engines. |

**Operating rule applied in BL-031:** the engines are the truth, the MCP wrapper is a thin adapter, and the schema lives in [`src/schemas/`](../../schemas/) so a single PR updates wizard config + engine + MCP simultaneously. The first time we need to ship a breaking change to the diligence schema with external clients depending on it, that's the trigger to introduce schema-version semantics — not before.

---

## Phase 1 (BL-031) Implementation Plan

### File layout (new)

```
gst-website/
├── package.json                 # +"workspaces": [".", "mcp-server"]
└── mcp-server/                  # NEW workspace, isolated from Astro build
    ├── package.json             # type: module, bin entry, deps: @modelcontextprotocol/server, zod
    ├── tsconfig.json            # standalone Node 22 strict config (does NOT extend Astro's)
    ├── README.md                # install, Claude Desktop / Code config, tool examples
    ├── src/
    │   ├── index.ts             # bootstrap + stdio transport
    │   ├── tools/
    │   │   ├── diligence.ts     # wraps generateScript()
    │   │   └── portfolio.ts     # wraps filterProjects() + facets
    │   └── schemas.ts           # re-exports Zod schemas from ../../../src/schemas
    └── tests/
        ├── diligence.test.ts
        └── portfolio.test.ts
```

### Critical files to read or modify

| File                                                                                         | Action                                                                | Why                                                                                                                                                                                                                                                                |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [src/utils/diligence-engine.ts](../../utils/diligence-engine.ts)                             | Read only — relative-import `generateScript`                          | Source of truth; pure, no DOM/Astro coupling.                                                                                                                                                                                                                      |
| [src/utils/filterLogic.ts](../../utils/filterLogic.ts)                                       | Read only — relative-import `filterProjects` and `getUnique*` helpers | Source of truth; covers facets too.                                                                                                                                                                                                                                |
| [src/data/diligence-machine/wizard-config.ts](../../data/diligence-machine/wizard-config.ts) | Read only                                                             | Authoritative enum values for `UserInputs` (the 13 fields).                                                                                                                                                                                                        |
| [src/data/ma-portfolio/projects.json](../../data/ma-portfolio/projects.json)                 | Read only at server boot                                              | 61 records; resolve via `import.meta.url` + `fileURLToPath`, NOT `process.cwd()` (Claude Desktop spawns with a different cwd).                                                                                                                                     |
| [src/schemas/diligence.ts](../../schemas/diligence.ts)                                       | Re-export via `mcp-server/src/schemas.ts`                             | Engine schema reuse. **Note:** the existing schema covers questions/attention areas; the **`UserInputs` Zod schema is not yet defined here** — derive it now (literal-union per field) to prevent drift, mirroring the canonical enum lists in `wizard-config.ts`. |
| [src/schemas/portfolio.ts](../../schemas/portfolio.ts)                                       | Re-export via `mcp-server/src/schemas.ts`                             | `ProjectSchema`, `ProjectsArraySchema`, growth-stage / engagement-category enums.                                                                                                                                                                                  |
| [package.json](../../../package.json)                                                        | Edit — add `"workspaces": [".", "mcp-server"]`                        | Required for the workspace to be discovered by lint/test/CI.                                                                                                                                                                                                       |
| [.github/workflows/test.yml](../../../.github/workflows/test.yml)                            | Read; minor edit if needed                                            | Existing jobs auto-discover workspaces; add a `cd mcp-server && npm test` step only if root `npm run test:run` doesn't pick it up.                                                                                                                                 |

### Tools to expose

#### `generate_diligence_agenda`

- Wraps `generateScript(inputs)` from [src/utils/diligence-engine.ts](../../utils/diligence-engine.ts).
- Input schema: derived **once** in `mcp-server/src/schemas.ts` from the enum lists in [wizard-config.ts](../../data/diligence-machine/wizard-config.ts) and the `UserInputs` interface. Each enum field uses `z.enum([...])` against the canonical values (transactionType, productType, techArchetype, headcount, revenueRange, growthStage, companyAge, businessModel, scaleIntensity, transformationState, dataSensitivity, operatingModel) plus `geographies: z.array(z.enum([...]))`.
- Output: full `GeneratedScript` (topics, attentionAreas, triggerMap, metadata) JSON-stringified into a `text` content block. Optionally also populate `structuredContent` with the same object so MCP clients that support structured output can parse without re-stringification.
- Validation failure: return `{ isError: true, content: [{ type: 'text', text: 'Validation failed: ...' }] }`. Never throw.

#### `search_portfolio`

- Wraps `filterProjects(projects, criteria)` from [src/utils/filterLogic.ts](../../utils/filterLogic.ts).
- Loads `projects.json` once at module-init using `fileURLToPath(new URL('../../../src/data/ma-portfolio/projects.json', import.meta.url))`; validates with `ProjectsArraySchema` from [src/schemas/portfolio.ts](../../schemas/portfolio.ts).
- Input: `{ search?: string, theme?: string ('all' default), engagement?: string ('all' default), limit?: number (default 20, max 61) }`.
- Output: `{ matches: Project[], totalMatched: number, returned: number }` — array slice + count summary, JSON-stringified into a `text` content block.

#### `list_portfolio_facets` (companion tool — included in Phase 1)

- Returns `{ themes: string[], engagementCategories: string[], growthStages: string[], years: number[] }` by composing `getUniqueThemes`, `getUniqueEngagementCategories`, `getUniqueGrowthStages`, `getUniqueYears` from [filterLogic.ts](../../utils/filterLogic.ts).
- Saves an LLM round-trip when discovering valid filter values. No input parameters.

### Server bootstrap (sketch)

```ts
// mcp-server/src/index.ts
import { McpServer, StdioServerTransport } from '@modelcontextprotocol/server';
import { registerDiligenceTool } from './tools/diligence.js';
import { registerPortfolioTools } from './tools/portfolio.js';

const server = new McpServer({ name: 'gst-tools', version: '0.1.0' });
registerDiligenceTool(server);
registerPortfolioTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('[gst-mcp] connected on stdio'); // stdout is reserved for protocol — log to stderr
```

### TypeScript & lint configuration

- `mcp-server/tsconfig.json` — standalone strict config: `target: ES2022`, `module: NodeNext`, `moduleResolution: NodeNext`, `strict: true`, `outDir: dist`, `rootDir: src`. Does **NOT** extend `astro/tsconfigs/strict` (which would import Astro types unnecessarily).
- Existing flat ESLint config at repo root automatically covers the new directory. Confirm by running `npm run lint` after scaffolding.
- The Astro `tsconfig.json` `include: ["**/*"]` will pick up `mcp-server/**/*.ts`. Add `mcp-server` to its `exclude` array to keep Astro's type checker out of the new workspace.

### Verification (run before marking complete)

1. `cd mcp-server && npm run build` — produces `dist/index.js`, no type errors.
2. `cd mcp-server && npm test` — Vitest green: happy-path, invalid-input rejection (expect `isError: true` not a thrown stack trace), empty-result, schema-bound enum violation, and `list_portfolio_facets` output shape.
3. From repo root: `npx astro check && npm run lint && npm run lint:css && npm run test:run` — still green; the canonical local-validation sequence from [DEVELOPER_TOOLING.md](DEVELOPER_TOOLING.md) must remain passing.
4. Add the local server to `claude_desktop_config.json` per the README snippet, restart Claude Desktop, confirm the three tools appear in the tool list.
5. Invoke `generate_diligence_agenda` with the README's worked example (a representative `b2b-saas` / `modern-cloud-native` / `majority-stake` payload), confirm a non-empty topic list and a sensible `metadata.totalQuestions`.
6. Invoke `search_portfolio { search: 'CRM', engagement: 'Value Creation' }`, confirm matches return.
7. Invoke `generate_diligence_agenda` with `transactionType: "foo"` (invalid enum), confirm a clean `isError: true` content block — no stack trace.
8. Compare a wizard output from `localhost:4321/hub/tools/diligence-machine` against the MCP output for the same inputs — they MUST be identical (zero behavior divergence is an explicit BL-031 outcome).

### Risks & mitigations

| Risk                                                                                                             | Mitigation                                                                                                                                                                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Schema drift between wizard and MCP                                                                              | Derive the MCP `UserInputs` Zod schema from the SAME enum arrays exported by [wizard-config.ts](../../data/diligence-machine/wizard-config.ts) (no string duplication). Add a Vitest test that asserts every wizard step's option list is a subset of the corresponding MCP enum. |
| Path resolution under stdio (Claude Desktop spawns server with cwd = home dir)                                   | Resolve `projects.json` via `fileURLToPath(new URL('...', import.meta.url))`, never `process.cwd()`.                                                                                                                                                                              |
| SDK package-name confusion (backlog says `@modelcontextprotocol/sdk`, current is `@modelcontextprotocol/server`) | Use `@modelcontextprotocol/server` (v2). Update the BACKLOG.md acceptance text in the implementation PR so future readers don't repeat the confusion.                                                                                                                             |
| Astro's `tsc` picking up the new workspace                                                                       | Add `"mcp-server"` to root `tsconfig.json` `exclude` array; confirm `npx astro check` is unchanged.                                                                                                                                                                               |
| Engine behavior divergence after a future PR adds a `UserInputs` field without updating MCP                      | The "subset" Vitest test above catches new wizard fields automatically; CI fails until the MCP schema is updated in the same PR.                                                                                                                                                  |

### Out of scope (deferred to BL-032 / BL-033)

- HTTP transport, Cloudflare Worker deployment, `wrangler.toml`
- Bearer-token auth, OAuth 2.1, PKCE, dynamic client registration
- Rate limiting, Upstash Redis, sliding-window quotas
- Radar tools (`search_radar`, `get_latest_insights`) — require Inoreader credentials and 6h cache (see [RADAR.md](../hub/RADAR.md))
- Audit logging, R2 immutable storage, hash-chain integrity
- Prompt-injection sanitization (the diligence/portfolio surfaces have no user-supplied free-text egress in BL-031)
- Public listing on MCP directories

---

## Phase 2 (BL-032) — at a glance

Remote internal deployment to Cloudflare Workers with Streamable HTTP transport and bearer-token auth. Adds the radar tools (`search_radar`, `get_latest_insights`) which require Upstash Redis caching to honor Inoreader's 200 req/day budget. Tool registry is shared with Phase 1 — register-once, transport-twice. Full acceptance criteria: [BACKLOG.md § BL-032](BACKLOG.md#bl-032-mcp-server--internal-remote-phase-2).

## Phase 3 (BL-033) — at a glance

External pilot with PE design partners. OAuth 2.1 (PKCE-mandatory), tool-level scopes, append-only audit logs to R2, prompt-injection hardening on radar surface, public listing on MCP directories. This is the phase where the repo-split decision and schema-versioning discipline get re-evaluated. Full acceptance criteria: [BACKLOG.md § BL-033](BACKLOG.md#bl-033-mcp-server--external-pilot-phase-3).

---

_Last updated: 2026-04-25_
