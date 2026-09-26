/** prospect.evaluate shared operation types.
 *
 * Structural mirrors of the contract in docs/contracts/prospect-evaluate.md.
 * These are plain TypeScript types, not Convex validators: rank-core must not
 * depend on the app's generated code, so the wire shape is asserted
 * structurally where the response lands instead.
 */

export interface ProspectInput {
  url: string;
  title?: string | null;
  description?: string | null;
  sourceDomain?: string | null;
  anchorText?: string | null;
  targetDomain?: string | null;
  fitRationale?: string | null;
  brandSummary?: string | null;
  metrics?: unknown;
  content?: string | null;
}

export type ProspectEvaluationState = "idle" | "evaluating" | "completed" | "failed" | "cancelled";

export interface ProspectJudgment {
  action: "act" | "review" | "drop";
  confidence: number;
  route?: string | null;
  fitScore?: number | null;
  fitConfidence?: number | null;
  spamProbability?: number | null;
  model?: string | null;
  reasons: string[];
}

export interface ProspectEvaluationRun {
  runId: string;
  sourceDiscoveryRunId: string | null;
  url: string;
  state: ProspectEvaluationState;
  context: {
    sourceDiscoveryRunId: string | null;
    prospect: ProspectInput;
    judgment: ProspectJudgment | null;
    error: string | null;
    attempt: number;
    startedAt: number;
    updatedAt: number;
  };
  createdAt: number;
  updatedAt: number;
}

export type ProspectErrorKind = "input" | "config" | "auth" | "operation" | "transport";

export interface ProspectEvaluateError {
  kind: ProspectErrorKind;
  message: string;
}

export type EvaluateProspectResult =
  | { ok: true; run: ProspectEvaluationRun }
  | { ok: false; error: ProspectEvaluateError };

export interface EvaluateProspectOptions {
  /** Convex deployment URL. Falls back to CONVEX_URL. */
  deploymentUrl?: string;
  /** Clerk session token for the calling identity. Falls back to RANK_AUTH_TOKEN. */
  authToken?: string;
  /** Completed discovery run this evaluation builds on, if any. */
  sourceDiscoveryRunId?: string;
  /** Transport seam. Defaults to ConvexHttpClient; inject a fake in tests. */
  caller?: ConvexActionCaller;
}

/** Runs one Convex action by path with a bearer token. */
export type ConvexActionCaller = (
  deploymentUrl: string,
  authToken: string,
  path: string,
  args: Record<string, unknown>,
) => Promise<unknown>;
