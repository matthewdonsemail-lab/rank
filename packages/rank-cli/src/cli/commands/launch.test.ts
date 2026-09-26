import { afterEach, describe, expect, test } from "bun:test";
import type { CommandContext } from "../types.ts";
import { launchDeps, parseLaunchArgs, runLaunch, shouldPrompt } from "./launch.ts";

function capture(processEnv: Record<string, string | undefined> = {}) {
  const out: string[] = [];
  const err: string[] = [];
  const context: CommandContext = {
    root: "/tmp/rank-launch-test",
    processEnv,
    out: (line) => out.push(line),
    err: (line) => err.push(line),
  };
  return { context, out, err };
}

const realDeps = {
  prompts: launchDeps.prompts,
  tty: launchDeps.tty,
  runDoctor: launchDeps.runDoctor,
  runCapabilities: launchDeps.runCapabilities,
  runInstall: launchDeps.runInstall,
  runEvaluate: launchDeps.runEvaluate,
};

afterEach(() => {
  launchDeps.prompts = realDeps.prompts;
  launchDeps.tty = realDeps.tty;
  launchDeps.runDoctor = realDeps.runDoctor;
  launchDeps.runCapabilities = realDeps.runCapabilities;
  launchDeps.runInstall = realDeps.runInstall;
  launchDeps.runEvaluate = realDeps.runEvaluate;
});

function stubPrompts(overrides: Partial<typeof launchDeps.prompts> = {}) {
  const calls: string[] = [];
  launchDeps.prompts = {
    intro: () => {
      calls.push("intro");
    },
    outro: () => {
      calls.push("outro");
    },
    cancel: () => {
      calls.push("cancel");
    },
    select: async () => {
      calls.push("select");
      throw new Error("prompt-stub: unexpected select");
    },
    text: async () => {
      calls.push("text");
      throw new Error("prompt-stub: unexpected text");
    },
    password: async () => {
      calls.push("password");
      throw new Error("prompt-stub: unexpected password");
    },
    ...overrides,
  };
  return calls;
}

describe("parseLaunchArgs", () => {
  test("accepts empty and --json", () => {
    expect(parseLaunchArgs([])).toEqual({ ok: true, json: false });
    expect(parseLaunchArgs(["--json"])).toEqual({ ok: true, json: true });
  });

  test("rejects unknown flags, values on --json, and positionals", () => {
    expect(parseLaunchArgs(["--bogus"]).ok).toBe(false);
    expect(parseLaunchArgs(["--json=true"]).ok).toBe(false);
    expect(parseLaunchArgs(["doctor"]).ok).toBe(false);
  });
});

describe("shouldPrompt", () => {
  test("--json never prompts even on a TTY", () => {
    expect(shouldPrompt(true, { stdinTTY: true, stdoutTTY: true })).toBe(false);
  });

  test("piped output never prompts", () => {
    expect(shouldPrompt(false, { stdinTTY: true, stdoutTTY: false })).toBe(false);
    expect(shouldPrompt(false, { stdinTTY: false, stdoutTTY: true })).toBe(false);
    expect(shouldPrompt(false, { stdinTTY: undefined, stdoutTTY: undefined })).toBe(false);
  });

  test("TTY + no --json prompts", () => {
    expect(shouldPrompt(false, { stdinTTY: true, stdoutTTY: true })).toBe(true);
  });
});

describe("runLaunch", () => {
  test("--json is deterministic and never prompts", async () => {
    const calls = stubPrompts();
    launchDeps.tty = () => ({ stdinTTY: true, stdoutTTY: true });
    const io = capture();
    const result = await runLaunch(io.context, ["--json"]);
    expect(result.code).toBe(0);
    expect(calls).toHaveLength(0);
    const body = JSON.parse(io.out.join("\n")) as { actions: string[] };
    expect(body.actions).toEqual(["doctor", "capabilities", "install", "login", "logout", "whoami", "evaluate"]);
  });

  test("non-TTY never prompts and points at scriptable commands", async () => {
    const calls = stubPrompts();
    launchDeps.tty = () => ({ stdinTTY: false, stdoutTTY: true });
    const io = capture();
    const result = await runLaunch(io.context, []);
    expect(result.code).toBe(2);
    expect(calls).toHaveLength(0);
    expect(io.err.join("\n")).toContain("rank doctor");
  });

  test("interactive doctor delegates to the existing command", async () => {
    stubPrompts({ select: async () => "doctor" });
    launchDeps.tty = () => ({ stdinTTY: true, stdoutTTY: true });
    let seen = 0;
    launchDeps.runDoctor = () => {
      seen++;
      return { code: 0 };
    };
    const io = capture();
    const result = await runLaunch(io.context, []);
    expect(result.code).toBe(0);
    expect(seen).toBe(1);
  });

  test("cancel exits 1 without delegating", async () => {
    stubPrompts({ select: async () => undefined });
    launchDeps.tty = () => ({ stdinTTY: true, stdoutTTY: true });
    let seen = 0;
    launchDeps.runDoctor = () => {
      seen++;
      return { code: 0 };
    };
    const io = capture();
    const result = await runLaunch(io.context, []);
    expect(result.code).toBe(1);
    expect(seen).toBe(0);
  });

  test("evaluate builds the existing flags and delegates", async () => {
    const texts = ["https://example.com/page", "", "excerpt", JSON.stringify({ score: 3 })];
    stubPrompts({
      select: async () => "evaluate",
      text: (async () => texts.shift() ?? "") as typeof launchDeps.prompts.text,
    });
    launchDeps.tty = () => ({ stdinTTY: true, stdoutTTY: true });
    let argv: string[] = [];
    launchDeps.runEvaluate = async (_context, next) => {
      argv = next;
      return { code: 0 };
    };
    const io = capture({ CONVEX_URL: "https://x.convex.cloud", RANK_AUTH_TOKEN: "tok" });
    const result = await runLaunch(io.context, []);
    expect(result.code).toBe(0);
    expect(argv).toEqual([
      "--url",
      "https://example.com/page",
      "--content",
      "excerpt",
      "--metrics",
      JSON.stringify({ score: 3 }),
    ]);
  });

  test("one-time token is masked, passed through, and never printed", async () => {
    const secret = "secret-tok-123";
    let passwordCalled = 0;
    stubPrompts({
      select: async () => "evaluate",
      text: (async (options: { message: string }) => {
        if (options.message.includes("Prospect URL")) return "https://example.com/page";
        if (options.message.includes("Convex deployment")) return "";
        return "";
      }) as typeof launchDeps.prompts.text,
      password: (async () => {
        passwordCalled++;
        return secret;
      }) as typeof launchDeps.prompts.password,
    });
    launchDeps.tty = () => ({ stdinTTY: true, stdoutTTY: true });
    let argv: string[] = [];
    launchDeps.runEvaluate = async (_context, next) => {
      argv = next;
      return { code: 0 };
    };
    const io = capture({ CONVEX_URL: "https://x.convex.cloud" });
    const result = await runLaunch(io.context, []);
    expect(result.code).toBe(0);
    expect(passwordCalled).toBe(1);
    expect(argv).toContain(secret);
    expect(io.out.join("\n")).not.toContain(secret);
    expect(io.err.join("\n")).not.toContain(secret);
  });
});
