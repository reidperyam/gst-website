/**
 * Question Bank for The Diligence Machine
 *
 * ~45 high-impact due diligence questions organized by meeting track.
 * Each question has conditional triggers that determine when it appears
 * based on the user's wizard inputs.
 *
 * Condition logic:
 * - Undefined fields = wildcard (matches everything)
 * - Specified arrays use OR logic within (match any)
 * - All specified fields use AND logic across (all must match)
 * - excludeTransactionTypes: exclude if user selected any of these
 * - headcountMin/revenueMin/companyAgeMin: ordinal "at least" comparison
 */

export interface QuestionCondition {
  transactionTypes?: string[];
  productTypes?: string[];
  techArchetypes?: string[];
  growthStages?: string[];
  geographies?: string[];
  headcountMin?: string;
  revenueMin?: string;
  companyAgeMin?: string;
  excludeTransactionTypes?: string[];
}

export interface DiligenceQuestion {
  id: string;
  track: 'architecture' | 'operations' | 'carveout-integration' | 'security-risk';
  trackLabel: string;
  audienceLevel: string;
  text: string;
  rationale: string;
  priority: 'critical' | 'high' | 'standard';
  conditions: QuestionCondition;
}

export const TRACK_META = {
  architecture: {
    label: 'Architecture & Scalability',
    audience: 'CTO / VP Engineering',
    order: 1,
  },
  operations: {
    label: 'Operations & Delivery',
    audience: 'VP Engineering / VP Product',
    order: 2,
  },
  'carveout-integration': {
    label: 'Carve-out / Integration',
    audience: 'M&A / Corporate Development',
    order: 3,
  },
  'security-risk': {
    label: 'Security & Risk',
    audience: 'CISO / VP Security',
    order: 4,
  },
} as const;

