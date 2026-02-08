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
];
