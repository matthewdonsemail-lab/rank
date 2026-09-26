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
import { evaluateProspect } from "../../../rank-core/src/prospect/index.ts";
import type {
  EvaluateProspectOptions,
  EvaluateProspectResult,
  ProspectEvaluationRun,
} from "../../../rank-core/src/prospect/index.ts";
import type { RankToolDefinition, ToolImplementation } from "./types.ts";

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

/**
 * Input schema for `rank_evaluate_prospect`.
 *
 * Transport only: the required `url` plus the optional prospect fields from
 * docs/contracts/prospect-evaluate.md. No other params. Validation, auth
 * plumbing, and the Convex call live in the shared `evaluateProspect`
 * operation; unknown fields are rejected there, not stripped here.
 */
export const EVALUATE_PROSPECT_INPUT_SCHEMA: RankToolDefinition["inputSchema"] = {
  type: "object",
  properties: {
    url: { type: "string", description: "Prospect URL to evaluate. Must normalize via normalizeCrawlUrl." },
    title: { type: ["string", "null"], description: "Prospect title, if known." },
    description: { type: ["string", "null"], description: "Prospect description, if known." },
    sourceDomain: { type: ["string", "null"], description: "Domain that surfaced the prospect, if known." },
    anchorText: { type: ["string", "null"], description: "Link anchor text, if known." },
    targetDomain: { type: ["string", "null"], description: "Brand domain the prospect is judged against, if known." },
    fitRationale: { type: ["string", "null"], description: "Why the prospect may fit, if known." },
    brandSummary: { type: ["string", "null"], description: "Brand summary the prospect is judged against, if known." },
    content: { type: ["string", "null"], description: "Prospect page content excerpt, if known." },
    metrics: { description: "Opaque caller-supplied metrics (any JSON value)." },
    sourceDiscoveryRunId: {
      type: "string",
      description: "Completed discovery run this evaluation builds on. Must be owned by the caller.",
    },
  },
  required: ["url"],
  additionalProperties: false,
};

/** Render the persisted run: judgment and rerank/homepage provenance, no owner. */
function renderEvaluationRun(run: ProspectEvaluationRun): string {
  const lines = [`Prospect evaluation ${run.runId} — ${run.state}`, `url: ${run.url}`];
  if (run.sourceDiscoveryRunId !== null && run.sourceDiscoveryRunId !== undefined) {
    lines.push(`sourceDiscoveryRunId: ${run.sourceDiscoveryRunId}`);
  }
  const judgment = run.context.judgment;
  if (!judgment) {
    lines.push("judgment: none yet");
  } else {
    lines.push(`judgment: ${judgment.action} (confidence ${judgment.confidence})`);
    const scores: string[] = [];
    if (judgment.fitScore !== null && judgment.fitScore !== undefined) scores.push(`fitScore=${judgment.fitScore}`);
    if (judgment.fitConfidence !== null && judgment.fitConfidence !== undefined) {
      scores.push(`fitConfidence=${judgment.fitConfidence}`);
    }
    if (judgment.spamProbability !== null && judgment.spamProbability !== undefined) {
      scores.push(`spamProbability=${judgment.spamProbability}`);
    }
    if (scores.length > 0) lines.push(`scores: ${scores.join(", ")}`);
    if (judgment.model) lines.push(`model: ${judgment.model}`);
    if (judgment.route) lines.push(`route: ${judgment.route}`);
    if (judgment.reasons.length > 0) lines.push(`reasons: ${judgment.reasons.join("; ")}`);
  }
  const metrics = run.context.prospect.metrics;
  if (typeof metrics === "object" && metrics !== null) {
    const record = metrics as Record<string, unknown>;
    if ("rerankStatus" in record || "homepageRead" in record) {
      lines.push(
        `provenance: rerankStatus=${String(record["rerankStatus"] ?? "unknown")}, homepageRead=${String(record["homepageRead"] ?? "unknown")}`,
      );
    }
  }
  if (metrics !== undefined) lines.push(`metrics: ${JSON.stringify(metrics)}`);
  if (run.context.error) lines.push(`error: ${run.context.error}`);
  return lines.join("\n");
}

/**
 * Build the `rank_evaluate_prospect` tool.
 *
 * The operation is injectable so tests can stub it; production uses the shared
 * `evaluateProspect` operation with the default Convex transport. The handler
 * never throws and never mints identities: missing env names its variable,
 * and backend failures carry the operation's error kind and message.
 */
export function createEvaluateProspectTool(
  evaluate: (prospect: unknown, options?: EvaluateProspectOptions) => Promise<EvaluateProspectResult> =
    evaluateProspect,
): ToolImplementation {
  return {
    definition: {
      name: "rank_evaluate_prospect",
      description: "Judge one prospect against the brand and save a human-reviewable result. No outreach.",
      capabilityId: "prospect.evaluate",
      inputSchema: EVALUATE_PROSPECT_INPUT_SCHEMA,
    },
    run: async (args, context) => {
      // MCP has no flags: both values come from env. They are passed
      // explicitly so the tool stays pure with respect to globals.
      const deploymentUrl = context.processEnv["CONVEX_URL"];
      if (!deploymentUrl) {
        return "rank_evaluate_prospect misconfigured: set CONVEX_URL to the Convex deployment URL.";
      }
      const authToken = context.processEnv["RANK_AUTH_TOKEN"];
      if (!authToken) {
        return "rank_evaluate_prospect misconfigured: set RANK_AUTH_TOKEN to a Clerk session token. Local tooling never mints identities.";
      }
      if (typeof args !== "object" || args === null) {
        return "rank_evaluate_prospect failed [input]: prospect must be an object with a url";
      }
      const { sourceDiscoveryRunId, ...prospect } = args;
      const options: EvaluateProspectOptions = { deploymentUrl, authToken };
      if (sourceDiscoveryRunId !== undefined) {
        options.sourceDiscoveryRunId = sourceDiscoveryRunId as string;
      }
      try {
        const result = await evaluate(prospect, options);
        if (!result.ok) {
          return `rank_evaluate_prospect failed [${result.error.kind}]: ${result.error.message}`;
        }
        return renderEvaluationRun(result.run);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return `rank_evaluate_prospect failed [transport]: ${message}`;
      }
    },
  };
}

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
  createEvaluateProspectTool(),
];

export function toolByName(name: string): ToolImplementation | undefined {
  return TOOLS.find((tool) => tool.definition.name === name);
}
