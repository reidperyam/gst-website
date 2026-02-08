# The Diligence Machine — Technical Documentation

## Overview

The Diligence Machine is a client-side wizard that generates a prescriptive technology due diligence agenda customized to a target company's profile. Users answer 5 steps of questions, and the engine produces 15–20 high-impact questions organized by topic, plus contextual attention areas (risk anchors).

**Entry point**: `src/pages/hub/tools/diligence-machine/index.astro`

---

## Architecture

```
User (Wizard UI)
│
├── src/data/diligence-machine/wizard-config.ts    ← Step definitions & option labels
│
├── src/utils/diligence-engine.ts                  ← Core engine: filtering, balancing, output
│
├── src/data/diligence-machine/questions.ts        ← Question bank (~45 questions, 4 topics)
│
└── src/data/diligence-machine/risk-anchors.ts     ← Risk anchor definitions (16 anchors)
```

All logic runs client-side. No server calls. The engine is a pure function: `generateScript(UserInputs) → GeneratedScript`.

---

## The 5 Wizard Steps

### Step 1: Transaction Type (`transactionType`)

Defines the deal structure. Gates carve-out/integration questions.

| Option | ID |
|--------|----|
| Full Acquisition | `full-acquisition` |
| Majority Stake | `majority-stake` |
| Business Integration | `business-integration` |
| Carve-Out | `carve-out` |
| Venture / Series | `venture-series` |

### Step 2: Product Type (`productType`)

Determines product-specific architecture, compliance, and operations questions.

| Option | ID |
|--------|----|
| B2B SaaS | `b2b-saas` |
| B2C Marketplace | `b2c-marketplace` |
| On-Premise Enterprise | `on-premise-enterprise` |
| Deep-Tech / IP | `deep-tech-ip` |
| Tech-Enabled Service | `tech-enabled-service` |

### Step 3: Tech Stack Archetype (`techArchetype`)

Drives infrastructure risk anchors and architecture questions.

| Option | ID |
|--------|----|
| Modern Cloud-Native | `modern-cloud-native` |
| Hybrid Legacy | `hybrid-legacy` |
| Self-Managed Infrastructure | `self-managed-infra` |
| Datacenter / Vendor | `datacenter-vendor` |

### Step 4: Company Profile (compound — 4 fields)

Scale influences operational questions, risk anchors, and minimum-threshold filtering.

**Headcount** (`headcount`): `1-50`, `51-200`, `201-500`, `500+`

**Revenue Range** (`revenueRange`): `0-5m`, `5-25m`, `25-100m`, `100m+`

**Growth Stage** (`growthStage`): `early`, `scaling`, `mature`

**Company Age** (`companyAge`): `under-2yr`, `2-5yr`, `5-10yr`, `10-20yr`, `20yr+`

### Step 5: Geography (`geographies` — multi-select)

Enables regulatory/compliance questions and region-specific risk anchors.

| Option | ID |
|--------|----|
| United States | `us` |
| Canada | `canada` |
| European Union | `eu` |
| United Kingdom | `uk` |
| Latin America | `latam` |
| Africa | `africa` |
| Asia-Pacific | `apac` |
| Multi-Region | `multi-region` |

**Multi-Region auto-sync**: Selecting 2+ specific regions auto-adds `multi-region`. Selecting only 1 region removes it.

---

## Conditional Matching System

Every question and risk anchor has a `conditions` object:

```typescript
conditions: {
  transactionTypes?: string[];         // OR within array
  productTypes?: string[];             // OR within array
  techArchetypes?: string[];           // OR within array
  growthStages?: string[];             // OR within array
  geographies?: string[];              // any match = include
  headcountMin?: string;               // ordinal "at least" threshold
  revenueMin?: string;                 // ordinal "at least" threshold
  companyAgeMin?: string;              // ordinal "at least" threshold
  excludeTransactionTypes?: string[];  // exclusion filter
}
```

### Matching Rules

- **Undefined field** = wildcard (matches all inputs)
- **Array fields** = OR within the array, AND across fields
- **Ordinal thresholds** (`headcountMin`, `revenueMin`, `companyAgeMin`) = user's bracket must be at or above the minimum in the ordering
- **`excludeTransactionTypes`** = excludes the question even if all other conditions match

**Example**: A question with `productTypes: ['b2b-saas']` and `headcountMin: '51-200'` only appears for B2B SaaS companies with 51+ employees, regardless of transaction type.

---

## Question Bank

### 4 Topics

| Topic | Audience | Questions |
|-------|----------|-----------|
| Architecture | CTO / VP Engineering | 12 |
| Operations & Delivery | VP Engineering / VP Product | 12 |
| Carve-out / Integration | M&A / Corporate Development | 12 |
| Security, Compliance & Governance | CISO | 16 |

### Priority Levels

- **high** — Critical concerns; always appear when conditions match
- **medium** — Important but not universally applicable
- **standard** — Context-dependent; included when space permits

### Question Structure

```typescript
{
  id: string;
  topicId: string;
  text: string;          // The question itself
  rationale: string;     // Why this question matters
  priority: 'high' | 'medium' | 'standard';
  conditions: { ... };
}
```

---

## Selection Algorithm

### 1. Filter

