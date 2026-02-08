/**
 * Predictive Risk Anchors for The Diligence Machine
 *
 * Risk anchors are warnings injected into the output based on
 * combinations of tech archetype, company age, and other inputs.
 * They highlight structural risks that require attention during diligence.
 */

import type { QuestionCondition } from './questions';

export interface RiskAnchor {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  conditions: QuestionCondition;
}

export const RISK_ANCHORS: RiskAnchor[] = [
  {
    id: 'risk-hw-eol',
    title: 'Hardware End-of-Life Risk',
    description:
      'Self-managed infrastructure in companies over 10 years old frequently contains hardware approaching or past end-of-life. Budget for hardware refresh or cloud migration as a capital expenditure item in the deal model.',
    severity: 'high',
    conditions: {
      techArchetypes: ['self-managed-infra'],
      companyAgeMin: '10-20yr',
    },
  },
  {
    id: 'risk-colo-hw',
    title: 'Colocation Hardware Lifecycle',
    description:
      'Datacenter colocation deployments in mature companies often rely on aging hardware with limited vendor support. Assess the remaining useful life of physical assets and the existence of a documented migration plan.',
    severity: 'high',
    conditions: {
      techArchetypes: ['datacenter-vendor'],
      companyAgeMin: '10-20yr',
    },
  },
  {
    id: 'risk-tech-debt',
    title: 'Technical Debt Accumulation',
    description:
      'Hybrid legacy environments in companies aged 5-10+ years accumulate significant technical debt across integration layers. Expect modernization costs to exceed initial estimates by 40-60%.',
    severity: 'medium',
    conditions: {
      techArchetypes: ['hybrid-legacy'],
      companyAgeMin: '5-10yr',
    },
  },
  {
    id: 'risk-key-person',
    title: 'Key-Person Technical Dependencies',
    description:
      'Small engineering teams (under 50) in on-premise or self-managed environments often concentrate critical knowledge in 1-2 individuals. Assess bus factor and knowledge transfer risk before close.',
    severity: 'high',
    conditions: {
      techArchetypes: ['on-premise-enterprise', 'self-managed-infra'],
      headcountMin: '1-50',
    },
  },
  {
    id: 'risk-ip-docs',
    title: 'IP Documentation Gaps',
    description:
      'Early-stage deep-tech companies frequently have undocumented IP, informal patent strategies, and research code that lacks production-grade engineering. Verify IP ownership chain and documentation completeness.',
    severity: 'medium',
    conditions: {
      productTypes: ['deep-tech-ip'],
      growthStages: ['early'],
    },
  },
  {
    id: 'risk-manual-ops',
    title: 'Manual Operations Dependency',
    description:
      'Tech-enabled service companies with mature operations often mask manual processes behind a technology facade. Validate the actual automation ratio before projecting margin improvement.',
    severity: 'medium',
    conditions: {
      productTypes: ['tech-enabled-service'],
      growthStages: ['scaling', 'mature'],
    },
  },
  {
    id: 'risk-labor-specialist',
    title: 'Specialized Labor Dependencies',
    description:
      'Self-managed infrastructure and datacenter colocations require specialized operations staff (network engineers, hardware technicians) that are increasingly scarce and expensive in the labor market.',
    severity: 'medium',
    conditions: {
      techArchetypes: ['self-managed-infra', 'datacenter-vendor'],
    },
  },
  {
    id: 'risk-carveout-entangle',
    title: 'Carve-out Technology Entanglement',
    description:
      'Carve-outs from parent companies in hybrid legacy environments carry elevated separation risk. Shared databases, identity systems, and network infrastructure create interdependencies that extend transition timelines.',
    severity: 'high',
    conditions: {
      transactionTypes: ['carve-out'],
      techArchetypes: ['hybrid-legacy'],
    },
  },
  {
    id: 'risk-gdpr-multi',
    title: 'Cross-Border Data Compliance',
    description:
      'Multi-region operations require careful navigation of GDPR (EU/UK), LGPD (LATAM), POPIA (Africa), APAC data residency laws, and cross-border data transfer mechanisms. Non-compliance creates material regulatory exposure and can block market access.',
    severity: 'high',
    conditions: {
      geographies: ['eu', 'uk', 'apac', 'latam', 'africa'],
    },
  },
  {
    id: 'risk-legacy-vendor',
    title: 'Legacy Vendor Lock-in',
    description:
      'On-premise enterprise products in companies over 10 years old frequently have deep vendor dependencies (Oracle, IBM, SAP) with multi-year contracts and high switching costs that constrain modernization options.',
    severity: 'medium',
    conditions: {
      productTypes: ['on-premise-enterprise'],
      companyAgeMin: '10-20yr',
    },
  },
  {
    id: 'risk-brexit-data',
    title: 'Post-Brexit Data Transfer Risk',
    description:
      'UK operations require separate GDPR compliance (UK GDPR + DPA 2018) and Standard Contractual Clauses for EU data transfers. Regulatory divergence between UK and EU creates ongoing compliance overhead.',
    severity: 'medium',
    conditions: {
      geographies: ['uk'],
    },
  },
  {
    id: 'risk-latam-infra',
    title: 'LATAM Infrastructure Maturity',
    description:
      'Latin American markets often face infrastructure challenges including inconsistent cloud service availability, connectivity issues, and varying levels of cybersecurity framework maturity. Budget for potential infrastructure upgrades.',
    severity: 'medium',
    conditions: {
      geographies: ['latam'],
      techArchetypes: ['modern-cloud-native', 'hybrid-legacy'],
    },
  },
  {
    id: 'risk-africa-regulatory',
    title: 'African Regulatory Fragmentation',
    description:
      'African markets have fragmented data protection and technology regulations across countries (POPIA, Nigeria DPA, Kenya DPA, etc.). Multi-country operations require jurisdiction-specific compliance strategies and local data residency planning.',
    severity: 'high',
    conditions: {
      geographies: ['africa'],
    },
  },
  {
    id: 'risk-canada-privacy',
    title: 'Canadian Privacy Law Complexity',
    description:
      'Canadian operations face a layered privacy landscape with PIPEDA at the federal level and substantially similar provincial legislation in Quebec (Law 25), Alberta, and British Columbia. Quebec\'s Law 25 introduces GDPR-like requirements including privacy impact assessments, consent reforms, and data portability rights.',
    severity: 'medium',
    conditions: {
      geographies: ['canada'],
    },
  },
  {
    id: 'risk-multi-data-transfer',
    title: 'Cross-Border Data Transfer Complexity',
    description:
      'Operating across multiple jurisdictions creates overlapping data transfer obligations (SCCs, adequacy decisions, bilateral agreements). Compliance overhead can scale non-linearly with each additional region, and transfer mechanisms may be invalidated by regulatory or court decisions.',
    severity: 'high',
    conditions: {
      geographies: ['multi-region'],
    },
  },
  {
    id: 'risk-multi-jurisdictional-conflict',
    title: 'Jurisdictional Conflict Risk',
    description:
      'Different regions may impose contradictory requirements (e.g., law enforcement access obligations vs. data protection mandates, or data localization rules conflicting with centralized architecture). These conflicts can force architectural compromises or operational workarounds.',
    severity: 'medium',
    conditions: {
      geographies: ['multi-region'],
    },
  },
  {
    id: 'risk-multi-infra-cost',
    title: 'Multi-Region Infrastructure Cost Multiplier',
    description:
      'Maintaining compliant infrastructure across regions often requires data residency architectures, regional failover, and localized deployments that can multiply infrastructure costs beyond simple scaling. Cloud region selection, latency optimization, and regional redundancy add layers of complexity.',
    severity: 'medium',
    conditions: {
      geographies: ['multi-region'],
    },
  },
  {
    id: 'risk-multi-vendor-fragmentation',
    title: 'Fragmented Vendor and Contract Landscape',
    description:
      'Multi-region operations often accumulate region-specific vendors, contracts, and licensing terms. Post-acquisition rationalization of these overlapping vendor relationships can be time-consuming and may surface non-transferable or conflicting agreements.',
    severity: 'medium',
    conditions: {
      geographies: ['multi-region'],
    },
  },
  {
    id: 'risk-multi-regulatory-velocity',
    title: 'Regulatory Change Velocity',
    description:
      'Operating across multiple regulatory environments increases exposure to legislative changes. A new privacy law, data localization requirement, or cybersecurity mandate in any one region can force architecture or process changes that ripple across the entire operation.',
    severity: 'medium',
    conditions: {
      geographies: ['multi-region'],
    },
  },
];
