/**
 * Convex deployment boundary.
 *
 * The only module that shells out to the Convex CLI. Rank's Convex functions
 * read app and auth variables from the deployment rather than from a local
 * file, so a preflight that ignored this would report correctly configured
 * variables as missing.
 */
import { spawnSync } from "node:child_process";
import type { DeploymentEnvResult } from "./types.ts";

const ENV_LINE = /^([A-Z_0-9]+)=(.*)$/;
const DEFAULT_TIMEOUT_MS = 30_000;

export interface DeploymentEnvOptions {
  cwd: string;
  /** Set false to skip the lookup entirely, for offline or fast runs. */
  include?: boolean;
  timeoutMs?: number;
  /** Injectable for tests. */
  runner?: typeof spawnSync;
}

/**
 * Read the variables set on the linked deployment.
 *
 * Returns `env: null` instead of throwing when the CLI is unavailable, not
 * logged in, or the lookup times out, so `rank doctor` still produces a useful
 * local report instead of an error.
 */
export function readDeploymentEnv(options: DeploymentEnvOptions): DeploymentEnvResult {
  if (options.include === false) {
    return { env: {}, attempted: false };
  }
  const run = options.runner ?? spawnSync;
  const result = run("convex", ["env", "list"], {
    cwd: options.cwd,
    encoding: "utf8",
    timeout: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    shell: process.platform === "win32",
  });

  if (result.error) {
    return { env: null, error: result.error.message, attempted: true };
  }
  if (result.status !== 0) {
    const stderr = (result.stderr ?? "").toString().trim().split(/\r?\n/)[0] ?? "";
    return {
      env: null,
      error: `convex env list exited ${result.status}${stderr ? `: ${stderr}` : ""}`,
      attempted: true,
    };
  }

  const env: Record<string, string> = {};
  for (const line of (result.stdout ?? "").toString().split(/\r?\n/)) {
    const match = ENV_LINE.exec(line.trim());
    if (match) env[match[1]] = match[2];
  }
  return { env, attempted: true };
}
