import { createActor } from "xstate";
import type { GenericActionCtx } from "convex/server";
import { ConvexError, v, type GenericId } from "convex/values";
import {
  competitorDiscoveryMachine,
  normalizeCompetitorCandidates,
  parseCompetitorCandidates,
  type CompetitorDiscoveryContext,
  type CompetitorDiscoveryEvent,
  type CompetitorDiscoveryState,
} from "../lib/xstate/competitor-discovery/index.js";
import { normalizeCrawlUrl } from "../lib/firecrawl/crawl/index.js";
import type { DataModel } from "./_generated/dataModel.js";
import { internal } from "./_generated/api.js";
import { action, internalMutation, internalQuery, query } from "./_generated/server.js";
import { tregClient } from "./treg.js";
import { requireOwner } from "./lib/server.js";

const COMPETITOR_ENDPOINTS = [
  "spyfu.google.domain.competitors",
  "serpstat.google.domain.competitors",
  "seranking.google.domain.competitors",
] as const;
const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 50;
const MAX_COST_USD = 0.05;
const MAX_ERROR_LENGTH = 500;

const candidateValidator = v.object({
  domain: v.string(),
  name: v.union(v.string(), v.null()),
  rank: v.union(v.number(), v.null()),
  commonTerms: v.union(v.number(), v.null()),
  sourceEndpoint: v.string(),
});

const contextValidator = v.object({
  owner: v.string(),
  sourceEnrichmentRunId: v.string(),
  sourceUrl: v.string(),
  sourceDomain: v.string(),
  endpoint: v.string(),
  limit: v.number(),
  candidates: v.array(candidateValidator),
  normalizedCandidates: v.array(candidateValidator),
  error: v.union(v.string(), v.null()),
  attempt: v.number(),
  startedAt: v.number(),
  updatedAt: v.number(),
});

const publicContextValidator = v.object({
  sourceEnrichmentRunId: v.string(),
  sourceUrl: v.string(),
  sourceDomain: v.string(),
  endpoint: v.string(),
  limit: v.number(),
  candidates: v.array(candidateValidator),
  normalizedCandidates: v.array(candidateValidator),
  error: v.union(v.string(), v.null()),
  attempt: v.number(),
  startedAt: v.number(),
  updatedAt: v.number(),
});

const stateValidator = v.union(
  v.literal("idle"),
  v.literal("discovering"),
  v.literal("normalizing"),
  v.literal("completed"),
  v.literal("failed"),
  v.literal("cancelled"),
);

const runValidator = v.object({
  runId: v.id("competitorDiscoveryRuns"),
  sourceEnrichmentRunId: v.id("enrichmentRuns"),
  sourceUrl: v.string(),
  sourceDomain: v.string(),
  state: stateValidator,
  context: publicContextValidator,
  createdAt: v.number(),
  updatedAt: v.number(),
});

const storedRunValidator = v.object({
  runId: v.id("competitorDiscoveryRuns"),
  sourceEnrichmentRunId: v.id("enrichmentRuns"),
  sourceUrl: v.string(),
  sourceDomain: v.string(),
  state: stateValidator,
  context: contextValidator,
  createdAt: v.number(),
  updatedAt: v.number(),
});

const summaryValidator = v.object({
  runId: v.id("competitorDiscoveryRuns"),
  sourceEnrichmentRunId: v.id("enrichmentRuns"),
  sourceUrl: v.string(),
  sourceDomain: v.string(),
  state: stateValidator,
  candidateCount: v.number(),
  normalizedCandidateCount: v.number(),
  attempt: v.number(),
  error: v.union(v.string(), v.null()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

type DiscoveryRunId = GenericId<"competitorDiscoveryRuns">;
type EnrichmentRunId = GenericId<"enrichmentRuns">;
type DiscoveryActionContext = GenericActionCtx<DataModel>;
type DiscoveryRunRow = {
  runId: DiscoveryRunId;
  sourceEnrichmentRunId: EnrichmentRunId;
  sourceUrl: string;
  sourceDomain: string;
  state: CompetitorDiscoveryState;
  context: CompetitorDiscoveryContext;
  createdAt: number;
  updatedAt: number;
};
type DiscoveryActor = {
  start: () => unknown;
  send: (event: CompetitorDiscoveryEvent) => void;
  getSnapshot: () => { value: unknown; context: CompetitorDiscoveryContext };
};

function errorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "Competitor discovery failed";
  return message.slice(0, MAX_ERROR_LENGTH);
}

function isTransientError(error: unknown): boolean {
  if (typeof error === "object" && error !== null) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === "object" && data !== null) {
      const status = (data as { status?: unknown }).status;
      if (typeof status === "number" && [408, 425, 429, 500, 502, 503, 504].includes(status)) return true;
    }
  }
  return /timeout|timed out|network|fetch failed|econnreset|429|500|502|503|504/i.test(errorMessage(error));
}

