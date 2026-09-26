/** Convex deployment boundary types. */

export interface DeploymentEnvResult {
  /**
   * Variables set on the linked deployment, or null when they could not be
   * read. Null is a normal state, not a failure: the CLI may be used offline or
   * without a Convex login.
   */
  env: Record<string, string> | null;
  /** Why the lookup failed, for diagnostics. Never contains secret values. */
  error?: string;
  /** Whether the lookup actually ran. */
  attempted: boolean;
}
