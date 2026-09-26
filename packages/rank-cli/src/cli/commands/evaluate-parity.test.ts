import { afterEach, describe, expect, test } from "bun:test";
import type {
  EvaluateProspectResult,
  ProspectErrorKind,
  ProspectEvaluationRun,
} from "../../../../rank-core/src/prospect/index.ts";
import type { CommandContext } from "../types.ts";
import { evaluateDeps, exitCodeForEvaluateError, runEvaluate } from "./evaluate.ts";
import { createEvaluateProspectTool } from "../../../../rank-mcp/src/mcp/tools.ts";

// Mirror: packages/rank-mcp/src/mcp/evaluate-parity.test.ts contains the same
// suite with adjusted import paths, so `bun test` in EITHER adapter package
// proves CLI<->MCP parity independently. No shared test-helper package exists;
// duplication is intentional and this header keeps the two copies traceable.

/* NORMALIZATION (auditable comparison, not coincidental equality):
 *
 * Both adapters are thin transports over the same shared operation
 * (`evaluateProspect` in rank-core). Each wraps the operation result in
 * transport-specific framing:
 * - CLI: exit code (0 ok / 1 usage-input-config-auth / 2
 *   operation-transport per exitCodeForEvaluateError) + stdout (human text,
 *   or the raw run as JSON with --json) + stderr (human error line, or
 *   {ok:false,error} as JSON with --json).
 * - MCP: a single returned string — either the rendered run text
 *   (renderEvaluationRun) or `rank_evaluate_prospect failed [kind]: message`.
 *
 * normalizeCli / normalizeMcp strip exactly that framing and recover one of:
 *   { ok:true, runId, url, state, action, confidence, rerankStatus, homepageRead }
 *   { ok:false, error:{ kind, message } }
 * Parity holds when both normalized forms deep-equal each other AND the
 * stubbed operation result they were driven with. Every test below drives
 * BOTH adapters against the SAME stubbed EvaluateProspectResult (no network:
 * the stub sits at each adapter's evaluateProspect injection point).
 */

const ENV = {
  CONVEX_URL: "https://parity.convex.cloud",
  RANK_AUTH_TOKEN: "parity-tok",
};

const RUN: ProspectEvaluationRun = {
  runId: "run_parity_1",
  sourceDiscoveryRunId: "disc_parity_9",
  url: "https://example.com/parity",
  state: "completed",
  context: {
    sourceDiscoveryRunId: "disc_parity_9",
    prospect: {
      url: "https://example.com/parity",
      title: "Parity",
      metrics: { rerankStatus: "ranked", homepageRead: true },
    },
    judgment: {
      action: "review",
      confidence: 0.62,
      route: null,
      fitScore: 0.7,
      fitConfidence: 0.6,
      spamProbability: 0.05,
      model: "parity-model",
      reasons: ["Relevant to the brand"],
    },
    error: null,
    attempt: 1,
    startedAt: 1,
    updatedAt: 2,
  },
  createdAt: 1,
  updatedAt: 2,
};

type Normalized =
  | {
      ok: true;
      runId: string;
      url: string;
      state: string;
      action: string | null;
      confidence: number | null;
      rerankStatus: string | null;
      homepageRead: string | null;
    }
  | { ok: false; error: { kind: string; message: string } };

function firstGroup(pattern: RegExp, text: string): string | null {
  const match = pattern.exec(text);
  return match?.[1] ?? null;
}

function normalizeCli(code: number, out: string, err: string): Normalized {
  if (code === 0) {
    // --json prints the raw run shape on stdout; pick the parity-relevant fields.
    const run = JSON.parse(out) as ProspectEvaluationRun;
    const metrics = (run.context.prospect.metrics ?? {}) as Record<string, unknown>;
    return {
      ok: true,
      runId: run.runId,
      url: run.url,
      state: run.state,
      action: run.context.judgment?.action ?? null,
      confidence: run.context.judgment?.confidence ?? null,
      rerankStatus:
        metrics["rerankStatus"] === undefined ? null : String(metrics["rerankStatus"]),
      homepageRead:
        metrics["homepageRead"] === undefined ? null : String(metrics["homepageRead"]),
    };
  }
  // --json prints {ok:false,error} on stderr; human mode prints
  // `rank evaluate failed (kind): message`. Prefer the machine form.
  try {
    const body = JSON.parse(err) as { ok: boolean; error: { kind: string; message: string } };
    return { ok: false, error: { kind: body.error.kind, message: body.error.message } };
  } catch {
    const kind = firstGroup(/failed \(([\w-]+)\)/, err) ?? "unknown";
    const message = firstGroup(/failed \([\w-]+\): ([\s\S]*)/, err) ?? err;
    return { ok: false, error: { kind, message } };
  }
}

