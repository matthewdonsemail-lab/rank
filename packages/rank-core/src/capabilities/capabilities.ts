/**
 * Capability registry helpers.
 *
 * Pure: takes a registry, returns views and consistency gaps. The registry in
 * config/capabilities.json catalogs what each surface documents; implementations
 * live in their packages and are checked against it, so these helpers exist to
 * detect drift rather than to describe behavior.
 */
import type { Capability, CapabilityRegistry, SurfaceGap, SurfaceName } from "./types.ts";

export const ALL_SURFACES: SurfaceName[] = ["cli", "mcp", "http"];

/** Every capability that declares a given surface. */
export function bySurface(registry: CapabilityRegistry, surface: SurfaceName): Capability[] {
  return registry.capabilities.filter((capability) => capability.surfaces[surface] !== undefined);
}

/** Find a capability by its dotted id. */
export function findCapability(registry: CapabilityRegistry, id: string): Capability | undefined {
  return registry.capabilities.find((capability) => capability.id === id);
}

/** Find a capability by the command that exposes it on the CLI. */
export function byCliCommand(registry: CapabilityRegistry, command: string): Capability | undefined {
  return registry.capabilities.find((capability) => capability.surfaces.cli?.command === command);
}

/** Find a capability by the tool name that exposes it over MCP. */
export function byMcpTool(registry: CapabilityRegistry, tool: string): Capability | undefined {
  return registry.capabilities.find((capability) => capability.surfaces.mcp?.tool === tool);
}

/** Distinct environment variables any capability depends on. */
export function requiredEnv(registry: CapabilityRegistry): string[] {
  const names = new Set<string>();
  for (const capability of registry.capabilities) {
    for (const name of capability.requiresEnv) names.add(name);
  }
  return [...names].sort();
}

/**
 * Report capabilities that do not declare every surface, and capabilities whose
 * identifiers collide.
 *
 * A surface marked `planned` counts as declared: it is documented intent with a
 * recorded reason, not a gap. Collisions only consider implemented surfaces,
 * because a planned surface has no command, tool, or route to collide yet.
 *
 * Two capabilities must never share a CLI command, an MCP tool name, or an
 * HTTP route and method, because a consumer resolving that surface would get an
 * ambiguous answer.
 */
export function findGaps(registry: CapabilityRegistry, expected: SurfaceName[] = ALL_SURFACES): SurfaceGap[] {
  const gaps: SurfaceGap[] = [];

  for (const capability of registry.capabilities) {
    for (const surface of expected) {
      if (capability.surfaces[surface] === undefined) {
        gaps.push({
          capabilityId: capability.id,
          surface,
          reason: `declares no ${surface} surface`,
        });
      }
    }
  }

  const seen: Record<string, string> = {};
  const collisions: Array<[SurfaceName, (capability: Capability) => string | undefined]> = [
    ["cli", (c) => (c.surfaces.cli?.planned ? undefined : c.surfaces.cli?.command)],
    ["mcp", (c) => (c.surfaces.mcp?.planned ? undefined : c.surfaces.mcp?.tool)],
    [
      "http",
      (c) =>
        c.surfaces.http?.planned || c.surfaces.http?.method === undefined || c.surfaces.http?.route === undefined
          ? undefined
          : `${c.surfaces.http.method} ${c.surfaces.http.route}`,
    ],
  ];
  for (const [surface, read] of collisions) {
    for (const capability of registry.capabilities) {
      const key = read(capability);
      if (key === undefined) continue;
      const id = `${surface}:${key}`;
      if (seen[id] !== undefined) {
        gaps.push({
          capabilityId: capability.id,
          surface,
          reason: `${surface} key "${key}" is already used by ${seen[id]}`,
        });
      } else {
        seen[id] = capability.id;
      }
    }
  }

  return gaps;
}

/** Render the registry for `rank capabilities` and the MCP tool listing. */
export function renderRegistry(registry: CapabilityRegistry): string {
  const lines: string[] = [`Rank capabilities — ${registry.capabilities.length}`, ""];
  for (const capability of registry.capabilities) {
    lines.push(`${capability.id} — ${capability.title}`);
    lines.push(`  ${capability.summary}`);
    lines.push(`  stage: ${capability.stage}${capability.mutating ? " (mutating)" : ""}`);
    if (capability.requiresEnv.length > 0) lines.push(`  requires: ${capability.requiresEnv.join(", ")}`);
    const cli = capability.surfaces.cli
      ? capability.surfaces.cli.planned
        ? `planned (${capability.surfaces.cli.reason ?? "no reason recorded"})`
        : `rank ${capability.surfaces.cli.command}`
      : null;
    const mcp = capability.surfaces.mcp
      ? capability.surfaces.mcp.planned
        ? `planned (${capability.surfaces.mcp.reason ?? "no reason recorded"})`
        : (capability.surfaces.mcp.tool ?? null)
      : null;
    const http = capability.surfaces.http
      ? capability.surfaces.http.planned
        ? `planned (${capability.surfaces.http.reason ?? "no reason recorded"})`
        : capability.surfaces.http.method !== undefined && capability.surfaces.http.route !== undefined
          ? `${capability.surfaces.http.method} ${capability.surfaces.http.route}`
          : "incomplete"
      : null;
    lines.push(`  surfaces: cli=${cli ?? "none"}, mcp=${mcp ?? "none"}, http=${http ?? "none"}`);
    lines.push("");
  }
  return lines.join("\n");
}
