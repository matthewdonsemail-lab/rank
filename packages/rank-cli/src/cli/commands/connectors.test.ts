/**
 * `rank connectors` lists the shared connector registry: the same data the
 * MCP server and the web app render, so the three surfaces cannot disagree.
 */
import { describe, expect, test } from "bun:test";
import { CONNECTOR_REGISTRY } from "../../../../rank-core/src/connectors/index.ts";
import { connectorsCommand } from "./connectors.ts";
import type { CommandContext } from "../types.ts";

function capture() {
  const out: string[] = [];
  const err: string[] = [];
  const context = {
    root: "/tmp/rank-connectors-test",
    processEnv: {},
    out: (line: string) => out.push(line),
    err: (line: string) => err.push(line),
  } satisfies CommandContext;
  return { context, out, err, text: () => [...out, ...err].join("\n") };
}

describe("rank connectors", () => {
  test("lists every registered connector with its status and guide", async () => {
    const io = capture();
    expect(await connectorsCommand.run(io.context, [])).toEqual({ code: 0 });
    for (const connector of CONNECTOR_REGISTRY.connectors) {
      expect(io.text()).toContain(connector.id);
      expect(io.text()).toContain(connector.name);
      expect(io.text()).toContain(connector.docPath);
    }
  });

  test("shows one connector by id", async () => {
    const io = capture();
    expect(await connectorsCommand.run(io.context, ["claude"])).toEqual({ code: 0 });
    expect(io.text()).toContain("Claude Code");
    expect(io.text()).toContain("Anthropic");
  });

  test("rejects an unknown id with the known list", async () => {
    const io = capture();
    const result = await connectorsCommand.run(io.context, ["nope"]);
    // runCli prints result.stderr; the command itself only returns it.
    expect(result.code).toBe(1);
    const diagnostic = "stderr" in result && typeof result.stderr === "string" ? result.stderr : "";
    for (const id of ["hermes", "claude", "codex", "muse"]) {
      expect(diagnostic).toContain(id);
    }
  });

  test("--json emits the registry for agent parsing", async () => {
    const io = capture();
    expect(await connectorsCommand.run(io.context, ["--json"])).toEqual({ code: 0 });
    const parsed = JSON.parse(io.out.join("\n")) as { connectors: Array<{ id: string }> };
    expect(parsed.connectors.map((c) => c.id)).toEqual(
      CONNECTOR_REGISTRY.connectors.map((c) => c.id),
    );
  });
});
