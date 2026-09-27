/** MCP server types. */

import type { Capability, CapabilityRegistry } from "../../../rank-core/src/capabilities/index.ts";

/**
 * One JSON Schema property in a tool input schema.
 *
 * Declared as a `type` alias rather than an `interface` on purpose: the MCP
 * SDK v2 wire types constrain `properties` with an index signature, and only
 * object-literal types (not interfaces) receive an implicit index signature.
 * An interface with this exact shape fails assignability to the spec `Tool`.
 */
export type RankToolPropertySchema = {
  /** JSON Schema type name(s). Omitted when any JSON value is accepted. */
  type?: string | string[];
  description: string;
};

/** A tool as advertised to an MCP client. */
export interface RankToolDefinition {
  name: string;
  description: string;
  /** Capability this tool exposes, for traceability back to the registry. */
  capabilityId: string;
  inputSchema: {
    type: "object";
    properties: Record<string, RankToolPropertySchema>;
    required?: string[];
    additionalProperties: false;
  };
}

export interface ToolImplementationContext {
  root: string;
  processEnv: Record<string, string | undefined>;
}

/**
 * What a tool run hands back. `text` is the human-readable rendering and is
 * always present; `structured` carries the same result as fields, so an agent
 * never has to scrape prose for run IDs, states, judgments, or scores. Tools
 * whose output is already a report (doctor, describe, capabilities) return a
 * bare string and the server sends text only.
 */
export interface ToolResult {
  text: string;
  structured?: Record<string, unknown>;
}

export interface ToolImplementation {
  definition: RankToolDefinition;
  run(args: Record<string, unknown>, context: ToolImplementationContext): Promise<ToolResult | string> | ToolResult | string;
}

export interface ToolBuildInput {
  registry: CapabilityRegistry;
  root: string;
}

export type { Capability, CapabilityRegistry };
