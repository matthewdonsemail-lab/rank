import { createActor } from "xstate";
import type { GenericActionCtx } from "convex/server";
import { ConvexError, v, type GenericId } from "convex/values";
import { FirecrawlCrawlClient, normalizeCrawlUrl } from "../lib/firecrawl/crawl/index.js";
import type { ScrapeOptions } from "../lib/firecrawl/crawl/index.js";
import {
  brandEnrichmentMachine,
  toEnrichmentDocument,
  type EnrichmentContext,
  type EnrichmentDocument,
  type EnrichmentState,
} from "../lib/xstate/enrichment/index.js";
import type { DataModel } from "./_generated/dataModel.js";
import { components, internal } from "./_generated/api.js";
import { action, internalMutation, internalQuery, query } from "./_generated/server.js";
import { BRAND_SCHEMA, parseBrandFacts } from "./lib/firecrawl.js";
import { requireOwner } from "./lib/server.js";

const firecrawl = FirecrawlCrawlClient.fromComponent(components.firecrawl);
const MAX_SCRAPE_URLS = 10;
const MAX_ERROR_LENGTH = 500;

const enrichmentFactsValidator = v.object({
  name: v.string(),
  tagline: v.string(),
  offerings: v.array(v.object({ name: v.string(), detail: v.string() })),
  tone: v.optional(v.string()),
  formality: v.optional(v.union(v.literal("casual"), v.literal("professional"), v.literal("formal"))),
  locationLabel: v.optional(v.string()),
  logoUrl: v.optional(v.string()),
});

const enrichmentDocumentValidator = v.object({
  url: v.string(),
  title: v.union(v.string(), v.null()),
  description: v.union(v.string(), v.null()),
  markdownExcerpt: v.string(),
  facts: v.union(enrichmentFactsValidator, v.null()),
});

const enrichmentContextValidator = v.object({
  owner: v.string(),
  sourceUrl: v.string(),
  mappedUrls: v.array(v.string()),
  documents: v.array(enrichmentDocumentValidator),
  facts: v.union(enrichmentFactsValidator, v.null()),
  error: v.union(v.string(), v.null()),
  attempt: v.number(),
  startedAt: v.number(),
  updatedAt: v.number(),
});

const publicEnrichmentContextValidator = v.object({
  sourceUrl: v.string(),
  mappedUrls: v.array(v.string()),
  documents: v.array(enrichmentDocumentValidator),
  facts: v.union(enrichmentFactsValidator, v.null()),
  error: v.union(v.string(), v.null()),
  attempt: v.number(),
  startedAt: v.number(),
  updatedAt: v.number(),
});

const enrichmentStateValidator = v.union(
  v.literal("idle"),
  v.literal("mapping"),
  v.literal("scraping"),
  v.literal("extracting"),
  v.literal("completed"),
  v.literal("failed"),
  v.literal("cancelled"),
);

const enrichmentRunValidator = v.object({
  runId: v.id("enrichmentRuns"),
  sourceUrl: v.string(),
  state: enrichmentStateValidator,
  context: publicEnrichmentContextValidator,
  createdAt: v.number(),
  updatedAt: v.number(),
});

const storedEnrichmentRunValidator = v.object({
  runId: v.id("enrichmentRuns"),
  sourceUrl: v.string(),
  state: enrichmentStateValidator,
  context: enrichmentContextValidator,
  createdAt: v.number(),
  updatedAt: v.number(),
});

