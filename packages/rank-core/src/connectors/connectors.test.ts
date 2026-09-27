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

  test("served docs match the registry: nav order, titles, and frontmatter", () => {
    // The Fumadocs app serves these files at /docs/connectors/<id> through a
    // loader over frontmatter plus _meta.json. Nav, pages, CLI, MCP, and web
    // all name the same connectors because this test pins the three sources
    // together.
    const root = resolveRepoRoot();
    const meta = JSON.parse(
      readFileSync(join(root, "apps", "docs", "content", "docs", "connectors", "_meta.json"), "utf8"),
    ) as Record<string, string>;
    expect(Object.keys(meta)).toEqual(CONNECTOR_REGISTRY.connectors.map((connector) => connector.id));
    for (const connector of CONNECTOR_REGISTRY.connectors) {
      expect(meta[connector.id]).toBe(connector.name);
      const raw = readFileSync(
        join(root, "apps", "docs", "content", "docs", "connectors", `${connector.id}.mdx`),
        "utf8",
      ).replace(/\r\n/g, "\n");
      const match = /^---\n([\s\S]*?)\n---\n/.exec(raw);
      expect(match, `${connector.id}.md needs frontmatter`).not.toBeNull();
      const fields: Record<string, string> = {};
      for (const line of (match?.[1] ?? "").split("\n")) {
        const separator = line.indexOf(":");
        if (separator >= 0) fields[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
      }
      expect(fields["title"]).toBe(connector.name);
      expect(fields["description"]?.length ?? 0).toBeGreaterThan(0);
    }
  });
});
