/**
 * `rank install` — bootstrap a working checkout.
 *
 * A bootstrap command rather than a product capability: it is local-only, has no
 * MCP tool and no HTTP route, so it is intentionally absent from
 * config/capabilities.json, which describes the surfaces a client can call.
 */
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { ENV_EXAMPLE_NAME, ENV_FILE_NAME, workspacePaths } from "../../../../rank-core/src/workspace/index.ts";
import type { Command, CommandContext } from "../types.js";

interface Probe {
  name: string;
  command: string;
  args: string[];
  required: boolean;
  installHint: string;
}

const PROBES: Probe[] = [
  {
    name: "bun",
    command: "bun",
    args: ["--version"],
    required: true,
    installHint: "Install Bun from https://bun.sh, then re-run `rank install`.",
  },
  {
    name: "convex",
    command: "convex",
    args: ["--version"],
    required: true,
    installHint: "Install with `npm install -g convex`.",
  },
  {
    name: "node",
    command: "node",
    args: ["--version"],
    required: true,
    installHint: "Install Node.js 20 or newer.",
  },
];

export interface ProbeResult {
  name: string;
  ok: boolean;
  /** True when the install cannot complete without this tool. */
  required: boolean;
  detail: string;
  hint?: string;
}

export function runProbes(
  probes: Probe[],
  runner: typeof spawnSync = spawnSync,
): ProbeResult[] {
  return probes.map((probe) => {
    const result = runner(probe.command, probe.args, {
      encoding: "utf8",
      timeout: 20_000,
      shell: process.platform === "win32",
    });
    if (result.error || result.status !== 0) {
      return {
        name: probe.name,
        ok: false,
        required: probe.required,
        detail: result.error?.message ?? `exited ${result.status}`,
        hint: probe.required ? probe.installHint : undefined,
      };
    }
    return {
      name: probe.name,
      ok: true,
      required: probe.required,
      detail: (result.stdout ?? "").trim().split(/\r?\n/)[0] ?? "",
    };
  });
}

export const installCommand: Command = {
  name: "install",
  summary: "Check prerequisites, create .env.local from the template, and run the preflight",
  run(context: CommandContext) {
    const paths = workspacePaths(context.root);
    const lines: string[] = ["Rank install", ""];

    lines.push("Prerequisites");
    const probes = runProbes(PROBES);
    for (const probe of probes) {
      lines.push(`  [${probe.ok ? "ok  " : "FAIL"}] ${probe.name.padEnd(8)} ${probe.detail}`);
      if (probe.hint) lines.push(`         ${probe.hint}`);
    }

    lines.push("");
    lines.push("Environment");
    if (existsSync(paths.envFilePath)) {
      lines.push(`  [ok  ] ${ENV_FILE_NAME} already exists`);
    } else if (existsSync(paths.envExamplePath)) {
      lines.push(`  [warn] ${ENV_FILE_NAME} is missing. Copy ${ENV_EXAMPLE_NAME} and fill in the values.`);
      lines.push(`         Copy-Item ${ENV_EXAMPLE_NAME} ${ENV_FILE_NAME}`);
    } else {
      lines.push(`  [FAIL] neither ${ENV_FILE_NAME} nor ${ENV_EXAMPLE_NAME} exists`);
    }

    const failed = probes.filter((probe) => !probe.ok && probe.required);
    lines.push("");
    if (failed.length > 0) {
      lines.push(`Install incomplete. Missing prerequisites: ${failed.map((p) => p.name).join(", ")}.`);
    } else {
      lines.push("Prerequisites satisfied. Run `rank doctor` to see which stage variables are still missing.");
    }
    context.out(lines.join("\n"));
    return { code: failed.length > 0 ? 1 : 0 };
  },
};
