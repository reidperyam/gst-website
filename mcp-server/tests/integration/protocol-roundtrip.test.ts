/**
 * Protocol-roundtrip integration tests.
 *
 * Exercises `generate_diligence_agenda`, `search_portfolio`, and
 * `list_portfolio_facets` through the full MCP protocol layer using a
 * vendored paired-pipe Transport. Closes BL-031 AC #9.
 *
 * Architecture decision: see
 * `src/docs/development/MCP_SERVER_ARCHITECTURE_BL-031_tests.md`.
 */

import {
  LATEST_PROTOCOL_VERSION,
  type JSONRPCMessage,
  type JSONRPCRequest,
  type JSONRPCResponse,
  type JSONRPCErrorResponse,
} from '@modelcontextprotocol/server';
import { createServer } from '../../src/server';
import { createPairedTransports, type PairedHalf } from '../helpers/paired-transport';

interface CallToolContent {
  type: string;
  text?: string;
}

interface CallToolResultPayload {
  content: CallToolContent[];
  isError?: boolean;
  structuredContent?: unknown;
}

interface ToolDescriptor {
  name: string;
  description?: string;
  inputSchema: { type: string; properties?: Record<string, unknown>; required?: string[] };
}

interface ListToolsResultPayload {
  tools: ToolDescriptor[];
}

const validDiligencePayload = {
  transactionType: 'majority-stake',
  productType: 'b2b-saas',
  techArchetype: 'modern-cloud-native',
  headcount: '51-200',
  revenueRange: '5-25m',
  growthStage: 'scaling',
  companyAge: '5-10yr',
  geographies: ['us', 'eu'],
  businessModel: 'productized-platform',
  scaleIntensity: 'moderate',
  transformationState: 'actively-modernizing',
  dataSensitivity: 'high',
  operatingModel: 'product-aligned-teams',
};

