# MCP Server — BL-031.5 Verification Punch List

> **Closing punch-list** for [BL-031.5: MCP Server — Hub Surface Extension](BACKLOG.md#bl-0315-mcp-server--hub-surface-extension). The initiative is code-complete; this document tracks the live-verification work required to _literally_ close it — invoking the new tools through a real MCP client, recording side-by-side wizard parity, and confirming the Resources primitive end-to-end.
>
> **Companion**: [`MCP_SERVER_HUB_SURFACE_BL-031_5.md`](MCP_SERVER_HUB_SURFACE_BL-031_5.md) — the architecture doc with the verification list (steps 4-10) this document operationalizes.
>
> **Closing artifact**: when every item below is checked, paste the recorded values into [`mcp-server/README.md` § "Smoke test (manual parity check)"](../../../mcp-server/README.md#smoke-test-manual-parity-check) — replacing the projected `≈` values currently there with real recordings — and bump `mcp-server/package.json` to `0.2.0` (recommended; see closing checklist). Then this document can be deleted, since the recorded evidence lives in the README. Tracked under [BL-034](BACKLOG.md#bl-034-mcp-server--documentation-cleanup) for the deletion.
>
> **Status**: Open — punch-list items below.

---

## Why this exists

The 17 BL-031.5 acceptance-criteria checkboxes are ticked and the code/tests/docs are landed, but two of them are **weakly satisfied**:

- **AC #16** (`Manual parity check recorded in the README — side-by-side outputs of the website wizard vs the MCP tool`) — the README stanza records _projected_ values from the test inputs, not actually-invoked-against-the-website-wizard side-by-side comparisons.
- **Architecture-doc verification steps 4-9** — restart Claude Desktop, confirm resource picker, pin a Library URI, invoke each new tool, side-by-side wizard comparison, snapshot-deleted error path live verification — none performed live.

By the BL-031 closure standard, both gaps need real evidence before "Complete" stands up to scrutiny. This document is the operational checklist to close them.

---

## Prerequisites

| #   | Step                                   | Command / location                                                                                                                                                                                                 | Verified |
| --- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| 1   | Repo cloned                            | (any clone of the gst-website repo)                                                                                                                                                                                | [x]      |
| 2   | Dependencies installed                 | `npm install` from repo root                                                                                                                                                                                       | [x]      |
| 3   | mcp-server build current               | `npm -w @gst/mcp-server run build` → produces `mcp-server/dist/index.js` (~430 KB)                                                                                                                                 | [x]      |
| 4   | Binary smoke-tested                    | `node mcp-server/dist/index.js < /dev/null` → prints `[gst-mcp] connected on stdio`                                                                                                                                | [x]      |
| 5   | Radar snapshot seeded                  | `npm run radar:seed` from repo root → populates `.cache/inoreader/` with two SHA256-keyed JSON files                                                                                                               | [x]      |
| 6   | Claude Desktop installed               | <https://claude.ai/download>                                                                                                                                                                                       | [x]      |
| 7   | gst-mcp registered with Claude Desktop | Per [`mcp-server/README.md` § Configure clients](../../../mcp-server/README.md#configure-clients) — edit `claude_desktop_config.json`, add the `gst` server entry with absolute path to `mcp-server/dist/index.js` | [x]      |
| 8   | Claude Desktop restarted               | Quit fully (not just close window) and reopen — required for `claude_desktop_config.json` changes to take effect                                                                                                   | [x]      |

> **Verified 2026-04-28 22:38 UTC** via Claude Desktop MCP log (`mcp-server-gst.log`) — server spawned, protocol `2025-11-25` negotiated, `tools/list` + `resources/list` both returned non-error responses with substantive payloads. Server-side stderr line `[gst-mcp] connected on stdio` confirmed.

> **Why Claude Desktop and not Claude Code for verification?** Both support MCP. Claude Desktop has the most prominent **resource picker** UI — pinning `gst://library/vdr-structure` into a conversation visually demonstrates the Resources primitive. Claude Code is a terminal-style interface where Resources are model-discovered rather than user-pinned. The tools (steps V1-V3, V6) work identically in both clients; the Resource verification (steps V4, V5) is most convincingly done in Claude Desktop.

---

## Confirming the server is registered

After restart, in a new Claude Desktop conversation:

### Tools registered (expect 9)

The MCP tool picker (typically opened via the conversation chrome's tools/connectors icon, or by typing `/` in the input) should list the `gst` server with these 9 tools:

| Tool                                    | Surface  | Initiative       |
| --------------------------------------- | -------- | ---------------- |
| `generate_diligence_agenda`             | BL-031   | ✅ shipped       |
| `search_portfolio`                      | BL-031   | ✅ shipped       |
| `list_portfolio_facets`                 | BL-031   | ✅ shipped       |
| `assess_infrastructure_cost_governance` | BL-031.5 | (verifying here) |
| `compute_techpar`                       | BL-031.5 | (verifying here) |
| `estimate_tech_debt_cost`               | BL-031.5 | (verifying here) |
| `search_regulations`                    | BL-031.5 | (verifying here) |
| `list_regulation_facets`                | BL-031.5 | (verifying here) |
| `search_radar_cache`                    | BL-031.5 | (verifying here) |

If only the BL-031 trio shows up, the binary loaded by Claude Desktop is pre-BL-031.5 — re-run `npm -w @gst/mcp-server run build` and restart Claude Desktop.

### Resources registered (expect 128)

The resource picker should list (or `resources/list` should return) **128 URIs**:

| URI pattern                                       | Count | Source                                                         |
| ------------------------------------------------- | ----- | -------------------------------------------------------------- |
| `gst://library/<slug>`                            | 2     | `src/data/library/<slug>/article.md`                           |
| `gst://regulations/<jurisdiction>/<framework-id>` | 120   | `src/data/regulatory-map/*.json` (codegened into bundle)       |
| `gst://radar/fyi/latest`                          | 1     | `.cache/inoreader/<sha256>.json` (read on demand)              |
| `gst://radar/wire/latest`                         | 1     | same                                                           |
| `gst://radar/wire/<category>`                     | 4     | same — `pe-ma`, `enterprise-tech`, `ai-automation`, `security` |

> **MCP UX note — why "ask Claude to list the resources" doesn't work**: in MCP, `resources/list` is a **protocol method called by the client** (Claude Desktop), not a tool the model can invoke. The model in a conversation has first-class access only to _tools_. Resources are surfaced to the user through the resource picker UI in the conversation chrome (the **"connectors" UX** in Claude Desktop, verified 2026-04-29) and become visible to the model only after they're brought into the active context (Claude Desktop currently inlines the resource body into the prompt; other MCP clients may attach a persistent-pin object). This is not a server bug or a missing capability — it's the architectural distinction between Tools (model-invoked) and Resources (user-pinned or model-pulled-by-URI).
>
> **For verification purposes**: the count of 128 is confirmed by the Claude Desktop MCP log (`mcp-server-gst.log`) which captures the `resources/list` response from server startup — the client did enumerate them, even if the model cannot surface that enumeration conversationally. Visual confirmation of the catalog happens in V4/V5 (pinning a Library + Regulation Resource via the resource picker UI).

### Inspecting MCP logs (when something fails)

Claude Desktop's MCP log location:

- **macOS**: `~/Library/Logs/Claude/mcp*.log`
- **Windows**: `%APPDATA%\Claude\logs\mcp*.log`
- **Linux**: `~/.config/Claude/logs/mcp*.log` (path varies by distro)

Look for lines tagged `[gst-mcp]` to see the server's stderr output. Any stack trace surfacing a website-engine import path (`src/utils/...`) means the server bundle is inheriting a runtime error from the embedded engines — surface to the BL-031.5 commit author.

---

## Verification flow — how to invoke

### Tools

In a Claude Desktop conversation with `gst` enabled, you can invoke a tool either:

1. **Implicitly** by describing the task in prose — Claude reads the prose, picks the right tool, extracts arguments. Example: _"Score this target's ICG maturity. Series B-C SaaS, ~60% tagging coverage, no FinOps team, ..."_
2. **Explicitly** by referring to the tool by name and pasting the JSON arguments. Example: _"Run `mcp__gst__assess_infrastructure_cost_governance` with `{ "answers": {...}, "companyStage": "series-bc" }`."_

For verification, **explicit invocation with a frozen payload** is preferred — it removes prose-interpretation as a variable and lets you compare byte-for-byte against the website wizard.

### Resources

In Claude Desktop:

1. Open the resource picker (in Claude Desktop, this is the **"connectors" UX** in the conversation chrome — verified 2026-04-29)
2. Browse to `gst://library/...` or `gst://regulations/...` — the resource is "pinned" to the conversation
3. The model now treats the pinned resource's body as referenceable context — you can ask follow-up questions like _"according to the pinned Quebec Law 25, what's the breach notification window?"_ and the model cites from the pinned content

### Snapshot-missing error path (Radar)

To verify the Radar Resources fail gracefully when the seed snapshot is missing:

1. Stop / minimize Claude Desktop
2. From repo root: `rm -rf .cache/inoreader/` (or `Remove-Item -Recurse -Force .cache/inoreader/` in PowerShell)
3. Reopen Claude Desktop, invoke `mcp__gst__search_radar_cache { "tier": "fyi" }`
4. Expected response: `isError: true` with text `Radar snapshot not found. Run `npm run radar:seed` from the gst-website repo root to populate the local cache.`
5. Re-seed: `npm run radar:seed`
6. Re-invoke; should now succeed

---

## Verification punch list

### V1. ICG — side-by-side wizard parity

- [x] **Verified 2026-04-29** — byte-for-byte match across all measurable fields (see recording table below). Trial 2 procedure (corrected after trial 1 used a sparse-map payload the wizard cannot reproduce; see commit `5e5680e`).

**Important — wizard / API asymmetry** (re-discovered during V1 trial 1, see commit history): the wizard requires an answer for every one of the 20 questions before it produces a result; the "Next domain" button stays disabled until the current domain's questions are complete. The MCP API allows sparse maps (missing keys treated as `0`), but a sparse-map call produces a state the wizard cannot reproduce. So this V1 procedure uses a **complete 20-answer payload** for byte-identical parity. See [`mcp-server/src/docs/icg/CONTRACT.md`](../../../mcp-server/src/docs/icg/CONTRACT.md) § Hidden semantics — wizard / API asymmetry for the full explanation.

**MCP invocation** (paste into Claude Desktop):

> _"Invoke the `gst:assess_infrastructure_cost_governance` tool with this exact payload, then show me the raw JSON output without any commentary or summarization:_
>
> ````json
> {
>   "answers": {
>     "q1_1": 2, "q1_2": 1, "q1_3": 0,
>     "q2_1": 3, "q2_2": 2, "q2_3": -1, "q2_4": 1,
>     "q3_1": 2, "q3_2": 2, "q3_3": 1,
>     "q4_1": 1, "q4_2": 0, "q4_3": -1,
>     "q5_1": 2, "q5_2": 1, "q5_3": 0,
>     "q6_1": 1, "q6_2": -1, "q6_3": 2, "q6_4": 1
>   },
>   "companyStage": "series-bc"
> }
> ```"
> ````

**Website wizard procedure**:

1. Open <https://globalstrategic.tech/hub/tools/infrastructure-cost-governance/> (or local dev: `npm run dev` then `http://localhost:4321/hub/tools/infrastructure-cost-governance/`)
2. Set company stage = "Series B–C" (top-of-page selector)
3. Answer **every one of the 20 questions** per the canonical map. The wizard answer-button labels map to scores:
   - "Not in place" = `0`
   - "Ad hoc" = `1`
   - "Established" = `2`
   - "Optimized" = `3`
   - "Not sure" = `-1`
4. The wizard's "Next domain" / "View results" button stays disabled until every question in the current domain has a value — there is no skip path. Use "Not sure" for the three `-1` entries above (`q2_3`, `q4_3`, `q6_2`).
5. Read the rendered overall score, maturity level, per-domain scores

**Recording (verified 2026-04-29)**:

| Field                                | MCP output                                                        | Wizard output                                | Match? |
| ------------------------------------ | ----------------------------------------------------------------- | -------------------------------------------- | ------ |
| `overallScore`                       | `32`                                                              | `32`                                         | ✅     |
| `maturityLevel`                      | `Aware`                                                           | `Aware`                                      | ✅     |
| `answeredCount` / `totalQuestions`   | `20 / 20`                                                         | `20 of 20`                                   | ✅     |
| `skippedCount`                       | `3`                                                               | `3` ("Not sure" responses)                   | ✅     |
| `showFoundationalFlag`               | `true` (d1.belowFoundationalThreshold: true)                      | `⚠ Foundational gap: Visibility and Tagging` | ✅     |
| `d1` Visibility & Tagging            | `33` (Aware)                                                      | `33/100` (Aware)                             | ✅     |
| `d2` Account Structure & Attribution | `42` (Aware)                                                      | `42/100` (Aware)                             | ✅     |
| `d3` Right-Sizing & Utilization      | `56` (Optimizing)                                                 | `56/100` (Optimizing)                        | ✅     |
| `d4` Lifecycle & Waste               | `0` (Reactive)                                                    | `0/100` (Reactive)                           | ✅     |
| `d5` Architectural Efficiency        | `33` (Aware)                                                      | `33/100` (Aware)                             | ✅     |
| `d6` Governance & Alerting           | `25` (Reactive)                                                   | `25/100` (Reactive)                          | ✅     |
| `recommendations[].length`           | `13`                                                              | `13`                                         | ✅     |
| Recommendation order (top→bottom)    | `r03, r16, r17, r21, r26, r07, r09, r04, r10, r11, r14, r19, r25` | identical                                    | ✅     |

**Bonus signal**: the wizard URL fragment `?s=eyJzIjo3LCJh...` (base64-decoded) shows the wizard's recorded answer map matches the MCP payload exactly — same input → same output, both surfaces.

---

### V2. TechPar — side-by-side wizard parity

- [x] **Verified 2026-04-29** — byte-for-byte match across all measurable fields after trial 1 surfaced two unrelated issues (an `infraPersonnel` typo of $6M instead of $600K — fixed in trial 2 — and a TechPar `exitMultiple` UX bug where the field is hidden at Series B–C stage but state persists from prior PE/Enterprise-stage interaction; the latter is moot for this scenario because `gap.cumulative36 = 0` makes `exitMultiple` irrelevant to any visible output, but is recorded under [BL-034](BACKLOG.md#bl-034-mcp-server--documentation-cleanup) for end-of-sequence resolution).

**MCP invocation**:

> _"Invoke `mcp__gst__compute_techpar` with this exact payload:_
>
> ````json
> {
>   "arr": 25000000,
>   "stage": "series_bc",
>   "mode": "quick",
>   "capexView": "cash",
>   "growthRate": 30,
>   "exitMultiple": 12,
>   "infraHosting": 80000,
>   "infraPersonnel": 600000,
>   "rdOpEx": 4000000,
>   "rdCapEx": 500000,
>   "engFTE": 25,
>   "engCost": 0,
>   "prodCost": 0,
>   "toolingCost": 0
> }
> ```"
> ````

**Website wizard procedure**:

1. Open <https://globalstrategic.tech/hub/tools/techpar/>
2. Stage = Series B–C; ARR = $25M; growth rate = 30%; exit multiple = 12×; basis = Cash
3. Mode = Quick; infra hosting (monthly) = $80K; infra personnel = $600K; R&D OpEx = $4M; R&D CapEx = $500K; engineering FTE = 25
4. Read totalTechPct, zone, per-category KPIs, 36-month gap

**Recording (verified 2026-04-29, trial 2)**:

| Field                                    | MCP output             | Wizard output                                                | Match? |
| ---------------------------------------- | ---------------------- | ------------------------------------------------------------ | ------ |
| `total` (Cash basis)                     | `$6,060,000`           | `$6.1M/yr` (display-rounded)                                 | ✅     |
| `totalTechPct`                           | `24.24`                | `24.2%` (1-decimal display)                                  | ✅     |
| `zone`                                   | `ahead`                | `Efficiency advantage` (zoneLabel mapping in techpar-engine) | ✅     |
| `categories[0].pctArr` (Infra hosting)   | `3.84` (bench [8, 18]) | `3.8%` (bench 8–18%)                                         | ✅     |
| `categories[1].pctArr` (Infra personnel) | `2.4` (bench [2, 6])   | `2.4%` (bench 2–6%)                                          | ✅     |
| `categories[2].pctArr` (R&D OpEx)        | `16` (bench [25, 40])  | `16.0%` (bench 25–40%)                                       | ✅     |
| `categories[3].pctArr` (R&D CapEx)       | `2` (bench [3.6, 7.2]) | `2.0%` (bench 3.6–7.2%)                                      | ✅     |
| `gap.underinvestGap`                     | `12,139,071.22`        | `$12.1M` (below 35% floor)                                   | ✅     |
| `gap.cumulative36` / `gap.exitValue`     | `0 / 0`                | (not displayed — no excess to multiply)                      | ✅     |

**Bonus signal — URL-fragment audit**: the wizard URL `?s=series_bc&a=25000000&g=30&e=15&h=80000&p=600000&r=4000000&x=500000&f=25&k=5000000&q=1000000&t=250000&u=A%24&n=marketplace` confirms the corrected `p=600000` (infraPersonnel). Other params:

- `e=15` — pre-existing wizard UX bug (BL-034 cleanup item); has zero output impact here because `gap.cumulative36 = 0`
- `k=5000000`, `q=1000000`, `t=250000` — deepdive-mode fields, ignored when mode is `quick` (no `m=` param means default `quick` mode)
- `u=A%24` (currency = AUD), `n=marketplace` — purely cosmetic display values; engine ignores

**Procedural lesson learned (folded into V3 below)**: always diff the wizard URL fragment against the MCP payload BEFORE declaring parity — input mismatches cause spurious "engine drift" alarms. This was the lesson from V2 trial 1.

---

### V3. Tech Debt — side-by-side wizard parity

- [x] **Verified 2026-04-29** — byte-for-byte match between MCP output and wizard URL-decoded engine state. Surfaced an additional UX bug ([Tech Debt direct-input quantization bug](BACKLOG.md#bl-034-mcp-server--documentation-cleanup) — the wizard's number-input fields silently round-trip user values through slider quantization, so $10M typed into the ARR input becomes $10.3M and $500K into budget becomes $522K). User adjusted the MCP payload to match the wizard's actually-quantized values; both surfaces then produced identical results.

**Caveat — slider quantization**: the website wizard uses sliders that quantize values (`posToTeamSize` rounds to specific integers; `posToSalary` rounds to nearest $5K; `posTobudget` rounds to nearest $1K; `posToArr` rounds to nearest $100K). The MCP tool accepts arbitrary raw values. Even the wizard's number-input fields quantize on entry (see BL-034). Pick verification inputs that hit slider stops cleanly OR run the URL-fragment audit BEFORE invoking the MCP tool so the MCP payload reflects what the wizard actually stored.

**MCP invocation**:

> _"Invoke `mcp__gst__estimate_tech_debt_cost` with this exact payload:_
>
> ````json
> {
>   "teamSize": 8,
>   "salary": 150000,
>   "maintenanceBurdenPct": 25,
>   "deployFrequency": "Bi-weekly",
>   "incidents": 3,
>   "mttrHours": 4,
>   "remediationBudget": 500000,
>   "arr": 10000000,
>   "remediationPct": 70,
>   "contextSwitchOn": false
> }
> ```"
> ````

**Website wizard procedure**:

1. Open <https://globalstrategic.tech/hub/tools/tech-debt-calculator/>
2. Slide team size to 8; salary to $150K; maintenance burden to 25%; deploy cadence to Bi-weekly
3. Set incidents = 3 / month; MTTR = 4 hours; remediation budget = $500K; ARR = $10M; remediation efficiency = 70%; context-switch overhead OFF (advanced section)
4. Read annual cost, monthly cost, payback period, DORA tier

**Recording (verified 2026-04-29)**:

Inputs (after wizard slider-quantization noted above): `teamSize=8, salary=$150K, maintPct=25, deployFreq=Bi-weekly, incidents=3, mttr=4hr, budget=$522K, arr=$10.3M, remediationPct=70, contextSwitch=off`

| Field                     | MCP output    | Wizard expected (engine math) | Match? |
| ------------------------- | ------------- | ----------------------------- | ------ |
| `annualCost`              | `$340,384.62` | `$340,384.62`                 | ✅     |
| `totalMonthly`            | `$28,365.38`  | `$28,365.38`                  | ✅     |
| `directMonthly`           | `$27,500.00`  | `8 × $12,500 × 0.25 × 1.1`    | ✅     |
| `incidentMonthly`         | `$865.38`     | `3 × 4 × ($150K/2080)`        | ✅     |
| `hoursLostPerEng`         | `10`          | `40 × 0.25`                   | ✅     |
| `costPerEng`              | `$3,545.67`   | `$28,365.38 / 8`              | ✅     |
| `debtPctArr`              | `3.3047%`     | `$340,384.62 / $10.3M × 100`  | ✅     |
| `monthlySavings`          | `$19,855.77`  | `$28,365.38 × 0.7`            | ✅     |
| `paybackMonths`           | `26.29`       | `$522K / $19,855.77`          | ✅     |
| `doraLabel`               | `High`        | `DEPLOY_OPTIONS[3].doraLabel` | ✅     |
| `V` (velocity multiplier) | `1.1`         | `DEPLOY_OPTIONS[3].V`         | ✅     |

**Bonus signal — URL-fragment audit**: the wizard URL `?s=eyJhIjoxLCJ0cyI6MTYsInNwIjozMSwibXAiOjI1LCJkaSI6MywiaW4iOjMsIm10dHIiOjQsImJwIjoxNiwiYXAiOjE2LCJyZSI6NzAsImNzIjowfQ==` decodes to `{"a":1,"ts":16,"sp":31,"mp":25,"di":3,"in":3,"mttr":4,"bp":16,"ap":16,"re":70,"cs":0}`. Engine math from those positions: `posToTeamSize(16)=8, posToSalary(31)=$150K, posTobudget(16)=$522K, posToArr(16)=$10.3M, DEPLOY_OPTIONS[3]=Bi-weekly`. Wizard input state proven equal to MCP payload by construction.

---

### V4. Pinned Library Resource — `gst://library/vdr-structure`

- [x] **Verified 2026-04-29** — resource was discoverable via the Claude Desktop "connectors" UX (initially mis-described as "paperclip" — corrected during V5); the body got inlined into the prompt window (Claude Desktop's current Resources UX is paste-the-content rather than persistent-pin); model returned all 9 folder categories in exact order with no paraphrasing or hallucination.

**Procedure**:

1. Open the resource picker in Claude Desktop ("connectors" UX in the conversation chrome — verified 2026-04-29 against Claude Desktop; not the paperclip as initially assumed)
2. Browse to `gst://library/vdr-structure` and select it. (UX note: Claude Desktop's current implementation INLINES the resource body into the prompt window when you select it — different from the persistent-pin model some MCP clients use. Both behaviors satisfy the AC; the functional outcome — content reachable by the model — is what's being verified.)
3. Confirm the resource content is present in the conversation (either as a pinned attachment or as inlined prompt text — implementation-dependent)
4. Ask: _"From the pinned VDR Structure Guide, list the 9 folder categories under the recommended folder taxonomy."_
5. Expected: model returns the exact 9 folders in numbered order — Product, Software Architecture, Infrastructure & Operations, SDLC, Data, Analytics & AI, Security, People & Organization, Corporate IT, Governance & Compliance.

**Recording (verified 2026-04-29)**:

- Resource discoverable in resource picker: ✅ (Claude Desktop "connectors" UX in the conversation chrome)
- Content reached the conversation: ✅ (inlined into prompt window — Claude Desktop UX)
- 9 folders enumerated correctly: ✅
- Model cited the pinned content (vs hallucinating): ✅ (exact match in exact order)
- Notes: Claude Desktop uses an inline-paste UX rather than a persistent-pin model. Both are valid MCP client implementations; the AC verifies the functional outcome (content reachable by the model) rather than a specific UI affordance.

---

### V5. Pinned Regulation Resource — `gst://regulations/eu/gdpr`

- [x] **Verified 2026-04-29** — both GDPR facts cited verbatim (72-hour notification window, up to 4% / €20M penalty); bonus check confirms the regulation catalog (~120 entries under `gst://regulations/...`) is fully visible in the connectors UX.

**Procedure**:

1. Open the resource picker (Claude Desktop "connectors" UX), browse to `gst://regulations/eu/gdpr`, select it
2. Ask: _"From the pinned GDPR resource, what's the breach notification window and the maximum penalty?"_
3. Expected: 72-hour breach notification; up to 4% of annual global turnover or €20M, whichever is greater.

**Recording (verified 2026-04-29)**:

- Resource discoverable in connectors UX: ✅
- Content reached the conversation: ✅ (inline-paste UX, same as V4)
- Breach window correct (72 hours): ✅ ("72 hours to supervisory authorities")
- Penalty correct (4% / €20M): ✅ ("Up to 4% of annual global turnover or EUR 20 million, whichever is greater.")
- **Bonus** — regulation catalog visible in connectors UX: ✅ (~120 regulation Resources visible — implicit confirmation of the 128-Resource manifest from server startup)
- Notes: V5 corrected the V4 misnomer — affordance is the "connectors" UX, not the paperclip; V4 procedure has been updated retroactively with the same correction.

---

### V6. Snapshot-missing Radar error path

- [ ] **Verified** (date / verifier: **\*\*\*\***\_\_\_\_**\*\*\*\***)

**Procedure** (do this when no other Radar verification work is in flight):

1. From repo root: `rm -rf .cache/inoreader` (or PowerShell: `Remove-Item -Recurse -Force .cache/inoreader`)
2. In Claude Desktop, invoke: `mcp__gst__search_radar_cache { "tier": "fyi" }`
3. Expected: `isError: true` with the text `Radar snapshot not found. Run `npm run radar:seed` from the gst-website repo root to populate the local cache.`
4. Verify no stack trace, no exception leak — just the structured error.
5. Restore: `npm run radar:seed`
6. Re-invoke; expected: normal response with `matches`, `totalMatched`, `returned`, `snapshotInfo.fyiLastSeededAt`.

**Recording**:

- Structured error returned (no stack trace): [ ]
- Error message text matches: [ ]
- Re-seed restored functionality: [ ]
- Notes: **\*\***\*\***\*\***\_\_**\*\***\*\***\*\***

---

### V7. Update the README "Last verified" stanza

- [ ] **Verified** (date / verifier: **\*\*\*\***\_\_\_\_**\*\*\*\***)

**Procedure**:

After V1-V6 are checked, edit [`mcp-server/README.md`](../../../mcp-server/README.md) § "Smoke test (manual parity check)" and replace the projected `≈` values in the BL-031.5 stanza with the **actual recorded values** from V1-V3. Update the "Last verified" date.

Specifically:

- Replace `totalTechPct ≈ 22%` with the exact value
- Replace `zone: "above"` if recorded zone differs
- Replace `annualCost ≈ $330K` with the exact value
- Replace `paybackMonths ≈ 18.2` with the exact value
- Replace `overallScore in the 0-100 range with a maturityLevel of Aware` with the exact recorded score and level

**Recording**:

- README stanza updated: [ ]
- Date refreshed: [ ]
- All `≈` qualifiers removed (or retained only where genuinely approximate): [ ]

---

## Closing the punch list

When V1-V7 are checked and the README stanza is updated, one final commit closes BL-031.5:

- [ ] All 7 verification items checked (V1-V7)
- [ ] `mcp-server/README.md` "Last verified (BL-031.5 surface)" stanza contains real recorded values, refreshed date
- [ ] `mcp-server/package.json` version bumped — recommended `0.2.0` to mark the BL-031.5 surface expansion (128 new URIs + 6 new tools = a materially different MCP surface from the BL-031 baseline). Record rationale in the closing commit message.
- [ ] Architecture-doc verification list at [`MCP_SERVER_HUB_SURFACE_BL-031_5.md` § Verification](MCP_SERVER_HUB_SURFACE_BL-031_5.md#verification) fully ticked
- [ ] Single closing commit lands the README updates + version bump
- [ ] **This document deleted** — the recorded evidence has migrated to the README; this punch list has served its purpose. Tracked under [BL-034](BACKLOG.md#bl-034-mcp-server--documentation-cleanup).

---

## Why this is a transitional document

This punch list is **not** intended to live as a permanent reference. It exists for one reason: BL-031.5 was committed code-complete with the parity check pending, and the closing work needs an explicit checklist so it doesn't get lost. Once the closing commit lands:

- Recorded evidence lives in `mcp-server/README.md` (durable, near the install instructions where future smoke tests will look)
- Architectural rationale lives in [`MCP_SERVER_HUB_SURFACE_BL-031_5.md`](MCP_SERVER_HUB_SURFACE_BL-031_5.md) (frozen ADR; describes the design at authoring time)
- This document has no remaining role and gets deleted

If a similar verification gap emerges on a future MCP initiative (BL-031.75, BL-032, etc.), author a sibling `<INITIATIVE>_Verification.md` following this structure, then delete it on closing. The pattern is reusable; the artifact is transitional.

---

_Last updated: 2026-04-28_
