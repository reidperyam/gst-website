import { McpServer } from '@modelcontextprotocol/server';
import { registerDiligenceTool } from './tools/diligence';
import { registerPortfolioTools } from './tools/portfolio';

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'gst-mcp',
    version: '0.1.0',
  });

  registerDiligenceTool(server);
  registerPortfolioTools(server);

  return server;
}
