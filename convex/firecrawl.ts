import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import { FirecrawlCrawlClient, normalizeCrawlUrl } from "../lib/firecrawl/crawl/index.js";
import type {
  Crawl,
  CrawledPage,
  FirecrawlDocument,
  MapLink,
  SearchResult,
} from "../lib/firecrawl/crawl/index.js";
import { components, internal } from "./_generated/api.js";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server.js";
import { requireOwner } from "./lib/server.js";

const firecrawl = FirecrawlCrawlClient.fromComponent(components.firecrawl);
const crawlStatus = v.union(
  v.literal("scraping"),
  v.literal("completed"),
  v.literal("failed"),
  v.literal("cancelled"),
);
// The Firecrawl component only invokes the completion callback once a crawl has
// settled, so "scraping" is not a valid callback status even though the stored
// row uses it while the crawl is still running.
const settledCrawlStatus = v.union(v.literal("completed"), v.literal("failed"), v.literal("cancelled"));
const crawlMode = v.union(v.literal("webhook"), v.literal("poll"));
const crawlView = v.object({
  crawlId: v.string(),
  url: v.string(),
  status: crawlStatus,
  mode: crawlMode,
  pageCount: v.number(),
  completed: v.union(v.number(), v.null()),
  total: v.union(v.number(), v.null()),
  creditsUsed: v.union(v.number(), v.null()),
  error: v.union(v.string(), v.null()),
  updatedAt: v.number(),
});
const pageView = v.object({
  crawlId: v.string(),
  url: v.string(),
  title: v.union(v.string(), v.null()),
  description: v.union(v.string(), v.null()),
  markdown: v.union(v.string(), v.null()),
  truncated: v.boolean(),
  scrapedAt: v.number(),
});
const scrapeView = v.object({
  url: v.string(),
  title: v.union(v.string(), v.null()),
  description: v.union(v.string(), v.null()),
  markdown: v.union(v.string(), v.null()),
  links: v.optional(v.array(v.string())),
  creditsUsed: v.union(v.number(), v.null()),
});
const mapView = v.object({
  url: v.string(),
  title: v.optional(v.string()),
  description: v.optional(v.string()),
});
const searchView = v.object({
  url: v.string(),
  title: v.optional(v.string()),
  description: v.optional(v.string()),
  position: v.optional(v.number()),
});
const pageListView = v.object({
  page: v.array(pageView),
  isDone: v.boolean(),
  continueCursor: v.string(),
});

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function documentView(url: string, document: FirecrawlDocument): typeof scrapeView.type {
  const metadata = document.metadata;
  return {
    url,
    title: stringValue(metadata?.title),
    description: stringValue(metadata?.description),
    markdown: stringValue(document.markdown),
    ...(Array.isArray(document.links) ? { links: document.links.filter((link): link is string => typeof link === "string") } : {}),
    creditsUsed: numberValue(metadata?.creditsUsed),
  };
}

function pageDocumentView(page: CrawledPage): typeof pageView.type {
  return {
    crawlId: page.crawlId,
    url: page.url,
    title: stringValue(page.metadata?.title),
    description: stringValue(page.metadata?.description),
    markdown: stringValue(page.markdown),
    truncated: page.truncated,
    scrapedAt: page.scrapedAt,
  };
}

function crawlDocumentView(crawl: Crawl): typeof crawlView.type {
  return {
    crawlId: crawl._id,
    url: crawl.url,
    status: crawl.status,
    mode: crawl.mode,
    pageCount: crawl.pageCount,
    completed: crawl.completed ?? null,
    total: crawl.total ?? null,
    creditsUsed: crawl.creditsUsed ?? null,
    error: crawl.error ?? null,
    updatedAt: crawl.updatedAt,
  };
}

function mapLinkView(link: MapLink): typeof mapView.type {
  return {
    url: link.url,
    ...(stringValue(link.title) ? { title: stringValue(link.title) as string } : {}),
    ...(stringValue(link.description) ? { description: stringValue(link.description) as string } : {}),
  };
}

function searchResultView(item: SearchResult | FirecrawlDocument): typeof searchView.type | null {
  const record = item as Record<string, unknown>;
  const metadata = record.metadata as Record<string, unknown> | undefined;
  const url = stringValue(record.url) ?? stringValue(metadata?.sourceURL) ?? stringValue(metadata?.url);
  if (!url) return null;
  const title = stringValue(record.title) ?? stringValue(metadata?.title);
  const description = stringValue(record.description) ?? stringValue(metadata?.description);
  const position = numberValue(record.position);
  return {
    url,
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(position === null ? {} : { position }),
  };
}

