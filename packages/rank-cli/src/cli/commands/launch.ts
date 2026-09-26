/**
 * `rank launch` — optional guided entrypoint over the existing commands.
 *
 * Thin interactive wrapper only: it never implements doctor, capabilities,
 * install, or evaluation logic. It prompts (Clack) for which scriptable
 * command to run and for that command's existing flags, then delegates to
 * the same `doctorCommand` / `capabilitiesCommand` / `installCommand` /
 * `runEvaluate` paths the CLI already uses. Non-interactive use
 * (`--json`, piped output, missing TTY) never prompts and stays
 * deterministic.
 *
 * Secrets: launch never prints or echoes RANK_AUTH_TOKEN. Durable storage
 * belongs to `rank login` (`.rank/`); when the env and the `.rank/` home
 * both lack a token, launch offers a one-time masked prompt whose value is
 * passed only to the delegated operation call, never written.
 * Missing system tools are reported with the explicit install hint from
 * `rank install`; launch never installs anything silently.
 */
import { cancel, intro, isCancel, outro, password, select, text } from "@clack/prompts";
import { effectiveProcessEnv } from "../../../../rank-core/src/rank-home/index.ts";
import { capabilitiesCommand } from "./capabilities.ts";
import { doctorCommand } from "./doctor.ts";
import { runEvaluate } from "./evaluate.ts";
import { installCommand } from "./install.ts";
import { runLogin, runLogout, runWhoami } from "./login.ts";
import type { Command, CommandContext } from "../types.ts";

export const LAUNCH_USAGE = "Usage: rank launch [--json]";

export type ParseLaunchArgsResult = { ok: true; json: boolean } | { ok: false; error: string };

/** Only `--json` is accepted; anything else is a usage error. Pure. */
export function parseLaunchArgs(argv: string[]): ParseLaunchArgsResult {
  for (const token of argv) {
    if (token === "--json") continue;
    if (token.startsWith("--json=")) {
      return { ok: false, error: `option "--json" takes no value` };
    }
    if (token.startsWith("--")) {
      return { ok: false, error: `unknown option "${token}"` };
    }
    return { ok: false, error: `unexpected argument "${token}"` };
  }
  return { ok: true, json: argv.includes("--json") };
}

export interface LaunchTTY {
  stdinTTY: boolean | undefined;
  stdoutTTY: boolean | undefined;
}

/**
 * Interactive only when output is not piped/JSON and both streams are TTYs.
 * Pure, so tests can assert the never-prompt boundary without globals.
 */
export function shouldPrompt(json: boolean, tty: LaunchTTY): boolean {
  if (json) return false;
  return Boolean(tty.stdinTTY && tty.stdoutTTY);
}

type PromptTextOptions = Parameters<typeof text>[0];
type PromptSelectOptions = Parameters<typeof select>[0];

interface LaunchPrompts {
  intro(title: string): void;
  outro(message?: string): void;
  cancel(message?: string): void;
  select(option: PromptSelectOptions): Promise<unknown>;
  text(option: PromptTextOptions): Promise<unknown>;
  password(option: Parameters<typeof password>[0]): Promise<unknown>;
}

/** Transport seam for tests. Production uses Clack + the real commands. */
export const launchDeps: {
  prompts: LaunchPrompts;
  tty: () => LaunchTTY;
  runDoctor: (context: CommandContext, argv: string[]) => Promise<{ code: number }> | { code: number };
  runCapabilities: (context: CommandContext) => Promise<{ code: number }> | { code: number };
  runInstall: (context: CommandContext) => Promise<{ code: number }> | { code: number };
  runLogin: (context: CommandContext, argv: string[]) => Promise<{ code: number }>;
  runLogout: (context: CommandContext, argv: string[]) => Promise<{ code: number }>;
  runWhoami: (context: CommandContext, argv: string[]) => Promise<{ code: number }>;
  runEvaluate: (context: CommandContext, argv: string[]) => Promise<{ code: number }>;
} = {
  prompts: { intro, outro, cancel, select: select as LaunchPrompts["select"], text, password },
  tty: () => ({ stdinTTY: process.stdin?.isTTY, stdoutTTY: process.stdout?.isTTY }),
  runDoctor: (context, argv) => doctorCommand.run(context, argv),
  runCapabilities: (context) => capabilitiesCommand.run(context, []),
  runInstall: (context) => installCommand.run(context, []),
  runLogin: (context, argv) => runLogin(context, argv),
  runLogout: (context, argv) => runLogout(context, argv),
  runWhoami: (context, argv) => runWhoami(context, argv),
  runEvaluate: (context, argv) => runEvaluate(context, argv),
};

function validateUrl(value: string | undefined): string | undefined {
  const trimmed = (value ?? "").trim();
  if (trimmed === "") return "URL is required";
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "URL must use http or https";
    }
  } catch {
    return "URL must be an absolute URL";
  }
  return undefined;
}

/** Empty input means "skip this optional field". */
function optionalText(value: string): string | undefined {
  return value.trim() === "" ? undefined : value;
}