function toPublicRun(row: DiscoveryRunRow): typeof runValidator.type {
  return {
    runId: row.runId,
    sourceEnrichmentRunId: row.sourceEnrichmentRunId,
    sourceUrl: row.sourceUrl,
    sourceDomain: row.sourceDomain,
    state: row.state,
    context: {
      sourceEnrichmentRunId: row.context.sourceEnrichmentRunId,
      sourceUrl: row.context.sourceUrl,
      sourceDomain: row.context.sourceDomain,
      endpoint: row.context.endpoint,
      limit: row.context.limit,
      candidates: row.context.candidates,
      normalizedCandidates: row.context.normalizedCandidates,
      error: row.context.error,
      attempt: row.context.attempt,
      startedAt: row.context.startedAt,
      updatedAt: row.context.updatedAt,
    },
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toStoredRun(row: DiscoveryRunRow): typeof storedRunValidator.type {
  return {
    runId: row.runId,
    sourceEnrichmentRunId: row.sourceEnrichmentRunId,
    sourceUrl: row.sourceUrl,
    sourceDomain: row.sourceDomain,
    state: row.state,
    context: row.context,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toSummary(row: DiscoveryRunRow): typeof summaryValidator.type {
  return {
    runId: row.runId,
    sourceEnrichmentRunId: row.sourceEnrichmentRunId,
    sourceUrl: row.sourceUrl,
    sourceDomain: row.sourceDomain,
    state: row.state,
    candidateCount: row.context.candidates.length,
    normalizedCandidateCount: row.context.normalizedCandidates.length,
    attempt: row.context.attempt,
    error: row.context.error,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function actorForRow(row: DiscoveryRunRow): DiscoveryActor {
  const snapshot = competitorDiscoveryMachine.resolveState({
    value: row.state,
    context: row.context,
  });
  return createActor(competitorDiscoveryMachine, {
    input: {
      owner: row.context.owner,
      sourceEnrichmentRunId: row.context.sourceEnrichmentRunId,
      sourceUrl: row.context.sourceUrl,
      sourceDomain: row.context.sourceDomain,
      endpoint: row.context.endpoint,
      limit: row.context.limit,
      startedAt: row.context.startedAt,
    },
    snapshot,
  });
}

async function persistActor(
  ctx: DiscoveryActionContext,
  runId: DiscoveryRunId,
  owner: string,
  actor: DiscoveryActor,
): Promise<void> {
  const snapshot = actor.getSnapshot();
  await ctx.runMutation(internal.competitorDiscovery.saveRun, {
    runId,
    owner,
    state: snapshot.value as CompetitorDiscoveryState,
    context: snapshot.context,
  });
}

async function callCompetitors(
  ctx: DiscoveryActionContext,
  owner: string,
  domain: string,
  limit: number,
): Promise<{ endpoint: string; payload: unknown }> {
  let lastError: unknown = new Error("No competitor provider available");
  for (const endpoint of COMPETITOR_ENDPOINTS) {
    try {
      const payload = await tregClient.call<unknown>(ctx, {
        owner,
        endpoint,
        params: {
          domain,
          countryCode: "US",
          pageSize: limit,
          sortBy: "CommonTerms",
          sortOrder: "Descending",
        },
        maxCostUsd: MAX_COST_USD,
      });
      return { endpoint, payload };
    } catch (error) {
      lastError = error;
      if (!isTransientError(error)) throw error;
    }
  }
  throw lastError;
}

async function advanceRun(
  ctx: DiscoveryActionContext,
  runId: DiscoveryRunId,
  owner: string,
): Promise<DiscoveryRunRow> {
  const row = (await ctx.runQuery(internal.competitorDiscovery.getOwnedRun, { runId, owner })) as DiscoveryRunRow | null;
  if (!row) throw new ConvexError("Competitor discovery run not found");

  const actor = actorForRow(row);
  actor.start();

  for (let step = 0; step < 4; step += 1) {
    const snapshot = actor.getSnapshot();
    const state = snapshot.value as CompetitorDiscoveryState;
    if (state === "completed" || state === "failed" || state === "cancelled") break;

    if (state === "idle") {
      actor.send({ type: "START", at: Date.now() });
      await persistActor(ctx, runId, owner, actor);
      continue;
    }

    if (state === "discovering") {
      try {
        const result = await callCompetitors(ctx, owner, snapshot.context.sourceDomain, snapshot.context.limit);
        const candidates = parseCompetitorCandidates(result.payload, result.endpoint);
        actor.send({ type: "COMPETITORS_RECEIVED", at: Date.now(), candidates });
      } catch (error) {
        actor.send({ type: "DISCOVERY_FAILED", at: Date.now(), error: errorMessage(error) });
      }
      await persistActor(ctx, runId, owner, actor);
      continue;
    }

    if (state === "normalizing") {
      try {
        const candidates = normalizeCompetitorCandidates(
          snapshot.context.candidates,
          snapshot.context.sourceDomain,
          snapshot.context.limit,
        );
        actor.send({ type: "CANDIDATES_READY", at: Date.now(), candidates });
      } catch (error) {
        actor.send({ type: "NORMALIZATION_FAILED", at: Date.now(), error: errorMessage(error) });
      }
      await persistActor(ctx, runId, owner, actor);
    }
  }

  const updated = (await ctx.runQuery(internal.competitorDiscovery.getOwnedRun, { runId, owner })) as DiscoveryRunRow | null;
  if (!updated) throw new ConvexError("Competitor discovery run not found after processing");
  return updated;
}

export const createRun = internalMutation({
  args: {
    owner: v.string(),
    sourceEnrichmentRunId: v.id("enrichmentRuns"),
    sourceUrl: v.string(),
    sourceDomain: v.string(),
    endpoint: v.string(),
    limit: v.number(),
    context: contextValidator,
  },
  returns: v.id("competitorDiscoveryRuns"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("competitorDiscoveryRuns")
      .withIndex("by_source", (q) => q.eq("sourceEnrichmentRunId", args.sourceEnrichmentRunId))
      .first();
    if (existing) {
      if (existing.owner !== args.owner) throw new ConvexError("Competitor discovery ownership conflict");
      return existing._id;
    }
    const now = Date.now();
    return await ctx.db.insert("competitorDiscoveryRuns", {
      owner: args.owner,
      sourceEnrichmentRunId: args.sourceEnrichmentRunId,
      sourceUrl: args.sourceUrl,
      sourceDomain: args.sourceDomain,
      state: "idle",
      context: args.context,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getOwnedRun = internalQuery({
  args: { runId: v.id("competitorDiscoveryRuns"), owner: v.string() },
  returns: v.union(storedRunValidator, v.null()),
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.runId);
    if (!row || row.owner !== args.owner) return null;
    return toStoredRun({
      runId: row._id,
      sourceEnrichmentRunId: row.sourceEnrichmentRunId,
      sourceUrl: row.sourceUrl,
      sourceDomain: row.sourceDomain,
      state: row.state,
      context: row.context,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  },
});

export const saveRun = internalMutation({
  args: {
    runId: v.id("competitorDiscoveryRuns"),
    owner: v.string(),
    state: stateValidator,
    context: contextValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.runId);
    if (!row || row.owner !== args.owner) throw new ConvexError("Competitor discovery run not found");
    await ctx.db.patch(args.runId, {
      state: args.state,
      context: args.context,
      updatedAt: args.context.updatedAt,
    });
    return null;
  },
});

export const startCompetitorDiscovery = action({
  args: {
    sourceEnrichmentRunId: v.id("enrichmentRuns"),
    limit: v.optional(v.number()),
  },
  returns: runValidator,
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const brandRun = (await ctx.runQuery(internal.enrichment.getOwnedRun, {
      runId: args.sourceEnrichmentRunId,
      owner,
    })) as { state: string; context: { sourceUrl: string; facts: unknown } } | null;
    if (!brandRun || brandRun.state !== "completed" || !brandRun.context.facts) {
      throw new ConvexError("Brand enrichment must complete before competitor discovery");
    }
    const normalized = normalizeCrawlUrl(brandRun.context.sourceUrl);
    if (!normalized.ok) throw new ConvexError(normalized.reason);
    const sourceDomain = new URL(normalized.url).hostname.toLowerCase().replace(/^www\./, "");
    const limit = Math.min(Math.max(args.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
    const startedAt = Date.now();
    const runId = (await ctx.runMutation(internal.competitorDiscovery.createRun, {
      owner,
      sourceEnrichmentRunId: args.sourceEnrichmentRunId,
      sourceUrl: normalized.url,
      sourceDomain,
      endpoint: COMPETITOR_ENDPOINTS[0],
      limit,
      context: {
        owner,
        sourceEnrichmentRunId: args.sourceEnrichmentRunId,
        sourceUrl: normalized.url,
        sourceDomain,
        endpoint: COMPETITOR_ENDPOINTS[0],
        limit,
        candidates: [],
        normalizedCandidates: [],
        error: null,
        attempt: 0,
        startedAt,
        updatedAt: startedAt,
      },
    })) as DiscoveryRunId;
    return toPublicRun(await advanceRun(ctx, runId, owner));
  },
});

export const advanceCompetitorDiscovery = action({
  args: { runId: v.id("competitorDiscoveryRuns") },
  returns: runValidator,
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    return toPublicRun(await advanceRun(ctx, args.runId, owner));
  },
});

export const retryCompetitorDiscovery = action({
  args: { runId: v.id("competitorDiscoveryRuns") },
  returns: runValidator,
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const row = (await ctx.runQuery(internal.competitorDiscovery.getOwnedRun, { runId: args.runId, owner })) as DiscoveryRunRow | null;
    if (!row) throw new ConvexError("Competitor discovery run not found");
    if (row.state !== "failed") return toPublicRun(row);
    const actor = actorForRow(row);
    actor.start();
    actor.send({ type: "RETRY", at: Date.now() });
    await persistActor(ctx, args.runId, owner, actor);
    return toPublicRun(await advanceRun(ctx, args.runId, owner));
  },
});

export const cancelCompetitorDiscovery = action({
  args: { runId: v.id("competitorDiscoveryRuns") },
  returns: runValidator,
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const row = (await ctx.runQuery(internal.competitorDiscovery.getOwnedRun, { runId: args.runId, owner })) as DiscoveryRunRow | null;
    if (!row) throw new ConvexError("Competitor discovery run not found");
    if (row.state === "completed" || row.state === "cancelled") return toPublicRun(row);
    const actor = actorForRow(row);
    actor.start();
    actor.send({ type: "CANCEL", at: Date.now() });
    await persistActor(ctx, args.runId, owner, actor);
    const updated = (await ctx.runQuery(internal.competitorDiscovery.getOwnedRun, { runId: args.runId, owner })) as DiscoveryRunRow | null;
    if (!updated) throw new ConvexError("Competitor discovery run not found after cancellation");
    return toPublicRun(updated);
  },
});

export const getCompetitorDiscovery = query({
  args: { runId: v.id("competitorDiscoveryRuns") },
  returns: v.union(runValidator, v.null()),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const row = (await ctx.runQuery(internal.competitorDiscovery.getOwnedRun, { runId: args.runId, owner })) as DiscoveryRunRow | null;
    return row ? toPublicRun(row) : null;
  },
});

export const listCompetitorDiscoveryRuns = query({
  args: {},
  returns: v.array(summaryValidator),
  handler: async (ctx) => {
    const owner = await requireOwner(ctx);
    const rows = await ctx.db
      .query("competitorDiscoveryRuns")
      .withIndex("by_owner_created", (q) => q.eq("owner", owner))
      .order("desc")
      .take(20);
    return rows.map((row) => toSummary({
      runId: row._id,
      sourceEnrichmentRunId: row.sourceEnrichmentRunId,
      sourceUrl: row.sourceUrl,
      sourceDomain: row.sourceDomain,
      state: row.state,
      context: row.context,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  },
});