export const getOwnedCrawl = internalQuery({
  args: { owner: v.string(), crawlId: v.string() },
  returns: v.union(v.id("firecrawlCrawls"), v.null()),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("firecrawlCrawls")
      .withIndex("by_crawl", (q) => q.eq("crawlId", args.crawlId))
      .first();
    return row?.owner === args.owner ? row._id : null;
  },
});

export const recordCrawlStart = internalMutation({
  args: {
    owner: v.string(),
    crawlId: v.string(),
    url: v.string(),
    mode: crawlMode,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("firecrawlCrawls")
      .withIndex("by_crawl", (q) => q.eq("crawlId", args.crawlId))
      .first();
    if (existing) {
      if (existing.owner !== args.owner) throw new ConvexError("Crawl ownership conflict");
      return null;
    }
    const now = Date.now();
    await ctx.db.insert("firecrawlCrawls", {
      owner: args.owner,
      crawlId: args.crawlId,
      url: args.url,
      status: "scraping",
      mode: args.mode,
      pageCount: 0,
      createdAt: now,
      updatedAt: now,
    });
    return null;
  },
});

export const updateCrawlStatus = internalMutation({
  args: {
    owner: v.string(),
    crawlId: v.string(),
    status: crawlStatus,
    pageCount: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("firecrawlCrawls")
      .withIndex("by_crawl", (q) => q.eq("crawlId", args.crawlId))
      .first();
    if (!row || row.owner !== args.owner) return null;
    await ctx.db.patch(row._id, {
      status: args.status,
      updatedAt: Date.now(),
      ...(args.pageCount === undefined ? {} : { pageCount: args.pageCount }),
    });
    return null;
  },
});

