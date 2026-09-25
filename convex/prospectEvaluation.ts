import { createActor } from "xstate";
import type { GenericActionCtx, GenericQueryCtx } from "convex/server";
import { ConvexError, v, type GenericId } from "convex/values";
import { FirecrawlCrawlClient, mapWithConcurrency, normalizeCrawlUrl, summarizePage } from "../lib/firecrawl/crawl/index.js";
import { NebiusRerankClient, rankCandidates, type BrandFacts } from "../lib/nebius/rerank/index.js";
import { TypeSafeEvaluator } from "../lib/typesafe/evaluator/index.js";
import type {
  LinkProspect,
  ProspectJudgment,
} from "../lib/typesafe/evaluator/index.js";
import {
  prospectEvaluationMachine,
  type ProspectEvaluationContext,
  type ProspectEvaluationEvent,
  type ProspectEvaluationState,
} from "../lib/xstate/prospect-evaluation/index.js";
import type { DataModel } from "./_generated/dataModel.js";
import { components, internal } from "./_generated/api.js";
import { action, internalMutation, internalQuery, query } from "./_generated/server.js";
import { requireOwner } from "./lib/server.js";

const prospectInputValidator = v.object({
  url: v.string(),
  title: v.optional(v.union(v.string(), v.null())),
  description: v.optional(v.union(v.string(), v.null())),
  sourceDomain: v.optional(v.union(v.string(), v.null())),
  anchorText: v.optional(v.union(v.string(), v.null())),
  targetDomain: v.optional(v.union(v.string(), v.null())),
  fitRationale: v.optional(v.union(v.string(), v.null())),
  brandSummary: v.optional(v.union(v.string(), v.null())),
  metrics: v.optional(v.any()),
  content: v.optional(v.union(v.string(), v.null())),
});

const prospectActionValidator = v.union(
  v.literal("act"),
  v.literal("review"),
  v.literal("drop"),
);

const prospectJudgmentValidator = v.object({
  action: prospectActionValidator,
  confidence: v.number(),
  route: v.optional(v.union(v.string(), v.null())),
  fitScore: v.optional(v.union(v.number(), v.null())),
  fitConfidence: v.optional(v.union(v.number(), v.null())),
  spamProbability: v.optional(v.union(v.number(), v.null())),
  model: v.optional(v.union(v.string(), v.null())),
  reasons: v.array(v.string()),
});

const prospectEvaluationStateValidator = v.union(
  v.literal("idle"),
  v.literal("evaluating"),
  v.literal("completed"),
  v.literal("failed"),
  v.literal("cancelled"),
);

const sourceDiscoveryRunIdValidator = v.union(v.id("competitorDiscoveryRuns"), v.null());

const prospectEvaluationContextValidator = v.object({
  owner: v.string(),
  sourceDiscoveryRunId: v.union(v.string(), v.null()),
  prospect: prospectInputValidator,
  judgment: v.union(prospectJudgmentValidator, v.null()),
  error: v.union(v.string(), v.null()),
  attempt: v.number(),
  startedAt: v.number(),
  updatedAt: v.number(),
});

const publicProspectEvaluationContextValidator = v.object({
  sourceDiscoveryRunId: v.union(v.string(), v.null()),
  prospect: prospectInputValidator,
  judgment: v.union(prospectJudgmentValidator, v.null()),
  error: v.union(v.string(), v.null()),
  attempt: v.number(),
  startedAt: v.number(),
  updatedAt: v.number(),
});

const prospectEvaluationRunValidator = v.object({
  runId: v.id("prospectEvaluations"),
  sourceDiscoveryRunId: sourceDiscoveryRunIdValidator,
  url: v.string(),
  state: prospectEvaluationStateValidator,
  context: publicProspectEvaluationContextValidator,
  createdAt: v.number(),
  updatedAt: v.number(),
});

