import { describe, expect, test } from "bun:test";
import { toolDefinitions } from "./helpers/tool-definitions.ts";
import { createEvaluateProspectTool, toolByName } from "./tools.ts";
import type { ToolImplementationContext } from "./types.ts";
import type {
  EvaluateProspectOptions,
  EvaluateProspectResult,
  ProspectEvaluationRun,
} from "../../../rank-core/src/prospect/index.ts";

const ENV = {
  CONVEX_URL: "https://test-deployment.convex.cloud",
  RANK_AUTH_TOKEN: "test-token",
};

function context(processEnv: Record<string, string | undefined> = ENV): ToolImplementationContext {
  return { root: "test-root", processEnv };
}

const RUN: ProspectEvaluationRun = {
  runId: "run_eval_1",
  sourceDiscoveryRunId: null,
  url: "https://example.com/article",
  state: "completed",
  context: {
    sourceDiscoveryRunId: null,
    prospect: {
      url: "https://example.com/article",
      metrics: { rerankStatus: "ranked", rerankScore: 0.81, homepageRead: true },
    },
    judgment: {
      action: "review",
      confidence: 0.62,
      route: null,
      fitScore: 0.7,
      fitConfidence: 0.6,
      spamProbability: 0.05,
      model: "jev-latest",
      reasons: ["Relevant to the brand", "Needs human verification"],
    },
    error: null,
    attempt: 1,
    startedAt: 1,
    updatedAt: 2,
  },
  createdAt: 1,
  updatedAt: 2,
};

function stubReturning(
  result: EvaluateProspectResult,
  seen: Array<{ prospect: unknown; options: EvaluateProspectOptions | undefined }> = [],
): (prospect: unknown, options?: EvaluateProspectOptions) => Promise<EvaluateProspectResult> {
  return async (prospect, options) => {
    seen.push({ prospect, options });
    return result;
  };
}

describe("rank_evaluate_prospect schema", () => {
  test("exposes the contract params and no others", () => {
    const tool = toolByName("rank_evaluate_prospect");
    expect(tool).toBeDefined();
    const schema = tool?.definition.inputSchema;
    expect(schema?.type).toBe("object");
    expect(schema?.additionalProperties).toBe(false);
    expect(schema?.required).toEqual(["url"]);
    expect(Object.keys(schema?.properties ?? {}).sort()).toEqual(
      [
        "anchorText",
        "brandSummary",
        "content",
        "description",
        "fitRationale",
        "metrics",
        "sourceDiscoveryRunId",
        "sourceDomain",
        "targetDomain",
        "title",
        "url",
      ].sort(),
    );
    expect(tool?.definition.capabilityId).toBe("prospect.evaluate");
  });

  test("advertises the real schema from the registry, not an empty one", async () => {
    const { asRegistry, loadWorkspace, resolveRepoRoot } = await import(
      "../../../rank-core/src/workspace/index.ts"
    );
    const advertised = toolDefinitions(asRegistry(loadWorkspace(resolveRepoRoot())));
    const definition = advertised.find((entry) => entry.name === "rank_evaluate_prospect");
    expect(definition).toBeDefined();
    expect(definition?.inputSchema.required).toEqual(["url"]);
    expect(Object.keys(definition?.inputSchema.properties ?? {})).toContain("sourceDiscoveryRunId");
  });
});

