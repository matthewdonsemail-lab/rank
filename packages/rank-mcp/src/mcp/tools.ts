/**
 * Tool implementations, one per registry capability.
 *
 * Each returns text and never throws across the protocol boundary: a failure
 * becomes a readable message the caller can act on, not a transport error.
 *
 * The repository root arrives through the call context on every invocation
 * rather than through module state, so tools stay pure with respect to globals
 * and can be called directly in tests.
 */
import { renderRegistry } from "../../../rank-core/src/capabilities/index.ts";
import { buildReport, renderManifest, renderReport, resolveEnv } from "../../../rank-core/src/env/index.ts";
import { asManifest, asRegistry, loadWorkspace } from "../../../rank-core/src/workspace/index.ts";
import type { ToolImplementation } from "./types.ts";

/** Preflight using only local sources: the MCP server does not shell out. */
function doctor(root: string, processEnv: Record<string, string | undefined>): string {
  const workspace = loadWorkspace(root);
  const manifest = asManifest(workspace);
  const report = buildReport(resolveEnv(manifest, { process: processEnv, file: workspace.envFile }));
  return renderReport(manifest, report);
}

function describeEnvironment(root: string): string {
  return renderManifest(asManifest(loadWorkspace(root)));
}

function listCapabilities(root: string): string {
  return renderRegistry(asRegistry(loadWorkspace(root)));
}

const NO_ARGUMENTS = { type: "object", properties: {}, additionalProperties: false } as const;

export const TOOLS: ToolImplementation[] = [
  {
    definition: {
      name: "rank_doctor",
      description: "Resolve every environment variable Rank reads and report what is missing per pipeline stage.",
      capabilityId: "env.doctor",
      inputSchema: NO_ARGUMENTS,
    },
    run: (_args, context) => doctor(context.root, context.processEnv),
  },
  {
    definition: {
      name: "rank_describe_environment",
      description: "List every environment variable Rank reads, who consumes it, and what breaks without it.",
      capabilityId: "env.describe",
      inputSchema: NO_ARGUMENTS,
    },
    run: (_args, context) => describeEnvironment(context.root),
  },
  {
    definition: {
      name: "rank_list_capabilities",
      description: "List every capability and the CLI command, MCP tool, and HTTP route that expose it.",
      capabilityId: "capabilities.list",
      inputSchema: NO_ARGUMENTS,
    },
    run: (_args, context) => listCapabilities(context.root),
  },
];

export function toolByName(name: string): ToolImplementation | undefined {
  return TOOLS.find((tool) => tool.definition.name === name);
}
