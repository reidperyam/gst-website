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

> **MCP UX note — why "ask Claude to list the resources" doesn't work**: in MCP, `resources/list` is a **protocol method called by the client** (Claude Desktop), not a tool the model can invoke. The model in a conversation has first-class access only to _tools_. Resources are surfaced to the user through the resource picker UI in the conversation chrome (paperclip / attachment icon in Claude Desktop) and become visible to the model only after they're _pinned_ into the active context. This is not a server bug or a missing capability — it's the architectural distinction between Tools (model-invoked) and Resources (user-pinned or model-pulled-by-URI).
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

1. Open the resource picker (typically a paperclip or attachment icon in the conversation chrome)
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

- [ ] **Verified** (date / verifier: **\*\*\*\***\_\_\_\_**\*\*\*\***)

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

**Recording**:

| Field                                    | MCP output | Wizard output | Match? |
| ---------------------------------------- | ---------- | ------------- | ------ |
| `totalTechPct`                           | **\_**     | **\_**        | [ ]    |
| `zone`                                   | **\_**     | **\_**        | [ ]    |
| `categories[0].pctArr` (Infra hosting)   | **\_**     | **\_**        | [ ]    |
| `categories[1].pctArr` (Infra personnel) | **\_**     | **\_**        | [ ]    |
| `categories[2].pctArr` (R&D OpEx)        | **\_**     | **\_**        | [ ]    |
| `categories[3].pctArr` (R&D CapEx)       | **\_**     | **\_**        | [ ]    |
| `gap.cumulative36`                       | **\_**     | **\_**        | [ ]    |
| `gap.exitValue`                          | **\_**     | **\_**        | [ ]    |
| `kpis.revenuePerEngineer`                | **\_**     | **\_**        | [ ]    |

---

### V3. Tech Debt — side-by-side wizard parity

- [ ] **Verified** (date / verifier: **\*\*\*\***\_\_\_\_**\*\*\*\***)

**Caveat — slider quantization**: the website wizard uses sliders that quantize values (`posToTeamSize` rounds to specific integers; `posToSalary` rounds to nearest $5K; `posTobudget` rounds to nearest $1K; `posToArr` rounds to nearest $100K). The MCP tool accepts arbitrary raw values. Pick verification inputs that hit slider stops cleanly so byte-identity is achievable. The values below are slider-stop-friendly.

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

**Recording**:

| Field                     | MCP output | Wizard output | Match? |
| ------------------------- | ---------- | ------------- | ------ |
| `annualCost`              | **\_**     | **\_**        | [ ]    |
| `totalMonthly`            | **\_**     | **\_**        | [ ]    |
| `directMonthly`           | **\_**     | **\_**        | [ ]    |
| `incidentMonthly`         | **\_**     | **\_**        | [ ]    |
| `hoursLostPerEng`         | **\_**     | **\_**        | [ ]    |
| `debtPctArr`              | **\_**     | **\_**        | [ ]    |
| `paybackMonths`           | **\_**     | **\_**        | [ ]    |
| `doraLabel`               | **\_**     | **\_**        | [ ]    |
| `V` (velocity multiplier) | **\_**     | **\_**        | [ ]    |

If the wizard outputs differ by ≤1% on any rounded field, that's slider-quantization noise — record both values and note "match within slider tolerance" rather than failing the parity check.

---

### V4. Pinned Library Resource — `gst://library/vdr-structure`

- [ ] **Verified** (date / verifier: **\*\*\*\***\_\_\_\_**\*\*\*\***)

**Procedure**:

1. Open the resource picker in Claude Desktop
2. Browse to `gst://library/vdr-structure` and pin it to the active conversation
3. Confirm the resource appears in the conversation as a pinned attachment
4. Ask: _"From the pinned VDR Structure Guide, list the 9 folder categories under the recommended folder taxonomy."_
5. Expected: model returns the exact 9 folders in numbered order — Product, Software Architecture, Infrastructure & Operations, SDLC, Data/Analytics/AI, Security, People & Organization, Corporate IT, Governance & Compliance.

**Recording**:

- Pin succeeded: [ ]
- 9 folders enumerated correctly: [ ]
- Model cited the pinned content (vs hallucinating): [ ]
- Notes: **\*\***\*\***\*\***\_\_**\*\***\*\***\*\***

---

### V5. Pinned Regulation Resource — `gst://regulations/eu/gdpr`

- [ ] **Verified** (date / verifier: **\*\*\*\***\_\_\_\_**\*\*\*\***)

**Procedure**:

1. Open the resource picker, browse to `gst://regulations/eu/gdpr`, pin it
2. Ask: _"From the pinned GDPR resource, what's the breach notification window and the maximum penalty?"_
3. Expected: 72-hour breach notification; up to 4% of annual global turnover or €20M, whichever is greater.

**Recording**:

- Pin succeeded: [ ]
- Breach window correct (72 hours): [ ]
- Penalty correct (4% / €20M): [ ]
- Notes: **\*\***\*\***\*\***\_\_**\*\***\*\***\*\***

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
