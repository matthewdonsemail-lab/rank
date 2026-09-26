/**
 * Turn capability registry entries into MCP tool definitions.
 *
 * Pure: the tool list is derived from the registry, so the server cannot
 * advertise a capability the CLI and HTTP surfaces do not also expose.
 */
import type { Capability, CapabilityRegistry } from "../../../../rank-core/src/capabilities/index.ts";
import type { RankToolDefinition } from "../types.ts";

const NO_ARGUMENTS = {
  type: "object" as const,
  properties: {} as Record<string, { type: string; description: string }>,
  additionalProperties: false as const,
};

/** Build the advertised tool definition for one capability. */
export function toolDefinitionFor(capability: Capability): RankToolDefinition | null {
  const tool = capability.surfaces.mcp?.tool;
  if (!tool) return null;
  return {
    name: tool,
    description: capability.summary,
    capabilityId: capability.id,
    inputSchema: NO_ARGUMENTS,
  };
}

/** Build every tool definition, in registry order. */
export function toolDefinitions(registry: CapabilityRegistry): RankToolDefinition[] {
  return registry.capabilities
    .map(toolDefinitionFor)
    .filter((definition): definition is RankToolDefinition => definition !== null);
}
