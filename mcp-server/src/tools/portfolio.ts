/**
 * MCP tools: search_portfolio + list_portfolio_facets
 *
 * Wrap the website's `filterProjects` / `getUnique*` helpers with the same
 * exact behavior as the M&A portfolio page (`/ma-portfolio`).
 *
 * The 61-project dataset is bundled into the server binary at build time —
 * esbuild inlines the JSON. Updates to `src/data/ma-portfolio/projects.json`
 * require a rebuild; this trade-off keeps the runtime free of cwd-relative
 * filesystem reads (Claude Desktop spawns the process with `cwd = $HOME`).
 */

import type { McpServer } from '@modelcontextprotocol/server';
import {
  filterProjects,
  getUniqueThemes,
  getUniqueEngagementCategories,
  getUniqueGrowthStages,
  getUniqueYears,
} from '../../../src/utils/filterLogic';
import {
  ProjectsArraySchema,
  SearchPortfolioInputSchema,
  ListPortfolioFacetsInputSchema,
  type Project,
} from '../schemas';
import projectsRaw from '../../../src/data/ma-portfolio/projects.json';

// Validate the bundled dataset at module init. Any drift between the JSON
// and the schema fails the import (and surfaces in the build log).
const PROJECTS: Project[] = ProjectsArraySchema.parse(projectsRaw);

const SEARCH_DESCRIPTION = `Search the GST M&A portfolio (61 anonymized engagements).

Filters by free-text search (matches code-name, industry, summary, technologies), \`theme\` (e.g. "Healthcare Tech", "Financial Services"; pass "all" to skip), and \`engagement\` (engagement category — "Buy-Side", "Sell-Side", or "all").

Returns up to \`limit\` matches (default 20, max 61) plus the unfiltered count.`;

const FACETS_DESCRIPTION = `List the distinct facet values present in the portfolio dataset.

Returns the deduplicated themes, engagement categories, growth stages, and years across all 61 projects — useful before composing a filtered \`search_portfolio\` query.`;

export function registerPortfolioTools(server: McpServer): void {
  server.registerTool(
    'search_portfolio',
    {
      title: 'Search M&A Portfolio',
      description: SEARCH_DESCRIPTION,
      inputSchema: SearchPortfolioInputSchema,
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
      },
    },
    async ({ search, theme, engagement, limit }) => {
      const matched = filterProjects(PROJECTS, {
        search: search ?? '',
        theme,
        engagement,
      });
      const returned = matched.slice(0, limit);
      const payload = {
        matches: returned,
        totalMatched: matched.length,
        returned: returned.length,
      };
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(payload, null, 2),
          },
        ],
        structuredContent: payload as unknown as Record<string, unknown>,
      };
    }
  );

  server.registerTool(
    'list_portfolio_facets',
    {
      title: 'List Portfolio Facet Values',
      description: FACETS_DESCRIPTION,
      inputSchema: ListPortfolioFacetsInputSchema,
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
      },
    },
    async () => {
      const facets = {
        themes: getUniqueThemes(PROJECTS),
        engagementCategories: getUniqueEngagementCategories(PROJECTS),
        growthStages: getUniqueGrowthStages(PROJECTS),
        years: getUniqueYears(PROJECTS),
      };
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(facets, null, 2),
          },
        ],
        structuredContent: facets as unknown as Record<string, unknown>,
      };
    }
  );
}
