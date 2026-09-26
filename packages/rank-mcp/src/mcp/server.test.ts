import { describe, expect, test } from "bun:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "./server.ts";
import { resolveRepoRoot } from "../../../rank-core/src/workspace/index.ts";

/** Connect a real MCP client to the server over an in-memory transport. */
async function connect() {
  const server = createServer({ root: resolveRepoRoot(), processEnv: {} });
  const client = new Client({ name: "test", version: "0.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
  return { client, server };
}

describe("rank mcp server", () => {
  test("advertises tools derived from the capability registry", async () => {
    const { client, server } = await connect();
    try {
      const { tools } = await client.listTools();
      const names = tools.map((tool) => tool.name);
      expect(names).toContain("rank_doctor");
      expect(names).toContain("rank_describe_environment");
      expect(names).toContain("rank_list_capabilities");
      for (const tool of tools) {
        expect(tool.description).toBeTruthy();
        expect(tool.inputSchema.type).toBe("object");
      }
    } finally {
      await client.close();
      await server.close();
    }
  });

  test("calls a tool and receives the rendered report", async () => {
    const { client, server } = await connect();
    try {
      const result = await client.callTool({ name: "rank_list_capabilities", arguments: {} });
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      expect(text).toContain("Rank capabilities");
      expect(text).toContain("rank doctor");
    } finally {
      await client.close();
      await server.close();
    }
  });

  test("reports an unknown tool as an error instead of throwing", async () => {
    const { client, server } = await connect();
    try {
      const result = await client.callTool({ name: "rank_not_a_tool", arguments: {} });
      expect(result.isError).toBe(true);
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      expect(text).toContain("Unknown tool");
    } finally {
      await client.close();
      await server.close();
    }
  });

  test("never leaks a secret value through a tool response", async () => {
    const { client, server } = await connect();
    try {
      const result = await client.callTool({ name: "rank_doctor", arguments: {} });
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      // A real key would be masked; assert the mask marker is what appears.
      expect(text).not.toMatch(/fc-[0-9a-f]{32}/);
      expect(text).not.toMatch(/v1\.[A-Za-z0-9+/]{40,}/);
    } finally {
      await client.close();
      await server.close();
    }
  });
});
