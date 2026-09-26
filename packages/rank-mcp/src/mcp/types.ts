/** MCP server types. */

import type { Capability, CapabilityRegistry } from "../../../rank-core/src/capabilities/index.ts";

/** One JSON Schema property in a tool input schema. */
export interface RankToolPropertySchema {
  /** JSON Schema type name(s). Omitted when any JSON value is accepted. */
  type?: string | string[];
  description: string;
}

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

export interface ToolImplementation {
  definition: RankToolDefinition;
  run(args: Record<string, unknown>, context: ToolImplementationContext): Promise<string> | string;
}

export interface ToolBuildInput {
  registry: CapabilityRegistry;
  root: string;
}

export type { Capability, CapabilityRegistry };
