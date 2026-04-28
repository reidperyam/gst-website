/**
 * MCP tool: estimate_tech_debt_cost
 *
 * Wraps the website's pure Tech Debt engine via `calculateFromRawInputs` —
 * the slider-position helpers stay on the website side so agents pass raw
 * business values directly.
 */

import type { McpServer } from '@modelcontextprotocol/server';
import { calculateFromRawInputs } from '../../../src/utils/tech-debt-engine';
import { TechDebtInputsSchema } from '../schemas';

const TOOL_DESCRIPTION = `Estimate the carrying cost of accumulated technical debt for a target organization.

Given raw business values (team size, average salary, maintenance burden %, deployment frequency, incidents/month, MTTR hours, remediation budget, ARR, planned remediation efficiency, and whether to model context-switch overhead), returns:

- \`annualCost\` and \`totalMonthly\` — total monthly + annualized debt-carrying cost
- \`directMonthly\`, \`contextSwitchMonthly\`, \`incidentMonthly\` — cost decomposition
- \`hoursLostPerEng\` — weekly engineering hours lost to maintenance
- \`debtPctArr\` — debt cost as a percentage of ARR
- \`paybackMonths\` — remediation budget payback at the configured efficiency
- \`doraLabel\` and DORA velocity multiplier (V) — derived from deployment frequency

The MCP tool accepts raw values directly. The website's slider-position helpers (\`posToTeamSize\`, \`posToSalary\`, \`posTobudget\`, \`posToArr\`) are deliberately bypassed — sliders are a UI concern with no place in an agent-facing schema.`;

export function registerTechDebtTool(server: McpServer): void {
  server.registerTool(
    'estimate_tech_debt_cost',
    {
      title: 'Estimate Tech Debt Cost',
      description: TOOL_DESCRIPTION,
      inputSchema: TechDebtInputsSchema,
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
      },
    },
    async (inputs) => {
      try {
        const result = calculateFromRawInputs(inputs);
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
          content: [{ type: 'text', text: `Failed to estimate tech-debt cost: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
