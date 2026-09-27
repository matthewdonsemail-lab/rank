/**
 * The connector registry is the single source of truth for how agents reach
 * Rank, so it is validated against the two things it references: capability
 * ids must exist in `config/capabilities.json`, and doc paths must exist on
 * disk. A connector pointing at a missing capability or a missing guide is a
 * test failure, not a runtime surprise.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import { CONNECTOR_REGISTRY, connectorById } from "./index.ts";
import { resolveRepoRoot } from "../workspace/index.ts";

function capabilityIds(): Set<string> {
  const raw = JSON.parse(
    readFileSync(join(resolveRepoRoot(), "config", "capabilities.json"), "utf8"),
  ) as { capabilities: Array<{ id: string }> };
  return new Set(raw.capabilities.map((capability) => capability.id));
}

describe("connector registry", () => {
  test("connector ids are unique and well-formed", () => {
    const ids = CONNECTOR_REGISTRY.connectors.map((connector) => connector.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const connector of CONNECTOR_REGISTRY.connectors) {
      expect(connector.id).toMatch(/^[a-z0-9-]+$/);
      expect(connector.name.trim()).not.toBe("");
      expect(connector.vendor.trim()).not.toBe("");
      expect(connector.description.trim()).not.toBe("");
      expect(["supported", "needs-remote-api"]).toContain(connector.status);
      expect(connector.docPath.trim()).not.toBe("");
      expect(Array.isArray(connector.limits)).toBe(true);
    }
  });

  test("every referenced capability exists in the catalog", () => {
    const known = capabilityIds();
    for (const connector of CONNECTOR_REGISTRY.connectors) {
      for (const id of connector.capabilities) {
        expect(known.has(id)).toBe(true);
      }
    }
  });

  test("every doc path exists on disk", () => {
    const root = resolveRepoRoot();
    for (const connector of CONNECTOR_REGISTRY.connectors) {
      expect(existsSync(join(root, connector.docPath))).toBe(true);
    }
  });

  test("stdio setups name a binary, absolute-able args, and env names", () => {
    for (const connector of CONNECTOR_REGISTRY.connectors) {
      if (!connector.stdio) continue;
      expect(connector.stdio.command.trim()).not.toBe("");
      expect(connector.stdio.args.length).toBeGreaterThan(0);
      for (const name of connector.stdio.env) {
        expect(name).toMatch(/^[A-Z0-9_]+$/);
      }
      expect(connector.stdio.authNote.trim()).not.toBe("");
    }
  });

  test("connectorById resolves every registered id", () => {
    for (const connector of CONNECTOR_REGISTRY.connectors) {
      expect(connectorById(connector.id)?.name).toBe(connector.name);
    }
    expect(connectorById("nope")).toBeUndefined();
  });
});
