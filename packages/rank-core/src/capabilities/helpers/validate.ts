/**
 * Structural schema validation for the capability registry.
 *
 * Pure: takes the parsed registry and env manifest, returns violations. This
 * covers shape the surface gate cannot: duplicate ids, missing required
 * fields, dangling requiresEnv names, planned surfaces without a recorded
 * reason, and unknown top-level keys. It is still static validation — it never
 * executes a surface, so it cannot prove runtime parity.
 */
import type { CapabilityRegistry, RegistryViolation, SurfaceName } from "../types.ts";

/** Minimal shape of the env manifest needed to resolve requiresEnv names. */
export interface EnvManifestLike {
  vars: Array<{ name: string }>;
}

const REGISTRY_KEYS = new Set(["description", "capabilities"]);

const CAPABILITY_KEYS = new Set([
  "id",
  "title",
  "summary",
  "stage",
  "mutating",
  "requiresEnv",
  "surfaces",
]);

const PLANNED_SURFACES: SurfaceName[] = ["cli", "mcp", "http"];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function labelFor(index: number, value: unknown): string {
  if (typeof value === "object" && value !== null) {
    const id = (value as Record<string, unknown>)["id"];
    if (isNonEmptyString(id)) return id;
  }
  return `#${index}`;
}

/**
 * Check registry shape beyond surface-name consistency: unique ids, required
 * fields, requiresEnv membership, planned-surface reasons, unknown keys.
 */
export function validateRegistry(
  registry: CapabilityRegistry,
  envManifest: EnvManifestLike,
): RegistryViolation[] {
  const violations: RegistryViolation[] = [];

  if (typeof registry !== "object" || registry === null || Array.isArray(registry)) {
    return [{ capabilityId: "(registry)", reason: "registry must be an object" }];
  }
  const record = registry as unknown as Record<string, unknown>;

  for (const key of Object.keys(record)) {
    if (!REGISTRY_KEYS.has(key)) {
      violations.push({ capabilityId: "(registry)", reason: `unknown top-level key "${key}"` });
    }
  }

  const list = (record["capabilities"] as CapabilityRegistry["capabilities"]) ?? [];
  if (!Array.isArray(list)) {
    violations.push({ capabilityId: "(registry)", reason: "capabilities must be an array" });
    return violations;
  }

  const envNames = new Set<string>();
  const vars = (envManifest as EnvManifestLike | null | undefined)?.vars;
  if (Array.isArray(vars)) {
    for (const spec of vars) {
      if (typeof spec === "object" && spec !== null && typeof (spec as { name: unknown }).name === "string") {
        envNames.add((spec as { name: string }).name);
      }
    }
  }

  const seenIds = new Map<string, string>();
  list.forEach((capability, index) => {
    const label = labelFor(index, capability);
    if (typeof capability !== "object" || capability === null || Array.isArray(capability)) {
      violations.push({ capabilityId: label, reason: "capability must be an object" });
      return;
    }
    const entry = capability as unknown as Record<string, unknown>;

    for (const key of Object.keys(entry)) {
      if (!CAPABILITY_KEYS.has(key)) {
        violations.push({ capabilityId: label, reason: `unknown top-level key "${key}"` });
      }
    }

    if (!isNonEmptyString(entry["id"])) {
      violations.push({ capabilityId: label, reason: "missing or empty id" });
    } else {
      const id = (entry["id"] as string).trim();
      const first = seenIds.get(id);
      if (first !== undefined) {
        violations.push({ capabilityId: label, reason: `duplicate capability id "${id}"` });
      } else {
        seenIds.set(id, label);
      }
    }

    for (const field of ["title", "summary", "stage"] as const) {
      if (!isNonEmptyString(entry[field])) {
        violations.push({ capabilityId: label, reason: `missing or empty ${field}` });
      }
    }

    const requiresEnv = entry["requiresEnv"];
    if (!Array.isArray(requiresEnv)) {
      violations.push({ capabilityId: label, reason: "missing or invalid requiresEnv array" });
    } else {
      for (const name of requiresEnv) {
        if (typeof name !== "string" || name.trim() === "") {
          violations.push({ capabilityId: label, reason: "requiresEnv entries must be non-empty strings" });
          continue;
        }
        if (!envNames.has(name)) {
          violations.push({ capabilityId: label, reason: `requiresEnv "${name}" is not in config/env-vars.json` });
        }
      }
    }

    const surfaces = entry["surfaces"];
    if (typeof surfaces === "object" && surfaces !== null && !Array.isArray(surfaces)) {
      const surfacesRecord = surfaces as Record<string, unknown>;
      for (const surface of PLANNED_SURFACES) {
        const surfaceEntry = surfacesRecord[surface];
        if (
          typeof surfaceEntry === "object" &&
          surfaceEntry !== null &&
          (surfaceEntry as Record<string, unknown>)["planned"] === true &&
          !isNonEmptyString((surfaceEntry as Record<string, unknown>)["reason"])
        ) {
          violations.push({
            capabilityId: label,
            surface,
            reason: `${surface} surface is planned without a non-empty reason`,
          });
        }
      }
    }
  });

  return violations;
}
