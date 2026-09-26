import { afterEach, describe, expect, test } from "bun:test";
import type { EvaluateProspectResult, ProspectEvaluationRun } from "../../../../rank-core/src/prospect/index.ts";
import type { CommandContext } from "../types.ts";
import {
  evaluateCommand,
  evaluateDeps,
  exitCodeForEvaluateError,
  parseEvaluateArgs,
} from "./evaluate.ts";

const RUN: ProspectEvaluationRun = {
  runId: "run_1",
  sourceDiscoveryRunId: null,
  url: "https://example.com/page",
  state: "completed",
  context: {
    sourceDiscoveryRunId: null,
    prospect: { url: "https://example.com/page" },
    judgment: {
      action: "act",
      confidence: 0.82,
      route: null,
      fitScore: null,
      fitConfidence: null,
      spamProbability: null,
      model: null,
      reasons: ["on-brand"],
    },
    error: null,
    attempt: 1,
    startedAt: 1,
    updatedAt: 2,
  },
  createdAt: 1,
  updatedAt: 2,
};

function okRun(run: ProspectEvaluationRun = RUN): EvaluateProspectResult {
  return { ok: true, run };
}

/** Capture output instead of printing it. */
function capture(processEnv: Record<string, string | undefined> = {}) {
  const out: string[] = [];
  const err: string[] = [];
  const context: CommandContext = {
    root: "/tmp/rank-test",
    processEnv,
    out: (line) => out.push(line),
    err: (line) => err.push(line),
  };
  return { context, out, err };
}

const realRun = evaluateDeps.run;
afterEach(() => {
  evaluateDeps.run = realRun;
});

describe("parseEvaluateArgs", () => {
  test("parses every documented flag", () => {
    const parsed = parseEvaluateArgs([
      "--url",
      "https://example.com/page",
      "--title",
      "Example",
      "--description",
      "A page",
      "--source-domain",
      "example.com",
      "--anchor-text",
      "click",
      "--target-domain",
      "shop.example",
      "--fit-rationale",
      "fits",
      "--brand-summary",
      "brand",
      "--content",
      "excerpt",
      "--metrics",
      JSON.stringify({ score: 3 }),
      "--discovery-run",
      "disc_9",
      "--deployment",
      "https://x.convex.cloud",
      "--token",
      "tok",
      "--json",
    ]);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) throw new Error("expected ok");
    expect(parsed.args).toEqual({
      url: "https://example.com/page",
      title: "Example",
      description: "A page",
      sourceDomain: "example.com",
      anchorText: "click",
      targetDomain: "shop.example",
      fitRationale: "fits",
      brandSummary: "brand",
      content: "excerpt",
      metricsJson: JSON.stringify({ score: 3 }),
      discoveryRun: "disc_9",
      deployment: "https://x.convex.cloud",
      token: "tok",
      json: true,
    });
  });

  test("accepts --flag=value form", () => {
    const parsed = parseEvaluateArgs(["--url=https://example.com/page", "--json"]);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) throw new Error("expected ok");
    expect(parsed.args.url).toBe("https://example.com/page");
    expect(parsed.args.json).toBe(true);
  });

  test("rejects a missing --url", () => {
    const parsed = parseEvaluateArgs(["--title", "Example"]);
    expect(parsed.ok).toBe(false);
    if (parsed.ok) throw new Error("expected failure");
    expect(parsed.error).toContain("--url");
  });

  test("rejects an unknown option instead of forwarding it", () => {
    const parsed = parseEvaluateArgs(["--url", "https://example.com", "--bogus", "x"]);
    expect(parsed.ok).toBe(false);
    if (parsed.ok) throw new Error("expected failure");
    expect(parsed.error).toContain("unknown option");
    expect(parsed.error).toContain("--bogus");
  });

  test("rejects a flag with no value", () => {
    const parsed = parseEvaluateArgs(["--url", "https://example.com", "--title"]);
    expect(parsed.ok).toBe(false);
    if (parsed.ok) throw new Error("expected failure");
    expect(parsed.error).toContain("--title");
  });

  test("rejects a positional argument", () => {
    const parsed = parseEvaluateArgs(["https://example.com"]);
    expect(parsed.ok).toBe(false);
  });

  test("rejects a value on --json", () => {
    const parsed = parseEvaluateArgs(["--url", "https://example.com", "--json=true"]);
    expect(parsed.ok).toBe(false);
  });
});

