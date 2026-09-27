/** Session validation for rank login.
 *
 * Runs the side-effect-free, owner-gated `prospectEvaluation:
 * listProspectEvaluationRuns` query (no args) with the candidate token. Any
 * shape of success proves the token authenticates; only the error path is
 * classified. Throws nothing.
 */
import { ConvexHttpClient } from "convex/browser";
import { convexErrorMessage, isConvexError } from "../convex/index.ts";
import type { ConvexQueryCaller, TokenIdentitySummary, ValidateSessionOptions, ValidateSessionResult } from "./types.ts";

export const VALIDATION_PATH = "prospectEvaluation:listProspectEvaluationRuns";

function base64UrlDecode(segment: string): string {
  const padded = segment.replace(/-/g, "+").replace(/_/g, "/");
  const remainder = padded.length % 4;
  const normalized = remainder === 0 ? padded : padded + "=".repeat(4 - remainder);
  // atob is available in Node 16+, browsers, and bun.
  return atob(normalized);
}

/**
 * Reads only the `iss` and `aud` claims from a JWT's payload segment.
 *
 * These two claims are routing metadata, not secrets — they name which
 * identity instance minted the token and which audience it is for, which is
 * exactly the information a `NoAuthProvider` rejection turns on. Nothing else
 * is extracted: no subject, no expiry, no signature, and the token itself is
 * never included in any returned or rendered string. Returns `{}` for anything
 * that is not a decodable two-or-three-segment token.
 */
export function summarizeTokenIdentity(authToken: string): TokenIdentitySummary {
  try {
    const segments = authToken.split(".");
    if (segments.length < 2) return {};
    const payload: unknown = JSON.parse(base64UrlDecode(segments[1] ?? ""));
    if (typeof payload !== "object" || payload === null) return {};
    const record = payload as Record<string, unknown>;
    const summary: TokenIdentitySummary = {};
    if (typeof record["iss"] === "string" && record["iss"] !== "") summary.iss = record["iss"];
    const aud = record["aud"];
    if (typeof aud === "string" && aud !== "") {
      summary.aud = aud;
    } else if (Array.isArray(aud) && aud.every((entry) => typeof entry === "string")) {
      summary.aud = (aud as string[]).join(",");
    }
    return summary;
  } catch {
    return {};
  }
}

/** Renders a token summary for an error message, or "" when there is nothing to say. */
export function formatTokenIdentity(summary: TokenIdentitySummary): string {
  const parts: string[] = [];
  if (summary.iss !== undefined) parts.push(`iss=${summary.iss}`);
  if (summary.aud !== undefined) parts.push(`aud=${summary.aud}`);
  return parts.length > 0 ? ` (token ${parts.join(" ")})` : "";
}

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
