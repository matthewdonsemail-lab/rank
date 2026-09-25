import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  workspaces: defineTable({
    name: v.string(),
    slug: v.string(),
    ownerId: v.string(),
    plan: v.string(),
    createdAt: v.number(),
  }).index("by_slug", ["slug"]),

  apiKeys: defineTable({
    workspaceId: v.id("workspaces"),
    hashedKey: v.string(),
    label: v.string(),
    scopes: v.array(v.string()),
    lastUsedAt: v.optional(v.number()),
  }).index("by_hashed_key", ["hashedKey"]),

  rankSessions: defineTable({
    workspaceId: v.id("workspaces"),
    query: v.string(),
    strategy: v.string(),
    model: v.string(),
    candidateCount: v.number(),
    latencyMs: v.number(),
    createdAt: v.number(),
  }).index("by_workspace", ["workspaceId", "createdAt"]),

  candidates: defineTable({
    sessionId: v.id("rankSessions"),
    externalId: v.optional(v.string()),
    text: v.string(),
    initialScore: v.optional(v.number()),
    rerankScore: v.number(),
    confidence: v.optional(v.number()),
    finalRank: v.number(),
  }).index("by_session", ["sessionId", "finalRank"]),

  receipts: defineTable({
    sessionId: v.id("rankSessions"),
    provider: v.string(),
    model: v.string(),
    tokensUsed: v.number(),
    costUsd: v.number(),
    timestamp: v.number(),
  }).index("by_session", ["sessionId"]),

  benchmarkRuns: defineTable({
    workspaceId: v.id("workspaces"),
    dataset: v.string(),
    ndcg10: v.number(),
    mrr: v.number(),
    avgLatencyMs: v.number(),
    completedAt: v.number(),
  }).index("by_workspace", ["workspaceId", "completedAt"]),

  brands: defineTable({
    owner: v.string(),
    sourceUrl: v.string(),
    name: v.string(),
    tagline: v.string(),
    offerings: v.array(v.object({ name: v.string(), detail: v.string() })),
    tone: v.optional(v.string()),
    formality: v.optional(v.union(v.literal("casual"), v.literal("professional"), v.literal("formal"))),
    locationLabel: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    fetchedAt: v.number(),
    lastAttemptAt: v.number(),
    lastMapAt: v.optional(v.number()),
  }).index("by_owner", ["owner"]),

  firecrawlCrawls: defineTable({
    owner: v.string(),
    crawlId: v.string(),
    url: v.string(),
    status: v.union(v.literal("scraping"), v.literal("completed"), v.literal("failed"), v.literal("cancelled")),
    mode: v.union(v.literal("webhook"), v.literal("poll")),
    pageCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner_created", ["owner", "createdAt"])
    .index("by_owner_crawl", ["owner", "crawlId"])
    .index("by_crawl", ["crawlId"]),
});
