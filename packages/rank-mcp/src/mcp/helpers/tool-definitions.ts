/**
 * Turn capability registry entries into MCP tool definitions.
 *
 * Pure: the tool list is derived from the registry, so the server cannot
 * advertise a capability that is not cataloged — including planned surfaces,
 * which are listed with their recorded status rather than hidden.
 */
import type { Capability, CapabilityRegistry } from "../../../../rank-core/src/capabilities/index.ts";
import { EVALUATE_PROSPECT_INPUT_SCHEMA } from "../tools.ts";
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
  if (capability.id === "prospect.evaluate") {
    return {
      name: tool,
      description: capability.summary,
      capabilityId: capability.id,
      inputSchema: EVALUATE_PROSPECT_INPUT_SCHEMA,
    };
  }
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