All ~45 questions are filtered against user inputs via `matchesConditions()`. Typically produces ~25–30 matched questions.

### 2. Balance Across Topics

`balanceAcrossTopics()` ensures representative coverage:

**Phase 1 — Minimums**: Reserve the top 3 highest-priority questions from each topic.

**Phase 2 — Fill**: From remaining candidates, fill up to 20 total questions by priority across all topics.

**Result**: 15–20 questions with guaranteed topic representation, weighted toward high-priority items.

### 3. Group & Sort

Questions are grouped by topic (Architecture → Operations → Carve-out → Security) and sorted by priority within each topic.

---

## Attention Areas (Risk Anchors)

16 risk anchors are filtered independently using the same condition system. They surface structural concerns that complement the question topics.

### Categories

**Infrastructure & Modernization**
- Hardware End-of-Life Exposure — self-managed/datacenter + age 10–20yr
- Technical Debt Accumulation — hybrid-legacy + age 5–10yr
- Legacy Vendor Lock-in — on-premise + age 10–20yr

**Organizational**
- Key-Person Dependencies — small teams + on-premise/self-managed
- Manual Operations Masking — tech-enabled services + scaling/mature
- Specialized Labor Dependencies — self-managed/datacenter

**Transaction-Specific**
- Carve-out Technology Entanglement — carve-out + hybrid-legacy
- IP Documentation Gaps — deep-tech + early stage

**Geographic / Regulatory**
- Cross-Border Data Compliance — EU/UK/LATAM/Africa
- Post-Brexit Data Transfer Complexity — UK
- LATAM Infrastructure Maturity — LATAM
- African Regulatory Fragmentation — Africa
- Canadian Privacy Law Complexity — Canada

**Multi-Region** (triggered by `multi-region` geography)
- Data Transfer Complexity
- Jurisdictional Conflicts
- Infrastructure Cost Multiplier
- Vendor Fragmentation
- Regulatory Change Velocity

### Relevance Levels

- **high** — Structural risks affecting valuation or integration
- **medium** — Important considerations, not deal-breaking
- **low** — Context-specific concerns

Risk anchors are sorted by relevance in the output.

---

## Decision Impact Reference

| User Decision | Questions Affected | Risk Anchors Triggered |
|---|---|---|
| **Carve-out** | Carve-out/integration topic questions enabled | Carve-out entanglement (if hybrid-legacy) |
| **B2B SaaS** | Multi-tenant architecture, SaaS ops | — |
| **Deep-Tech / IP** | Data pipelines, SBOM | IP docs gaps (if early-stage) |
| **Tech-Enabled Service** | Automation ratio, outsourcing | Manual ops masking (if scaling/mature) |
| **Hybrid Legacy** | Legacy coupling, tech debt | Tech debt accumulation |
| **Self-Managed Infra** | Scaling limits, cloud migration | HW end-of-life, key-person, labor specialist |
| **Datacenter / Vendor** | Scaling limits, cloud migration | HW end-of-life, labor specialist |
| **51–200 headcount** | Observability, access control | — |
| **201–500 headcount** | Platform engineering | — |
| **5–25M revenue** | DR/BC planning | — |
| **25–100M revenue** | Third-party assessments, BC/DR testing | — |
| **5–10yr age** | Tech debt, legacy coupling | Tech debt accumulation |
| **10–20yr age** | Legacy/modernization questions | HW end-of-life, legacy vendor lock-in |
| **EU/UK** | GDPR, post-Brexit data transfer | Cross-border compliance, Brexit data |
| **LATAM** | LGPD compliance | LATAM infrastructure maturity |
| **Africa** | POPIA, local DPA | African regulatory fragmentation |
| **Canada** | PIPEDA, Quebec Law 25 | Canadian privacy complexity |
| **Multi-Region** | All geographic compliance questions | 5+ multi-region risk anchors |

---

## Output Structure

```typescript
interface GeneratedScript {
  topics: {
    topicId: string;
    topicLabel: string;
    audienceLevel: string;
    questions: {
      id: string;
      text: string;
      rationale: string;
      priority: 'high' | 'medium' | 'standard';
    }[];
  }[];
  riskAnchors: {
    id: string;
    title: string;
    description: string;
    relevance: 'high' | 'medium' | 'low';
  }[];
  metadata: {
    totalQuestions: number;
    generatedAt: string;
    inputSummary: UserInputs;
  };
}
```

---

## State Management

- Wizard state (current step, selections) persists to `localStorage` under key `diligence-machine-state`
- State restores on page reload, including compound field selections and geography multi-select
- Restart clears localStorage and resets all UI state

---

## Key Files

| File | Purpose |
|------|---------|
| `src/pages/hub/tools/diligence-machine/index.astro` | Page component, wizard UI, output rendering, print styles |
| `src/utils/diligence-engine.ts` | Core engine: `generateScript()`, `matchesConditions()`, `balanceAcrossTopics()` |
| `src/data/diligence-machine/wizard-config.ts` | Step definitions, option labels, `getOptionLabel()` helper |
| `src/data/diligence-machine/questions.ts` | Question bank with conditions and priorities |
| `src/data/diligence-machine/risk-anchors.ts` | Risk anchor definitions with conditions and relevance |
