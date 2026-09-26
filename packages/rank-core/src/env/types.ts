/**
 * Environment manifest types.
 *
 * The manifest (`config/env-vars.json`) is the single description of every
 * variable Rank reads, who consumes it, and what breaks without it. These types
 * describe that file; nothing here reads the environment.
 */

export type EnvScope = "app" | "auth" | "local";

export interface EnvVarSpec {
  name: string;
  /** True when the value must never be printed in full. */
  secret: boolean;
  /** True when a stage cannot run at all without it. */
  required: boolean;
  scope: EnvScope;
  /** Which pipeline stage consumes it, used to group the preflight output. */
  stage: string;
  consumedBy: string[];
  /** Set when the value is forwarded into a component's own env namespace. */
  forwardedTo?: string;
  /** Documented behaviour when unset. Null means the stage fails closed. */
  fallback: string | null;
  purpose: string;
}

export interface EnvManifest {
  description: string;
  vars: EnvVarSpec[];
}

export type EnvSource = Record<string, string | undefined>;

/**
 * Where a resolved value came from. Convex reads app and auth variables from
 * the deployment, so `deployment` is a real origin and not a special case.
 * `session` and `rank` come from the local `.rank/` home: `session` is the
 * machine-stored Clerk token (`rank login`), `rank` is non-secret connection
 * config kept alongside it.
 */
export type EnvOrigin = "process" | "session" | "rank" | "env-file" | "deployment" | "unset";

export interface EnvSources {
  /** Process environment. Highest precedence so one command can override. */
  process?: EnvSource;
  /** Machine-stored `.rank/sessions.json` token (rank login). */
  session?: EnvSource;
  /** Non-secret `.rank/config.json` connection config. */
  rank?: EnvSource;
  /** Parsed dotenv file, normally .env.local. */
  file?: Record<string, string>;
  /** Variables set on the linked Convex deployment. */
  deployment?: Record<string, string>;
}

export interface ResolvedVar {
  spec: EnvVarSpec;
  value: string | undefined;
  origin: EnvOrigin;
  /** Every source the value appeared in, in precedence order. */
  origins: EnvOrigin[];
}

export interface DoctorReport {
  vars: ResolvedVar[];
  missingRequired: ResolvedVar[];
  unsetOptional: ResolvedVar[];
  /** Unset optional variables that still have a documented fallback. */
  satisfiedByFallback: ResolvedVar[];
  /** True when the deployment lookup could not run, so results are local-only. */
  deploymentUnavailable: boolean;
  ok: boolean;
}

/** Result of a CLI invocation: the process exit code plus optional output. */
export interface CommandResult {
  code: number;
  stdout?: string;
  stderr?: string;
}
