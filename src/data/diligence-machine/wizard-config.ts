/**
 * Wizard Step Configuration for The Diligence Machine
 *
 * Each step is a typed config object. Adding, removing, or reordering steps
 * requires only changes to this file — the UI renders from this data.
 */

export interface WizardOption {
  id: string;
  label: string;
  description?: string;
}

export interface WizardField {
  id: string;
  label: string;
  inputType: 'select';
  options: WizardOption[];
}

export interface WizardStep {
  id: string;
  title: string;
  subtitle: string;
  inputType: 'single-select' | 'multi-select' | 'compound';
  options?: WizardOption[];
  fields?: WizardField[];
}

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'transaction-type',
    title: 'Transaction Type',
    subtitle: 'What type of deal is being evaluated?',
    inputType: 'single-select',
    options: [
      {
        id: 'full-acquisition',
        label: 'Full Acquisition',
        description: 'Complete purchase of the target entity',
      },
      {
        id: 'majority-stake',
        label: 'Majority Stake',
        description: 'Controlling interest with existing ownership retained',
      },
      {
        id: 'venture-series',
        label: 'Venture Series A/B',
        description: 'Growth-stage equity investment round',
      },
      {
        id: 'carve-out',
        label: 'Carve-out',
        description: 'Separation of a business unit from a parent company',
      },
      {
        id: 'business-integration',
        label: 'Business Integration',
        description: 'Merging operations of two existing entities',
      },
    ],
  },
  {
    id: 'product-type',
    title: 'Product Type',
    subtitle: 'What does the target company build or deliver?',
    inputType: 'single-select',
    options: [
      {
        id: 'b2b-saas',
        label: 'B2B SaaS',
        description: 'Cloud-hosted software sold to businesses',
      },
      {
        id: 'b2c-marketplace',
        label: 'B2C Marketplace',
        description: 'Consumer-facing platform connecting buyers and sellers',
      },
      {
        id: 'on-premise-enterprise',
        label: 'On-Premise Enterprise',
        description: 'Software deployed within customer infrastructure',
      },
      {
        id: 'deep-tech-ip',
        label: 'Deep-Tech / IP',
        description: 'Technology driven by proprietary research or patents',
      },
      {
        id: 'tech-enabled-service',
        label: 'Tech-Enabled Business / Service Company',
        description: 'Service delivery augmented by proprietary technology',
      },
    ],
  },
  {
    id: 'tech-archetype',
    title: 'Tech Stack Archetype',
    subtitle: 'How is the technology infrastructure provisioned?',
    inputType: 'single-select',
    options: [
      {
        id: 'modern-cloud-native',
        label: 'Modern Cloud Native',
        description: 'Built on public cloud with containerization and IaC',
      },
      {
        id: 'hybrid-legacy',
        label: 'Hybrid Legacy',
        description: 'Mix of cloud services and legacy on-premise systems',
      },
      {
        id: 'self-managed-infra',
        label: 'Self-Managed Infrastructure',
        description: 'On-premises servers owned and operated by the company',
      },
      {
        id: 'datacenter-colocation',
        label: 'Datacenter Co-location(s)',
        description: 'Hardware housed in third-party data centers',
      },
    ],
  },
  {
    id: 'company-profile',
    title: 'Company Profile',
    subtitle: 'Describe the target company\'s scale and maturity.',
    inputType: 'compound',
    fields: [
      {
        id: 'headcount',
        label: 'Target Size (Headcount)',
        inputType: 'select',
        options: [
          { id: '1-50', label: '1 \u2013 50' },
          { id: '51-200', label: '51 \u2013 200' },
          { id: '201-500', label: '201 \u2013 500' },
          { id: '500+', label: '500+' },
        ],
      },
      {
        id: 'revenue-range',
        label: 'Revenue Range',
        inputType: 'select',
        options: [
          { id: '0-5m', label: '$0 \u2013 $5M' },
          { id: '5-25m', label: '$5M \u2013 $25M' },
          { id: '25-100m', label: '$25M \u2013 $100M' },
          { id: '100m+', label: '$100M+' },
        ],
      },
      {
        id: 'growth-stage',
        label: 'Growth Stage',
        inputType: 'select',
        options: [
          { id: 'early', label: 'Early' },
          { id: 'scaling', label: 'Scaling' },
          { id: 'mature', label: 'Mature' },
        ],
      },
      {
        id: 'company-age',
        label: 'Company Age',
        inputType: 'select',
        options: [
          { id: 'under-2yr', label: 'Under 2 years' },
          { id: '2-5yr', label: '2 \u2013 5 years' },
          { id: '5-10yr', label: '5 \u2013 10 years' },
          { id: '10-20yr', label: '10 \u2013 20 years' },
          { id: '20yr+', label: '20+ years' },
        ],
      },
    ],
  },
  {
    id: 'geography',
    title: 'Geography',
    subtitle: 'Where does the target operate? Select all that apply.',
    inputType: 'multi-select',
    options: [
      {
        id: 'us',
        label: 'United States',
        description: 'North American operations',
      },
      {
        id: 'eu',
        label: 'European Union',
        description: 'EU member state operations',
      },
      {
        id: 'apac',
        label: 'Asia-Pacific',
        description: 'APAC regional operations',
      },
    ],
  },
];

/** Ordinal bracket ordering for comparative conditions */
export const BRACKET_ORDER = {
  headcount: ['1-50', '51-200', '201-500', '500+'],
  'revenue-range': ['0-5m', '5-25m', '25-100m', '100m+'],
  'company-age': ['under-2yr', '2-5yr', '5-10yr', '10-20yr', '20yr+'],
} as const;

/** Human-readable labels for input summary display */
export function getOptionLabel(stepId: string, optionId: string): string {
  const step = WIZARD_STEPS.find(s => s.id === stepId);
  if (!step) return optionId;

  if (step.options) {
    const opt = step.options.find(o => o.id === optionId);
    return opt?.label ?? optionId;
  }

  if (step.fields) {
    for (const field of step.fields) {
      const opt = field.options.find(o => o.id === optionId);
      if (opt) return opt.label;
    }
  }

  return optionId;
}
