import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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

const enrichmentStateValidator = v.union(
  v.literal("idle"),
  v.literal("mapping"),
  v.literal("scraping"),
  v.literal("extracting"),
  v.literal("completed"),
  v.literal("failed"),
  v.literal("cancelled"),
);

const competitorCandidateValidator = v.object({
  domain: v.string(),
  name: v.union(v.string(), v.null()),
  rank: v.union(v.number(), v.null()),
  commonTerms: v.union(v.number(), v.null()),
  sourceEndpoint: v.string(),
});

const competitorDiscoveryContextValidator = v.object({
  owner: v.string(),
  sourceEnrichmentRunId: v.string(),
  sourceUrl: v.string(),
  sourceDomain: v.string(),
  endpoint: v.string(),
  limit: v.number(),
  candidates: v.array(competitorCandidateValidator),
  normalizedCandidates: v.array(competitorCandidateValidator),
  error: v.union(v.string(), v.null()),
  attempt: v.number(),
  startedAt: v.number(),
  updatedAt: v.number(),
});

const competitorDiscoveryStateValidator = v.union(
  v.literal("idle"),
  v.literal("discovering"),
  v.literal("normalizing"),
  v.literal("completed"),
  v.literal("failed"),
  v.literal("cancelled"),
);

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

const contactResolutionContextValidator = v.object({
  owner: v.string(),
  domain: v.string(),
  candidateEmail: v.string(),
  contactName: v.string(),
  publicationUrl: v.string(),
  resolvedEmail: v.union(v.string(), v.null()),
  verificationSource: v.union(v.string(), v.null()),
  confidence: v.union(v.number(), v.null()),
  reason: v.union(v.string(), v.null()),
  attempt: v.number(),
  checkedAt: v.union(v.number(), v.null()),
  error: v.union(v.string(), v.null()),
  startedAt: v.number(),
  updatedAt: v.number(),
});

const contactResolutionStateValidator = v.union(
  v.literal("idle"),
  v.literal("checking_domain"),
  v.literal("checking_contact"),
  v.literal("deliverable"),
  v.literal("needs_alternate"),
  v.literal("bounced"),
  v.literal("failed"),
  v.literal("cancelled"),
);

const outboundProspectValidator = v.object({
  name: v.string(),
  email: v.string(),
  url: v.string(),
  publication: v.string(),
  fitRationale: v.string(),
});

const outboundBrandValidator = v.object({
  name: v.string(),
  voice: v.string(),
  guestPostAngle: v.string(),
});

const outboundDraftValidator = v.object({
  subject: v.string(),
  text: v.string(),
  labels: v.array(v.string()),
});

const outboundReplyAnalysisValidator = v.object({
  intent: v.union(
    v.literal("unknown"),
    v.literal("interested"),
    v.literal("question"),
    v.literal("negative"),
    v.literal("bounce"),
    v.literal("accepted"),
  ),
  sentiment: v.number(),
  confidence: v.number(),
  dealLikelihood: v.number(),
  nextAction: v.union(
    v.literal("review"),
    v.literal("draft_follow_up"),
    v.literal("qualify"),
    v.literal("close_lost"),
    v.literal("schedule_guest_post"),
    v.literal("retry_delivery"),
  ),
  labels: v.array(v.string()),
  rationale: v.string(),
});

