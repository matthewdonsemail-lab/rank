/**
 * `rank evaluate` — judge one prospect against the brand and save a
 * human-reviewable result.
 *
 * Thin adapter over the shared prospect.evaluate operation: flags in, exit
 * code out. No ranking logic lives here; validation, auth plumbing, the Convex
 * call, and the stable result shape all belong to rank-core, so this surface
 * cannot disagree with the contract in docs/contracts/prospect-evaluate.md.
 */
import { evaluateProspect } from "../../../../rank-core/src/prospect/index.ts";
import type {
  ProspectEvaluateError,
  ProspectEvaluationRun,
} from "../../../../rank-core/src/prospect/index.ts";
import type { Command, CommandContext } from "../types.ts";

export const EVALUATE_USAGE =
  "Usage: rank evaluate --url <url> [--title <text>] [--description <text>] " +
  "[--source-domain <domain>] [--anchor-text <text>] [--target-domain <domain>] " +
  "[--fit-rationale <text>] [--brand-summary <text>] [--content <text>] " +
  "[--metrics <json>] [--discovery-run <id>] " +
  "[--deployment <url>] [--token <tok>] [--json]";

interface EvaluateArgs {
  url?: string;
  title?: string;
  description?: string;
  sourceDomain?: string;
  anchorText?: string;
  targetDomain?: string;
  fitRationale?: string;
  brandSummary?: string;
  content?: string;
  /** Raw --metrics JSON text; parsed at run time so parse errors stay usage errors. */
  metricsJson?: string;
  discoveryRun?: string;
  deployment?: string;
  token?: string;
  json: boolean;
}

export type ParseEvaluateArgsResult =
  | { ok: true; args: EvaluateArgs }
  | { ok: false; error: string };

/** CLI flags that take a value, keyed by flag to arg field. */
const VALUE_FLAGS: Record<string, keyof Omit<EvaluateArgs, "json">> = {
  "--url": "url",
  "--title": "title",
  "--description": "description",
  "--source-domain": "sourceDomain",
  "--anchor-text": "anchorText",
  "--target-domain": "targetDomain",
  "--fit-rationale": "fitRationale",
  "--brand-summary": "brandSummary",
  "--content": "content",
  "--metrics": "metricsJson",
  "--discovery-run": "discoveryRun",
  "--deployment": "deployment",
  "--token": "token",
};

/**
 * Parse raw argv into structured args. Pure: no I/O, no env, no network, so
 * it is unit-testable in isolation. Unknown flags are rejected rather than
 * ignored, mirroring the operation's unknown-field rejection.
 */
export function parseEvaluateArgs(argv: string[]): ParseEvaluateArgsResult {
  const args: EvaluateArgs = { json: false };
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i] as string;
    const [name, inline] = splitFlag(token);
    if (!name.startsWith("--")) {
      return { ok: false, error: `unexpected argument "${token}"` };
    }
    if (name === "--json") {
      if (inline !== undefined) {
        return { ok: false, error: `option "--json" takes no value` };
      }
      args.json = true;
      continue;
    }
    const field = VALUE_FLAGS[name];
    if (field === undefined) {
      return { ok: false, error: `unknown option "${name}"` };
    }
    let value = inline;
    if (value === undefined) {
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) {
        return { ok: false, error: `option "${name}" requires a value` };
      }
      value = next;
      i++;
    }
    args[field] = value;
  }
  if (args.url === undefined) {
    return { ok: false, error: `missing required option "--url"` };
  }
  return { ok: true, args };
}

/** Split "--flag=value" into ["--flag", "value"]; a bare flag has no value. */
function splitFlag(token: string): [string, string | undefined] {
  const eq = token.indexOf("=");
  if (eq === -1 || !token.startsWith("--")) return [token, undefined];
  return [token.slice(0, eq), token.slice(eq + 1)];
}

/** Human-readable rendering: run id, state, and judgment action/confidence. */
export function renderEvaluateHuman(run: ProspectEvaluationRun): string {
  const lines = [`run: ${run.runId}`, `state: ${run.state}`];
  const judgment = run.context.judgment;
  if (judgment) {
    lines.push(`judgment: ${judgment.action} (confidence ${judgment.confidence})`);
  } else if (run.context.error) {
    lines.push(`error: ${run.context.error}`);
  } else {
    lines.push(`judgment: none`);
  }
  return lines.join("\n");
}

