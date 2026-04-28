/**
 * Diligence engine input schemas (Zod).
 *
 * Validation surface only — no `.describe()` calls. The human-readable
 * reference (per-field labels, valid-value descriptions, downstream-effect
 * summaries, hidden-semantics callouts) lives at:
 *   `mcp-server/src/docs/diligence/CONTRACT.md`
 *
 * The wizard-config at `src/data/diligence-machine/wizard-config.ts` is the
 * source of user-facing labels; the contract doc cites both files.
 */
import { z } from 'zod';

import {
  TRANSACTION_TYPE_IDS,
  PRODUCT_TYPE_IDS,
  TECH_ARCHETYPE_IDS,
  HEADCOUNT_IDS,
  REVENUE_RANGE_IDS,
  GROWTH_STAGE_IDS,
  COMPANY_AGE_IDS,
  GEOGRAPHY_IDS,
  BUSINESS_MODEL_IDS,
  SCALE_INTENSITY_IDS,
  TRANSFORMATION_STATE_IDS,
  DATA_SENSITIVITY_IDS,
  OPERATING_MODEL_IDS,
} from '../data/diligence-machine/wizard-config';

/**
 * Zod schemas for Diligence Machine data sources.
 *
 * Single source of truth for the shape of files in
 * `src/data/diligence-machine/`.
 */

// ─── wizard-config.ts ────────────────────────────────────────────────────────

export const WizardOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1).optional(),
});

export const WizardFieldSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  inputType: z.literal('select'),
  options: z.array(WizardOptionSchema).min(1),
});

export const WizardInputTypeSchema = z.enum(['single-select', 'multi-select', 'compound']);

export const WizardStepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  navLabel: z.string().min(1),
  subtitle: z.string().min(1),
  inputType: WizardInputTypeSchema,
  options: z.array(WizardOptionSchema).optional(),
  fields: z.array(WizardFieldSchema).optional(),
});

export const WizardStepsArraySchema = z.array(WizardStepSchema);

// ─── questions.ts ────────────────────────────────────────────────────────────

export const QuestionConditionSchema = z.object({
  transactionTypes: z.array(z.string()).optional(),
  productTypes: z.array(z.string()).optional(),
  techArchetypes: z.array(z.string()).optional(),
  growthStages: z.array(z.string()).optional(),
  geographies: z.array(z.string()).optional(),
  headcountMin: z.string().optional(),
  revenueMin: z.string().optional(),
  companyAgeMin: z.string().optional(),
  excludeTransactionTypes: z.array(z.string()).optional(),
  // v2 condition dimensions
  businessModels: z.array(z.string()).optional(),
  scaleIntensity: z.array(z.string()).optional(),
  transformationStates: z.array(z.string()).optional(),
  dataSensitivity: z.array(z.string()).optional(),
  operatingModels: z.array(z.string()).optional(),
});

export const QuestionTopicSchema = z.enum([
  'architecture',
  'operations',
  'carveout-integration',
  'security-risk',
]);

export const QuestionPrioritySchema = z.enum(['high', 'medium', 'standard']);

export const ExitImpactSchema = z.enum(['Multiple Expander', 'Valuation Drag', 'Operational Risk']);

export const TrackSchema = z.enum(['Architecture', 'Operations', 'Carve-out', 'Security']);

export const DiligenceQuestionSchema = z.object({
  id: z.string().min(1),
  topic: QuestionTopicSchema,
  topicLabel: z.string().min(1),
  audienceLevel: z.string().min(1),
  text: z.string().min(1),
  rationale: z.string().min(1),
  priority: QuestionPrioritySchema,
  conditions: QuestionConditionSchema,
  exitImpact: ExitImpactSchema.optional(),
  lookoutSignal: z.string().optional(),
  track: TrackSchema.optional(),
});

export const DiligenceQuestionsArraySchema = z.array(DiligenceQuestionSchema);

// ─── attention-areas.ts ──────────────────────────────────────────────────────

export const AttentionRelevanceSchema = z.enum(['high', 'medium', 'low']);

export const AttentionAreaSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  relevance: AttentionRelevanceSchema,
  conditions: QuestionConditionSchema,
});

export const AttentionAreasArraySchema = z.array(AttentionAreaSchema);

// ─── User inputs (consumed by The Diligence Machine wizard + MCP tool) ──────

/**
 * Runtime-validated shape of the wizard's submitted answers.
 *
 * Every enum is bound to the `*_IDS` tuple in
 * `src/data/diligence-machine/wizard-config.ts` so adding a new option to the
 * wizard without updating the schema (or vice versa) trips the
 * `diligence-wizard-schema.test.ts` subset invariant.
 */
export const UserInputsSchema = z.object({
  transactionType: z.enum(TRANSACTION_TYPE_IDS),
  productType: z.enum(PRODUCT_TYPE_IDS),
  techArchetype: z.enum(TECH_ARCHETYPE_IDS),
  headcount: z.enum(HEADCOUNT_IDS),
  revenueRange: z.enum(REVENUE_RANGE_IDS),
  growthStage: z.enum(GROWTH_STAGE_IDS),
  companyAge: z.enum(COMPANY_AGE_IDS),
  geographies: z.array(z.enum(GEOGRAPHY_IDS)).min(1),
  businessModel: z.enum(BUSINESS_MODEL_IDS),
  scaleIntensity: z.enum(SCALE_INTENSITY_IDS),
  transformationState: z.enum(TRANSFORMATION_STATE_IDS),
  dataSensitivity: z.enum(DATA_SENSITIVITY_IDS),
  operatingModel: z.enum(OPERATING_MODEL_IDS),
});

// ─── Inferred types ──────────────────────────────────────────────────────────

export type WizardOption = z.infer<typeof WizardOptionSchema>;
export type WizardField = z.infer<typeof WizardFieldSchema>;
export type WizardStep = z.infer<typeof WizardStepSchema>;
export type QuestionCondition = z.infer<typeof QuestionConditionSchema>;
export type DiligenceQuestion = z.infer<typeof DiligenceQuestionSchema>;
export type AttentionArea = z.infer<typeof AttentionAreaSchema>;

/**
 * Strict literal-union shape produced by `UserInputsSchema.parse()`.
 * Used at the MCP boundary; the engine itself uses the looser
 * `UserInputs` interface in `src/utils/diligence-engine.ts`.
 */
export type ValidatedUserInputs = z.infer<typeof UserInputsSchema>;
