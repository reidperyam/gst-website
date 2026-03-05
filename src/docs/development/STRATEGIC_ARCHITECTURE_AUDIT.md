# Initiative #5: The Strategic Architecture Audit

**Status:** Proposed
**Priority:** High
**Estimated Effort:** 3-5 days
**Expected ROI:** Very High
**Hub Location:** `/hub/tools/architecture-audit`
**Depends On:** Business & Technology Architectures library article (live)

---

## Overview

An interactive self-assessment tool where an executive scores their organization across the five architecture layers defined in the Business Architectures guide. The output is a **Congruence Radar Chart** that visually reveals where technology is misaligned with business goals, plus a prioritized set of recommendations.

This tool turns the Business Architectures article from a passive reference into an actionable diagnostic. It also serves as a natural lead-generation funnel: executives who discover misalignment are primed for a consultation.

## What Problem Does It Solve?

**Current state:**
- The Business Architectures guide educates leaders on the five-layer model
- No mechanism for leaders to assess their own organization against the framework
- Self-assessment is manual and unstructured
- No clear path from "I understand the concepts" to "I need help with my specific gaps"

**With Architecture Audit:**
- Executives get a personalized, visual diagnostic in under 5 minutes
- Misalignments between technology choices and business strategy become immediately visible
- Prioritized recommendations give clear next steps
- Natural CTA to schedule a consultation for identified gaps
- Positions GST as the authority on technology-business alignment

---

## Core Concept: Five-Layer Congruence Model

The audit maps directly to the five layers from the Business Architectures guide:

| Layer | What's Scored | Example Questions |
|-------|--------------|-------------------|
| **1. Software Architecture** | Code quality, modularity, tech debt | "How long does it take to ship a feature from commit to production?" |
| **2. Operational Architecture** | Infrastructure, CI/CD, observability | "Can you scale infrastructure without manual intervention?" |
| **3. Product Architecture** | Feature modularity, extensibility, data model | "Can you launch a new product line without re-architecting the platform?" |
| **4. Organizational Architecture** | Team topology, decision-making, talent | "Do your engineering teams ship independently or wait on shared resources?" |
| **5. Industry & Regulatory** | Compliance posture, market position, standards | "Could you pass a SOC 2 Type II audit within 90 days?" |

Each layer is scored 1-5:
- **1 - Critical Gap**: Actively constraining or destroying value
- **2 - Significant Risk**: Known issues, no active remediation
- **3 - Adequate**: Functional but not a competitive advantage
- **4 - Strong**: Well-designed, supports current business needs
- **5 - Strategic Asset**: Architecture is a competitive moat

---

## User Flow

### Step 1: Context Setting (1 screen)
- Company stage: Startup / Growth / Mature / Portfolio Company
- Primary objective: Preparing for exit / Post-acquisition integration / Value creation / Platform modernization
- Industry vertical (optional, adjusts regulatory layer questions)

### Step 2: Layer Assessment (5 screens, one per layer)
- 3-4 questions per layer, each scored 1-5
- Questions are contextual based on Step 1 selections (e.g., PE portfolio company gets different Org Architecture questions than a startup)
- Each question includes a one-line description of what "good" looks like
- Visual progress indicator showing layers completed

### Step 3: Results (1 screen)
- **Congruence Radar Chart**: 5-axis radar/spider chart with scores plotted
- **Congruence Score**: Weighted average (0-100) with label (Critical / At Risk / Aligned / Strategic)
- **Gap Analysis**: Ordered list of layers by severity, highlighting the widest gaps between "importance for your objective" and "current score"
- **Top 3 Recommendations**: Specific, actionable next steps based on lowest-scoring layers
- **CTA**: "Discuss your results with our team" -> Calendly link

### Step 4: Export (optional)
- Download results as a branded PDF one-pager
- Shareable URL with encoded results (no PII stored)

---

## Technical Architecture

### Implementation Pattern
Follow the Diligence Machine pattern: wizard-based, client-side, no backend required.

```
src/
  pages/hub/tools/architecture-audit/
    index.astro              # Page shell and layout
  components/hub/tools/architecture-audit/
    AuditWizard.astro        # (optional) Astro wrapper
  data/architecture-audit/
    audit-config.ts          # Layer definitions, questions, scoring weights
    question-bank.ts         # Context-sensitive question pools
    recommendations.ts       # Recommendation templates keyed by gap patterns
  scripts/
    architecture-audit.ts    # Client-side wizard logic, scoring engine
```