describe("rank_evaluate_prospect env handling", () => {
  test("missing CONVEX_URL names the variable and never reaches the operation", async () => {
    const seen: Array<unknown> = [];
    const tool = createEvaluateProspectTool(async () => {
      seen.push(true);
      return { ok: true, run: RUN };
    });
    const text = await tool.run({ url: "https://example.com/article" }, context({}));
    expect(text).toContain("CONVEX_URL");
    expect(seen).toHaveLength(0);
  });

  test("missing RANK_AUTH_TOKEN names the variable and never reaches the operation", async () => {
    const seen: Array<unknown> = [];
    const tool = createEvaluateProspectTool(async () => {
      seen.push(true);
      return { ok: true, run: RUN };
    });
    const text = await tool.run(
      { url: "https://example.com/article" },
      context({ CONVEX_URL: ENV.CONVEX_URL }),
    );
    expect(text).toContain("RANK_AUTH_TOKEN");
    expect(seen).toHaveLength(0);
  });

  test("non-object args fail as input instead of throwing", async () => {
    const tool = createEvaluateProspectTool(stubReturning({ ok: true, run: RUN }));
    const text = await tool.run(null as unknown as Record<string, unknown>, context());
    expect(text).toContain("[input]");
  });
});

describe("rank_evaluate_prospect result mapping", () => {
  test("success returns run shape: judgment, scores, and provenance", async () => {
    const seen: Array<{ prospect: unknown; options: EvaluateProspectOptions | undefined }> = [];
    const tool = createEvaluateProspectTool(stubReturning({ ok: true, run: RUN }, seen));
    const text = await tool.run(
      { url: "https://example.com/article", title: "Example" },
      context(),
    );
    expect(text).toContain("run_eval_1");
    expect(text).toContain("completed");
    expect(text).toContain("review");
    expect(text).toContain("0.62");
    expect(text).toContain("fitScore=0.7");
    expect(text).toContain("rerankStatus=ranked");
    expect(text).toContain("homepageRead=true");
    expect(text).toContain("Needs human verification");
    expect(seen).toHaveLength(1);
    expect(seen[0]?.options?.deploymentUrl).toBe(ENV.CONVEX_URL);
    expect(seen[0]?.options?.authToken).toBe(ENV.RANK_AUTH_TOKEN);
    expect(seen[0]?.prospect).toEqual({ url: "https://example.com/article", title: "Example" });
  });

  test("forwards sourceDiscoveryRunId as an option, not part of the prospect", async () => {
    const seen: Array<{ prospect: unknown; options: EvaluateProspectOptions | undefined }> = [];
    const tool = createEvaluateProspectTool(stubReturning({ ok: true, run: RUN }, seen));
    await tool.run({ url: "https://example.com/article", sourceDiscoveryRunId: "disc_1" }, context());
    expect(seen[0]?.options?.sourceDiscoveryRunId).toBe("disc_1");
    expect(seen[0]?.prospect).toEqual({ url: "https://example.com/article" });
  });

  test("backend auth failure maps to a tool error carrying kind and message", async () => {
    const tool = createEvaluateProspectTool(
      stubReturning({ ok: false, error: { kind: "auth", message: "Convex rejected the session token" } }),
    );
    const text = await tool.run({ url: "https://example.com/article" }, context());
    expect(text).toContain("[auth]");
    expect(text).toContain("Convex rejected the session token");
  });

  test("backend operation failure maps to a tool error carrying kind and message", async () => {
    const tool = createEvaluateProspectTool(
      stubReturning({
        ok: false,
        error: { kind: "operation", message: "Source competitor discovery must complete before prospect evaluation" },
      }),
    );
    const text = await tool.run({ url: "https://example.com/article" }, context());
    expect(text).toContain("[operation]");
    expect(text).toContain("must complete");
  });

  test("backend input rejection maps to a tool error carrying kind and message", async () => {
    const tool = createEvaluateProspectTool(
      stubReturning({ ok: false, error: { kind: "input", message: 'unknown field "urll"' } }),
    );
    const text = await tool.run({ url: "https://example.com/article", urll: "typo" }, context());
    expect(text).toContain("[input]");
    expect(text).toContain('unknown field "urll"');
  });

  test("a throwing operation becomes a transport tool error instead of throwing", async () => {
    const tool = createEvaluateProspectTool(async () => {
      throw new Error("boom");
    });
    const text = await tool.run({ url: "https://example.com/article" }, context());
    expect(text).toContain("[transport]");
    expect(text).toContain("boom");
  });
});