const storedProspectEvaluationRunValidator = v.object({
  runId: v.id("prospectEvaluations"),
  sourceDiscoveryRunId: sourceDiscoveryRunIdValidator,
  url: v.string(),
  state: prospectEvaluationStateValidator,
  context: prospectEvaluationContextValidator,
  createdAt: v.number(),
  updatedAt: v.number(),
});

const prospectEvaluationSummaryValidator = v.object({
  runId: v.id("prospectEvaluations"),
  sourceDiscoveryRunId: sourceDiscoveryRunIdValidator,
  url: v.string(),
  state: prospectEvaluationStateValidator,
  action: v.union(prospectActionValidator, v.null()),
  confidence: v.union(v.number(), v.null()),
  updatedAt: v.number(),
});

const prospectQueueItemValidator = v.object({
  runId: v.id("prospectEvaluations"),
  sourceDiscoveryRunId: sourceDiscoveryRunIdValidator,
  url: v.string(),
  action: prospectActionValidator,
  confidence: v.number(),
  judgment: prospectJudgmentValidator,
  updatedAt: v.number(),
});

type ProspectEvaluationRunId = GenericId<"prospectEvaluations">;
type CompetitorDiscoveryRunId = GenericId<"competitorDiscoveryRuns">;
type ProspectAction = "act" | "review" | "drop";
type EvaluationActionContext = GenericActionCtx<DataModel>;
type EvaluationQueryContext = GenericQueryCtx<DataModel>;

type StoredProspectJudgment = {
  action: ProspectAction;
  confidence: number;
  route: string | null;
  fitScore: number | null;
  fitConfidence: number | null;
  spamProbability: number | null;
  model: string | null;
  reasons: string[];
};

type StoredProspectEvaluationContext = {
  owner: string;
  sourceDiscoveryRunId: string | null;
  prospect: LinkProspect;
  judgment: StoredProspectJudgment | null;
  error: string | null;
  attempt: number;
  startedAt: number;
  updatedAt: number;
};

type ProspectEvaluationRow = {
  runId: ProspectEvaluationRunId;
  sourceDiscoveryRunId: CompetitorDiscoveryRunId | null;
  url: string;
  prospect: LinkProspect;
  state: ProspectEvaluationState;
  action: ProspectAction | null;
  confidence: number | null;
  context: StoredProspectEvaluationContext;
  createdAt: number;
  updatedAt: number;
};

type ProspectEvaluationDbRow = Omit<ProspectEvaluationRow, "runId"> & {
  _id: ProspectEvaluationRunId;
};

type ProspectEvaluationActor = {
  start: () => unknown;
  send: (event: ProspectEvaluationEvent) => void;
  getSnapshot: () => { value: unknown; context: ProspectEvaluationContext };
};

type EvaluationIndex = {
  eq: (field: string, value: unknown) => EvaluationIndex;
};

type EvaluationQuery = {
  withIndex: (
    name: string,
    builder: (index: EvaluationIndex) => unknown,
  ) => {
    first: () => Promise<ProspectEvaluationDbRow | null>;
    order: (direction: "asc" | "desc") => {
      take: (count: number) => Promise<ProspectEvaluationDbRow[]>;
    };
  };
};

function errorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "Prospect evaluation failed";
  return message.slice(0, 500);
}

function toStoredProspect(prospect: LinkProspect, normalizedUrl: string): LinkProspect {
  const stored: LinkProspect = { url: normalizedUrl };
  const fields = [
    "title",
    "description",
    "sourceDomain",
    "anchorText",
    "targetDomain",
    "fitRationale",
    "brandSummary",
    "content",
  ] as const;
  for (const field of fields) {
    const value = prospect[field];
    if (value !== undefined) stored[field] = value;
  }
  if (prospect.metrics !== undefined && prospect.metrics !== null) {
    stored.metrics = prospect.metrics;
  }
  return stored;
}

