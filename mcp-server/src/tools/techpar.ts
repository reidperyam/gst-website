/**
 * MCP tool: compute_techpar
 *
 * Wraps the website's pure TechPar calculation engine. Computes blended
 * tech cost ratio, zone classification, per-category KPIs, and the
 * 36-month gap projection for a company's tech-spend posture.
 */

import type { McpServer } from '@modelcontextprotocol/server';
import { compute } from '../../../src/utils/techpar-engine';
import { TechParInputsSchema } from '../schemas';

const TOOL_DESCRIPTION = `Compute TechPar — a benchmark of a target company's technology cost ratio against stage-specific peer ranges.

Given a 14-field input (ARR, growth stage, mode, capex view, growth rate, exit multiple, infra hosting/personnel, R&D OpEx/CapEx, engineering FTEs, and per-category cost breakdown), returns:

- \`totalTechPct\` — blended technology cost as a percentage of revenue
- \`zone\` — one of underinvest / ahead / healthy / above / elevated / critical
- Per-category KPIs with benchmark ranges and zone classifications
- 36-month gap projection (cumulative excess or underinvestment)
- Stage configuration metadata

\`infraHosting\` and \`arr\` must both be > 0 (the engine returns null otherwise — surfaced here as an error). Same engine as https://globalstrategic.tech/hub/tools/techpar.`;

export function registerTechparTool(server: McpServer): void {
  server.registerTool(
    'compute_techpar',
    {
      title: 'Compute TechPar Benchmark',
      description: TOOL_DESCRIPTION,
      inputSchema: TechParInputsSchema,
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
      },
    },
    async (inputs) => {
      try {
        const result = compute(inputs);
        if (result === null) {
          return {
            content: [
              {
                type: 'text',
                text: 'TechPar requires both `arr` and `infraHosting` to be greater than zero.',
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
          structuredContent: result as unknown as Record<string, unknown>,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: 'text', text: `Failed to compute TechPar: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
