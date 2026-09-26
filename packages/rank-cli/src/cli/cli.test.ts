import { describe, expect, test } from "bun:test";
import { COMMANDS, runCli } from "./cli.ts";
import { renderUsage } from "./helpers/usage.ts";
import type { CommandContext } from "./types.ts";

/** Capture output instead of printing it. */
function capture() {
  const out: string[] = [];
  const err: string[] = [];
  const context: Partial<CommandContext> = {
    processEnv: {},
    out: (line) => out.push(line),
    err: (line) => err.push(line),
  };
  return { context, out, err, text: () => [...out, ...err].join("\n") };
}

describe("runCli", () => {
  test("shows usage with no arguments and exits zero", async () => {
    const io = capture();
    expect(await runCli([], io.context)).toBe(0);
    expect(io.text()).toContain("rank doctor");
    expect(io.text()).toContain("Notes");
  });

  test("treats --help and -h as help", async () => {
    for (const flag of ["--help", "-h", "help"]) {
      const io = capture();
      expect(await runCli([flag], io.context)).toBe(0);
      expect(io.text()).toContain("Usage");
    }
  });

  test("rejects an unknown command with exit code 2", async () => {
    const io = capture();
    expect(await runCli(["nope"], io.context)).toBe(2);
    expect(io.err.join("\n")).toContain("Unknown command: nope");
  });

  test("registry and usage text stay in sync", () => {
    const usage = renderUsage(COMMANDS);
    for (const command of COMMANDS) {
      expect(usage).toContain(command.name);
      expect(usage).toContain(command.summary);
    }
  });

  test("every command name is unique", () => {
    const names = COMMANDS.map((command) => command.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("install probes", () => {
  test("reports a missing prerequisite with an install hint", async () => {
    const { runProbes } = await import("./commands/install.ts");
    const results = runProbes(
      [{ name: "bun", command: "bun", args: ["--version"], required: true, installHint: "Install Bun." }],
      (() => ({ error: new Error("spawn bun ENOENT") })) as never,
    );
    expect(results[0].ok).toBe(false);
    expect(results[0].hint).toBe("Install Bun.");
  });

  test("reports the first line of a successful probe", async () => {
    const { runProbes } = await import("./commands/install.ts");
    const results = runProbes(
      [{ name: "bun", command: "bun", args: ["--version"], required: true, installHint: "" }],
      (() => ({ status: 0, stdout: "1.4.0\nsecond line\n" })) as never,
    );
    expect(results[0]).toEqual({ name: "bun", ok: true, required: true, detail: "1.4.0" });
  });
});