async function promptEvaluate(context: CommandContext): Promise<{ code: number }> {
  const prompts = launchDeps.prompts;

  const url = await prompts.text({
    message: "Prospect URL to evaluate",
    placeholder: "https://example.com/page",
    validate: validateUrl,
  });
  if (isCancel(url) || typeof url !== "string") {
    prompts.cancel("Launch cancelled.");
    return { code: 1 };
  }

  const discoveryRun = await prompts.text({
    message: "Discovery run id (optional, Enter to skip)",
    placeholder: "disc_9",
  });
  if (isCancel(discoveryRun)) {
    prompts.cancel("Launch cancelled.");
    return { code: 1 };
  }

  const content = await prompts.text({
    message: "Page content excerpt (optional, Enter to skip)",
  });
  if (isCancel(content)) {
    prompts.cancel("Launch cancelled.");
    return { code: 1 };
  }

  const metrics = await prompts.text({
    message: "Metrics JSON (optional, Enter to skip)",
    placeholder: '{"score":3}',
    validate: (value) => {
      const raw = value ?? "";
      if (raw.trim() === "") return undefined;
      try {
        JSON.parse(raw);
      } catch {
        return "Metrics must be valid JSON";
      }
      return undefined;
    },
  });
  if (isCancel(metrics)) {
    prompts.cancel("Launch cancelled.");
    return { code: 1 };
  }

  const argv = ["--url", (url as string).trim()];
  const run = optionalText(discoveryRun as string);
  if (run !== undefined) argv.push("--discovery-run", run);
  const body = optionalText(content as string);
  if (body !== undefined) argv.push("--content", body);
  const metricsRaw = optionalText(metrics as string);
  if (metricsRaw !== undefined) argv.push("--metrics", metricsRaw);

  // One-time credentials only when the process env and the `.rank/` home both
  // lack them. Never printed; the delegating command stores a --token value.
  const env = effectiveProcessEnv(context.root, context.processEnv);
  if (!env["CONVEX_URL"]) {
    const deployment = await prompts.text({
      message: "Convex deployment URL (optional, Enter to use CONVEX_URL from env)",
      placeholder: "https://your-deployment.convex.cloud",
    });
    if (isCancel(deployment)) {
      prompts.cancel("Launch cancelled.");
      return { code: 1 };
    }
    const once = optionalText(deployment as string);
    if (once !== undefined) argv.push("--deployment", once);
  }
  if (!env["RANK_AUTH_TOKEN"]) {
    const token = await prompts.password({
      message: "Clerk session token (once, not stored — or run `rank login` first)",
      mask: "*",
    });
    if (isCancel(token)) {
      prompts.cancel("Launch cancelled.");
      return { code: 1 };
    }
    const once = typeof token === "string" ? optionalText(token) : undefined;
    if (once !== undefined) argv.push("--token", once);
    else {
      context.err("No token provided. Run `rank login` to store one, set RANK_AUTH_TOKEN in your shell, and re-run.");
    }
  }

  return launchDeps.runEvaluate(context, argv);
}

export async function runLaunch(context: CommandContext, argv: string[]): Promise<{ code: number }> {
  const parsed = parseLaunchArgs(argv);
  if (!parsed.ok) {
    context.err(`rank launch: ${parsed.error}\n${LAUNCH_USAGE}`);
    return { code: 1 };
  }

  // Deterministic machine form: the guided actions, never a prompt.
  if (parsed.json) {
    context.out(
      JSON.stringify(
        {
          ok: true,
          interactive: false,
          actions: ["doctor", "capabilities", "install", "login", "logout", "whoami", "evaluate"],
          hint: "Run `rank launch` in an interactive terminal (no --json) for guided mode.",
        },
        null,
        2,
      ),
    );
    return { code: 0 };
  }

  const tty = launchDeps.tty();
  if (!shouldPrompt(false, tty)) {
    context.err(
      `rank launch: guided mode needs an interactive terminal.\n` +
        `Use the scriptable commands instead: rank doctor, rank capabilities, rank install, rank evaluate --url <url>.\n` +
        `${LAUNCH_USAGE}`,
    );
    return { code: 2 };
  }

  const prompts = launchDeps.prompts;
  try {
    prompts.intro("rank launch");

    const action = await prompts.select({
      message: "What do you want to do?",
      options: [
        { value: "doctor", label: "Check environment", hint: "rank doctor" },
        { value: "capabilities", label: "List capabilities", hint: "rank capabilities" },
        { value: "install", label: "Check prerequisites", hint: "rank install" },
        { value: "login", label: "Sign in (browser or token)", hint: "rank login" },
        { value: "logout", label: "Sign out stored session", hint: "rank logout" },
        { value: "whoami", label: "Show stored session", hint: "rank whoami" },
        { value: "evaluate", label: "Evaluate one prospect", hint: "rank evaluate" },
      ],
    });
    if (isCancel(action) || typeof action !== "string") {
      prompts.cancel("Launch cancelled.");
      return { code: 1 };
    }

    let result: { code: number };
    if (action === "doctor") result = await launchDeps.runDoctor(context, []);
    else if (action === "capabilities") result = await launchDeps.runCapabilities(context);
    else if (action === "install") result = await launchDeps.runInstall(context);
    else if (action === "login") result = await launchDeps.runLogin(context, []);
    else if (action === "logout") result = await launchDeps.runLogout(context, []);
    else if (action === "whoami") result = await launchDeps.runWhoami(context, []);
    else result = await promptEvaluate(context);

    if (result.code === 0) prompts.outro("Done.");
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    context.err(`rank launch failed: ${message}`);
    return { code: 2 };
  }
}

export const launchCommand: Command = {
  name: "launch",
  summary: "Guided setup and status, then route into the same scriptable commands",
  args: "[--json]",
  run: runLaunch,
};
