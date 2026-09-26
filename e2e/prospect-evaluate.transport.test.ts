/** FAKE transport-seam E2E for prospect.evaluate (rank-o9fu).
 *
 * Drives the REAL `evaluateProspect` operation with a fake
 * `ConvexActionCaller` that replays recorded live-shaped responses. No
 * network, no Convex deployment, no secrets. Every test is FAKE by
 * construction: only `evaluateProspect` is real; the transport is injected.
 *
 * Recorded shapes mirror `toPublicRun` in convex/prospectEvaluation.ts:
 * { runId, sourceDiscoveryRunId, url, state, context, createdAt, updatedAt }.
 */
import { describe, expect, test } from "bun:test";
import { ConvexError } from "convex/values";
import { evaluateProspect } from "../packages/rank-core/src/prospect/prospect.ts";
import type { ConvexActionCaller } from "../packages/rank-core/src/prospect/types.ts";

const OPTIONS = {
  deploymentUrl: "https://fake-deployment.convex.cloud",
  authToken: "fake-clerk-session-token",
};

const BASE_RUN = {
  runId: "jn_fake_run_01",
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
      fitScore: 0.77,
      fitConfidence: 0.8,
      spamProbability: 0.05,
      model: "jev-latest",
      reasons: ["Topical overlap with brand offerings"],
    },
    error: null,
    attempt: 1,
    startedAt: 1700000000000,
    updatedAt: 1700000001000,
  },
  createdAt: 1700000000000,
  updatedAt: 1700000001000,
};

/** Recorded success: judgment + provenance (ranked, homepage read). */
const RUN_RANKED = {
  ...BASE_RUN,
  context: {
    ...BASE_RUN.context,
    prospect: {
      url: "https://example.com/page",
      title: "Example Journal",
      description: "A publication about the industry",
      metrics: { rerankStatus: "ranked", homepageRead: true },
    },
  },
};

/** Recorded provider-failed variant: Nebius down + homepage unreadable,
 * evaluation continues on metadata with failed provenance. */
const RUN_PROVIDER_FAILED = {
  ...BASE_RUN,
  runId: "jn_fake_run_02",
  context: {
    ...BASE_RUN.context,
    prospect: {
      url: "https://example.com/page",
      title: "Example Journal",
      metrics: {
        rerankStatus: "failed",
        rerankReason: "Nebius rerank unavailable",
        homepageRead: false,
      },
    },
    judgment: {
      action: "review",
      confidence: 0.51,
      route: null,
      fitScore: 0.55,
      fitConfidence: 0.5,
      spamProbability: 0.2,
      model: "jev-latest",
      reasons: ["Metadata-only judgment: homepage unreadable, rerank failed"],
    },
  },
};

function callerReturning(value: unknown): ConvexActionCaller {
  return async () => value;
}

function callerThrowing(error: unknown): ConvexActionCaller {
  return async () => {
    throw error;
  };
}

describe("FAKE prospect.evaluate transport seam", () => {
  test("FAKE success returns persisted run shape with judgment and provenance", async () => {
    const seen: Array<{ path: string; args: Record<string, unknown> }> = [];
    const caller: ConvexActionCaller = async (_url, _token, path, args) => {
      seen.push({ path, args });
      return RUN_RANKED;
    };
    const result = await evaluateProspect(
      { url: "https://example.com/page" },
      { ...OPTIONS, caller },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected ok");
    expect(result.run.runId).toBe("jn_fake_run_01");
    expect(result.run.state).toBe("completed");
    expect(result.run.context.judgment?.action).toBe("act");
    const metrics = (result.run.context.prospect as Record<string, unknown>)["metrics"] as Record<string, unknown>;
    expect(metrics["rerankStatus"]).toBe("ranked");
    expect(metrics["homepageRead"]).toBe(true);
    expect(seen).toHaveLength(1);
    expect(seen[0]?.path).toBe("prospectEvaluation:startProspectEvaluation");
  });

  test("FAKE provider-failed run still persists judgment with failed provenance", async () => {
    const result = await evaluateProspect(
      { url: "https://example.com/page" },
      { ...OPTIONS, caller: callerReturning(RUN_PROVIDER_FAILED) },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected ok");
    expect(result.run.context.judgment?.action).toBe("review");
    const metrics = (result.run.context.prospect as Record<string, unknown>)["metrics"] as Record<string, unknown>;
    expect(metrics["rerankStatus"]).toBe("failed");
    expect(metrics["homepageRead"]).toBe(false);
  });

  test("FAKE backend auth rejection maps to auth", async () => {
    const result = await evaluateProspect(
      { url: "https://example.com/page" },
      { ...OPTIONS, caller: callerThrowing(new ConvexError("Authentication required")) },
    );
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.error.kind).toBe("auth");
  });

  test("FAKE backend URL normalizer rejection maps to operation", async () => {
    // "http://localhost/..." passes the client pre-check (absolute http URL)
    // but the backend normalizeCrawlUrl rejects it as non-public.
    let reached = false;
    const caller: ConvexActionCaller = async () => {
      reached = true;
      throw new ConvexError("The crawl URL must be a public website.");
    };
    const result = await evaluateProspect(
      { url: "http://localhost:3000/bad" },
      { ...OPTIONS, caller },
    );
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.error.kind).toBe("operation");
    expect(result.error.message).toContain("public website");
    expect(reached).toBe(true);
  });

  test("FAKE client-side bad URL never reaches transport", async () => {
    let reached = false;
    const caller: ConvexActionCaller = async () => {
      reached = true;
      return RUN_RANKED;
    };
    const result = await evaluateProspect({ url: "not a url" }, { ...OPTIONS, caller });
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.error.kind).toBe("input");
    expect(reached).toBe(false);
  });

  test("FAKE unknown discovery run maps to operation", async () => {
    const result = await evaluateProspect(
      { url: "https://example.com/page" },
      {
        ...OPTIONS,
        sourceDiscoveryRunId: "jd_fake_missing",
        caller: callerThrowing(
          new ConvexError("Source competitor discovery must complete before prospect evaluation"),
        ),
      },
    );
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.error.kind).toBe("operation");
    expect(result.error.message).toContain("must complete");
  });

  test("FAKE missing run row maps to operation", async () => {
    const result = await evaluateProspect(
      { url: "https://example.com/page" },
      {
        ...OPTIONS,
        caller: callerThrowing(new ConvexError("Prospect evaluation run not found")),
      },
    );
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.error.kind).toBe("operation");
    expect(result.error.message).toContain("not found");
  });

  test("FAKE unexpected run shape maps to transport", async () => {
    const result = await evaluateProspect(
      { url: "https://example.com/page" },
      { ...OPTIONS, caller: callerReturning({ nope: true }) },
    );
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.error.kind).toBe("transport");
  });

  test("FAKE missing deployment URL and token report config", async () => {
    const noUrl = await evaluateProspect(
      { url: "https://example.com" },
      { authToken: "fake-token", caller: callerReturning(RUN_RANKED) },
    );
    expect(noUrl.ok).toBe(false);
    if (noUrl.ok) throw new Error("expected failure");
    expect(noUrl.error.kind).toBe("config");
    expect(noUrl.error.message).toContain("CONVEX_URL");

    const noToken = await evaluateProspect(
      { url: "https://example.com" },
      { deploymentUrl: "https://fake.convex.cloud", caller: callerReturning(RUN_RANKED) },
    );
    expect(noToken.ok).toBe(false);
    if (noToken.ok) throw new Error("expected failure");
    expect(noToken.error.kind).toBe("config");
    expect(noToken.error.message).toContain("RANK_AUTH_TOKEN");
  });
});
