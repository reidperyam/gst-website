import { McpServer } from '@modelcontextprotocol/server';
import { registerDiligenceTool } from './tools/diligence';
import { registerPortfolioTools } from './tools/portfolio';
import { registerIcgTool } from './tools/icg';
import { registerTechparTool } from './tools/techpar';
import { registerTechDebtTool } from './tools/tech-debt';

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'gst-mcp',
    version: '0.1.0',
  });

  registerDiligenceTool(server);
  registerPortfolioTools(server);
  registerIcgTool(server);
  registerTechparTool(server);
  registerTechDebtTool(server);

  return server;
}