const enrichmentSummaryValidator = v.object({
  runId: v.id("enrichmentRuns"),
  sourceUrl: v.string(),
  state: enrichmentStateValidator,
  documentCount: v.number(),
  mappedUrlCount: v.number(),
  attempt: v.number(),
  facts: v.union(enrichmentFactsValidator, v.null()),
  error: v.union(v.string(), v.null()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

type EnrichmentRunId = GenericId<"enrichmentRuns">;
type EnrichmentActionContext = GenericActionCtx<DataModel>;
type EnrichmentRunRow = {
  runId: EnrichmentRunId;
  sourceUrl: string;
  state: EnrichmentState;
  context: EnrichmentContext;
  createdAt: number;
  updatedAt: number;
};
type EnrichmentActor = {
  start: () => unknown;
  send: (event: import("../lib/xstate/enrichment/index.js").EnrichmentEvent) => void;
  getSnapshot: () => { value: unknown; context: EnrichmentContext };
};

function errorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "Enrichment request failed";
  return message.slice(0, MAX_ERROR_LENGTH);
}

function initialContext(owner: string, sourceUrl: string, startedAt: number): EnrichmentContext {
  return {
    owner,
    sourceUrl,
    mappedUrls: [],
    documents: [],
    facts: null,
    error: null,
    attempt: 0,
    startedAt,
    updatedAt: startedAt,
  };
}

function toRunView(row: EnrichmentRunRow): typeof enrichmentRunValidator.type {
  return {
    runId: row.runId,
    sourceUrl: row.sourceUrl,
    state: row.state,
    context: {
      sourceUrl: row.context.sourceUrl,
      mappedUrls: row.context.mappedUrls,
      documents: row.context.documents,
      facts: row.context.facts,
      error: row.context.error,
      attempt: row.context.attempt,
      startedAt: row.context.startedAt,
      updatedAt: row.context.updatedAt,
    },
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toStoredRunView(row: EnrichmentRunRow): typeof storedEnrichmentRunValidator.type {
  return {
    runId: row.runId,
    sourceUrl: row.sourceUrl,
    state: row.state,
    context: row.context,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toSummary(row: EnrichmentRunRow): typeof enrichmentSummaryValidator.type {
  return {
    runId: row.runId,
    sourceUrl: row.sourceUrl,
    state: row.state,
    documentCount: row.context.documents.length,
    mappedUrlCount: row.context.mappedUrls.length,
    attempt: row.context.attempt,
    facts: row.context.facts,
    error: row.context.error,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function actorForRow(row: EnrichmentRunRow): EnrichmentActor {
  const snapshot = brandEnrichmentMachine.resolveState({
    value: row.state,
    context: row.context,
  });
  return createActor(brandEnrichmentMachine, {
    input: {
      owner: row.context.owner,
      sourceUrl: row.context.sourceUrl,
      startedAt: row.context.startedAt,
    },
    snapshot,
  });
}

async function persistActor(
  ctx: EnrichmentActionContext,
  runId: EnrichmentRunId,
  owner: string,
  actor: EnrichmentActor,
): Promise<void> {
  const snapshot = actor.getSnapshot();
  const state = snapshot.value as EnrichmentState;
  await ctx.runMutation(internal.enrichment.saveRun, {
    runId,
    owner,
    state,
    context: snapshot.context,
  });
}

async function scrapeDocuments(
  ctx: EnrichmentActionContext,
  context: EnrichmentContext,
): Promise<EnrichmentDocument[]> {
  const urls = Array.from(new Set([context.sourceUrl, ...context.mappedUrls])).slice(0, MAX_SCRAPE_URLS);
  const documents: EnrichmentDocument[] = [];
  for (const [index, url] of urls.entries()) {
    const formats: NonNullable<ScrapeOptions["formats"]> = index === 0
      ? ["markdown", "links", { type: "json", schema: BRAND_SCHEMA as Record<string, unknown> }]
      : ["markdown", "links"];
    const document = await firecrawl.scrape(ctx, url, {
      formats,
      onlyMainContent: true,
    });
    documents.push(toEnrichmentDocument(url, document, index === 0 ? parseBrandFacts(document.json) : null));
  }
  return documents;
}

async function advanceRun(
  ctx: EnrichmentActionContext,
  runId: EnrichmentRunId,
  owner: string,
): Promise<EnrichmentRunRow> {
  const row = (await ctx.runQuery(internal.enrichment.getOwnedRun, { runId, owner })) as EnrichmentRunRow | null;
  if (!row) throw new ConvexError("Enrichment run not found");

  const actor = actorForRow(row);
  actor.start();

  for (let step = 0; step < 6; step += 1) {
    const snapshot = actor.getSnapshot();
    const state = snapshot.value as EnrichmentState;
    if (state === "completed" || state === "cancelled" || state === "failed") break;

    const now = Date.now();
    if (state === "idle") {
      actor.send({ type: "START", at: now });
      await persistActor(ctx, runId, owner, actor);
      continue;
    }

    if (state === "mapping") {
      try {
        const result = await firecrawl.map(ctx, snapshot.context.sourceUrl, {
          limit: 25,
          ignoreQueryParameters: true,
        });
        actor.send({ type: "MAP_SUCCEEDED", at: Date.now(), urls: result.links.map((link) => link.url) });
      } catch (error) {
        actor.send({ type: "MAP_FAILED", at: Date.now(), error: errorMessage(error) });
      }
      await persistActor(ctx, runId, owner, actor);
      continue;
    }

    if (state === "scraping") {
      try {
        const documents = await scrapeDocuments(ctx, snapshot.context);
        actor.send({ type: "SCRAPE_SUCCEEDED", at: Date.now(), documents });
      } catch (error) {
        actor.send({ type: "SCRAPE_FAILED", at: Date.now(), error: errorMessage(error) });
      }
      await persistActor(ctx, runId, owner, actor);
      continue;
    }

    if (state === "extracting") {
      const facts = snapshot.context.documents.find((document) => document.facts)?.facts ?? null;
      if (facts) {
        actor.send({ type: "EXTRACT_SUCCEEDED", at: Date.now(), facts });
      } else {
        actor.send({
          type: "EXTRACT_FAILED",
          at: Date.now(),
          error: "No structured brand facts were extracted from the website.",
        });
      }
      await persistActor(ctx, runId, owner, actor);
    }
  }

  const updated = (await ctx.runQuery(internal.enrichment.getOwnedRun, { runId, owner })) as EnrichmentRunRow | null;
  if (!updated) throw new ConvexError("Enrichment run not found after processing");
  return updated;
}

export const createRun = internalMutation({
  args: {
    owner: v.string(),
    sourceUrl: v.string(),
    context: enrichmentContextValidator,
  },
  returns: v.id("enrichmentRuns"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("enrichmentRuns", {
      owner: args.owner,
      sourceUrl: args.sourceUrl,
      state: "idle",
      context: args.context,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getOwnedRun = internalQuery({
  args: { runId: v.id("enrichmentRuns"), owner: v.string() },
  returns: v.union(storedEnrichmentRunValidator, v.null()),
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.runId);
    if (!row || row.owner !== args.owner) return null;
    return toStoredRunView({
      runId: row._id,
      sourceUrl: row.sourceUrl,
      state: row.state,
      context: row.context,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  },
});

export const saveRun = internalMutation({
  args: {
    runId: v.id("enrichmentRuns"),
    owner: v.string(),
    state: enrichmentStateValidator,
    context: enrichmentContextValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.runId);
    if (!row || row.owner !== args.owner) throw new ConvexError("Enrichment run not found");
    await ctx.db.patch(args.runId, {
      state: args.state,
      context: args.context,
      updatedAt: args.context.updatedAt,
    });
    return null;
  },
});

export const startBrandEnrichment = action({
  args: { url: v.string() },
  returns: enrichmentRunValidator,
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const normalized = normalizeCrawlUrl(args.url);
    if (!normalized.ok) throw new ConvexError(normalized.reason);
    const startedAt = Date.now();
    const runId = (await ctx.runMutation(internal.enrichment.createRun, {
      owner,
      sourceUrl: normalized.url,
      context: initialContext(owner, normalized.url, startedAt),
    })) as EnrichmentRunId;
    return toRunView(await advanceRun(ctx, runId, owner));
  },
});

export const advanceBrandEnrichment = action({
  args: { runId: v.id("enrichmentRuns") },
  returns: enrichmentRunValidator,
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    return toRunView(await advanceRun(ctx, args.runId, owner));
  },
});

export const retryBrandEnrichment = action({
  args: { runId: v.id("enrichmentRuns") },
  returns: enrichmentRunValidator,
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const row = (await ctx.runQuery(internal.enrichment.getOwnedRun, { runId: args.runId, owner })) as EnrichmentRunRow | null;
    if (!row) throw new ConvexError("Enrichment run not found");
    if (row.state !== "failed") return toRunView(row);
    const actor = actorForRow(row);
    actor.start();
    actor.send({ type: "RETRY", at: Date.now() });
    await persistActor(ctx, args.runId, owner, actor);
    return toRunView(await advanceRun(ctx, args.runId, owner));
  },
});

export const cancelBrandEnrichment = action({
  args: { runId: v.id("enrichmentRuns") },
  returns: enrichmentRunValidator,
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const row = (await ctx.runQuery(internal.enrichment.getOwnedRun, { runId: args.runId, owner })) as EnrichmentRunRow | null;
    if (!row) throw new ConvexError("Enrichment run not found");
    if (row.state === "completed" || row.state === "cancelled") return toRunView(row);
    const actor = actorForRow(row);
    actor.start();
    actor.send({ type: "CANCEL", at: Date.now() });
    await persistActor(ctx, args.runId, owner, actor);
    const updated = (await ctx.runQuery(internal.enrichment.getOwnedRun, { runId: args.runId, owner })) as EnrichmentRunRow | null;
    if (!updated) throw new ConvexError("Enrichment run not found after cancellation");
    return toRunView(updated);
  },
});

export const getBrandEnrichment = query({
  args: { runId: v.id("enrichmentRuns") },
  returns: v.union(enrichmentRunValidator, v.null()),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const row = (await ctx.runQuery(internal.enrichment.getOwnedRun, { runId: args.runId, owner })) as EnrichmentRunRow | null;
    return row ? toRunView(row) : null;
  },
});

export const listBrandEnrichmentRuns = query({
  args: {},
  returns: v.array(enrichmentSummaryValidator),
  handler: async (ctx) => {
    const owner = await requireOwner(ctx);
    const rows = await ctx.db
      .query("enrichmentRuns")
      .withIndex("by_owner_created", (q) => q.eq("owner", owner))
      .order("desc")
      .take(20);
    return rows.map((row) => toSummary({
      runId: row._id,
      sourceUrl: row.sourceUrl,
      state: row.state,
      context: row.context,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  },
});
