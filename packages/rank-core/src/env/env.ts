/**
 * Environment resolution: turn a manifest plus three sources into a preflight
 * report. Pure — no filesystem, no process, no Convex calls.
 */
import { isBlank } from "./helpers/env-file.ts";
import type {
  DoctorReport,
  EnvManifest,
  EnvOrigin,
  EnvSources,
  ResolvedVar,
} from "./types.ts";

/**
 * Resolve every manifest variable.
 *
 * Precedence is process, then the `.rank/` home (stored session token, then
 * connection config), then the env file, then the Convex deployment. The
 * deployment is consulted because that is where Convex reads app and auth
 * variables from, so a value set with `convex env set` must count as present
 * even when nothing local defines it. `local` scope variables ignore the
 * deployment, since the deployment never provides them.
 */
export function resolveEnv(manifest: EnvManifest, sources: EnvSources = {}): ResolvedVar[] {
  const processEnv = sources.process ?? {};
  const sessionEnv = sources.session ?? {};
  const rankEnv = sources.rank ?? {};
  const fileEnv = sources.file ?? {};
  const deploymentEnv = sources.deployment ?? {};

  return manifest.vars.map((spec) => {
    const found: Array<{ origin: EnvOrigin; value: string }> = [];
    const consider = (origin: EnvOrigin, source: Record<string, string | undefined> | undefined) => {
      const value = source?.[spec.name];
      if (!isBlank(value)) found.push({ origin, value: value!.trim() });
    };

    consider("process", processEnv);
    consider("session", sessionEnv);
    consider("rank", rankEnv);
    consider("env-file", fileEnv);
    if (spec.scope !== "local") consider("deployment", deploymentEnv);

    if (found.length === 0) {
      return { spec, value: undefined, origin: "unset" as const, origins: ["unset" as const] };
    }
    return {
      spec,
      value: found[0].value,
      origin: found[0].origin,
      origins: found.map((f) => f.origin),
    };
  });
}

/**
 * Fold resolved variables into a report.
 *
 * `deploymentUnavailable` is surfaced rather than treated as a failure: not
 * being logged in to a Convex deployment is a normal local state, but the
 * operator should know the result is local-only.
 */
export function buildReport(resolved: ResolvedVar[], deploymentUnavailable = false): DoctorReport {
  const missingRequired = resolved.filter((v) => v.spec.required && v.value === undefined);
  const unsetOptional = resolved.filter((v) => !v.spec.required && v.value === undefined);
  return {
    vars: resolved,
    missingRequired,
    unsetOptional,
    satisfiedByFallback: unsetOptional.filter((v) => v.spec.fallback !== null),
    deploymentUnavailable,
    ok: missingRequired.length === 0,
  };
}

/** Preflight passes when nothing required is missing. */
export function exitCodeFor(report: DoctorReport): number {
  return report.ok ? 0 : 1;
}