### Radar Chart
- Use a lightweight SVG-based radar chart (no chart library dependency)
- 5-axis layout mapping to the five layers
- Color-coded zones: red (1-2), yellow (3), green (4-5)
- Responsive and dark-mode compatible using CSS variables

### Scoring Engine
```typescript
interface LayerScore {
  layer: string;
  score: number;          // 1-5, averaged from question responses
  importance: number;     // Derived from context (objective + company stage)
  gap: number;           // importance - score (higher = more urgent)
}

interface AuditResult {
  layers: LayerScore[];
  congruenceScore: number; // 0-100 weighted score
  label: string;           // Critical | At Risk | Aligned | Strategic
  recommendations: Recommendation[];
}
```

### Question Contextuality
Questions adapt based on Step 1 inputs:

| Context | Software Layer Emphasis | Org Layer Emphasis |
|---------|------------------------|-------------------|
| Exit prep | Code quality, documentation, IP hygiene | Key-person risk, knowledge transfer |
| Post-acquisition | Integration readiness, API surface | Team retention, cultural fit |
| Value creation | Velocity, tech debt ratio | Hiring pipeline, team autonomy |
| Platform modernization | Modularity, migration paths | Change management, skill gaps |

---

## Competitive Differentiation

- **Unique positioning**: No other M&A advisory firm offers a self-service architecture assessment tool
- **Content flywheel**: The Business Architectures guide drives traffic to the audit; the audit drives consultations
- **Data moat**: Anonymized aggregate scoring data (if collected with consent) reveals industry benchmarks over time
- **Lead quality**: Executives who complete the audit have self-identified their pain points -- highest-intent leads possible

---

## Content Connection

The audit creates a tight loop with existing Hub content:

```
Business Architectures Guide (Library)
  "Understand the five layers"
       |
       v
Strategic Architecture Audit (Tools)
  "Score your own organization"
       |
       v
Consultation CTA
  "Let's close the gaps together"
```

The results page should deep-link back to relevant sections of the Business Architectures guide for each layer, e.g., "Your Software Architecture scored 2/5. Learn more about what best-in-class looks like."

---

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|-------------|
| Completion rate | >60% of starters finish | GA4 funnel events |
| Time to complete | <5 minutes | GA4 timing events |
| CTA click-through | >15% of completions | GA4 event tracking |
| Consultation bookings | Baseline + 20% | Calendly attribution |
| Organic traffic | +30% to /hub/tools | GA4 page views |

### Analytics Events
```
audit_started         -> context selections
audit_layer_completed -> layer name, average score
audit_completed       -> congruence score, label, time elapsed
audit_cta_clicked     -> which CTA (consultation, PDF, share)
audit_pdf_downloaded  -> congruence score
```

---

## Implementation Checklist

### Phase 1: Core Tool (MVP)
- [ ] Design question bank for all 5 layers (3-4 questions each, 4 context variants)
- [ ] Create `audit-config.ts` with layer definitions and scoring weights
- [ ] Create `question-bank.ts` with context-sensitive question pools
- [ ] Create `recommendations.ts` with gap-pattern-based recommendations
- [ ] Build wizard UI following Diligence Machine patterns
- [ ] Implement client-side scoring engine
- [ ] Build SVG radar chart component (responsive, dark-mode)
- [ ] Build results screen with gap analysis and recommendations
- [ ] Add CTA linking to Calendly
- [ ] Add deep links back to Business Architectures guide sections
- [ ] Add teaser card to Workbench tools index page
- [ ] GA4 event tracking for all audit steps

### Phase 2: Polish
- [ ] PDF export of results (client-side generation)
- [ ] Shareable URL with encoded results
- [ ] Animated radar chart on results reveal
- [ ] Mobile-optimized question layout

### Phase 3: Iterate
- [ ] A/B test question wording for clarity
- [ ] Add benchmark overlays ("companies like yours typically score X")
- [ ] Collect anonymized aggregate data for industry benchmarks (with consent)

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Questions feel generic | Medium | Contextual question pools based on company stage + objective |
| Users abandon mid-assessment | Medium | Keep to 15-20 questions max; show progress; allow saving |
| Radar chart complexity on mobile | Low | Fallback to horizontal bar chart below 480px breakpoint |
| Scoring feels arbitrary | Medium | Anchor each score level with concrete, observable criteria |

---

## References

- Business & Technology Architectures guide: `/hub/library/business-architectures`
- Diligence Machine (implementation pattern): `/hub/tools/diligence-machine`
- Wizard config pattern: `src/data/diligence-machine/wizard-config.ts`
- [Spider/Radar Charts in SVG](https://www.smashingmagazine.com/2022/02/svg-radar-chart-component/) (implementation reference)
