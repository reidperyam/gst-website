/**
 * Schema re-exports for the MCP server.
 *
 * The website's Zod schemas under `src/schemas/` are the single source of
 * truth. We re-export them here (via relative imports — same workspace, no
 * package boundary) and add MCP-tool-specific input shapes layered on top.
 */

import { z } from 'zod';

// Re-export the diligence input schema and supporting tuples.
export { UserInputsSchema, type ValidatedUserInputs } from '../../src/schemas/diligence';

// Re-export portfolio schemas + the canonical category/theme/stage tuples.
export {
  ProjectSchema,
  ProjectsArraySchema,
  GrowthStageSchema,
  EngagementCategorySchema,
  EngagementTypeSchema,
  GROWTH_STAGE_VALUES,
  ENGAGEMENT_CATEGORY_VALUES,
  ENGAGEMENT_TYPE_VALUES,
  type Project,
  type GrowthStage,
  type EngagementCategory,
  type EngagementType,
} from '../../src/schemas/portfolio';

// ─── MCP tool input schemas ──────────────────────────────────────────────

/** Input for the `search_portfolio` tool. */
export const SearchPortfolioInputSchema = z.object({
  search: z.string().optional(),
  theme: z.string().default('all'),
  engagement: z.string().default('all'),
  limit: z.number().int().positive().max(61).default(20),
});

export type SearchPortfolioInput = z.infer<typeof SearchPortfolioInputSchema>;

/** Input for the `list_portfolio_facets` tool — no parameters. */
export const ListPortfolioFacetsInputSchema = z.object({});
export type ListPortfolioFacetsInput = z.infer<typeof ListPortfolioFacetsInputSchema>;