function normalizeMcp(text: string): Normalized {
  if (text.startsWith("Prospect evaluation ")) {
    const runId = firstGroup(/^Prospect evaluation (\S+) — /m, text) ?? "";
    const url = firstGroup(/^url: (\S+)$/m, text) ?? "";
    const state = firstGroup(/^Prospect evaluation \S+ — (\S+)$/m, text) ?? "";
    const action = firstGroup(/^judgment: (\S+) \(confidence /m, text);
    const confidenceRaw = firstGroup(/^judgment: \S+ \(confidence ([\d.]+)\)/m, text);
    const rerankStatus = firstGroup(/rerankStatus=([^,\s]+)/, text);
    const homepageRead = firstGroup(/homepageRead=([^\s]+)/, text);
    return {
      ok: true,
      runId,
      url,
      state,
      action,
      confidence: confidenceRaw === null ? null : Number(confidenceRaw),
      rerankStatus,
      homepageRead,
    };
  }
  const kind = firstGroup(/failed \[([\w-]+)\]/, text) ?? "unknown";
  const message = firstGroup(/failed \[[\w-]+\]: ([\s\S]*)/, text) ?? text;
  return { ok: false, error: { kind, message } };
}

const realRun = evaluateDeps.run;
afterEach(() => {
  evaluateDeps.run = realRun;
});

async function driveCli(
  stubResult: EvaluateProspectResult,
  argv: string[],
  seen: Array<{ prospect: unknown; options: unknown }>,
): Promise<{ code: number; out: string; err: string }> {
  evaluateDeps.run = (async (prospect: unknown, options?: unknown) => {
    seen.push({ prospect, options });
    return stubResult;
  }) as typeof evaluateDeps.run;
  const out: string[] = [];
  const err: string[] = [];
  const context: CommandContext = {
    root: "/tmp/rank-parity",
    processEnv: { ...ENV },
    out: (line) => out.push(line),
    err: (line) => err.push(line),
  };
  const result = await runEvaluate(context, argv);
  return { code: result.code, out: out.join("\n"), err: err.join("\n") };
}

async function driveMcp(
  stubResult: EvaluateProspectResult,
  args: Record<string, unknown>,
  seen: Array<{ prospect: unknown; options: unknown }>,
): Promise<string> {
  const tool = createEvaluateProspectTool(async (prospect: unknown, options?: unknown) => {
    seen.push({ prospect, options });
    return stubResult;
  });
  return tool.run(args, { root: "parity-root", processEnv: { ...ENV } });
}

describe("prospect.evaluate cross-adapter parity", () => {
  test("success: same stubbed run normalizes equal across CLI and MCP", async () => {
    const cliSeen: Array<{ prospect: unknown; options: unknown }> = [];
    const mcpSeen: Array<{ prospect: unknown; options: unknown }> = [];
    const stub: EvaluateProspectResult = { ok: true, run: RUN };

    const cli = await driveCli(stub, ["--url", "https://example.com/parity", "--json"], cliSeen);
    const mcpText = await driveMcp(stub, { url: "https://example.com/parity" }, mcpSeen);

    expect(cli.code).toBe(0);
    const cliNorm = normalizeCli(cli.code, cli.out, cli.err);
    const mcpNorm = normalizeMcp(mcpText);
    // The core parity assertion: transports stripped, both equal each other…
    expect(mcpNorm).toEqual(cliNorm);
    // …and both equal the stubbed operation result (not just each other).
    expect(cliNorm).toEqual({
      ok: true,
      runId: "run_parity_1",
      url: "https://example.com/parity",
      state: "completed",
      action: "review",
      confidence: 0.62,
      rerankStatus: "ranked",
      homepageRead: "true",
    });
    expect(cliSeen).toHaveLength(1);
    expect(mcpSeen).toHaveLength(1);
  });

  test("same logical input reaches the shared operation identically", async () => {
    const cliSeen: Array<{ prospect: unknown; options: unknown }> = [];
    const mcpSeen: Array<{ prospect: unknown; options: unknown }> = [];
    const stub: EvaluateProspectResult = { ok: true, run: RUN };

    // Common-subset fields only: the CLI has no --content/--metrics flags, so
    // full-schema inputs cannot be expressed there (see final report).
    await driveCli(
      stub,
      [
        "--url",
        "https://example.com/parity",
        "--title",
        "Parity",
        "--brand-summary",
        "Brand",
        "--discovery-run",
        "disc_parity_9",
        "--json",
      ],
      cliSeen,
    );
    await driveMcp(
      stub,
      {
        url: "https://example.com/parity",
        title: "Parity",
        brandSummary: "Brand",
        sourceDiscoveryRunId: "disc_parity_9",
      },
      mcpSeen,
    );

    // --discovery-run (CLI) and sourceDiscoveryRunId (MCP) both arrive as the
    // operation option, never as part of the prospect.
    expect(cliSeen[0]?.prospect).toEqual(mcpSeen[0]?.prospect);
    expect(cliSeen[0]?.prospect).toEqual({
      url: "https://example.com/parity",
      title: "Parity",
      brandSummary: "Brand",
    });
    expect(cliSeen[0]?.options).toEqual(mcpSeen[0]?.options);
    expect(cliSeen[0]?.options).toEqual({
      deploymentUrl: ENV.CONVEX_URL,
      authToken: ENV.RANK_AUTH_TOKEN,
      sourceDiscoveryRunId: "disc_parity_9",
    });
  });

  const errorCases: Array<{ kind: ProspectErrorKind; message: string; exitCode: number }> = [
    { kind: "input", message: 'unknown field "urll"', exitCode: 1 },
    { kind: "config", message: "No Convex deployment URL. Pass deploymentUrl or set CONVEX_URL.", exitCode: 1 },
    { kind: "auth", message: "Convex rejected the session token", exitCode: 1 },
    {
      kind: "operation",
      message: "Source competitor discovery must complete before prospect evaluation",
      exitCode: 2,
    },
    { kind: "transport", message: "fetch failed", exitCode: 2 },
  ];

  for (const { kind, message, exitCode } of errorCases) {
    test(`error kind "${kind}": both adapters surface kind+message, CLI exits ${exitCode}, neither throws`, async () => {
      const stub: EvaluateProspectResult = { ok: false, error: { kind, message } };
      // Awaiting directly: any throw across the adapter boundary fails the test.
      const cli = await driveCli(stub, ["--url", "https://example.com/parity", "--json"], []);
      const mcpText = await driveMcp(stub, { url: "https://example.com/parity" }, []);

      expect(cli.code).toBe(exitCode);
      expect(cli.code).toBe(exitCodeForEvaluateError({ kind, message }));
      const cliNorm = normalizeCli(cli.code, cli.out, cli.err);
      const mcpNorm = normalizeMcp(mcpText);
      expect(mcpNorm).toEqual(cliNorm);
      expect(cliNorm).toEqual({ ok: false, error: { kind, message } });
      expect(mcpText).toContain(`[${kind}]`);
      expect(mcpText).toContain(message);
      expect(cli.err).toContain(kind);
      // --json stderr is JSON-escaped, so assert the message on the parsed
      // form rather than as a raw substring.
      expect((JSON.parse(cli.err) as { error: { message: string } }).error.message).toBe(message);
    });
  }

  test("human rendering: both carry run/state/judgment; MCP additionally carries provenance", async () => {
    const stub: EvaluateProspectResult = { ok: true, run: RUN };
    const cli = await driveCli(stub, ["--url", "https://example.com/parity"], []);
    const mcpText = await driveMcp(stub, { url: "https://example.com/parity" }, []);

    expect(cli.code).toBe(0);
    for (const needle of ["run_parity_1", "completed", "review", "0.62"]) {
      expect(cli.out).toContain(needle);
      expect(mcpText).toContain(needle);
    }
    // MCP's text rendering carries provenance explicitly. The CLI's human
    // summary is run/state/judgment only; its provenance-preserving surface
    // is --json (asserted in the success test via normalizeCli), so no
    // provenance claim is made about human stdout here.
    expect(mcpText).toContain("rerankStatus=ranked");
    expect(mcpText).toContain("homepageRead=true");
  });

  test("usage-level input errors stay transport-local but map per contract", async () => {
    // CLI: missing --url never reaches the operation, exits 1 (usage).
    const cliSeen: Array<{ prospect: unknown; options: unknown }> = [];
    const cli = await driveCli({ ok: true, run: RUN }, [], cliSeen);
    expect(cli.code).toBe(1);
    expect(cliSeen).toHaveLength(0);
    expect(cli.err).toContain("--url");

    // MCP: non-object args never reach the operation, fail as [input].
    const mcpSeen: Array<{ prospect: unknown; options: unknown }> = [];
    const tool = createEvaluateProspectTool(async (prospect: unknown, options?: unknown) => {
      mcpSeen.push({ prospect, options });
      return { ok: true, run: RUN };
    });
    const text = await tool.run(null as unknown as Record<string, unknown>, {
      root: "parity-root",
      processEnv: { ...ENV },
    });
    expect(text).toContain("[input]");
    expect(mcpSeen).toHaveLength(0);
  });
});
