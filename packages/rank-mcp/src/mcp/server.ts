/**
 * Register Rank tools on an MCP server.
 *
 * Tool names come from the shared capability registry, and every advertised tool
 * is also implemented here, so an unimplemented tool is impossible to expose.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { loadWorkspace, asRegistry, resolveRepoRoot } from "../../../rank-core/src/workspace/index.ts";
import { toolDefinitions } from "./helpers/tool-definitions.ts";
import { TOOLS, toolByName } from "./tools.ts";
import type { ToolImplementationContext } from "./types.ts";

const SERVER_NAME = "rank";
const SERVER_VERSION = "0.1.0";

/** Build the server with its context, without starting transport. */
export function createServer(context: ToolImplementationContext): Server {
  const registry = asRegistry(loadWorkspace(context.root));
  const advertised = toolDefinitions(registry);
  const implemented = new Set(TOOLS.map((tool) => tool.definition.name));
  const missing = advertised.filter((definition) => !implemented.has(definition.name));

  const server = new Server(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: advertised.map((definition) => ({
      name: definition.name,
      description: definition.description,
      inputSchema: definition.inputSchema,
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const name = request.params.name;
    const tool = toolByName(name);
    if (!tool) {
      return {
        isError: true,
        content: [
          {
            type: "text" as const,
            text: `Unknown tool: ${name}. Advertised tools: ${advertised.map((d) => d.name).join(", ")}`,
          },
        ],
      };
    }
    try {
      const text = await tool.run((request.params.arguments ?? {}) as Record<string, unknown>, context);
      return { content: [{ type: "text" as const, text }] };
    } catch (error) {
      return {
        isError: true,
        content: [{ type: "text" as const, text: `${name} failed: ${(error as Error).message}` }],
      };
    }
  });

  if (missing.length > 0) {
    // Surfaced at startup rather than silently advertised and then failing.
    console.error(
      `rank-mcp: registry declares tools with no implementation: ${missing.map((d) => d.name).join(", ")}`,
    );
  }

  return server;
}

/** Start the server on stdio. */
export async function startServer(root: string = resolveRepoRoot()): Promise<void> {
  const server = createServer({ root, processEnv: process.env });
  await server.connect(new StdioServerTransport());
}
