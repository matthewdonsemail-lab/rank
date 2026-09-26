import { describe, expect, test } from "bun:test";
import type { CapabilityRegistry } from "../types.ts";
import { validateRegistry } from "./validate.ts";

function validRegistry(): CapabilityRegistry {
  return {
    description: "test registry",
    capabilities: [
      {
        id: "env.doctor",
        title: "Environment preflight",
        summary: "Report what is missing per pipeline stage.",
        stage: "local tooling",
        mutating: false,
        requiresEnv: ["CONVEX_URL"],
        surfaces: {
          cli: { command: "doctor" },
          mcp: { tool: "rank_doctor" },
          http: { route: "/rank/status", method: "GET" },
        },
      },
      {
        id: "prospect.evaluate",
        title: "Evaluate one prospect",
        summary: "Judge one prospect.",
        stage: "judgment",
        mutating: true,
        requiresEnv: [],
        surfaces: {
          cli: { command: "evaluate" },
          mcp: { tool: "rank_evaluate_prospect" },
          http: { planned: true, reason: "Deferred: no external client needs it yet." },
        },
      },
    ],
  };
}

const envManifest = { vars: [{ name: "CONVEX_URL" }, { name: "RANK_AUTH_TOKEN" }] };

describe("validateRegistry", () => {
  test("accepts a valid registry", () => {
    expect(validateRegistry(validRegistry(), envManifest)).toEqual([]);
  });

  test("reports a duplicate capability id", () => {
    const registry = validRegistry();
    registry.capabilities.push({ ...registry.capabilities[0] });
    const violations = validateRegistry(registry, envManifest);
    expect(violations.some((v) => v.reason.includes('duplicate capability id "env.doctor"'))).toBe(true);
  });

  test("reports a missing required field", () => {
    const registry = validRegistry();
    const entry = { ...registry.capabilities[0], title: "   " } as CapabilityRegistry["capabilities"][number];
    registry.capabilities[0] = entry;
    const violations = validateRegistry(registry, envManifest);
    expect(violations.some((v) => v.capabilityId === "env.doctor" && v.reason.includes("title"))).toBe(true);
  });

  test("reports a planned surface without a reason", () => {
    const registry = validRegistry();
    registry.capabilities[1] = {
      ...registry.capabilities[1],
      surfaces: {
        ...registry.capabilities[1].surfaces,
        http: { planned: true, reason: "  " },
      },
    };
    const violations = validateRegistry(registry, envManifest);
    expect(
      violations.some((v) => v.capabilityId === "prospect.evaluate" && v.reason.includes("without a non-empty reason")),
    ).toBe(true);
  });

  test("reports a requiresEnv name missing from the env manifest", () => {
    const registry = validRegistry();
    registry.capabilities[0] = { ...registry.capabilities[0], requiresEnv: ["MISSING_VAR"] };
    const violations = validateRegistry(registry, envManifest);
    expect(violations.some((v) => v.reason.includes('requiresEnv "MISSING_VAR"'))).toBe(true);
  });

  test("reports unknown top-level keys", () => {
    const registry = validRegistry();
    (registry.capabilities[0] as unknown as Record<string, unknown>)["extra"] = true;
    const violations = validateRegistry(registry, envManifest);
    expect(violations.some((v) => v.reason.includes('unknown top-level key "extra"'))).toBe(true);
  });
});
