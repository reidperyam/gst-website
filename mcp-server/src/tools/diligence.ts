/**
 * MCP tool: generate_diligence_agenda
 *
 * Wraps the website's pure `generateScript` engine — same inputs, same
 * outputs, no browser round-trip. Input validation is handled by the SDK
 * via `UserInputsSchema`; on failure the SDK returns a protocol-level
 * error before the handler runs.
 */

import type { McpServer } from '@modelcontextprotocol/server';
import { generateScript } from '../../../src/utils/diligence-engine';
import { UserInputsSchema } from '../schemas';

const TOOL_DESCRIPTION = `Generate a prescriptive due-diligence "Inquisitor's Script" for a target M&A or investment opportunity.

Given a 13-field profile of the deal (transaction type, product type, tech archetype, company size/age/stage/revenue/geography, business model, scale intensity, transformation state, data sensitivity, operating model), returns a structured agenda containing:

- Topic-grouped diligence questions (architecture, operations, carve-out, security/risk) — already balanced and priority-sorted.
- Attention-area summaries flagged for the deal profile.
- A trigger map showing which input dimensions caused which questions to surface.
- Aggregate metadata (totalQuestions, generatedAt timestamp, an inputSummary echo).

This is the same engine that powers https://globalstrategic.tech/hub/tools/diligence-machine — calling it via MCP eliminates the browser round-trip.`;

export function registerDiligenceTool(server: McpServer): void {
  server.registerTool(
    'generate_diligence_agenda',
    {
      title: 'Generate Diligence Agenda',
      description: TOOL_DESCRIPTION,
      inputSchema: UserInputsSchema,
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
      },
    },
    async (inputs) => {
      try {
        const result = generateScript(inputs);
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
          content: [{ type: 'text', text: `Failed to generate diligence agenda: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