function toStoredJudgment(judgment: ProspectJudgment | null): StoredProspectJudgment | null {
  if (!judgment) return null;
  return {
    action: judgment.action,
    confidence: judgment.confidence,
    route: judgment.route ?? null,
    fitScore: judgment.fitScore ?? null,
    fitConfidence: judgment.fitConfidence ?? null,
    spamProbability: judgment.spamProbability ?? null,
    model: judgment.model ?? null,
    reasons: judgment.reasons,
  };
}

function toStoredContext(context: ProspectEvaluationContext): StoredProspectEvaluationContext {
  return {
    owner: context.owner,
    sourceDiscoveryRunId: context.sourceDiscoveryRunId,
    prospect: toStoredProspect(context.prospect, context.prospect.url),
    judgment: toStoredJudgment(context.judgment),
    error: context.error,
    attempt: context.attempt,
    startedAt: context.startedAt,
    updatedAt: context.updatedAt,
  };
}

function toPublicContext(context: StoredProspectEvaluationContext): typeof publicProspectEvaluationContextValidator.type {
  return {
    sourceDiscoveryRunId: context.sourceDiscoveryRunId,
    prospect: context.prospect,
    judgment: context.judgment,
    error: context.error,
    attempt: context.attempt,
    startedAt: context.startedAt,
    updatedAt: context.updatedAt,
  };
}