const outboundThreadContextValidator = v.object({
  owner: v.string(),
  campaignId: v.string(),
  prospect: outboundProspectValidator,
  brand: outboundBrandValidator,
  goal: v.literal("guest_post"),
  draft: v.union(outboundDraftValidator, v.null()),
  analysis: v.union(outboundReplyAnalysisValidator, v.null()),
  agentThreadId: v.union(v.string(), v.null()),
  agentMailThreadId: v.union(v.string(), v.null()),
  agentMailInboxId: v.union(v.string(), v.null()),
  agentMailMessageId: v.union(v.string(), v.null()),
  idempotencyKey: v.union(v.string(), v.null()),
  labels: v.array(v.string()),
  attempt: v.number(),
  nextFollowUpAt: v.union(v.number(), v.null()),
  error: v.union(v.string(), v.null()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

const outboundThreadStateValidator = v.union(
  v.literal("idle"),
  v.literal("drafting"),
  v.literal("review_required"),
  v.literal("ready_to_send"),
  v.literal("sending"),
  v.literal("awaiting_reply"),
  v.literal("analyzing_reply"),
  v.literal("follow_up_scheduled"),
  v.literal("follow_up_due"),
  v.literal("engaged"),
  v.literal("negotiating"),
  v.literal("scheduled"),
  v.literal("closed_won"),
  v.literal("closed_lost"),
  v.literal("failed"),
  v.literal("cancelled"),
);

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

  enrichmentRuns: defineTable({
    owner: v.string(),
    sourceUrl: v.string(),
    state: enrichmentStateValidator,
    context: enrichmentContextValidator,
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_owner_created", ["owner", "createdAt"]),

  competitorDiscoveryRuns: defineTable({
    owner: v.string(),
    sourceEnrichmentRunId: v.id("enrichmentRuns"),
    sourceUrl: v.string(),
    sourceDomain: v.string(),
    state: competitorDiscoveryStateValidator,
    context: competitorDiscoveryContextValidator,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner_created", ["owner", "createdAt"])
    .index("by_source", ["sourceEnrichmentRunId"]),

  prospectEvaluations: defineTable({
    owner: v.string(),
    sourceDiscoveryRunId: sourceDiscoveryRunIdValidator,
    url: v.string(),
    prospect: prospectInputValidator,
    state: prospectEvaluationStateValidator,
    action: v.union(prospectActionValidator, v.null()),
    confidence: v.union(v.number(), v.null()),
    context: prospectEvaluationContextValidator,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
     .index("by_owner_action_updated", ["owner", "action", "updatedAt"])
     .index("by_owner_updated", ["owner", "updatedAt"])
     .index("by_owner_url", ["owner", "url"]),

  contactResolutions: defineTable({
    owner: v.string(),
    outboundThreadId: v.optional(v.id("outboundThreads")),
    state: contactResolutionStateValidator,
    context: contactResolutionContextValidator,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner_state_updated", ["owner", "state", "updatedAt"])
    .index("by_owner_updated", ["owner", "updatedAt"])
    .index("by_outbound_thread", ["outboundThreadId"]),

  outboundDomains: defineTable({
    owner: v.string(),
    domain: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("verified"),
      v.literal("warming"),
      v.literal("paused"),
      v.literal("error"),
    ),
    localPartPrefixes: v.array(v.string()),
    dailyLimit: v.number(),
    sentToday: v.number(),
    warmupScore: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner_status", ["owner", "status"])
    .index("by_owner_domain", ["owner", "domain"]),

  outboundInboxes: defineTable({
    owner: v.string(),
    domain: v.string(),
    localPart: v.string(),
    address: v.string(),
    agentMailInboxId: v.optional(v.string()),
    displayName: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("warming"),
      v.literal("paused"),
      v.literal("error"),
    ),
    dailyLimit: v.number(),
    sentToday: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner_status", ["owner", "status"])
    .index("by_owner_domain", ["owner", "domain"])
    .index("by_owner_address", ["owner", "address"]),

  outboundCampaigns: defineTable({
    owner: v.string(),
    name: v.string(),
    goal: v.literal("guest_post"),
    status: v.union(
      v.literal("draft"),
      v.literal("running"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
    dailySendLimit: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_owner_status_updated", ["owner", "status", "updatedAt"]),

  outboundThreads: defineTable({
    owner: v.string(),
    campaignId: v.id("outboundCampaigns"),
    state: outboundThreadStateValidator,
    context: outboundThreadContextValidator,
    agentThreadId: v.optional(v.string()),
    agentMailThreadId: v.optional(v.string()),
    agentMailInboxId: v.optional(v.string()),
    labels: v.array(v.string()),
    nextFollowUpAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner_state_updated", ["owner", "state", "updatedAt"])
    .index("by_campaign_updated", ["campaignId", "updatedAt"])
    .index("by_owner_follow_up", ["owner", "nextFollowUpAt"]),

  outboundDeliveries: defineTable({
    owner: v.string(),
    threadId: v.id("outboundThreads"),
    idempotencyKey: v.string(),
    provider: v.string(),
    status: v.union(
      v.literal("reserved"),
      v.literal("sent"),
      v.literal("failed"),
      v.literal("bounced"),
    ),
    providerMessageId: v.optional(v.string()),
    attemptedAt: v.number(),
    sentAt: v.optional(v.number()),
  })
    .index("by_owner_key", ["owner", "idempotencyKey"])
    .index("by_thread", ["threadId", "attemptedAt"]),
});