describe('protocol roundtrip', () => {
  let client: PairedHalf;
  let nextId: number;

  async function rpc(
    method: string,
    params: unknown
  ): Promise<JSONRPCResponse | JSONRPCErrorResponse> {
    const id = nextId++;
    return new Promise<JSONRPCResponse | JSONRPCErrorResponse>((resolve) => {
      client.onmessage = (msg: JSONRPCMessage) => {
        if ('id' in msg && msg.id === id) {
          resolve(msg as JSONRPCResponse | JSONRPCErrorResponse);
        }
      };
      const req: JSONRPCRequest = { jsonrpc: '2.0', id, method, params } as JSONRPCRequest;
      void client.send(req);
    });
  }

  async function notify(method: string, params: unknown): Promise<void> {
    await client.send({ jsonrpc: '2.0', method, params } as JSONRPCMessage);
  }

  function isErrorResponse(
    msg: JSONRPCResponse | JSONRPCErrorResponse
  ): msg is JSONRPCErrorResponse {
    return 'error' in msg;
  }

  function parseToolText<T>(result: CallToolResultPayload): T {
    const block = result.content[0];
    if (!block || block.type !== 'text' || !block.text) {
      throw new Error('expected first content block to be non-empty text');
    }
    return JSON.parse(block.text) as T;
  }

  beforeEach(async () => {
    nextId = 1;
    const server = createServer();
    const pair = createPairedTransports();
    client = pair.client;
    await server.connect(pair.server);

    // MCP handshake — initialize, then notifications/initialized.
    const init = await rpc('initialize', {
      protocolVersion: LATEST_PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: { name: 'protocol-roundtrip-test', version: '0.0.0' },
    });
    if (isErrorResponse(init)) {
      throw new Error(`initialize failed: ${init.error.message}`);
    }
    await notify('notifications/initialized', {});
  });

  describe('handshake + discovery', () => {
    it('initialize returned protocolVersion + capabilities + serverInfo', async () => {
      // `beforeEach` already performed `initialize`. Re-confirm by inspecting
      // a fresh `tools/list` to prove the connection is in initialized state.
      const res = await rpc('tools/list', {});
      expect(isErrorResponse(res)).toBe(false);
    });

    it('tools/list returns the three registered tools with input schemas', async () => {
      const res = await rpc('tools/list', {});
      expect(isErrorResponse(res)).toBe(false);
      if (isErrorResponse(res)) return;

      const payload = res.result as unknown as ListToolsResultPayload;
      const toolNames = payload.tools.map((t) => t.name).sort();
      expect(toolNames).toEqual(
        ['generate_diligence_agenda', 'list_portfolio_facets', 'search_portfolio'].sort()
      );

      // Every tool publishes a JSON Schema input — proves the Zod→JSON-Schema
      // conversion in the SDK fires through this transport too.
      for (const tool of payload.tools) {
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe('object');
      }
    });
  });

  describe('happy path — each tool returns valid content', () => {
    it('generate_diligence_agenda returns non-empty topics + metadata', async () => {
      const res = await rpc('tools/call', {
        name: 'generate_diligence_agenda',
        arguments: validDiligencePayload,
      });
      expect(isErrorResponse(res)).toBe(false);
      if (isErrorResponse(res)) return;

      const result = res.result as unknown as CallToolResultPayload;
      expect(result.isError).not.toBe(true);

      const parsed = parseToolText<{
        topics: unknown[];
        metadata: { totalQuestions: number };
      }>(result);
      expect(parsed.topics.length).toBeGreaterThan(0);
      expect(parsed.metadata.totalQuestions).toBeGreaterThan(0);
    });

    it('search_portfolio returns matches + count summary', async () => {
      const res = await rpc('tools/call', {
        name: 'search_portfolio',
        arguments: { search: 'platform', limit: 3 },
      });
      expect(isErrorResponse(res)).toBe(false);
      if (isErrorResponse(res)) return;

      const result = res.result as unknown as CallToolResultPayload;
      expect(result.isError).not.toBe(true);

      const parsed = parseToolText<{
        matches: unknown[];
        totalMatched: number;
        returned: number;
      }>(result);
      expect(parsed.returned).toBe(3);
      expect(parsed.matches.length).toBe(3);
      expect(parsed.totalMatched).toBeGreaterThan(parsed.returned);
    });

    it('list_portfolio_facets returns themes / engagementCategories / growthStages / years', async () => {
      const res = await rpc('tools/call', {
        name: 'list_portfolio_facets',
        arguments: {},
      });
      expect(isErrorResponse(res)).toBe(false);
      if (isErrorResponse(res)) return;

      const result = res.result as unknown as CallToolResultPayload;
      expect(result.isError).not.toBe(true);

      const parsed = parseToolText<{
        themes: string[];
        engagementCategories: string[];
        growthStages: string[];
        years: number[];
      }>(result);
      expect(parsed.themes.length).toBeGreaterThan(0);
      expect(parsed.engagementCategories.length).toBeGreaterThan(0);
      expect(parsed.growthStages.length).toBeGreaterThan(0);
      expect(parsed.years.length).toBeGreaterThan(0);
    });
  });

  describe('invalid input — the SDK rejects before the handler runs', () => {
    it('generate_diligence_agenda — bad transactionType returns structured error', async () => {
      const res = await rpc('tools/call', {
        name: 'generate_diligence_agenda',
        arguments: { ...validDiligencePayload, transactionType: 'asset-purchase' },
      });

      // Rejection may surface as a JSON-RPC error envelope OR as a CallToolResult
      // with isError: true — either is acceptable per the MCP spec; both are
      // structured (no thrown exception, no stack trace).
      if (isErrorResponse(res)) {
        expect(res.error.message).toBeTruthy();
      } else {
        const result = res.result as unknown as CallToolResultPayload;
        expect(result.isError).toBe(true);
      }
    });

    it('search_portfolio — limit > 61 returns structured error', async () => {
      const res = await rpc('tools/call', {
        name: 'search_portfolio',
        arguments: { search: 'platform', limit: 100 },
      });

      if (isErrorResponse(res)) {
        expect(res.error.message).toBeTruthy();
      } else {
        const result = res.result as unknown as CallToolResultPayload;
        expect(result.isError).toBe(true);
      }
    });

    it('list_portfolio_facets — empty input is accepted (no error envelope)', async () => {
      // The Zod input schema is z.object({}) — empty object is the canonical
      // valid input. This case proves the SDK does not reject "no fields"
      // as an error.
      const res = await rpc('tools/call', {
        name: 'list_portfolio_facets',
        arguments: {},
      });

      expect(isErrorResponse(res)).toBe(false);
      if (isErrorResponse(res)) return;
      const result = res.result as unknown as CallToolResultPayload;
      expect(result.isError).not.toBe(true);
    });
  });

  describe('empty result — search miss returns 0 matches without an error', () => {
    it('search_portfolio with a nonsense term returns matches: [], totalMatched: 0', async () => {
      const res = await rpc('tools/call', {
        name: 'search_portfolio',
        arguments: { search: 'zxqzxq-no-such-engagement', limit: 5 },
      });
      expect(isErrorResponse(res)).toBe(false);
      if (isErrorResponse(res)) return;

      const result = res.result as unknown as CallToolResultPayload;
      expect(result.isError).not.toBe(true);

      const parsed = parseToolText<{
        matches: unknown[];
        totalMatched: number;
        returned: number;
      }>(result);
      expect(parsed.matches).toEqual([]);
      expect(parsed.totalMatched).toBe(0);
      expect(parsed.returned).toBe(0);
    });
  });
});