function toStoredRun(row: ProspectEvaluationRow): typeof storedProspectEvaluationRunValidator.type {
  return {
    runId: row.runId,
    sourceDiscoveryRunId: row.sourceDiscoveryRunId,
    url: row.url,
    state: row.state,
    context: row.context,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toPublicRun(row: ProspectEvaluationRow): typeof prospectEvaluationRunValidator.type {
  return {
    runId: row.runId,
    sourceDiscoveryRunId: row.sourceDiscoveryRunId,
    url: row.url,
    state: row.state,
    context: toPublicContext(row.context),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toSummary(row: ProspectEvaluationRow): typeof prospectEvaluationSummaryValidator.type {
  return {
    runId: row.runId,
    sourceDiscoveryRunId: row.sourceDiscoveryRunId,
    url: row.url,
    state: row.state,
    action: row.action,
    confidence: row.confidence,
    updatedAt: row.updatedAt,
  };
}

function toQueueItem(row: ProspectEvaluationRow): typeof prospectQueueItemValidator.type | null {
  if (!row.action || row.confidence === null || !row.context.judgment) return null;
  return {
    runId: row.runId,
    sourceDiscoveryRunId: row.sourceDiscoveryRunId,
    url: row.url,
    action: row.action,
    confidence: row.confidence,
    judgment: row.context.judgment,
    updatedAt: row.updatedAt,
  };
}

function toRow(row: ProspectEvaluationDbRow): ProspectEvaluationRow {
  return {
    runId: row._id,
    sourceDiscoveryRunId: row.sourceDiscoveryRunId,
    url: row.url,
    prospect: row.prospect,
    state: row.state,
    action: row.action,
    confidence: row.confidence,
    context: row.context,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function initialContext(
  owner: string,
  sourceDiscoveryRunId: CompetitorDiscoveryRunId | null,
  prospect: LinkProspect,
  startedAt: number,
): ProspectEvaluationContext {
  return {
    owner,
    sourceDiscoveryRunId: sourceDiscoveryRunId ?? null,
    prospect,
    judgment: null,
    error: null,
    attempt: 0,
    startedAt,
    updatedAt: startedAt,
  };
}

function actorForRow(row: ProspectEvaluationRow): ProspectEvaluationActor {
  const snapshot = prospectEvaluationMachine.resolveState({
    value: row.state,
    context: row.context,
  });
  return createActor(prospectEvaluationMachine, {
    input: {
      owner: row.context.owner,
      sourceDiscoveryRunId: row.sourceDiscoveryRunId ?? undefined,
      prospect: row.context.prospect,
      startedAt: row.context.startedAt,
    },
    snapshot,
  });
}

async function persistActor(
  ctx: EvaluationActionContext,
  runId: ProspectEvaluationRunId,
  owner: string,
  actor: ProspectEvaluationActor,
): Promise<void> {
  const snapshot = actor.getSnapshot();
  const context = toStoredContext(snapshot.context);
  await ctx.runMutation(internal.prospectEvaluation.saveRun, {
    runId,
    owner,
    state: snapshot.value as ProspectEvaluationState,
    context,
    action: context.judgment?.action ?? null,
    confidence: context.judgment?.confidence ?? null,
  });
}

async function advanceRun(
  ctx: EvaluationActionContext,
  runId: ProspectEvaluationRunId,
  owner: string,
): Promise<ProspectEvaluationRow> {
  const row = (await ctx.runQuery(internal.prospectEvaluation.getOwnedRun, { runId, owner })) as ProspectEvaluationRow | null;
  if (!row) throw new ConvexError("Prospect evaluation run not found");

  const actor = actorForRow(row);
  actor.start();
  let evaluator: TypeSafeEvaluator | null = null;

  for (let step = 0; step < 4; step += 1) {
    const snapshot = actor.getSnapshot();
    const state = snapshot.value as ProspectEvaluationState;
    if (state === "completed" || state === "failed" || state === "cancelled") break;

    if (state === "idle") {
      actor.send({ type: "START", at: Date.now() });
      await persistActor(ctx, runId, owner, actor);
      continue;
    }

    if (state === "evaluating") {
      try {
        evaluator ??= new TypeSafeEvaluator();
        const judgment = await evaluator.judgeProspect(snapshot.context.prospect);
        actor.send({ type: "JUDGMENT_READY", at: Date.now(), judgment });
      } catch (error) {
        actor.send({ type: "EVALUATION_FAILED", at: Date.now(), error: errorMessage(error) });
      }
      await persistActor(ctx, runId, owner, actor);
    }
  }

  const updated = (await ctx.runQuery(internal.prospectEvaluation.getOwnedRun, { runId, owner })) as ProspectEvaluationRow | null;
  if (!updated) throw new ConvexError("Prospect evaluation run not found after processing");
  return updated;
}

async function listQueue(
  ctx: EvaluationQueryContext,
  owner: string,
  action: ProspectAction,
): Promise<Array<typeof prospectQueueItemValidator.type>> {
  const rows = await (ctx.db.query("prospectEvaluations") as unknown as EvaluationQuery)
    .withIndex("by_owner_action_updated", (index) => index.eq("owner", owner).eq("action", action))
    .order("desc")
    .take(50);
  return rows.flatMap((row) => {
    const item = toQueueItem(toRow(row));
    return item ? [item] : [];
  });
}

export const createRun = internalMutation({
  args: {
    owner: v.string(),
    sourceDiscoveryRunId: v.optional(v.id("competitorDiscoveryRuns")),
    url: v.string(),
    prospect: prospectInputValidator,
    context: prospectEvaluationContextValidator,
  },
  returns: v.id("prospectEvaluations"),
  handler: async (ctx, args) => {
    const existing = await (ctx.db.query("prospectEvaluations") as unknown as EvaluationQuery)
      .withIndex("by_owner_url", (index) => index.eq("owner", args.owner).eq("url", args.url))
      .first();
    if (existing && existing.state !== "failed" && existing.action !== "review") return existing._id;

    const now = Date.now();
    return await ctx.db.insert("prospectEvaluations", {
      owner: args.owner,
      sourceDiscoveryRunId: args.sourceDiscoveryRunId ?? null,
      url: args.url,
      prospect: args.prospect,
      state: "idle",
      action: null,
      confidence: null,
      context: args.context,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getOwnedRun = internalQuery({
  args: { runId: v.id("prospectEvaluations"), owner: v.string() },
  returns: v.union(storedProspectEvaluationRunValidator, v.null()),
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.runId);
    if (!row || row.owner !== args.owner) return null;
    return toStoredRun({
      runId: row._id,
      sourceDiscoveryRunId: row.sourceDiscoveryRunId,
      url: row.url,
      prospect: row.prospect,
      state: row.state,
      action: row.action,
      confidence: row.confidence,
      context: row.context,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  },
});

export const saveRun = internalMutation({
  args: {
    runId: v.id("prospectEvaluations"),
    owner: v.string(),
    state: prospectEvaluationStateValidator,
    context: prospectEvaluationContextValidator,
    action: v.union(prospectActionValidator, v.null()),
    confidence: v.union(v.number(), v.null()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.runId);
    if (!row || row.owner !== args.owner) throw new ConvexError("Prospect evaluation run not found");
    await ctx.db.patch(args.runId, {
      state: args.state,
      context: args.context,
      action: args.action,
      confidence: args.confidence,
      prospect: args.context.prospect,
      url: args.context.prospect.url,
      updatedAt: args.context.updatedAt,
    });
    return null;
  },
});

export const startProspectEvaluation = action({
  args: {
    sourceDiscoveryRunId: v.optional(v.id("competitorDiscoveryRuns")),
    prospect: prospectInputValidator,
  },
  returns: prospectEvaluationRunValidator,
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const normalized = normalizeCrawlUrl(args.prospect.url);
    if (!normalized.ok) throw new ConvexError(normalized.reason);

    if (args.sourceDiscoveryRunId) {
      const source = await ctx.runQuery(internal.competitorDiscovery.getOwnedRun, {
        runId: args.sourceDiscoveryRunId,
        owner,
      });
      if (!source || source.state !== "completed") {
        throw new ConvexError("Source competitor discovery must complete before prospect evaluation");
      }
    }

    const prospect = toStoredProspect(args.prospect as LinkProspect, normalized.url);
    const startedAt = Date.now();
    const runId = (await ctx.runMutation(internal.prospectEvaluation.createRun, {
      owner,
      sourceDiscoveryRunId: args.sourceDiscoveryRunId,
      url: normalized.url,
      prospect,
      context: initialContext(owner, args.sourceDiscoveryRunId ?? null, prospect, startedAt),
    })) as ProspectEvaluationRunId;
    return toPublicRun(await advanceRun(ctx, runId, owner));
  },
});

/** The brand facts the enrichment run read from the brand's own site, or null when there are none to rank against. */
async function loadBrandFacts(ctx: EvaluationActionContext, enrichmentRunId: string, owner: string): Promise<BrandFacts | null> {
  const run = (await ctx.runQuery(internal.enrichment.getOwnedRun, {
    runId: enrichmentRunId as GenericId<"enrichmentRuns">,
    owner,
  })) as { context: { facts: BrandFacts | null } } | null;
  return run?.context.facts ?? null;
}

/** One line telling TypeSafe who the brand is, so it judges a prospect against the brand and not in the abstract. */
function brandSummary(brand: BrandFacts): string {
  const offers = (brand.offerings ?? []).slice(0, 4).map((o) => o.name).join(", ");
  return [brand.name, brand.tagline, offers ? `Offers: ${offers}` : ""].filter(Boolean).join(". ").slice(0, 500);
}

const firecrawl = FirecrawlCrawlClient.fromComponent(components.firecrawl);

/** At most this many homepages are read per run (one Firecrawl credit each), and this many at once. */
const MAX_HOMEPAGES = 25;
const HOMEPAGE_CONCURRENCY = 5;
const HOMEPAGE_TIMEOUT_MS = 20_000;
/** Candidates beyond this stay in discovery order and are not ranked. */
const MAX_RANKED = 50;

type CandidatePage = { title: string | null; description: string | null; excerpt: string | null };

/**
 * Read each candidate's homepage so the reranker and TypeSafe judge what the site says, not just its domain. A page
 * that cannot be read (blocked, slow, no such site) is left out and that candidate is ranked on discovery data alone.
 * The returned array lines up with `domains`.
 */
async function fetchHomepages(ctx: EvaluationActionContext, domains: string[]): Promise<(CandidatePage | null)[]> {
  const pages = await mapWithConcurrency(domains, HOMEPAGE_CONCURRENCY, async (domain): Promise<CandidatePage | null> => {
    const normalized = normalizeCrawlUrl(domain);
    if (!normalized.ok) return null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const document = await Promise.race([
        firecrawl.scrape(ctx, normalized.url, { formats: ["markdown"], onlyMainContent: true }),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error("Homepage read timed out")), HOMEPAGE_TIMEOUT_MS);
        }),
      ]);
      const summary = summarizePage(document);
      return summary.title || summary.description || summary.excerpt ? summary : null;
    } finally {
      if (timer !== undefined) clearTimeout(timer);
    }
  });
  return domains.map((_, index) => pages[index] ?? null);
}

export const startCompetitorProspectEvaluations = action({
  args: {
    sourceDiscoveryRunId: v.id("competitorDiscoveryRuns"),
    limit: v.optional(v.number()),
    /** Read each candidate's homepage before ranking (default true). Costs one Firecrawl credit per page. */
    readHomepages: v.optional(v.boolean()),
  },
  returns: v.array(prospectEvaluationSummaryValidator),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const source = (await ctx.runQuery(internal.competitorDiscovery.getOwnedRun, {
      runId: args.sourceDiscoveryRunId,
      owner,
    })) as {
      state: string;
      context: {
        sourceDomain: string;
        sourceEnrichmentRunId: string;
        normalizedCandidates: Array<{
          domain: string;
          name: string | null;
          rank: number | null;
          commonTerms: number | null;
          sourceEndpoint: string;
        }>;
      };
    } | null;
    if (!source || source.state !== "completed") {
      throw new ConvexError("Source competitor discovery must complete before prospect evaluation");
    }

    const limit = Math.min(Math.max(args.limit ?? 10, 1), 25);

    // Rank every discovered candidate against the brand before spending TypeSafe calls, so the `limit` that get judged
    // are the most relevant ones rather than the first ones discovery returned. If ranking cannot run, discovery order
    // is kept and the reason is stored on each prospect.
    const brand = await loadBrandFacts(ctx, source.context.sourceEnrichmentRunId, owner);
    const toRank = source.context.normalizedCandidates.slice(0, MAX_RANKED);
    const pages: (CandidatePage | null)[] = args.readHomepages === false
      ? toRank.map(() => null)
      : [
          ...(await fetchHomepages(ctx, toRank.slice(0, MAX_HOMEPAGES).map((c) => c.domain))),
          ...toRank.slice(MAX_HOMEPAGES).map(() => null),
        ];
    const { ranked, rank } = await rankCandidates(
      process.env.NEBIUS_API_KEY ? new NebiusRerankClient() : null,
      brand,
      toRank.map((candidate, index) => ({ ...candidate, page: pages[index] })),
      limit,
    );

    if (rank.status !== "ranked") console.log(`prospect ranking ${rank.status}: ${rank.reason}`);

    const rows: ProspectEvaluationRow[] = [];
    for (const { candidate, rerankScore } of ranked) {
      const { page } = candidate;
      const normalized = normalizeCrawlUrl(candidate.domain);
      if (!normalized.ok) continue;
      const prospect: LinkProspect = {
        url: normalized.url,
        title: candidate.name ?? page?.title ?? null,
        sourceDomain: candidate.domain,
        targetDomain: source.context.sourceDomain,
        fitRationale: `Discovered through ${candidate.sourceEndpoint}`,
        ...(page?.description ? { description: page.description } : {}),
        ...(page?.excerpt ? { content: page.excerpt } : {}),
        ...(brand ? { brandSummary: brandSummary(brand) } : {}),
        metrics: {
          rank: candidate.rank,
          commonTerms: candidate.commonTerms,
          sourceEndpoint: candidate.sourceEndpoint,
          rerankScore,
          rerankStatus: rank.status,
          homepageRead: page !== null && page !== undefined,
        },
      };
      const startedAt = Date.now();
      const runId = (await ctx.runMutation(internal.prospectEvaluation.createRun, {
        owner,
        sourceDiscoveryRunId: args.sourceDiscoveryRunId,
        url: normalized.url,
        prospect,
        context: initialContext(owner, args.sourceDiscoveryRunId, prospect, startedAt),
      })) as ProspectEvaluationRunId;
      rows.push(await advanceRun(ctx, runId, owner));
    }
    return rows.map(toSummary);
  },
});

export const advanceProspectEvaluation = action({
  args: { runId: v.id("prospectEvaluations") },
  returns: prospectEvaluationRunValidator,
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    return toPublicRun(await advanceRun(ctx, args.runId, owner));
  },
});

export const retryProspectEvaluation = action({
  args: { runId: v.id("prospectEvaluations") },
  returns: prospectEvaluationRunValidator,
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const row = (await ctx.runQuery(internal.prospectEvaluation.getOwnedRun, { runId: args.runId, owner })) as ProspectEvaluationRow | null;
    if (!row) throw new ConvexError("Prospect evaluation run not found");
    if (row.state !== "failed") return toPublicRun(row);
    const actor = actorForRow(row);
    actor.start();
    actor.send({ type: "RETRY", at: Date.now() });
    await persistActor(ctx, args.runId, owner, actor);
    return toPublicRun(await advanceRun(ctx, args.runId, owner));
  },
});

export const cancelProspectEvaluation = action({
  args: { runId: v.id("prospectEvaluations") },
  returns: prospectEvaluationRunValidator,
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const row = (await ctx.runQuery(internal.prospectEvaluation.getOwnedRun, { runId: args.runId, owner })) as ProspectEvaluationRow | null;
    if (!row) throw new ConvexError("Prospect evaluation run not found");
    if (row.state === "completed" || row.state === "cancelled") return toPublicRun(row);
    const actor = actorForRow(row);
    actor.start();
    actor.send({ type: "CANCEL", at: Date.now() });
    await persistActor(ctx, args.runId, owner, actor);
    const updated = (await ctx.runQuery(internal.prospectEvaluation.getOwnedRun, { runId: args.runId, owner })) as ProspectEvaluationRow | null;
    if (!updated) throw new ConvexError("Prospect evaluation run not found after cancellation");
    return toPublicRun(updated);
  },
});

export const getProspectEvaluation = query({
  args: { runId: v.id("prospectEvaluations") },
  returns: v.union(prospectEvaluationRunValidator, v.null()),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const row = (await ctx.runQuery(internal.prospectEvaluation.getOwnedRun, { runId: args.runId, owner })) as ProspectEvaluationRow | null;
    return row ? toPublicRun(row) : null;
  },
});

export const listActiveProspects = query({
  args: {},
  returns: v.array(prospectQueueItemValidator),
  handler: async (ctx) => listQueue(ctx, await requireOwner(ctx), "act"),
});

export const listReviewProspects = query({
  args: {},
  returns: v.array(prospectQueueItemValidator),
  handler: async (ctx) => listQueue(ctx, await requireOwner(ctx), "review"),
});

export const listDroppedProspects = query({
  args: {},
  returns: v.array(prospectQueueItemValidator),
  handler: async (ctx) => listQueue(ctx, await requireOwner(ctx), "drop"),
});

export const listProspectEvaluationRuns = query({
  args: {},
  returns: v.array(prospectEvaluationSummaryValidator),
  handler: async (ctx) => {
    const owner = await requireOwner(ctx);
    const rows = await (ctx.db.query("prospectEvaluations") as unknown as EvaluationQuery)
      .withIndex("by_owner_updated", (index) => index.eq("owner", owner))
      .order("desc")
      .take(50);
    return rows.map((row) => toSummary(toRow(row)));
  },
});
