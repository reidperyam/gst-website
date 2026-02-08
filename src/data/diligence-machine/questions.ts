/**
 * Question Bank for The Diligence Machine
 *
 * ~45 high-impact due diligence questions organized by meeting topic.
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
  // v2 condition dimensions
  businessModels?: string[];
  scaleIntensity?: string[];
  transformationStates?: string[];
  dataSensitivity?: string[];
  operatingModels?: string[];
}

export interface DiligenceQuestion {
  id: string;
  topic: 'architecture' | 'operations' | 'carveout-integration' | 'security-risk';
  topicLabel: string;
  audienceLevel: string;
  text: string;
  rationale: string;
  priority: 'high' | 'medium' | 'standard';
  conditions: QuestionCondition;
  // v2 strategic metadata (optional for backward compat)
  exitImpact?: 'Multiple Expander' | 'Valuation Drag' | 'Operational Risk';
  redFlagSignal?: string;
  track?: 'Architecture' | 'Operations' | 'Carve-out' | 'Security';
}

export const TOPIC_META = {
  architecture: {
    label: 'Architecture',
    audience: 'CTO / VP Engineering / Senior Architect',
    order: 1,
  },
  operations: {
    label: 'Operations & Delivery',
    audience: 'VP Engineering / VP Product',
    order: 2,
  },
  'carveout-integration': {
    label: 'Carve-out / Integration',
    audience: 'CIO / COO / CTO / PE Leadership',
    order: 3,
  },
  'security-risk': {
    label: 'Security, Compliance & Governance',
    audience: 'CIO / CISO / VP Security',
    order: 4,
  },
} as const;

export const QUESTIONS: DiligenceQuestion[] = [
  // ─── TOPIC 1: ARCHITECTURE & SCALABILITY ────────────────────────────

  {
    id: 'arch-01',
    topic: 'architecture',
    topicLabel: 'Architecture',
    audienceLevel: 'CTO',
    text: 'Describe the current system architecture. Is it monolithic, service-oriented, or microservices-based, and what is the roadmap for decomposition if monolithic?',
    rationale: 'Monolithic architectures in scaling companies can create deployment bottlenecks and single points of failure that often impact velocity and reliability.',
    priority: 'high',
    conditions: {},
  },
  {
    id: 'arch-02',
    topic: 'architecture',
    topicLabel: 'Architecture',
    audienceLevel: 'CTO',
    text: 'What is the database scaling strategy? Are you using read replicas, sharding, or partitioning, and what is the current headroom before the next scaling event?',
    rationale: 'Database capacity constraints are a common hidden bottleneck in growing platforms. Understanding headroom helps prevent post-acquisition surprises.',
    priority: 'medium',
    conditions: {
      headcountMin: '51-200',
    },
  },
  {
    id: 'arch-03',
    topic: 'architecture',
    topicLabel: 'Architecture',
    audienceLevel: 'CTO',
    text: 'Is the platform single-tenant or multi-tenant? If single-tenant, what is the cost and timeline to migrate to a multi-tenant architecture?',
    rationale: 'Single-tenant B2B SaaS architectures can create linear infrastructure cost scaling that may erode margins as the customer base grows.',
    priority: 'medium',
    conditions: {
      productTypes: ['b2b-saas'],
    },
  },
  {
    id: 'arch-04',
    topic: 'architecture',
    topicLabel: 'Architecture',
    audienceLevel: 'CTO',
    text: 'How mature is your Infrastructure-as-Code practice? Can the entire production environment be reproduced from version-controlled templates?',
    rationale: 'IaC maturity often correlates with disaster recovery capability, environment parity, and the speed of scaling infrastructure.',
    priority: 'medium',
    conditions: {
      techArchetypes: ['modern-cloud-native', 'hybrid-legacy'],
    },
  },
  {
    id: 'arch-05',
    topic: 'architecture',
    topicLabel: 'Architecture',
    audienceLevel: 'CTO',
    text: 'What are the horizontal and vertical scaling limits of the current infrastructure? At what load factor do you anticipate needing architectural changes?',
    rationale: 'Scaling ceilings on self-managed or colocated infrastructure may require capital expenditure planning that differs from elastic cloud models.',
    priority: 'high',
    conditions: {
      techArchetypes: ['self-managed-infra', 'datacenter-vendor'],
    },
  },
  {
    id: 'arch-06',
    topic: 'architecture',
    topicLabel: 'Architecture',
    audienceLevel: 'CTO',
    text: 'Is there a documented cloud migration plan? What is the estimated timeline, cost, and risk profile for transitioning from current infrastructure to a cloud-native deployment?',
    rationale: 'Cloud migration can be a multi-year capital project. Understanding whether a plan exists, and its fidelity, helps assess strategic infrastructure thinking.',
    priority: 'high',
    conditions: {
      techArchetypes: ['self-managed-infra', 'datacenter-vendor'],
    },
  },
  {
    id: 'arch-07',
    topic: 'architecture',
    topicLabel: 'Architecture',
    audienceLevel: 'CTO',
    text: 'Describe the API versioning strategy. How are breaking changes communicated to consumers, and what is the deprecation lifecycle?',
    rationale: 'API governance quality can affect integration stability for customers and partners, potentially impacting churn and support burden.',
    priority: 'standard',
    conditions: {
      productTypes: ['b2b-saas', 'b2c-marketplace'],
    },
  },
  {
    id: 'arch-08',
    topic: 'architecture',
    topicLabel: 'Architecture',
    audienceLevel: 'CTO',
    text: 'What is the data pipeline architecture? How is data ingested, transformed, and served, and what is the latency from raw input to actionable output?',
    rationale: 'Deep-tech and IP-driven companies derive value from data processing pipelines. Architectural weaknesses here can undermine the core value proposition.',
    priority: 'medium',
    conditions: {
      productTypes: ['deep-tech-ip'],
    },
  },
  {
    id: 'arch-09',
    topic: 'architecture',
    topicLabel: 'Architecture',
    audienceLevel: 'CTO',
    text: 'What are the disaster recovery and business continuity architectures? What are the documented RPO and RTO targets, and have they been validated through testing?',
    rationale: 'Disaster recovery capability is important for revenue protection. Untested DR plans may be as ineffective as having no plan.',
    priority: 'high',
    conditions: {
      revenueMin: '5-25m',
    },
  },
  {
    id: 'arch-10',
    topic: 'architecture',
    topicLabel: 'Architecture',
    audienceLevel: 'CTO',
    text: 'What is the coupling between legacy systems and core business logic? Are there integration layers, or is business logic directly embedded in legacy codebases?',
    rationale: 'Tight coupling to legacy systems can create refactoring challenges and constrain the pace of innovation. Understanding the coupling depth helps inform modernization cost.',
    priority: 'medium',
    conditions: {
      techArchetypes: ['hybrid-legacy', 'self-managed-infra'],
      companyAgeMin: '5-10yr',
    },
  },
  {
    id: 'arch-11',
    topic: 'architecture',
    topicLabel: 'Architecture',
    audienceLevel: 'CTO',
    text: 'Do architecture decision records (ADRs) exist? How are significant technical decisions documented, communicated, and revisited?',
    rationale: 'ADRs can indicate engineering maturity and help reduce knowledge loss. Their absence may suggest decisions live in individual memories, creating key-person dependencies.',
    priority: 'standard',
    conditions: {},
  },
  {
    id: 'arch-12',
    topic: 'architecture',
    topicLabel: 'Architecture',
    audienceLevel: 'CTO',
    text: 'What are the current performance SLAs, and what is the historical adherence rate? Where are the most significant performance bottlenecks today?',
    rationale: 'SLA adherence history can reveal operational reliability. Consistent breaches may indicate systemic architectural issues rather than isolated incidents.',
    priority: 'medium',
    conditions: {
      productTypes: ['b2b-saas', 'b2c-marketplace'],
      growthStages: ['scaling', 'mature'],
    },
  },

  // ─── TOPIC 2: OPERATIONS & DELIVERY ─────────────────────────────────

  {
    id: 'ops-01',
    topic: 'operations',
    topicLabel: 'Operations & Delivery',
    audienceLevel: 'VP Engineering',
    text: 'Describe your CI/CD pipeline. What is the cycle time from code commit to production deployment, and what percentage of deployments require manual intervention?',
    rationale: 'CI/CD maturity is a strong indicator of engineering velocity. Manual deployment steps may indicate process debt that can compound over time.',
    priority: 'high',
    conditions: {},
  },
  {
    id: 'ops-02',
    topic: 'operations',
    topicLabel: 'Operations & Delivery',
    audienceLevel: 'VP Engineering',
    text: 'What is the deployment frequency, and what is the rollback success rate? How long does a typical rollback take from detection to resolution?',
    rationale: 'Deployment frequency and rollback capability are DORA metrics that often correlate with engineering team performance and system stability.',
    priority: 'medium',
    conditions: {},
  },
  {
    id: 'ops-03',
    topic: 'operations',
    topicLabel: 'Operations & Delivery',
    audienceLevel: 'VP Engineering',
    text: 'What is the bus factor for critical systems? How many engineers can independently deploy, debug, and recover each major subsystem?',
    rationale: 'Small teams with concentrated knowledge can represent operational vulnerability. Post-acquisition attrition may disrupt critical systems.',
    priority: 'high',
    conditions: {
      headcountMin: '1-50',
    },
  },
  {
    id: 'ops-04',
    topic: 'operations',
    topicLabel: 'Operations & Delivery',
    audienceLevel: 'VP Engineering',
    text: 'Describe the on-call rotation and incident management process. What is the mean time to detection (MTTD) and mean time to resolution (MTTR) for P1 incidents?',
    rationale: 'Incident management maturity can reflect operational resilience. High MTTR in customer-facing platforms may impact revenue and retention.',
    priority: 'medium',
    conditions: {
      productTypes: ['b2b-saas', 'b2c-marketplace'],
    },
  },
  {
    id: 'ops-05',
    topic: 'operations',
    topicLabel: 'Operations & Delivery',
    audienceLevel: 'VP Engineering',
    text: 'How is technical debt quantified and prioritized? What percentage of engineering capacity is allocated to debt reduction versus feature development?',
    rationale: 'Quantifying technical debt is important for effective management. Without measurement, debt can compound and constrain delivery over time.',
    priority: 'medium',
    conditions: {
      companyAgeMin: '5-10yr',
    },
  },
  {
    id: 'ops-06',
    topic: 'operations',
    topicLabel: 'Operations & Delivery',
    audienceLevel: 'VP Product',
    text: 'What percentage of service delivery is automated via the proprietary platform versus manual intervention by the operations team?',
    rationale: 'Tech-enabled service companies often derive margin from automation. A high ratio of manual processes may indicate scalability constraints and margin compression potential.',
    priority: 'high',
    conditions: {
      productTypes: ['tech-enabled-service'],
    },
  },
  {
    id: 'ops-07',
    topic: 'operations',
    topicLabel: 'Operations & Delivery',
    audienceLevel: 'VP Engineering',
    text: 'What is the testing strategy? What is the ratio of unit, integration, and end-to-end tests, and what is the overall code coverage percentage?',
    rationale: 'Test coverage and strategy can reveal confidence in change safety. Low coverage in critical paths may create deployment challenges and slow velocity.',
    priority: 'medium',
    conditions: {},
  },
  {
    id: 'ops-08',
    topic: 'operations',
    topicLabel: 'Operations & Delivery',
    audienceLevel: 'VP Engineering',
    text: 'How current is the technical documentation? When was the architecture diagram, runbook library, and onboarding guide last updated?',
    rationale: 'Stale documentation may indicate process challenges. Post-acquisition, accurate documentation can accelerate integration and reduce dependency on institutional knowledge.',
    priority: 'standard',
    conditions: {},
  },
  {
    id: 'ops-09',
    topic: 'operations',
    topicLabel: 'Operations & Delivery',
    audienceLevel: 'VP Engineering',
    text: 'What is the ratio of outsourced to in-house engineering? Which systems or features are maintained by external contractors?',
    rationale: 'Heavy reliance on outsourced engineering can create continuity challenges post-acquisition, especially if contractor agreements are tied to the selling entity.',
    priority: 'medium',
    conditions: {
      productTypes: ['tech-enabled-service'],
      headcountMin: '1-50',
    },
  },
  {
    id: 'ops-10',
    topic: 'operations',
    topicLabel: 'Operations & Delivery',
    audienceLevel: 'VP Engineering',
    text: 'What engineering velocity metrics are tracked? How has sprint velocity or throughput trended over the past 12 months?',
    rationale: 'Velocity trends can reveal whether the team is accelerating, stable, or decelerating, providing insights into engineering health post-investment.',
    priority: 'standard',
    conditions: {
      transactionTypes: ['venture-series'],
    },
  },
  {
    id: 'ops-11',
    topic: 'operations',
    topicLabel: 'Operations & Delivery',
    audienceLevel: 'VP Engineering',
    text: 'Is there a platform engineering function? How are developer tools, shared libraries, and internal infrastructure services managed and maintained?',
    rationale: 'At scale, the absence of platform engineering can create duplicated effort and inconsistent tooling that may degrade velocity across teams.',
    priority: 'standard',
    conditions: {
      headcountMin: '201-500',
    },
  },
  {
    id: 'ops-12',
    topic: 'operations',
    topicLabel: 'Operations & Delivery',
    audienceLevel: 'VP Engineering',
    text: 'Describe the release management process. Are feature flags used for progressive rollouts, and is there a formal change advisory board for production changes?',
    rationale: 'Mature release management can reduce blast radius of defects. Its absence in scaling companies may indicate process debt that can slow growth.',
    priority: 'standard',
    conditions: {
      growthStages: ['scaling', 'mature'],
    },
  },

  // ─── TOPIC 3: CARVE-OUT / INTEGRATION ───────────────────────────────

  {
    id: 'ci-01',
    topic: 'carveout-integration',
    topicLabel: 'Carve-out / Integration',
    audienceLevel: 'M&A Lead',
    text: 'Which core infrastructure components are currently shared with the parent company, and what is the estimated timeline to achieve complete logical and physical separation?',
    rationale: 'Shared infrastructure can be a significant hidden cost in carve-outs. Without a separation inventory, timelines and budgets may be unreliable.',
    priority: 'high',
    conditions: {
      transactionTypes: ['carve-out'],
    },
  },
  {
    id: 'ci-02',
    topic: 'carveout-integration',
    topicLabel: 'Carve-out / Integration',
    audienceLevel: 'M&A Lead',
    text: 'What is the data separation plan? Can customer, operational, and analytical data be cleanly partitioned from the parent entity without data loss or integrity issues?',
    rationale: 'Data entanglement can create regulatory, operational, and legal exposure. Clean separation is typically important for standalone operations.',
    priority: 'high',
    conditions: {
      transactionTypes: ['carve-out'],
    },
  },
  {
    id: 'ci-03',
    topic: 'carveout-integration',
    topicLabel: 'Carve-out / Integration',
    audienceLevel: 'M&A Lead',
    text: 'Which software licenses, SaaS subscriptions, and vendor contracts are held by the parent company? Are they transferable, and at what cost?',
    rationale: 'Non-transferable licenses may require expensive re-procurement post-close. Enterprise agreements often contain anti-assignment clauses.',
    priority: 'medium',
    conditions: {
      transactionTypes: ['carve-out', 'full-acquisition'],
    },
  },
  {
    id: 'ci-04',
    topic: 'carveout-integration',
    topicLabel: 'Carve-out / Integration',
    audienceLevel: 'M&A Lead',
    text: 'Is the identity and access management (SSO/IAM) infrastructure shared with or dependent on the parent organization? What is the migration complexity?',
    rationale: 'Shared identity infrastructure can be one of the most complex dependencies to sever. It often touches every user, system, and security boundary.',
    priority: 'medium',
    conditions: {
      transactionTypes: ['carve-out', 'business-integration'],
    },
  },
  {
    id: 'ci-05',
    topic: 'carveout-integration',
    topicLabel: 'Carve-out / Integration',
    audienceLevel: 'M&A Lead',
    text: 'What is the API surface area between the target and acquirer systems? How many integration points exist, and what is the estimated effort to harmonize or replace them?',
    rationale: 'Integration complexity often scales non-linearly with the number of API touchpoints. Early mapping can help prevent costly surprises during Day 2 execution.',
    priority: 'medium',
    conditions: {
      transactionTypes: ['business-integration'],
    },
  },
  {
    id: 'ci-06',
    topic: 'carveout-integration',
    topicLabel: 'Carve-out / Integration',
    audienceLevel: 'M&A Lead',
    text: 'What is the technology stack overlap between the two entities? Where do platforms, languages, and tooling diverge, and what is the rationalization strategy?',
    rationale: 'Stack divergence can create long-term maintenance burden. A rationalization plan helps prevent the "two of everything" anti-pattern in merged organizations.',
    priority: 'medium',
    conditions: {
      transactionTypes: ['business-integration', 'full-acquisition'],
    },
  },
  {
    id: 'ci-07',
    topic: 'carveout-integration',
    topicLabel: 'Carve-out / Integration',
    audienceLevel: 'M&A Lead',
    text: 'What is the scope of the transition service agreement (TSA)? Which technology services will the parent continue to provide, for how long, and at what cost?',
    rationale: 'TSAs are temporary by design but can become extended dependencies. Understanding scope and duration is important for standalone readiness planning.',
    priority: 'high',
    conditions: {
      transactionTypes: ['carve-out'],
    },
  },
  {
    id: 'ci-08',
    topic: 'carveout-integration',
    topicLabel: 'Carve-out / Integration',
    audienceLevel: 'M&A Lead',
    text: 'Are there duplicate systems that serve the same function across both entities? What is the rationalization plan and expected timeline for consolidation?',
    rationale: 'Duplicate systems can increase licensing, maintenance, and operational costs. Early consolidation planning helps capture synergies.',
    priority: 'standard',
    conditions: {
      transactionTypes: ['business-integration', 'majority-stake'],
    },
  },
  {
    id: 'ci-09',
    topic: 'carveout-integration',
    topicLabel: 'Carve-out / Integration',
    audienceLevel: 'M&A Lead',
    text: 'What is the customer data migration plan? How will customer accounts, configurations, and historical data be transferred without service disruption?',
    rationale: 'Customer-facing data migration can be a high-stakes operational event in transactions. Inadequate planning may lead to customer churn.',
    priority: 'high',
    conditions: {
      transactionTypes: ['full-acquisition', 'carve-out'],
    },
  },
  {
    id: 'ci-10',
    topic: 'carveout-integration',
    topicLabel: 'Carve-out / Integration',
    audienceLevel: 'M&A Lead',
    text: 'What regulatory or compliance certifications must be transferred, re-obtained, or newly acquired as part of this transaction?',
    rationale: 'Compliance gaps post-close may halt operations in regulated markets. Certification transfer timelines often exceed deal close timelines.',
    priority: 'medium',
    conditions: {
      geographies: ['eu', 'uk', 'canada', 'apac', 'latam', 'africa', 'multi-region'],
    },
  },
  {
    id: 'ci-11',
    topic: 'carveout-integration',
    topicLabel: 'Carve-out / Integration',
    audienceLevel: 'M&A Lead',
    text: 'Are there brand, domain name, or digital asset dependencies on the parent entity that require transfer or replacement?',
    rationale: 'Digital identity dependencies may block go-to-market activities post-separation. DNS, SSL, and domain ownership should be mapped early.',
    priority: 'standard',
    conditions: {
      transactionTypes: ['carve-out'],
    },
  },
  {
    id: 'ci-12',
    topic: 'carveout-integration',
    topicLabel: 'Carve-out / Integration',
    audienceLevel: 'M&A Lead',
    text: 'What is the Day-1 readiness assessment? Which technology systems, processes, and integrations must be operational from the first day of standalone or combined operations?',
    rationale: 'Day-1 failures can create operational disruption and customer impact. A gap analysis helps ensure critical systems are prioritized in the transition plan.',
    priority: 'high',
    conditions: {
      transactionTypes: ['carve-out', 'business-integration'],
    },
  },

  // ─── TOPIC 4: SECURITY, COMPLIANCE & GOVERNANCE ────────────────────

  {
    id: 'sec-01',
    topic: 'security-risk',
    topicLabel: 'Security, Compliance & Governance',
    audienceLevel: 'CISO',
    text: 'What compliance certifications does the company currently hold (SOC 2, ISO 27001, etc.)? When were they last audited, and were there any material findings?',
    rationale: 'Compliance certifications are often expected by enterprise customers. Gaps or findings may indicate security program maturity issues that can affect deal value.',
    priority: 'high',
    conditions: {},
  },
  {
    id: 'sec-02',
    topic: 'security-risk',
    topicLabel: 'Security, Compliance & Governance',
    audienceLevel: 'CISO',
    text: 'What is the penetration testing cadence? When was the last external penetration test, and what is the remediation status of critical and high-severity findings?',
    rationale: 'Penetration testing frequency and finding remediation velocity can indicate how seriously the organization treats proactive security.',
    priority: 'medium',
    conditions: {},
  },
  {
    id: 'sec-03',
    topic: 'security-risk',
    topicLabel: 'Security, Compliance & Governance',
    audienceLevel: 'CISO',
    text: 'Describe the data encryption posture. Is data encrypted at rest and in transit? What key management solution is used, and who controls the encryption keys?',
    rationale: 'Encryption gaps can create regulatory liability and data breach exposure. Key management ownership is especially important in carve-out scenarios.',
    priority: 'medium',
    conditions: {},
  },
  {
    id: 'sec-04',
    topic: 'security-risk',
    topicLabel: 'Security, Compliance & Governance',
    audienceLevel: 'CISO',
    text: 'How is privileged access managed? Is there a PAM solution in place, and is the principle of least privilege enforced across production systems?',
    rationale: 'Excessive privilege is a commonly exploited attack vector. Weak access controls in scaled organizations can represent systemic breach exposure.',
    priority: 'medium',
    conditions: {
      headcountMin: '51-200',
    },
  },
  {
    id: 'sec-05',
    topic: 'security-risk',
    topicLabel: 'Security, Compliance & Governance',
    audienceLevel: 'CISO',
    text: 'What is the GDPR compliance posture? Are data processing agreements in place with all sub-processors, and is there a documented data subject rights fulfillment process?',
    rationale: 'GDPR non-compliance can carry fines of up to 4% of global revenue. Due diligence should verify compliance before transaction close.',
    priority: 'high',
    conditions: {
      geographies: ['eu', 'uk'],
    },
  },
  {
    id: 'sec-06',
    topic: 'security-risk',
    topicLabel: 'Security, Compliance & Governance',
    audienceLevel: 'CISO',
    text: 'Is there a Software Bill of Materials (SBOM)? What is the open-source license compliance posture, and are there any copyleft license contamination risks?',
    rationale: 'Open-source license violations may require code disclosure or re-architecture. SBOM absence can indicate blind spots in the software supply chain.',
    priority: 'medium',
    conditions: {
      productTypes: ['deep-tech-ip', 'on-premise-enterprise'],
    },
  },
  {
    id: 'sec-07',
    topic: 'security-risk',
    topicLabel: 'Security, Compliance & Governance',
    audienceLevel: 'CISO',
    text: 'How are secrets, API keys, and credentials managed? Is there a centralized secrets management solution, or are credentials stored in code repositories or configuration files?',
    rationale: 'Credentials in code repositories are a leading cause of data breaches in technology companies. This question helps assess foundational security hygiene.',
    priority: 'high',
    conditions: {},
  },
  {
    id: 'sec-08',
    topic: 'security-risk',
    topicLabel: 'Security, Compliance & Governance',
    audienceLevel: 'CISO',
    text: 'Describe any security incidents in the past 36 months. What was the root cause, blast radius, and what systemic changes were implemented as a result?',
    rationale: 'Incident history can reveal attack surface exposure and organizational learning capacity. Repeated incident types may indicate unresolved systemic weaknesses.',
    priority: 'high',
    conditions: {},
  },
  {
    id: 'sec-09',
    topic: 'security-risk',
    topicLabel: 'Security, Compliance & Governance',
    audienceLevel: 'CISO',
    text: 'Have any third-party security assessments or vendor risk assessments been conducted in the past 24 months? What were the key findings and remediation outcomes?',
    rationale: 'External assessments provide independent validation of security posture. Their absence in revenue-significant companies may suggest underinvestment in security.',
    priority: 'standard',
    conditions: {
      revenueMin: '25-100m',
    },
  },
  {
    id: 'sec-10',
    topic: 'security-risk',
    topicLabel: 'Security, Compliance & Governance',
    audienceLevel: 'CISO',
    text: 'Is the platform PCI-DSS compliant? If payment processing is involved, describe the cardholder data environment scope and the last qualified security assessor (QSA) audit results.',
    rationale: 'PCI-DSS scope creep is common in marketplace and e-commerce platforms. Non-compliance can create financial and legal liability.',
    priority: 'medium',
    conditions: {
      productTypes: ['b2c-marketplace'],
    },
  },
  {
    id: 'sec-11',
    topic: 'security-risk',
    topicLabel: 'Security, Compliance & Governance',
    audienceLevel: 'CISO',
    text: 'What are the data residency and sovereignty requirements? Where is customer data physically stored, and does this comply with applicable local regulations?',
    rationale: 'Data sovereignty violations may block market access. Multi-region operations typically require explicit data residency architectures.',
    priority: 'medium',
    conditions: {
      geographies: ['eu', 'uk', 'canada', 'apac', 'latam', 'africa', 'multi-region'],
    },
  },
  {
    id: 'sec-12',
    topic: 'security-risk',
    topicLabel: 'Security, Compliance & Governance',
    audienceLevel: 'CISO',
    text: 'What are the business continuity RPO and RTO targets? Have they been validated through tabletop exercises or live failover testing in the past 12 months?',
    rationale: 'Untested business continuity plans may provide false assurance. Revenue-significant platforms typically require validated recovery capabilities.',
    priority: 'medium',
    conditions: {
      revenueMin: '25-100m',
    },
  },
  {
    id: 'sec-13',
    topic: 'security-risk',
    topicLabel: 'Security, Compliance & Governance',
    audienceLevel: 'CISO',
    text: 'What is the UK GDPR and Data Protection Act 2018 compliance status post-Brexit? Are Standard Contractual Clauses (SCCs) in place for cross-border data transfers with the EU?',
    rationale: 'Post-Brexit UK data protection divergence can create dual compliance requirements. Adequate data transfer mechanisms are important for EU-UK data flows.',
    priority: 'medium',
    conditions: {
      geographies: ['uk'],
    },
  },
  {
    id: 'sec-14',
    topic: 'security-risk',
    topicLabel: 'Security, Compliance & Governance',
    audienceLevel: 'CISO',
    text: 'What are the LGPD (Brazil) or regional data protection compliance measures for Latin American operations? Is customer data localized within LATAM jurisdictions?',
    rationale: 'Brazil\'s LGPD and other LATAM data protection frameworks can impose strict data residency and consent requirements that may affect operational architecture.',
    priority: 'medium',
    conditions: {
      geographies: ['latam'],
    },
  },
  {
    id: 'sec-15',
    topic: 'security-risk',
    topicLabel: 'Security, Compliance & Governance',
    audienceLevel: 'CISO',
    text: 'What regulatory frameworks govern data protection and cybersecurity in your African markets (e.g., POPIA in South Africa, Nigeria DPA)? Are data localization requirements met?',
    rationale: 'African data protection regulations vary significantly by country. Non-compliance may result in operational restrictions and market access barriers.',
    priority: 'medium',
    conditions: {
      geographies: ['africa'],
    },
  },
  {
    id: 'sec-16',
    topic: 'security-risk',
    topicLabel: 'Security, Compliance & Governance',
    audienceLevel: 'CISO',
    text: 'What is the PIPEDA compliance posture for Canadian operations? Are there provincial privacy obligations (e.g., Quebec Law 25) that impose additional requirements beyond federal legislation, and how are cross-border data transfers with the US managed?',
    rationale: 'Canada has a layered privacy landscape with PIPEDA at the federal level and substantially similar provincial legislation in Quebec, Alberta, and British Columbia. Quebec\'s Law 25 introduces GDPR-like requirements that may affect data handling practices.',
    priority: 'medium',
    conditions: {
      geographies: ['canada'],
    },
  },

  // ─── V2 QUESTIONS ──────────────────────────────────────────────────────

  // Doc 1: DR testing question
  {
    id: 'ops-13',
    topic: 'operations',
    topicLabel: 'Operations & Delivery',
    audienceLevel: 'VP Engineering',
    text: 'When was the last disaster recovery test executed end-to-end? What was the actual recovery time, and how did it compare to the documented RTO target?',
    rationale: 'DR testing is the only reliable validation of recovery capability. Untested DR plans may provide false assurance that creates material risk exposure.',
    priority: 'high',
    exitImpact: 'Operational Risk',
    redFlagSignal: 'If DR has never been tested or last test was 12+ months ago, recovery capability is unvalidated.',
    track: 'Operations',
    conditions: {
      revenueMin: '5-25m',
    },
  },

  // Doc 1: Automation ratio question
  {
    id: 'ops-14',
    topic: 'operations',
    topicLabel: 'Operations & Delivery',
    audienceLevel: 'VP Engineering',
    text: 'What is the automation-to-human ratio for core business processes? How has this ratio trended over the past 24 months?',
    rationale: 'The automation ratio directly impacts margin scalability. Declining automation ratios in growing companies may indicate that growth is being achieved through headcount rather than leverage.',
    priority: 'high',
    exitImpact: 'Multiple Expander',
    redFlagSignal: 'Inability to quantify how many new FTEs are required per $1M in revenue, or a declining automation ratio alongside revenue growth.',
    track: 'Operations',
    conditions: {
      productTypes: ['tech-enabled-service'],
    },
  },

  // Sovereignty trigger: EU AI Act
  {
    id: 'sec-17',
    topic: 'security-risk',
    topicLabel: 'Security, Compliance & Governance',
    audienceLevel: 'CISO',
    text: 'What is the EU AI Act compliance posture? If the target deploys AI systems within the EU, are risk classifications documented, and is there a conformity assessment plan for high-risk AI systems?',
    rationale: 'The EU AI Act imposes tiered compliance requirements on AI systems. Non-compliance may result in fines up to 6% of global turnover and market access restrictions.',
    priority: 'high',
    exitImpact: 'Valuation Drag',
    redFlagSignal: 'If AI systems are deployed in the EU without risk classification, compliance exposure is likely unquantified.',
    track: 'Security',
    conditions: {
      geographies: ['eu'],
    },
  },

  // Business model: customized deployments
  {
    id: 'ops-15',
    topic: 'operations',
    topicLabel: 'Operations & Delivery',
    audienceLevel: 'VP Engineering',
    text: 'What is the ratio of custom code to shared platform code across customer deployments? How is configuration drift between deployments managed?',
    rationale: 'Customized deployment models can create a fragmented codebase where each customer instance diverges, increasing maintenance burden and deployment complexity.',
    priority: 'medium',
    exitImpact: 'Multiple Expander',
    redFlagSignal: 'If custom code exceeds 30% per deployment or there is no drift detection mechanism.',
    track: 'Operations',
    conditions: {
      businessModels: ['customized-deployments'],
    },
  },

  // Business model: services-led
  {
    id: 'ops-16',
    topic: 'operations',
    topicLabel: 'Operations & Delivery',
    audienceLevel: 'VP Product',
    text: 'What percentage of revenue is derived from recurring product versus professional services? What is the trend over the past three years?',
    rationale: 'Services-led businesses often face margin compression at scale. Understanding the product-to-services revenue mix informs valuation multiple expectations.',
    priority: 'high',
    exitImpact: 'Multiple Expander',
    redFlagSignal: 'If services revenue is growing faster than product revenue, the business may be moving away from scalable economics.',
    track: 'Operations',
    conditions: {
      businessModels: ['services-led'],
    },
  },

  // Scale intensity: high
  {
    id: 'arch-13',
    topic: 'architecture',
    topicLabel: 'Architecture',
    audienceLevel: 'CTO',
    text: 'What observability and monitoring infrastructure is in place? Are distributed tracing, centralized logging, and real-time alerting operational at scale?',
    rationale: 'High-scale systems require mature observability to detect and diagnose issues before they impact users. Gaps in monitoring at scale can lead to cascading failures.',
    priority: 'high',
    exitImpact: 'Operational Risk',
    redFlagSignal: 'If monitoring is limited to basic health checks without distributed tracing or anomaly detection.',
    track: 'Architecture',
    conditions: {
      scaleIntensity: ['high'],
    },
  },

  // Scale intensity: high + architecture
  {
    id: 'arch-14',
    topic: 'architecture',
    topicLabel: 'Architecture',
    audienceLevel: 'CTO',
    text: 'What is the auto-scaling architecture? Are scaling policies reactive or predictive, and what is the cost profile during peak versus baseline load?',
    rationale: 'High-scale platforms with reactive-only scaling may experience latency spikes and degraded user experience during traffic surges, impacting retention and SLA adherence.',
    priority: 'medium',
    exitImpact: 'Operational Risk',
    redFlagSignal: 'If scaling is manual or requires engineering intervention for capacity changes.',
    track: 'Architecture',
    conditions: {
      scaleIntensity: ['high'],
    },
  },

  // Transformation state: mid-migration
  {
    id: 'arch-15',
    topic: 'architecture',
    topicLabel: 'Architecture',
    audienceLevel: 'CTO',
    text: 'What is the migration timeline and risk profile for the in-flight platform transition? Are there rollback capabilities at each migration stage?',
    rationale: 'Mid-migration architectures carry compounded risk: both old and new systems must be maintained, and partial migrations can create data consistency and integration challenges.',
    priority: 'high',
    exitImpact: 'Operational Risk',
    redFlagSignal: 'If the migration has no documented rollback plan or has already exceeded its original timeline.',
    track: 'Architecture',
    conditions: {
      transformationStates: ['mid-migration'],
    },
  },

  // Transformation state: actively-modernizing
  {
    id: 'arch-16',
    topic: 'architecture',
    topicLabel: 'Architecture',
    audienceLevel: 'CTO',
    text: 'What is the modernization roadmap and what percentage of the target architecture has been achieved? How is technical debt being retired versus accumulated during the modernization?',
    rationale: 'Active modernization programs can consume significant engineering capacity. Understanding progress and debt accumulation rates helps assess post-close engineering velocity expectations.',
    priority: 'medium',
    exitImpact: 'Valuation Drag',
    redFlagSignal: 'If modernization has been "in progress" for 2+ years with less than 50% completion.',
    track: 'Architecture',
    conditions: {
      transformationStates: ['actively-modernizing'],
    },
  },

  // Data sensitivity: high
  {
    id: 'sec-18',
    topic: 'security-risk',
    topicLabel: 'Security, Compliance & Governance',
    audienceLevel: 'CISO',
    text: 'What data classification framework is in place? How is highly sensitive data (PII, PHI, financial) segmented, encrypted, and access-controlled differently from standard operational data?',
    rationale: 'High data sensitivity without a formal classification and segmentation framework creates regulatory and breach exposure that may not be visible in standard security assessments.',
    priority: 'high',
    exitImpact: 'Valuation Drag',
    redFlagSignal: 'If all data is treated uniformly regardless of sensitivity level, or if there is no formal classification policy.',
    track: 'Security',
    conditions: {
      dataSensitivity: ['high'],
    },
  },

  // Data sensitivity: high + security
  {
    id: 'sec-19',
    topic: 'security-risk',
    topicLabel: 'Security, Compliance & Governance',
    audienceLevel: 'CISO',
    text: 'What is the data retention and purging policy? Are there automated mechanisms to enforce retention periods, and has the policy been validated against applicable regulatory requirements?',
    rationale: 'Retaining sensitive data beyond regulatory requirements increases breach surface and compliance risk. Manual retention management is error-prone at scale.',
    priority: 'medium',
    exitImpact: 'Operational Risk',
    redFlagSignal: 'If there is no automated purging or if data older than regulatory minimums is retained without justification.',
    track: 'Security',
    conditions: {
      dataSensitivity: ['moderate', 'high'],
    },
  },

  // Operating model: outsourced-heavy
  {
    id: 'ops-17',
    topic: 'operations',
    topicLabel: 'Operations & Delivery',
    audienceLevel: 'VP Engineering',
    text: 'What is the knowledge transfer and documentation posture between outsourced teams and internal stakeholders? Are there IP assignment agreements covering all outsourced work?',
    rationale: 'Heavy outsourcing can create knowledge silos and IP ownership ambiguity. Post-acquisition, contractor transitions or terminations may disrupt critical capabilities.',
    priority: 'high',
    exitImpact: 'Operational Risk',
    redFlagSignal: 'If outsourced teams hold undocumented institutional knowledge or if IP assignment clauses are incomplete.',
    track: 'Operations',
    conditions: {
      operatingModels: ['outsourced-heavy'],
    },
  },

  // Operating model: product-aligned-teams
  {
    id: 'ops-18',
    topic: 'operations',
    topicLabel: 'Operations & Delivery',
    audienceLevel: 'VP Engineering',
    text: 'How are cross-cutting concerns (security, infrastructure, data) governed across product-aligned teams? Is there a platform or enabling team that provides shared services?',
    rationale: 'Product-aligned teams can optimize for local velocity but create inconsistency in security, infrastructure, and data practices without cross-cutting governance.',
    priority: 'medium',
    exitImpact: 'Operational Risk',
    redFlagSignal: 'If each team independently manages security, infrastructure, or data with no shared standards or enabling function.',
    track: 'Operations',
    conditions: {
      operatingModels: ['product-aligned-teams'],
    },
  },

  // Usage-based business model
  {
    id: 'arch-17',
    topic: 'architecture',
    topicLabel: 'Architecture',
    audienceLevel: 'CTO',
    text: 'How is usage metering and billing instrumented? What is the accuracy and latency of the metering pipeline, and how are billing disputes resolved?',
    rationale: 'Usage-based models depend on metering accuracy for revenue recognition. Metering gaps or latency can create revenue leakage and customer disputes.',
    priority: 'high',
    exitImpact: 'Multiple Expander',
    redFlagSignal: 'If metering is not real-time or if there have been material billing adjustments in the past 12 months.',
    track: 'Architecture',
    conditions: {
      businessModels: ['usage-based'],
    },
  },

  // IP licensing business model
  {
    id: 'sec-20',
    topic: 'security-risk',
    topicLabel: 'Security, Compliance & Governance',
    audienceLevel: 'CISO',
    text: 'What is the IP protection strategy? Are patents, trade secrets, and proprietary algorithms documented, protected, and assignable in a transaction context?',
    rationale: 'IP licensing models derive value from protectable intellectual property. Gaps in IP documentation, protection, or assignability can materially impact deal value.',
    priority: 'high',
    exitImpact: 'Valuation Drag',
    redFlagSignal: 'If core IP is not patent-protected or if assignment clauses in employee/contractor agreements are incomplete.',
    track: 'Security',
    conditions: {
      businessModels: ['ip-licensing'],
    },
  },
];