export const onCrawlComplete = internalMutation({
  args: {
    crawlId: v.string(),
    status: settledCrawlStatus,
    pageCount: v.number(),
    context: v.optional(v.any()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("firecrawlCrawls")
      .withIndex("by_crawl", (q) => q.eq("crawlId", args.crawlId))
      .unique();
    if (!row) return null;
    await ctx.db.patch(row._id, {
      status: args.status,
      pageCount: args.pageCount,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const scrapePage = action({
  args: {
    url: v.string(),
    includeMarkdown: v.optional(v.boolean()),
  },
  returns: scrapeView,
  handler: async (ctx, args) => {
    await requireOwner(ctx);
    const normalized = normalizeCrawlUrl(args.url);
    if (!normalized.ok) throw new ConvexError(normalized.reason);
    const result = await firecrawl.scrape(ctx, normalized.url, {
      formats: args.includeMarkdown === false ? ["links"] : ["markdown", "links"],
      onlyMainContent: true,
    });
    return documentView(normalized.url, result);
  },
});

export const mapSite = action({
  args: { url: v.string(), limit: v.optional(v.number()) },
  returns: v.array(mapView),
  handler: async (ctx, args) => {
    await requireOwner(ctx);
    const normalized = normalizeCrawlUrl(args.url);
    if (!normalized.ok) throw new ConvexError(normalized.reason);
    const result = await firecrawl.map(ctx, normalized.url, {
      limit: Math.min(Math.max(args.limit ?? 100, 1), 500),
    });
    return result.links.map(mapLinkView);
  },
});

export const searchWeb = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    scrapeResults: v.optional(v.boolean()),
  },
  returns: v.array(searchView),
  handler: async (ctx, args) => {
    await requireOwner(ctx);
    const result = await firecrawl.search(ctx, args.query, {
      limit: Math.min(Math.max(args.limit ?? 10, 1), 20),
      ...(args.scrapeResults ? { scrapeOptions: { formats: ["markdown"] as const } } : {}),
    });
    return [...(result.web ?? []), ...(result.news ?? []), ...(result.developer ?? [])]
      .map(searchResultView)
      .filter((item): item is NonNullable<typeof item> => item !== null);
  },
});

export const startCrawl = action({
  args: {
    url: v.string(),
    limit: v.optional(v.number()),
    includePaths: v.optional(v.array(v.string())),
    excludePaths: v.optional(v.array(v.string())),
    mode: v.optional(crawlMode),
    storeContent: v.optional(v.boolean()),
  },
  returns: v.object({ crawlId: v.string(), jobId: v.string() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const normalized = normalizeCrawlUrl(args.url);
    if (!normalized.ok) throw new ConvexError(normalized.reason);
    const limit = Math.min(Math.max(args.limit ?? 25, 1), 100);
    const mode = args.mode ?? "webhook";
    const result = await firecrawl.startCrawl(ctx, {
      url: normalized.url,
      mode,
      storeContent: args.storeContent ?? true,
      options: {
        limit,
        ...(args.includePaths ? { includePaths: args.includePaths } : {}),
        ...(args.excludePaths ? { excludePaths: args.excludePaths } : {}),
        scrapeOptions: { formats: ["markdown"], onlyMainContent: true },
      },
      onComplete: internal.firecrawl.onCrawlComplete,
      context: { owner },
    });
    await ctx.runMutation(internal.firecrawl.recordCrawlStart, {
      owner,
      crawlId: result.crawlId,
      url: normalized.url,
      mode,
    });
    return result;
  },
});

export const getCrawl = query({
  args: { crawlId: v.string() },
  returns: v.union(crawlView, v.null()),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const owned = await ctx.runQuery(internal.firecrawl.getOwnedCrawl, { owner, crawlId: args.crawlId });
    if (!owned) throw new ConvexError("Crawl not found");
    const crawl = await firecrawl.getCrawl(ctx, args.crawlId);
    return crawl ? crawlDocumentView(crawl) : null;
  },
});

export const listCrawls = query({
  args: {},
  returns: v.array(crawlView),
  handler: async (ctx) => {
    const owner = await requireOwner(ctx);
    const rows = await ctx.db
      .query("firecrawlCrawls")
      .withIndex("by_owner_created", (q) => q.eq("owner", owner))
      .order("desc")
      .take(20);
    return rows.map((row) => ({
      crawlId: row.crawlId,
      url: row.url,
      status: row.status,
      mode: row.mode,
      pageCount: row.pageCount,
      completed: null,
      total: null,
      creditsUsed: null,
      error: null,
      updatedAt: row.updatedAt,
    }));
  },
});

export const listCrawlPages = query({
  args: { crawlId: v.string(), paginationOpts: paginationOptsValidator },
  returns: pageListView,
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const owned = await ctx.runQuery(internal.firecrawl.getOwnedCrawl, { owner, crawlId: args.crawlId });
    if (!owned) throw new ConvexError("Crawl not found");
    const result = await firecrawl.listPages(ctx, args);
    return {
      page: result.page.map(pageDocumentView),
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    };
  },
});

export const getCrawlPage = query({
  args: { crawlId: v.string(), url: v.string() },
  returns: v.union(pageView, v.null()),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const owned = await ctx.runQuery(internal.firecrawl.getOwnedCrawl, { owner, crawlId: args.crawlId });
    if (!owned) throw new ConvexError("Crawl not found");
    const page = await firecrawl.getPage(ctx, args);
    return page ? pageDocumentView(page) : null;
  },
});

export const cancelCrawl = action({
  args: { crawlId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const owned = await ctx.runQuery(internal.firecrawl.getOwnedCrawl, { owner, crawlId: args.crawlId });
    if (!owned) throw new ConvexError("Crawl not found");
    await firecrawl.cancelCrawl(ctx, args.crawlId);
    await ctx.runMutation(internal.firecrawl.updateCrawlStatus, {
      owner,
      crawlId: args.crawlId,
      status: "cancelled",
    });
    return null;
  },
});

export const deleteCrawl = mutation({
  args: { crawlId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const owned = await ctx.runQuery(internal.firecrawl.getOwnedCrawl, { owner, crawlId: args.crawlId });
    if (!owned) throw new ConvexError("Crawl not found");
    await firecrawl.deleteCrawl(ctx, args.crawlId);
    await ctx.db.delete(owned);
    return null;
  },
});

export const resumeCrawl = mutation({
  args: { crawlId: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const owned = await ctx.runQuery(internal.firecrawl.getOwnedCrawl, { owner, crawlId: args.crawlId });
    if (!owned) throw new ConvexError("Crawl not found");
    const resumed = await firecrawl.resumeCrawl(ctx, args.crawlId);
    if (resumed) {
      await ctx.runMutation(internal.firecrawl.updateCrawlStatus, {
        owner,
        crawlId: args.crawlId,
        status: "scraping",
      });
    }
    return resumed;
  },
});