export const QUESTIONS: DiligenceQuestion[] = [
  // ─── TRACK 1: ARCHITECTURE & SCALABILITY ────────────────────────────

  {
    id: 'arch-01',
    track: 'architecture',
    trackLabel: 'Architecture & Scalability',
    audienceLevel: 'CTO',
    text: 'Describe the current system architecture. Is it monolithic, service-oriented, or microservices-based — and what is the roadmap for decomposition if monolithic?',
    rationale: 'Monolithic architectures in scaling companies create deployment bottlenecks and single points of failure that directly impact velocity and reliability.',
    priority: 'critical',
    conditions: {},
  },
  {
    id: 'arch-02',
    track: 'architecture',
    trackLabel: 'Architecture & Scalability',
    audienceLevel: 'CTO',
    text: 'What is the database scaling strategy? Are you using read replicas, sharding, or partitioning — and what is the current headroom before the next scaling event?',
    rationale: 'Database capacity constraints are the most common hidden bottleneck in growing platforms. Understanding headroom prevents post-acquisition surprises.',
    priority: 'high',
    conditions: {
      headcountMin: '51-200',
    },
  },
  {
    id: 'arch-03',
    track: 'architecture',
    trackLabel: 'Architecture & Scalability',
    audienceLevel: 'CTO',
    text: 'Is the platform single-tenant or multi-tenant? If single-tenant, what is the cost and timeline to migrate to a multi-tenant architecture?',
    rationale: 'Single-tenant B2B SaaS architectures create linear infrastructure cost scaling that erodes margins as the customer base grows.',
    priority: 'high',
    conditions: {
      productTypes: ['b2b-saas'],
    },
  },
  {
    id: 'arch-04',
    track: 'architecture',
    trackLabel: 'Architecture & Scalability',
    audienceLevel: 'CTO',
    text: 'How mature is your Infrastructure-as-Code practice? Can the entire production environment be reproduced from version-controlled templates?',
    rationale: 'IaC maturity directly correlates with disaster recovery capability, environment parity, and the speed of scaling infrastructure.',
    priority: 'high',
    conditions: {
      techArchetypes: ['modern-cloud-native', 'hybrid-legacy'],
    },
  },
  {
    id: 'arch-05',
    track: 'architecture',
    trackLabel: 'Architecture & Scalability',
    audienceLevel: 'CTO',
    text: 'What are the horizontal and vertical scaling limits of the current infrastructure? At what load factor do you anticipate needing architectural changes?',
    rationale: 'Scaling ceilings on self-managed or colocated infrastructure require capital expenditure planning that differs fundamentally from elastic cloud models.',
    priority: 'critical',
    conditions: {
      techArchetypes: ['self-managed-infra', 'datacenter-colocation'],
    },
  },
  {
    id: 'arch-06',
    track: 'architecture',
    trackLabel: 'Architecture & Scalability',
    audienceLevel: 'CTO',
    text: 'Is there a documented cloud migration plan? What is the estimated timeline, cost, and risk profile for transitioning from current infrastructure to a cloud-native deployment?',
    rationale: 'Cloud migration is a multi-year capital project. Understanding whether a plan exists — and its fidelity — reveals strategic infrastructure thinking.',
    priority: 'critical',
    conditions: {
      techArchetypes: ['self-managed-infra', 'datacenter-colocation'],
    },
  },
  {
    id: 'arch-07',
    track: 'architecture',
    trackLabel: 'Architecture & Scalability',
    audienceLevel: 'CTO',
    text: 'Describe the API versioning strategy. How are breaking changes communicated to consumers, and what is the deprecation lifecycle?',
    rationale: 'Poor API governance creates integration fragility for customers and partners, increasing churn risk and support burden.',
    priority: 'standard',
    conditions: {
      productTypes: ['b2b-saas', 'b2c-marketplace'],
    },
  },
  {
    id: 'arch-08',
    track: 'architecture',
    trackLabel: 'Architecture & Scalability',
    audienceLevel: 'CTO',
    text: 'What is the data pipeline architecture? How is data ingested, transformed, and served — and what is the latency from raw input to actionable output?',
    rationale: 'Deep-tech and IP-driven companies derive value from data processing pipelines. Architectural weaknesses here undermine the core value proposition.',
    priority: 'high',
    conditions: {
      productTypes: ['deep-tech-ip'],
    },
  },
  {
    id: 'arch-09',
    track: 'architecture',
    trackLabel: 'Architecture & Scalability',
    audienceLevel: 'CTO',
    text: 'What are the disaster recovery and business continuity architectures? What are the documented RPO and RTO targets, and have they been validated through testing?',
    rationale: 'Disaster recovery capability is directly proportional to revenue protection. Untested DR plans are functionally equivalent to no plan.',
    priority: 'critical',
    conditions: {
      revenueMin: '5-25m',
    },
  },
  {
    id: 'arch-10',
    track: 'architecture',
    trackLabel: 'Architecture & Scalability',
    audienceLevel: 'CTO',
    text: 'What is the coupling between legacy systems and core business logic? Are there integration layers, or is business logic directly embedded in legacy codebases?',
    rationale: 'Tight coupling to legacy systems creates refactoring risk and constrains the pace of innovation. Understanding the coupling depth informs modernization cost.',
    priority: 'high',
    conditions: {
      techArchetypes: ['hybrid-legacy', 'self-managed-infra'],
      companyAgeMin: '5-10yr',
    },
  },
  {
    id: 'arch-11',
    track: 'architecture',
    trackLabel: 'Architecture & Scalability',
    audienceLevel: 'CTO',
    text: 'Do architecture decision records (ADRs) exist? How are significant technical decisions documented, communicated, and revisited?',
    rationale: 'ADRs indicate engineering maturity and reduce knowledge loss risk. Their absence suggests decisions live in individual memories — a key-person dependency.',
    priority: 'standard',
    conditions: {},
  },
  {
    id: 'arch-12',
    track: 'architecture',
    trackLabel: 'Architecture & Scalability',
    audienceLevel: 'CTO',
    text: 'What are the current performance SLAs, and what is the historical adherence rate? Where are the most significant performance bottlenecks today?',
    rationale: 'SLA adherence history reveals operational reliability. Consistent breaches indicate systemic architectural issues rather than isolated incidents.',
    priority: 'high',
    conditions: {
      productTypes: ['b2b-saas', 'b2c-marketplace'],
      growthStages: ['scaling', 'mature'],
    },
  },

  // ─── TRACK 2: OPERATIONS & DELIVERY ─────────────────────────────────

  {
    id: 'ops-01',
    track: 'operations',
    trackLabel: 'Operations & Delivery',
    audienceLevel: 'VP Engineering',
    text: 'Describe your CI/CD pipeline. What is the cycle time from code commit to production deployment, and what percentage of deployments require manual intervention?',
    rationale: 'CI/CD maturity is the strongest predictor of engineering velocity. Manual deployment steps indicate process debt that compounds over time.',
    priority: 'critical',
    conditions: {},
  },
  {
    id: 'ops-02',
    track: 'operations',
    trackLabel: 'Operations & Delivery',
    audienceLevel: 'VP Engineering',
    text: 'What is the deployment frequency, and what is the rollback success rate? How long does a typical rollback take from detection to resolution?',
    rationale: 'Deployment frequency and rollback capability are DORA metrics that directly correlate with engineering team performance and system stability.',
    priority: 'high',
    conditions: {},
  },
  {
    id: 'ops-03',
    track: 'operations',
    trackLabel: 'Operations & Delivery',
    audienceLevel: 'VP Engineering',
    text: 'What is the bus factor for critical systems? How many engineers can independently deploy, debug, and recover each major subsystem?',
    rationale: 'Small teams with single points of knowledge represent acute operational risk. Post-acquisition attrition can paralyze critical systems.',
    priority: 'critical',
    conditions: {
      headcountMin: '1-50',
    },
  },
  {
    id: 'ops-04',
    track: 'operations',
    trackLabel: 'Operations & Delivery',
    audienceLevel: 'VP Engineering',
    text: 'Describe the on-call rotation and incident management process. What is the mean time to detection (MTTD) and mean time to resolution (MTTR) for P1 incidents?',
    rationale: 'Incident management maturity reflects operational resilience. High MTTR in customer-facing platforms directly impacts revenue and retention.',
    priority: 'high',
    conditions: {
      productTypes: ['b2b-saas', 'b2c-marketplace'],
    },
  },
  {
    id: 'ops-05',
    track: 'operations',
    trackLabel: 'Operations & Delivery',
    audienceLevel: 'VP Engineering',
    text: 'How is technical debt quantified and prioritized? What percentage of engineering capacity is allocated to debt reduction versus feature development?',
    rationale: 'Companies that cannot quantify their technical debt cannot manage it. Unmanaged debt compounds and eventually constrains all delivery.',
    priority: 'high',
    conditions: {
      companyAgeMin: '5-10yr',
    },
  },
  {
    id: 'ops-06',
    track: 'operations',
    trackLabel: 'Operations & Delivery',
    audienceLevel: 'VP Product',
    text: 'What percentage of service delivery is automated via the proprietary platform versus manual intervention by the operations team?',
    rationale: 'Tech-enabled service companies derive margin from automation. A high ratio of manual processes signals limited scalability and margin compression risk.',
    priority: 'critical',
    conditions: {
      productTypes: ['tech-enabled-service'],
    },
  },
  {
    id: 'ops-07',
    track: 'operations',
    trackLabel: 'Operations & Delivery',
    audienceLevel: 'VP Engineering',
    text: 'What is the testing strategy? What is the ratio of unit, integration, and end-to-end tests — and what is the overall code coverage percentage?',
    rationale: 'Test coverage and strategy reveal confidence in change safety. Low coverage in critical paths creates deployment risk and slows velocity.',
    priority: 'high',
    conditions: {},
  },
  {
    id: 'ops-08',
    track: 'operations',
    trackLabel: 'Operations & Delivery',
    audienceLevel: 'VP Engineering',
    text: 'How current is the technical documentation? When was the architecture diagram, runbook library, and onboarding guide last updated?',
    rationale: 'Stale documentation indicates process entropy. Post-acquisition, accurate documentation accelerates integration and reduces dependency on institutional knowledge.',
    priority: 'standard',
    conditions: {},
  },
  {
    id: 'ops-09',
    track: 'operations',
    trackLabel: 'Operations & Delivery',
    audienceLevel: 'VP Engineering',
    text: 'What is the ratio of outsourced to in-house engineering? Which systems or features are maintained by external contractors?',
    rationale: 'Heavy reliance on outsourced engineering creates continuity risk post-acquisition, especially if contractor agreements are tied to the selling entity.',
    priority: 'high',
    conditions: {
      productTypes: ['tech-enabled-service'],
      headcountMin: '1-50',
    },
  },
  {
    id: 'ops-10',
    track: 'operations',
    trackLabel: 'Operations & Delivery',
    audienceLevel: 'VP Engineering',
    text: 'What engineering velocity metrics are tracked? How has sprint velocity or throughput trended over the past 12 months?',
    rationale: 'Velocity trends reveal whether the team is accelerating, stable, or decelerating — a leading indicator of engineering health post-investment.',
    priority: 'standard',
    conditions: {
      transactionTypes: ['venture-series'],
    },
  },
  {
    id: 'ops-11',
    track: 'operations',
    trackLabel: 'Operations & Delivery',
    audienceLevel: 'VP Engineering',
    text: 'Is there a platform engineering function? How are developer tools, shared libraries, and internal infrastructure services managed and maintained?',
    rationale: 'At scale, the absence of platform engineering creates duplicated effort and inconsistent tooling that degrades velocity across all teams.',
    priority: 'standard',
    conditions: {
      headcountMin: '201-500',
    },
  },
  {
    id: 'ops-12',
    track: 'operations',
    trackLabel: 'Operations & Delivery',
    audienceLevel: 'VP Engineering',
    text: 'Describe the release management process. Are feature flags used for progressive rollouts, and is there a formal change advisory board for production changes?',
    rationale: 'Mature release management reduces blast radius of defects. Its absence in scaling companies indicates process debt that will slow growth.',
    priority: 'standard',
    conditions: {
      growthStages: ['scaling', 'mature'],
    },
  },

  // ─── TRACK 3: CARVE-OUT / INTEGRATION ───────────────────────────────

  {
    id: 'ci-01',
    track: 'carveout-integration',
    trackLabel: 'Carve-out / Integration',
    audienceLevel: 'M&A Lead',
    text: 'Which core infrastructure components are currently shared with the parent company, and what is the estimated timeline to achieve complete logical and physical separation?',
    rationale: 'Shared infrastructure is the largest hidden cost in carve-outs. Without a separation inventory, timelines and budgets are unreliable.',
    priority: 'critical',
    conditions: {
      transactionTypes: ['carve-out'],
    },
  },
  {
    id: 'ci-02',
    track: 'carveout-integration',
    trackLabel: 'Carve-out / Integration',
    audienceLevel: 'M&A Lead',
    text: 'What is the data separation plan? Can customer, operational, and analytical data be cleanly partitioned from the parent entity without data loss or integrity issues?',
    rationale: 'Data entanglement creates regulatory, operational, and legal risk. Clean separation is a prerequisite for standalone operations.',
    priority: 'critical',
    conditions: {
      transactionTypes: ['carve-out'],
    },
  },
  {
    id: 'ci-03',
    track: 'carveout-integration',
    trackLabel: 'Carve-out / Integration',
    audienceLevel: 'M&A Lead',
    text: 'Which software licenses, SaaS subscriptions, and vendor contracts are held by the parent company? Are they transferable, and at what cost?',
    rationale: 'Non-transferable licenses can force expensive re-procurement post-close. Enterprise agreements often contain anti-assignment clauses.',
    priority: 'high',
    conditions: {
      transactionTypes: ['carve-out', 'full-acquisition'],
    },
  },
  {
    id: 'ci-04',
    track: 'carveout-integration',
    trackLabel: 'Carve-out / Integration',
    audienceLevel: 'M&A Lead',
    text: 'Is the identity and access management (SSO/IAM) infrastructure shared with or dependent on the parent organization? What is the migration complexity?',
    rationale: 'Shared identity infrastructure is often the last and most complex dependency to sever. It touches every user, system, and security boundary.',
    priority: 'high',
    conditions: {
      transactionTypes: ['carve-out', 'business-integration'],
    },
  },
  {
    id: 'ci-05',
    track: 'carveout-integration',
    trackLabel: 'Carve-out / Integration',
    audienceLevel: 'M&A Lead',
    text: 'What is the API surface area between the target and acquirer systems? How many integration points exist, and what is the estimated effort to harmonize or replace them?',
    rationale: 'Integration complexity scales non-linearly with the number of API touchpoints. Early mapping prevents costly surprises during Day 2 execution.',
    priority: 'high',
    conditions: {
      transactionTypes: ['business-integration'],
    },
  },
  {
    id: 'ci-06',
    track: 'carveout-integration',
    trackLabel: 'Carve-out / Integration',
    audienceLevel: 'M&A Lead',
    text: 'What is the technology stack overlap between the two entities? Where do platforms, languages, and tooling diverge — and what is the rationalization strategy?',
    rationale: 'Stack divergence creates long-term maintenance burden. A rationalization plan prevents the "two of everything" anti-pattern in merged organizations.',
    priority: 'high',
    conditions: {
      transactionTypes: ['business-integration', 'full-acquisition'],
    },
  },
  {
    id: 'ci-07',
    track: 'carveout-integration',
    trackLabel: 'Carve-out / Integration',
    audienceLevel: 'M&A Lead',
    text: 'What is the scope of the transition service agreement (TSA)? Which technology services will the parent continue to provide, for how long, and at what cost?',
    rationale: 'TSAs are temporary by design but often become permanent dependencies. Understanding scope and duration is essential for standalone readiness planning.',
    priority: 'critical',
    conditions: {
      transactionTypes: ['carve-out'],
    },
  },
  {
    id: 'ci-08',
    track: 'carveout-integration',
    trackLabel: 'Carve-out / Integration',
    audienceLevel: 'M&A Lead',
    text: 'Are there duplicate systems that serve the same function across both entities? What is the rationalization plan and expected timeline for consolidation?',
    rationale: 'Duplicate systems double licensing, maintenance, and operational costs. Consolidation planning should begin pre-close to capture synergies.',
    priority: 'standard',
    conditions: {
      transactionTypes: ['business-integration', 'majority-stake'],
    },
  },
  {
    id: 'ci-09',
    track: 'carveout-integration',
    trackLabel: 'Carve-out / Integration',
    audienceLevel: 'M&A Lead',
    text: 'What is the customer data migration plan? How will customer accounts, configurations, and historical data be transferred without service disruption?',
    rationale: 'Customer-facing data migration is the highest-risk operational event in any transaction. Inadequate planning leads to customer churn.',
    priority: 'critical',
    conditions: {
      transactionTypes: ['full-acquisition', 'carve-out'],
    },
  },
  {
    id: 'ci-10',
    track: 'carveout-integration',
    trackLabel: 'Carve-out / Integration',
    audienceLevel: 'M&A Lead',
    text: 'What regulatory or compliance certifications must be transferred, re-obtained, or newly acquired as part of this transaction?',
    rationale: 'Compliance gaps post-close can halt operations in regulated markets. Certification transfer timelines often exceed deal close timelines.',
    priority: 'high',
    conditions: {
      geographies: ['eu', 'apac'],
    },
  },
  {
    id: 'ci-11',
    track: 'carveout-integration',
    trackLabel: 'Carve-out / Integration',
    audienceLevel: 'M&A Lead',
    text: 'Are there brand, domain name, or digital asset dependencies on the parent entity that require transfer or replacement?',
    rationale: 'Digital identity dependencies can block go-to-market activities post-separation. DNS, SSL, and domain ownership must be mapped early.',
    priority: 'standard',
    conditions: {
      transactionTypes: ['carve-out'],
    },
  },
  {
    id: 'ci-12',
    track: 'carveout-integration',
    trackLabel: 'Carve-out / Integration',
    audienceLevel: 'M&A Lead',
    text: 'What is the Day-1 readiness assessment? Which technology systems, processes, and integrations must be operational from the first day of standalone or combined operations?',
    rationale: 'Day-1 failures create immediate operational risk and customer impact. A gap analysis ensures critical systems are prioritized in the transition plan.',
    priority: 'critical',
    conditions: {
      transactionTypes: ['carve-out', 'business-integration'],
    },
  },

  // ─── TRACK 4: SECURITY & RISK ──────────────────────────────────────

  {
    id: 'sec-01',
    track: 'security-risk',
    trackLabel: 'Security & Risk',
    audienceLevel: 'CISO',
    text: 'What compliance certifications does the company currently hold (SOC 2, ISO 27001, etc.)? When were they last audited, and were there any material findings?',
    rationale: 'Compliance certifications are table stakes for enterprise customers. Gaps or findings indicate security program maturity issues that affect deal value.',
    priority: 'critical',
    conditions: {},
  },
  {
    id: 'sec-02',
    track: 'security-risk',
    trackLabel: 'Security & Risk',
    audienceLevel: 'CISO',
    text: 'What is the penetration testing cadence? When was the last external penetration test, and what is the remediation status of critical and high-severity findings?',
    rationale: 'Penetration testing frequency and finding remediation velocity indicate how seriously the organization treats proactive security.',
    priority: 'high',
    conditions: {},
  },
  {
    id: 'sec-03',
    track: 'security-risk',
    trackLabel: 'Security & Risk',
    audienceLevel: 'CISO',
    text: 'Describe the data encryption posture. Is data encrypted at rest and in transit? What key management solution is used, and who controls the encryption keys?',
    rationale: 'Encryption gaps create regulatory liability and data breach exposure. Key management ownership is especially critical in carve-out scenarios.',
    priority: 'high',
    conditions: {},
  },
  {
    id: 'sec-04',
    track: 'security-risk',
    trackLabel: 'Security & Risk',
    audienceLevel: 'CISO',
    text: 'How is privileged access managed? Is there a PAM solution in place, and is the principle of least privilege enforced across production systems?',
    rationale: 'Excessive privilege is the most exploited attack vector. Weak access controls in scaled organizations represent systemic breach risk.',
    priority: 'high',
    conditions: {
      headcountMin: '51-200',
    },
  },
  {
    id: 'sec-05',
    track: 'security-risk',
    trackLabel: 'Security & Risk',
    audienceLevel: 'CISO',
    text: 'What is the GDPR compliance posture? Are data processing agreements in place with all sub-processors, and is there a documented data subject rights fulfillment process?',
    rationale: 'GDPR non-compliance carries fines of up to 4% of global revenue. Due diligence must verify compliance before transaction close.',
    priority: 'critical',
    conditions: {
      geographies: ['eu'],
    },
  },
  {
    id: 'sec-06',
    track: 'security-risk',
    trackLabel: 'Security & Risk',
    audienceLevel: 'CISO',
    text: 'Is there a Software Bill of Materials (SBOM)? What is the open-source license compliance posture, and are there any copyleft license contamination risks?',
    rationale: 'Open-source license violations can force code disclosure or re-architecture. SBOM absence indicates blind spots in the software supply chain.',
    priority: 'high',
    conditions: {
      productTypes: ['deep-tech-ip', 'on-premise-enterprise'],
    },
  },
  {
    id: 'sec-07',
    track: 'security-risk',
    trackLabel: 'Security & Risk',
    audienceLevel: 'CISO',
    text: 'How are secrets, API keys, and credentials managed? Is there a centralized secrets management solution, or are credentials stored in code repositories or configuration files?',
    rationale: 'Credentials in code repositories are the leading cause of data breaches in technology companies. This question reveals foundational security hygiene.',
    priority: 'critical',
    conditions: {},
  },
  {
    id: 'sec-08',
    track: 'security-risk',
    trackLabel: 'Security & Risk',
    audienceLevel: 'CISO',
    text: 'Describe any security incidents in the past 36 months. What was the root cause, blast radius, and what systemic changes were implemented as a result?',
    rationale: 'Incident history reveals attack surface exposure and organizational learning capacity. Repeated incident types indicate unresolved systemic weaknesses.',
    priority: 'critical',
    conditions: {},
  },
  {
    id: 'sec-09',
    track: 'security-risk',
    trackLabel: 'Security & Risk',
    audienceLevel: 'CISO',
    text: 'Have any third-party security assessments or vendor risk assessments been conducted in the past 24 months? What were the key findings and remediation outcomes?',
    rationale: 'External assessments provide independent validation of security posture. Their absence in revenue-significant companies suggests underinvestment in security.',
    priority: 'standard',
    conditions: {
      revenueMin: '25-100m',
    },
  },
  {
    id: 'sec-10',
    track: 'security-risk',
    trackLabel: 'Security & Risk',
    audienceLevel: 'CISO',
    text: 'Is the platform PCI-DSS compliant? If payment processing is involved, describe the cardholder data environment scope and the last qualified security assessor (QSA) audit results.',
    rationale: 'PCI-DSS scope creep is common in marketplace and e-commerce platforms. Non-compliance creates immediate financial and legal liability.',
    priority: 'high',
    conditions: {
      productTypes: ['b2c-marketplace'],
    },
  },
  {
    id: 'sec-11',
    track: 'security-risk',
    trackLabel: 'Security & Risk',
    audienceLevel: 'CISO',
    text: 'What are the data residency and sovereignty requirements? Where is customer data physically stored, and does this comply with applicable local regulations?',
    rationale: 'Data sovereignty violations can block market access entirely. Multi-region operations require explicit data residency architectures.',
    priority: 'high',
    conditions: {
      geographies: ['eu', 'apac'],
    },
  },
  {
    id: 'sec-12',
    track: 'security-risk',
    trackLabel: 'Security & Risk',
    audienceLevel: 'CISO',
    text: 'What are the business continuity RPO and RTO targets? Have they been validated through tabletop exercises or live failover testing in the past 12 months?',
    rationale: 'Untested business continuity plans provide false assurance. Revenue-significant platforms require validated recovery capabilities.',
    priority: 'high',
    conditions: {
      revenueMin: '25-100m',
    },
  },
];
