import { describe, expect, test } from "bun:test";
import { toolDefinitionFor, toolDefinitions } from "./helpers/tool-definitions.ts";
import { TOOLS, toolByName } from "./tools.ts";
import type { CapabilityRegistry } from "../../../rank-core/src/capabilities/index.ts";

const registry: CapabilityRegistry = {
  description: "test",
  capabilities: [
    {
      id: "env.doctor",
      title: "Environment preflight",
      summary: "Check the environment",
      stage: "local tooling",
      mutating: false,
      requiresEnv: [],
      surfaces: { cli: { command: "doctor" }, mcp: { tool: "rank_doctor" } },
    },
    {
      id: "no.mcp",
      title: "CLI only",
      summary: "Has no MCP surface",
      stage: "local tooling",
      mutating: false,
      requiresEnv: [],
      surfaces: { cli: { command: "other" } },
    },
  ],
};

describe("toolDefinitions", () => {
  test("derives one tool per capability that declares an MCP surface", () => {
    const definitions = toolDefinitions(registry);
    expect(definitions).toHaveLength(1);
    expect(definitions[0].name).toBe("rank_doctor");
    expect(definitions[0].capabilityId).toBe("env.doctor");
  });

  test("returns null for a capability with no MCP surface", () => {
    expect(toolDefinitionFor(registry.capabilities[1])).toBeNull();
  });

  test("advertises a closed, argument-free schema", () => {
    const [definition] = toolDefinitions(registry);
    expect(definition.inputSchema.type).toBe("object");
    expect(definition.inputSchema.additionalProperties).toBe(false);
    expect(Object.keys(definition.inputSchema.properties)).toHaveLength(0);
  });
});

describe("tools", () => {
  test("implements every tool the real registry advertises", async () => {
    const { asRegistry, loadWorkspace, resolveRepoRoot } = await import(
      "../../../rank-core/src/workspace/index.ts"
    );
    const real = asRegistry(loadWorkspace(resolveRepoRoot()));
    const advertised = toolDefinitions(real).map((definition) => definition.name);
    for (const name of advertised) {
      expect(toolByName(name)).toBeDefined();
    }
  });

  test("every implemented tool traces back to a registry capability", async () => {
    const { asRegistry, loadWorkspace, resolveRepoRoot } = await import(
      "../../../rank-core/src/workspace/index.ts"
    );
    const real = asRegistry(loadWorkspace(resolveRepoRoot()));
    const known = new Set(real.capabilities.map((capability) => capability.id));
    for (const tool of TOOLS) {
      expect(known.has(tool.definition.capabilityId)).toBe(true);
    }
  });

  test("tool names are unique", () => {
    const names = TOOLS.map((tool) => tool.definition.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