/** Machine-readable rendering: the raw run shape. */
export function renderEvaluateJson(run: ProspectEvaluationRun): string {
  return JSON.stringify(run, null, 2);
}

/**
 * Map an operation failure to a process exit code.
 *
 * 1 is usage/input/config: the caller can fix flags, env, or the token and
 * retry. 2 is runtime: the backend or the transport failed. This matches the
 * package fallback (0 ok / 1 usage-input-config / 2 runtime); doctor's own
 * exit mapping lives in the not-yet-present rank-core env domain, so there is
 * no finer convention to follow yet.
 */
export function exitCodeForEvaluateError(error: ProspectEvaluateError): number {
  switch (error.kind) {
    case "input":
    case "config":
    case "auth":
      return 1;
    case "operation":
    case "transport":
      return 2;
  }
}

/**
 * Transport seam for tests. Production always uses the shared operation;
 * tests replace `run` with a stub so no network is touched.
 */
export const evaluateDeps: { run: typeof evaluateProspect } = {
  run: evaluateProspect,
};

const PROSPECT_FIELDS: Array<[keyof Omit<EvaluateArgs, "url" | "metricsJson" | "discoveryRun" | "deployment" | "token" | "json">, string]> = [
  ["title", "title"],
  ["description", "description"],
  ["sourceDomain", "sourceDomain"],
  ["anchorText", "anchorText"],
  ["targetDomain", "targetDomain"],
  ["fitRationale", "fitRationale"],
  ["brandSummary", "brandSummary"],
  ["content", "content"],
];

export async function runEvaluate(context: CommandContext, argv: string[]): Promise<{ code: number }> {
  const parsed = parseEvaluateArgs(argv);
  if (!parsed.ok) {
    context.err(`rank evaluate: ${parsed.error}\n${EVALUATE_USAGE}`);
    return { code: 1 };
  }
  const opts = parsed.args;

  const prospect: Record<string, unknown> = { url: opts.url as string };
  for (const [field, key] of PROSPECT_FIELDS) {
    const value = opts[field];
    if (value !== undefined) prospect[key] = value;
  }
  if (opts.metricsJson !== undefined) {
    try {
      prospect["metrics"] = JSON.parse(opts.metricsJson);
    } catch {
      context.err(`rank evaluate: --metrics must be valid JSON\n${EVALUATE_USAGE}`);
      return { code: 1 };
    }
  }

  // Flags first, then the process environment. Anything still undefined falls
  // through to the operation's own CONVEX_URL / RANK_AUTH_TOKEN lookup, which
  // reads the same environment in production.
  const deploymentUrl = opts.deployment ?? context.processEnv["CONVEX_URL"];
  const authToken = opts.token ?? context.processEnv["RANK_AUTH_TOKEN"];

  // The operation contract says it throws nothing, but a transport seam that
  // lets an exception escape would crash the process with a stack trace. Catch
  // everything here and report it as a transport failure, matching the MCP
  // adapter's boundary behavior.
  let result: Awaited<ReturnType<typeof evaluateDeps.run>>;
  try {
    result = await evaluateDeps.run(prospect, {
      deploymentUrl,
      authToken,
      ...(opts.discoveryRun !== undefined ? { sourceDiscoveryRunId: opts.discoveryRun } : {}),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const failure = { kind: "transport" as const, message };
    if (opts.json) {
      context.err(JSON.stringify({ ok: false, error: failure }, null, 2));
    } else {
      context.err(`rank evaluate failed (transport): ${message}`);
    }
    return { code: 2 };
  }

  if (!result.ok) {
    if (opts.json) {
      context.err(JSON.stringify({ ok: false, error: result.error }, null, 2));
    } else {
      context.err(`rank evaluate failed (${result.error.kind}): ${result.error.message}`);
    }
    return { code: exitCodeForEvaluateError(result.error) };
  }

  context.out(opts.json ? renderEvaluateJson(result.run) : renderEvaluateHuman(result.run));
  return { code: 0 };
}

export const evaluateCommand: Command = {
  name: "evaluate",
  summary: "Judge one prospect against the brand and save a human-reviewable result",
  args: "--url <url> [options]",
  run: runEvaluate,
};
