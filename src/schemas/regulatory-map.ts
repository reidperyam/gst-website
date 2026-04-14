import { z } from 'zod';

/**
 * Zod schema for a single regulation record.
 *
 * This schema is the single source of truth for regulation data shape.
 * The TypeScript `Regulation` type is re-exported from `src/types/regulatory-map.ts`
 * and `RegulationCategory` is derived from the enum below.
 */
export const RegulationCategorySchema = z.enum([
  'data-privacy',
  'ai-governance',
  'industry-compliance',
  'cybersecurity',
]);

export const RegulationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  regions: z
    .array(
      z
        .string()
        .regex(
          /^[A-Z]{3}$|^US-[A-Z]{2}$|^CA-[A-Z]{2}$/,
          'Must be ISO 3166-1 alpha-3, US state (US-XX), or CA province (CA-XX)'
        )
    )
    .min(1),
  effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
  summary: z.string().min(1),
  category: RegulationCategorySchema,
  scope: z.string().min(1).optional(),
  keyRequirements: z.array(z.string()).optional(),
  penalties: z.string().optional(),
});

export type RegulationCategory = z.infer<typeof RegulationCategorySchema>;
export type Regulation = z.infer<typeof RegulationSchema>;
