import { describe, expect, test } from "bun:test";
import { ConvexError } from "convex/values";
import { evaluateProspect } from "./prospect.ts";
import type { ConvexActionCaller } from "./types.ts";

const OPTIONS = {
  deploymentUrl: "https://test-deployment.convex.cloud",
  authToken: "test-token",
};

const RUN = {
  runId: "run_1",
  sourceDiscoveryRunId: null,
  url: "https://example.com/page",
  state: "completed",
  context: {
    sourceDiscoveryRunId: null,
    prospect: { url: "https://example.com/page" },
    judgment: null,
    error: null,
    attempt: 1,
    startedAt: 1,
    updatedAt: 2,
  },
  createdAt: 1,
  updatedAt: 2,
};

function callerReturning(value: unknown): ConvexActionCaller {
  return async () => value;
}

function callerThrowing(error: unknown): ConvexActionCaller {
  return async () => {
    throw error;
  };
}

describe("evaluateProspect", () => {
  test("calls the evaluation action and returns the run", async () => {
    const seen: Array<{ path: string; args: Record<string, unknown> }> = [];
    const caller: ConvexActionCaller = async (_url, _token, path, args) => {
      seen.push({ path, args });
      return RUN;
    };
    const result = await evaluateProspect({ url: "https://example.com/page" }, { ...OPTIONS, caller });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected ok");
    expect(result.run.runId).toBe("run_1");
    expect(result.run.state).toBe("completed");
    expect(seen).toHaveLength(1);
    expect(seen[0]?.path).toBe("prospectEvaluation:startProspectEvaluation");
    expect(seen[0]?.args["prospect"]).toEqual({ url: "https://example.com/page" });
  });

  test("forwards an explicit discovery run id", async () => {
    const seen: Array<Record<string, unknown>> = [];
    const caller: ConvexActionCaller = async (_url, _token, _path, args) => {
      seen.push(args);
      return RUN;
    };
    const result = await evaluateProspect({ url: "https://example.com/page" }, {
      ...OPTIONS,
      sourceDiscoveryRunId: "disc_9",
      caller,
    });
    expect(result.ok).toBe(true);
    expect(seen[0]?.["sourceDiscoveryRunId"]).toBe("disc_9");
  });

  test("invalid input never reaches the transport", async () => {
    let called = false;
    const caller: ConvexActionCaller = async () => {
      called = true;
      return RUN;
    };
    const result = await evaluateProspect({ url: "not a url" }, { ...OPTIONS, caller });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.error.kind).toBe("input");
    expect(called).toBe(false);
  });

  test("unknown fields are rejected before the call", async () => {
    let called = false;
    const caller: ConvexActionCaller = async () => {
      called = true;
      return RUN;
    };
    const result = await evaluateProspect(
      { url: "https://example.com", urll: "typo" },
      { ...OPTIONS, caller },
    );
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.error.kind).toBe("input");
    expect(called).toBe(false);
  });

  test("missing deployment url and token report config, naming the fix", async () => {
    const noUrl = await evaluateProspect({ url: "https://example.com" }, { authToken: "t" });
    expect(noUrl.ok).toBe(false);
    if (noUrl.ok) throw new Error("expected failure");
    expect(noUrl.error.kind).toBe("config");
    expect(noUrl.error.message).toContain("CONVEX_URL");

    const noToken = await evaluateProspect({ url: "https://example.com" }, {
      deploymentUrl: "https://x.convex.cloud",
    });
    expect(noToken.ok).toBe(false);
    if (noToken.ok) throw new Error("expected failure");
    expect(noToken.error.kind).toBe("config");
    expect(noToken.error.message).toContain("RANK_AUTH_TOKEN");
  });

  test("backend authentication failure maps to auth, not operation", async () => {
    const result = await evaluateProspect({ url: "https://example.com" }, {
      ...OPTIONS,
      caller: callerThrowing(new ConvexError("Authentication required")),
    });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.error.kind).toBe("auth");
  });

  test("backend validation failure maps to operation with the backend message", async () => {
    const result = await evaluateProspect({ url: "https://example.com" }, {
      ...OPTIONS,
      caller: callerThrowing(new ConvexError("Source competitor discovery must complete before prospect evaluation")),
    });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.error.kind).toBe("operation");
    expect(result.error.message).toContain("must complete");
  });

  test("network failure maps to transport", async () => {
    const result = await evaluateProspect({ url: "https://example.com" }, {
      ...OPTIONS,
      caller: callerThrowing(new TypeError("fetch failed")),
    });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.error.kind).toBe("transport");
  });

  test("an unexpected run shape maps to transport", async () => {
    const result = await evaluateProspect({ url: "https://example.com" }, {
      ...OPTIONS,
      caller: callerReturning({ nope: true }),
    });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.error.kind).toBe("transport");
  });

  test("the operation never throws", async () => {
    const result = await evaluateProspect(null, {});
    expect(result.ok).toBe(false);
  });
});
