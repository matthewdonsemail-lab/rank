/** `rank login` session validation types.
 *
 * Login captures a Clerk session token and validates it against the linked
 * deployment before anything is stored. The stored form is one entry in the
 * gitignored `.rank/` home (`sessions.json`), which CLI, MCP, and doctor
 * resolve as env sources, so a login is picked up with no other changes.
 */

export type AuthErrorKind = "config" | "auth" | "operation" | "transport";

export interface AuthError {
  kind: AuthErrorKind;
  message: string;
}

export type ValidateSessionResult = { ok: true } | { ok: false; error: AuthError };

export interface ValidateSessionOptions {
  /** Convex deployment URL. Falls back to CONVEX_URL. */
  deploymentUrl?: string;
  /** Clerk session token being validated. Never read from disk here. */
  authToken: string;
  /** Transport seam. Defaults to the generated-api Convex client; inject a fake in tests. */
  caller?: ConvexQueryCaller;
}

/** Runs one Convex query by path with a bearer token. */
export type ConvexQueryCaller = (
  deploymentUrl: string,
  authToken: string,
  path: string,
  args: Record<string, unknown>,
) => Promise<unknown>;