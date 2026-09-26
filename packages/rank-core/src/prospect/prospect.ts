/** prospect.evaluate shared operation.
 *
 * The single place that knows how to run a prospect evaluation. Adapters (CLI
 * flags, MCP tool schemas, HTTP routes) translate transport only and call this;
 * validation, auth plumbing, the Convex call, and the stable result shape live
 * here, so the three surfaces cannot disagree about what the operation does.
 */
import { ConvexHttpClient } from "convex/browser";
import { ConvexError } from "convex/values";
import { validateDiscoveryRunId, validateProspectInput } from "./helpers/index.ts";
import type {
  ConvexActionCaller,
  EvaluateProspectOptions,
  EvaluateProspectResult,
  ProspectEvaluationRun,
  ProspectEvaluationState,
} from "./types.ts";

const ACTION_PATH = "prospectEvaluation:startProspectEvaluation";

const RUN_STATES: ReadonlySet<string> = new Set(["idle", "evaluating", "completed", "failed", "cancelled"]);

const defaultCaller: ConvexActionCaller = async (deploymentUrl, authToken, path, args) => {
  const client = new ConvexHttpClient(deploymentUrl);
  client.setAuth(authToken);
  // Generated api entries are these same path strings; rank-core must not
  // depend on the app's generated code, so the literal path is cast.
  return client.action(path as never, args as never);
};

function isRunShape(value: unknown): value is ProspectEvaluationRun {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  if (typeof record["runId"] !== "string") return false;
  if (typeof record["state"] !== "string" || !RUN_STATES.has(record["state"] as string)) return false;
  if (typeof record["context"] !== "object" || record["context"] === null) return false;
  return true;
}

function convexMessage(error: unknown): string {
  if (error instanceof ConvexError) return String(error.data ?? error.message);
  if (error instanceof Error) return error.message;
  return String(error);
}

/**
 * Run one prospect evaluation against the linked deployment.
 *
 * Returns a stable `{ ok, run } | { ok: false, error }` shape in every case,
 * so adapters never have to interpret transport details. Throws nothing.
 */
export async function evaluateProspect(
  prospect: unknown,
  options: EvaluateProspectOptions = {},
): Promise<EvaluateProspectResult> {
  const validated = validateProspectInput(prospect);
  if (!validated.ok) {
    return { ok: false, error: { kind: "input", message: validated.issues.join("; ") } };
  }
  const discoveryIssue = validateDiscoveryRunId(options.sourceDiscoveryRunId);
  if (discoveryIssue) {
    return { ok: false, error: { kind: "input", message: discoveryIssue } };
  }

  const deploymentUrl = options.deploymentUrl ?? process.env["CONVEX_URL"];
  if (!deploymentUrl) {
    return {
      ok: false,
      error: {
        kind: "config",
        message: "No Convex deployment URL. Pass deploymentUrl or set CONVEX_URL.",
      },
    };
  }
  const authToken = options.authToken ?? process.env["RANK_AUTH_TOKEN"];
  if (!authToken) {
    return {
      ok: false,
      error: {
        kind: "config",
        message:
          "No Clerk session token. Pass authToken or set RANK_AUTH_TOKEN. Local tooling never mints identities.",
      },
    };
  }

  const caller = options.caller ?? defaultCaller;
  const args: Record<string, unknown> = { prospect: validated.input };
  if (options.sourceDiscoveryRunId !== undefined) {
    args["sourceDiscoveryRunId"] = options.sourceDiscoveryRunId;
  }

  let raw: unknown;
  try {
    raw = await caller(deploymentUrl, authToken, ACTION_PATH, args);
  } catch (error) {
    if (error instanceof ConvexError && /authentication required/i.test(convexMessage(error))) {
      return { ok: false, error: { kind: "auth", message: "Convex rejected the session token" } };
    }
    if (error instanceof ConvexError) {
      return { ok: false, error: { kind: "operation", message: convexMessage(error) } };
    }
    return { ok: false, error: { kind: "transport", message: convexMessage(error) } };
  }

  if (!isRunShape(raw)) {
    return { ok: false, error: { kind: "transport", message: "Deployment returned an unexpected run shape" } };
  }
  return {
    ok: true,
    run: { ...raw, state: raw.state as ProspectEvaluationState },
  };
}