describe("exitCodeForEvaluateError", () => {
  test("usage/input/config failures exit 1, runtime failures exit 2", () => {
    for (const kind of ["input", "config", "auth"] as const) {
      expect(exitCodeForEvaluateError({ kind, message: "m" })).toBe(1);
    }
    for (const kind of ["operation", "transport"] as const) {
      expect(exitCodeForEvaluateError({ kind, message: "m" })).toBe(2);
    }
  });
});

describe("evaluateCommand", () => {
  test("renders run id, state, and judgment action/confidence on success", async () => {
    let calls = 0;
    evaluateDeps.run = (async () => {
      calls++;
      return okRun();
    }) as typeof evaluateDeps.run;
    const io = capture({ CONVEX_URL: "https://x.convex.cloud", RANK_AUTH_TOKEN: "tok" });
    const result = await evaluateCommand.run(io.context, ["--url", "https://example.com/page"]);
    expect(result.code).toBe(0);
    expect(calls).toBe(1);
    const text = io.out.join("\n");
    expect(text).toContain("run_1");
    expect(text).toContain("completed");
    expect(text).toContain("act");
    expect(text).toContain("0.82");
    expect(io.err).toHaveLength(0);
  });

  test("--json prints the raw run shape", async () => {
    evaluateDeps.run = (async () => okRun()) as typeof evaluateDeps.run;
    const io = capture({ CONVEX_URL: "https://x.convex.cloud", RANK_AUTH_TOKEN: "tok" });
    const result = await evaluateCommand.run(io.context, ["--url", "https://example.com/page", "--json"]);
    expect(result.code).toBe(0);
    const raw = JSON.parse(io.out.join("\n")) as ProspectEvaluationRun;
    expect(raw.runId).toBe("run_1");
    expect(raw.state).toBe("completed");
    expect(raw.context.judgment?.action).toBe("act");
  });

  test("flags win over the environment for deployment and token", async () => {
    const seen: Array<{ deploymentUrl?: string; authToken?: string }> = [];
    evaluateDeps.run = (async (_prospect: unknown, options?: {
      deploymentUrl?: string;
      authToken?: string;
    }) => {
      seen.push({ deploymentUrl: options?.deploymentUrl, authToken: options?.authToken });
      return okRun();
    }) as typeof evaluateDeps.run;
    const io = capture({ CONVEX_URL: "https://env.convex.cloud", RANK_AUTH_TOKEN: "env-tok" });
    const result = await evaluateCommand.run(io.context, [
      "--url",
      "https://example.com/page",
      "--deployment",
      "https://flag.convex.cloud",
      "--token",
      "flag-tok",
    ]);
    expect(result.code).toBe(0);
    expect(seen[0]?.deploymentUrl).toBe("https://flag.convex.cloud");
    expect(seen[0]?.authToken).toBe("flag-tok");
  });

  test("falls back to CONVEX_URL and RANK_AUTH_TOKEN when flags are absent", async () => {
    const seen: Array<{ deploymentUrl?: string; authToken?: string }> = [];
    evaluateDeps.run = (async (_prospect: unknown, options?: {
      deploymentUrl?: string;
      authToken?: string;
    }) => {
      seen.push({ deploymentUrl: options?.deploymentUrl, authToken: options?.authToken });
      return okRun();
    }) as typeof evaluateDeps.run;
    const io = capture({ CONVEX_URL: "https://env.convex.cloud", RANK_AUTH_TOKEN: "env-tok" });
    const result = await evaluateCommand.run(io.context, ["--url", "https://example.com/page"]);
    expect(result.code).toBe(0);
    expect(seen[0]?.deploymentUrl).toBe("https://env.convex.cloud");
    expect(seen[0]?.authToken).toBe("env-tok");
  });

  test("forwards the discovery run id only when given", async () => {
    const seen: Array<Record<string, unknown>> = [];
    evaluateDeps.run = (async (_prospect: unknown, options?: { sourceDiscoveryRunId?: string }) => {
      seen.push({ sourceDiscoveryRunId: options?.sourceDiscoveryRunId });
      return okRun();
    }) as typeof evaluateDeps.run;
    const io = capture({ CONVEX_URL: "https://x.convex.cloud", RANK_AUTH_TOKEN: "tok" });
    await evaluateCommand.run(io.context, [
      "--url",
      "https://example.com/page",
      "--discovery-run",
      "disc_9",
    ]);
    expect(seen[0]?.["sourceDiscoveryRunId"]).toBe("disc_9");
  });

  test("a config error exits 1 without hitting the network", async () => {
    evaluateDeps.run = (async () => ({
      ok: false,
      error: { kind: "config", message: "No Convex deployment URL. Pass deploymentUrl or set CONVEX_URL." },
    })) as typeof evaluateDeps.run;
    const io = capture();
    const result = await evaluateCommand.run(io.context, ["--url", "https://example.com/page"]);
    expect(result.code).toBe(1);
    expect(io.err.join("\n")).toContain("CONVEX_URL");
    expect(io.out).toHaveLength(0);
  });

  test("an operation-level rejection (e.g. unknown field) exits 1", async () => {
    evaluateDeps.run = (async () => ({
      ok: false,
      error: { kind: "input", message: 'unknown field "urll"' },
    })) as typeof evaluateDeps.run;
    const io = capture();
    const result = await evaluateCommand.run(io.context, ["--url", "https://example.com/page"]);
    expect(result.code).toBe(1);
    expect(io.err.join("\n")).toContain("unknown field");
  });

  test("a transport failure exits 2", async () => {
    evaluateDeps.run = (async () => ({
      ok: false,
      error: { kind: "transport", message: "fetch failed" },
    })) as typeof evaluateDeps.run;
    const io = capture();
    const result = await evaluateCommand.run(io.context, ["--url", "https://example.com/page"]);
    expect(result.code).toBe(2);
    expect(io.err.join("\n")).toContain("fetch failed");
  });

  test("a usage error exits 1 and never calls the operation", async () => {
    let calls = 0;
    evaluateDeps.run = (async () => {
      calls++;
      return okRun();
    }) as typeof evaluateDeps.run;
    const io = capture();
    const result = await evaluateCommand.run(io.context, []);
    expect(result.code).toBe(1);
    expect(calls).toBe(0);
    expect(io.err.join("\n")).toContain("--url");
  });

  test("a throwing operation is caught and exits 2 as transport", async () => {
    evaluateDeps.run = (async () => {
      throw new Error("boom");
    }) as typeof evaluateDeps.run;
    const io = capture();
    const result = await evaluateCommand.run(io.context, ["--url", "https://example.com/page"]);
    expect(result.code).toBe(2);
    expect(io.err.join("\n")).toContain("transport");
    expect(io.err.join("\n")).toContain("boom");
  });

  test("--content and --metrics reach the prospect", async () => {
    let seen: Record<string, unknown> = {};
    evaluateDeps.run = (async (prospect: unknown) => {
      seen = prospect as Record<string, unknown>;
      return okRun();
    }) as typeof evaluateDeps.run;
    const io = capture();
    const result = await evaluateCommand.run(io.context, [
      "--url",
      "https://example.com/page",
      "--content",
      "excerpt",
      "--metrics",
      JSON.stringify({ score: 3 }),
    ]);
    expect(result.code).toBe(0);
    expect(seen["content"]).toBe("excerpt");
    expect(seen["metrics"]).toEqual({ score: 3 });
  });

  test("invalid --metrics JSON exits 1 without calling the operation", async () => {
    let calls = 0;
    evaluateDeps.run = (async () => {
      calls++;
      return okRun();
    }) as typeof evaluateDeps.run;
    const io = capture();
    const result = await evaluateCommand.run(io.context, [
      "--url",
      "https://example.com/page",
      "--metrics",
      "{broken",
    ]);
    expect(result.code).toBe(1);
    expect(calls).toBe(0);
    expect(io.err.join("\n")).toContain("--metrics");
  });
});
