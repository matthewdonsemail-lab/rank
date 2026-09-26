/** Session validation for rank login.
 *
 * Runs the side-effect-free, owner-gated `prospectEvaluation:
 * listProspectEvaluationRuns` query (no args) with the candidate token. Any
 * shape of success proves the token authenticates; only the error path is
 * classified. Throws nothing.
 */
import { ConvexHttpClient } from "convex/browser";
import { convexErrorMessage, isConvexError } from "../convex/index.ts";
import type { ConvexQueryCaller, ValidateSessionOptions, ValidateSessionResult } from "./types.ts";

export const VALIDATION_PATH = "prospectEvaluation:listProspectEvaluationRuns";

const defaultCaller: ConvexQueryCaller = async (deploymentUrl, authToken, path, args) => {
  const client = new ConvexHttpClient(deploymentUrl);
  client.setAuth(authToken);
  // Generated api entries are these same path strings; rank-core must not
  // depend on the app's generated code, so the literal path is cast.
  return client.query(path as never, args as never);
};

/**
 * Validate a Clerk session token against the linked deployment.
 *
 * Returns `{ ok: true }` when the token authenticates, otherwise a stable
 * `{ ok: false, error }` with kind `config` (missing URL/token), `auth`
 * (backend rejected the token), `operation` (backend error), or `transport`
 * (network or unexpected shape). The token itself never appears in any
 * message.
 */
export async function validateSessionToken(options: ValidateSessionOptions): Promise<ValidateSessionResult> {
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
  if (options.authToken.trim() === "") {
    return {
      ok: false,
      error: {
        kind: "config",
        message: "No session token. Sign in and pass the Clerk session token.",
      },
    };
  }

  const caller = options.caller ?? defaultCaller;
  let raw: unknown;
  try {
    raw = await caller(deploymentUrl, options.authToken, VALIDATION_PATH, {});
  } catch (error) {
    if (isConvexError(error) && /authentication required/i.test(convexErrorMessage(error))) {
      return { ok: false, error: { kind: "auth", message: "Convex rejected the session token" } };
    }
    if (isConvexError(error)) {
      return { ok: false, error: { kind: "operation", message: convexErrorMessage(error) } };
    }
    return { ok: false, error: { kind: "transport", message: convexErrorMessage(error) } };
  }

  if (!Array.isArray(raw)) {
    return { ok: false, error: { kind: "transport", message: "Deployment returned an unexpected shape" } };
  }
  return { ok: true };
}
