/**
 * Preflight report rendering.
 *
 * Pure: takes the manifest and a report, returns the text to print. Groups by
 * stage so the output answers "what is missing for the stage I care about"
 * instead of listing names in an arbitrary order.
 */
import type { DoctorReport, EnvManifest, ResolvedVar } from "../types.ts";
import { mask } from "./mask.ts";

const STATUS = {
  set: "ok  ",
  fallback: "warn",
  unset: "warn",
  missing: "FAIL",
} as const;

const ORIGIN_LABELS: Record<string, string> = {
  process: "process env",
  "env-file": ".env.local",
  deployment: "deployment",
};

function statusOf(v: ResolvedVar, report: DoctorReport): string {
  if (v.value !== undefined) return STATUS.set;
  if (v.spec.required) return STATUS.missing;
  return v.spec.fallback ? STATUS.fallback : STATUS.unset;
}

function originSuffix(v: ResolvedVar): string {
  if (v.origins.length === 0 || v.origins[0] === "unset") return "";
  return ` (${v.origins.map((o) => ORIGIN_LABELS[o] ?? o).join(" + ")})`;
}

function groupByStage(vars: ResolvedVar[]): Array<[string, ResolvedVar[]]> {
  const byStage = new Map<string, ResolvedVar[]>();
  for (const v of vars) {
    const list = byStage.get(v.spec.stage) ?? [];
    list.push(v);
    byStage.set(v.spec.stage, list);
  }
  return [...byStage.entries()];
}

export function renderReport(manifest: EnvManifest, report: DoctorReport): string {
  const lines: string[] = [`Rank environment preflight — ${manifest.vars.length} variables`, ""];

  for (const [stage, vars] of groupByStage(report.vars)) {
    lines.push(stage);
    for (const v of vars) {
      // An unset variable shows its fallback verbatim; only a real secret value
      // is masked.
      const shown = v.value === undefined ? v.spec.fallback ?? "(unset)" : mask(v.value, v.spec.secret);
      lines.push(`  [${statusOf(v, report)}] ${v.spec.name.padEnd(26)} ${shown}${originSuffix(v)}`);
      if (v.spec.forwardedTo) lines.push(`         forwarded to the ${v.spec.forwardedTo} component`);
    }
    lines.push("");
  }

  if (report.missingRequired.length > 0) {
    lines.push("Required variables are missing:");
    for (const v of report.missingRequired) lines.push(`  - ${v.spec.name}: ${v.spec.purpose}`);
    lines.push("");
  }

  const hardMissing = report.unsetOptional.filter((v) => v.spec.fallback === null);
  if (hardMissing.length > 0) {
    lines.push("Unset, with no fallback — the related stage will fail closed:");
    for (const v of hardMissing) lines.push(`  - ${v.spec.name} (${v.spec.stage}): ${v.spec.purpose}`);
    lines.push("");
  }

  if (report.deploymentUnavailable) {
    lines.push(
      "Note: deployment variables could not be read, so anything set only with `convex env set` may look unset.",
    );
    lines.push("");
  }

  lines.push(
    report.ok
      ? "Preflight passed. Required variables are present."
      : "Preflight failed. Set the variables above before running the pipeline.",
  );
  return lines.join("\n");
}

/** Render the manifest itself, for `rank env`. */
export function renderManifest(manifest: EnvManifest): string {
  const lines: string[] = [];
  for (const v of manifest.vars) {
    lines.push(`${v.name}${v.required ? " (required)" : ""} — ${v.stage}`);
    lines.push(`  ${v.purpose}`);
    lines.push(`  read by: ${v.consumedBy.join(", ")}`);
    if (v.forwardedTo) lines.push(`  forwarded to the ${v.forwardedTo} component`);
    lines.push(`  fallback: ${v.fallback ?? "none, the stage fails closed"}`);
    lines.push("");
  }
  return lines.join("\n");
}
