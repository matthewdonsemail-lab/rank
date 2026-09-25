import { createActor } from "xstate";
import type { GenericActionCtx, GenericQueryCtx } from "convex/server";
import { ConvexError, v, type GenericId } from "convex/values";
import {
  buildPrefixedInboxAddress,
  normalizeInboxPrefix,
  outboundThreadMachine,
  selectSharedInbox,
  type OutboundBrandContext,
  type OutboundProspect,
  type OutboundReplyAnalysis,
  type OutboundThreadContext,
  type OutboundThreadEvent,
  type OutboundThreadState,
} from "../lib/xstate/outbound/index.js";
import {
  contactResolutionMachine,
  type ContactResolutionContext,
  type ContactResolutionEvent,
  type ContactResolutionState,
} from "../lib/xstate/contact-resolution/index.js";
import type { DataModel } from "./_generated/dataModel.js";
import { internal } from "./_generated/api.js";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server.js";
import { requireOwner } from "./lib/server.js";

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

const outboundAnalysisValidator = v.object({
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

const outboundContextValidator = v.object({
  owner: v.string(),
  campaignId: v.string(),
  prospect: outboundProspectValidator,
  brand: outboundBrandValidator,
  goal: v.literal("guest_post"),
  draft: v.union(outboundDraftValidator, v.null()),
  analysis: v.union(outboundAnalysisValidator, v.null()),
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

const outboundStateValidator = v.union(
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

const outboundEventValidator = v.object({
  type: v.union(
    v.literal("START"),
    v.literal("DRAFT_READY"),
    v.literal("APPROVE"),
    v.literal("SEND"),
    v.literal("SENT"),
    v.literal("REPLY_RECEIVED"),
    v.literal("ANALYSIS_READY"),
    v.literal("REANALYZE"),
    v.literal("SCHEDULE_FOLLOW_UP"),
    v.literal("FOLLOW_UP_DUE"),
    v.literal("FOLLOW_UP_SENT"),
    v.literal("NEGOTIATION_STARTED"),
    v.literal("GUEST_POST_SCHEDULED"),
    v.literal("CLOSE_WON"),
    v.literal("CLOSE_LOST"),
    v.literal("ATTACH_AGENT_THREAD"),
    v.literal("ASSIGN_INBOX"),
    v.literal("ATTACH_AGENTMAIL_THREAD"),
    v.literal("FAIL"),
    v.literal("RETRY"),
    v.literal("CANCEL"),
  ),
  at: v.number(),
  draft: v.optional(outboundDraftValidator),
  idempotencyKey: v.optional(v.string()),
  messageId: v.optional(v.string()),
  threadId: v.optional(v.string()),
  inboxId: v.optional(v.string()),
  dueAt: v.optional(v.number()),
  analysis: v.optional(outboundAnalysisValidator),
  error: v.optional(v.string()),
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

const contactResolutionEventValidator = v.object({
  type: v.union(
    v.literal("START"),
    v.literal("DOMAIN_VERIFIED"),
    v.literal("DOMAIN_UNUSABLE"),
    v.literal("CONTACT_RESOLVED"),
    v.literal("CONTACT_UNRESOLVED"),
    v.literal("DELIVERY_BOUNCED"),
    v.literal("FAIL"),
    v.literal("RETRY"),
    v.literal("CANCEL"),
  ),
  at: v.number(),
  verificationSource: v.optional(v.string()),
  confidence: v.optional(v.number()),
  email: v.optional(v.string()),
  reason: v.optional(v.string()),
  error: v.optional(v.string()),
});

const contactResolutionValidator = v.object({
  resolutionId: v.id("contactResolutions"),
  owner: v.string(),
  outboundThreadId: v.optional(v.id("outboundThreads")),
  state: contactResolutionStateValidator,
  context: contactResolutionContextValidator,
  createdAt: v.number(),
  updatedAt: v.number(),
});

const outboundDomainValidator = v.object({
  domainId: v.id("outboundDomains"),
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
});

const outboundInboxValidator = v.object({
  inboxId: v.id("outboundInboxes"),
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
});

const outboundCampaignValidator = v.object({
  campaignId: v.id("outboundCampaigns"),
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
});

const outboundThreadValidator = v.object({
  threadId: v.id("outboundThreads"),
  owner: v.string(),
  campaignId: v.id("outboundCampaigns"),
  state: outboundStateValidator,
  context: outboundContextValidator,
  agentThreadId: v.optional(v.string()),
  agentMailThreadId: v.optional(v.string()),
  agentMailInboxId: v.optional(v.string()),
  labels: v.array(v.string()),
  nextFollowUpAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

const storedThreadValidator = v.object({
  threadId: v.id("outboundThreads"),
  owner: v.string(),
  campaignId: v.id("outboundCampaigns"),
  state: outboundStateValidator,
  context: outboundContextValidator,
  createdAt: v.number(),
  updatedAt: v.number(),
});

const storedCampaignValidator = v.object({
  campaignId: v.id("outboundCampaigns"),
  owner: v.string(),
});

type ActionContext = GenericActionCtx<DataModel>;
type QueryContext = GenericQueryCtx<DataModel>;
type ThreadId = GenericId<"outboundThreads">;

type ThreadRow = {
  _id: ThreadId;
  owner: string;
  campaignId: GenericId<"outboundCampaigns">;
  state: OutboundThreadState;
  context: OutboundThreadContext;
  agentThreadId?: string;
  agentMailThreadId?: string;
  agentMailInboxId?: string;
  labels: string[];
  nextFollowUpAt?: number;
  createdAt: number;
  updatedAt: number;
};

type ThreadActor = {
  start: () => unknown;
  send: (event: OutboundThreadEvent) => void;
  getSnapshot: () => { value: unknown; context: OutboundThreadContext };
};

type ContactResolutionRow = {
  _id: GenericId<"contactResolutions">;
  owner: string;
  outboundThreadId?: GenericId<"outboundThreads">;
  state: ContactResolutionState;
  context: ContactResolutionContext;
  createdAt: number;
  updatedAt: number;
};

type ContactResolutionActor = {
  start: () => unknown;
  send: (event: ContactResolutionEvent) => void;
  getSnapshot: () => { value: unknown; context: ContactResolutionContext };
};

function toThreadView(row: ThreadRow): typeof outboundThreadValidator.type {
  return {
    threadId: row._id,
    owner: row.owner,
    campaignId: row.campaignId,
    state: row.state,
    context: row.context,
    agentThreadId: row.agentThreadId,
    agentMailThreadId: row.agentMailThreadId,
    agentMailInboxId: row.agentMailInboxId,
    labels: row.labels,
    nextFollowUpAt: row.nextFollowUpAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toStoredThread(row: ThreadRow): typeof storedThreadValidator.type {
  return {
    threadId: row._id,
    owner: row.owner,
    campaignId: row.campaignId,
    state: row.state,
    context: row.context,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function actorForRow(row: ThreadRow): ThreadActor {
  const snapshot = outboundThreadMachine.resolveState({
    value: row.state,
    context: row.context,
  });
  return createActor(outboundThreadMachine, {
    input: {
      owner: row.context.owner,
      campaignId: row.context.campaignId,
      prospect: row.context.prospect,
      brand: row.context.brand,
      createdAt: row.context.createdAt,
    },
    snapshot,
  });
}

function contactResolutionActor(row: ContactResolutionRow): ContactResolutionActor {
  const snapshot = contactResolutionMachine.resolveState({
    value: row.state,
    context: row.context,
  });
  return createActor(contactResolutionMachine, {
    input: {
      owner: row.context.owner,
      domain: row.context.domain,
      candidateEmail: row.context.candidateEmail,
      contactName: row.context.contactName,
      publicationUrl: row.context.publicationUrl,
      startedAt: row.context.startedAt,
    },
    snapshot,
  });
}

function contactResolutionView(row: ContactResolutionRow): typeof contactResolutionValidator.type {
  return {
    resolutionId: row._id,
    owner: row.owner,
    outboundThreadId: row.outboundThreadId,
    state: row.state,
    context: row.context,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function assertAnalysis(analysis: Record<string, unknown>): void {
  for (const field of ["sentiment"] as const) {
    const value = analysis[field];
    if (typeof value !== "number" || value < -1 || value > 1) {
      throw new ConvexError(`${field} must be between -1 and 1`);
    }
  }
  for (const field of ["confidence", "dealLikelihood"] as const) {
    const value = analysis[field];
    if (typeof value !== "number" || value < 0 || value > 1) {
      throw new ConvexError(`${field} must be between 0 and 1`);
    }
  }
}

function assertEvent(event: Record<string, unknown>): asserts event is OutboundThreadEvent {
  if (typeof event.type !== "string" || typeof event.at !== "number") {
    throw new ConvexError("Invalid outbound event");
  }
  if (event.type === "DRAFT_READY" && !event.draft) throw new ConvexError("draft is required");
  if (event.type === "SEND" && !event.idempotencyKey) throw new ConvexError("idempotencyKey is required");
  if (["SENT", "REPLY_RECEIVED", "FOLLOW_UP_SENT"].includes(event.type) && (!event.messageId || !event.threadId)) {
    throw new ConvexError("messageId and threadId are required");
  }
  if (event.type === "ANALYSIS_READY" && !event.analysis) throw new ConvexError("analysis is required");
  if (event.type === "SCHEDULE_FOLLOW_UP" && typeof event.dueAt !== "number") {
    throw new ConvexError("dueAt is required");
  }
  if (event.type === "FAIL" && typeof event.error !== "string") throw new ConvexError("error is required");
  if (event.type === "ATTACH_AGENT_THREAD" && !event.threadId) throw new ConvexError("threadId is required");
  if (event.type === "ASSIGN_INBOX" && !event.inboxId) throw new ConvexError("inboxId is required");
  if (event.type === "ATTACH_AGENTMAIL_THREAD" && (!event.threadId || !event.inboxId)) {
    throw new ConvexError("threadId and inboxId are required");
  }
}

function assertContactEvent(event: Record<string, unknown>): asserts event is ContactResolutionEvent {
  if (typeof event.type !== "string" || typeof event.at !== "number") {
    throw new ConvexError("Invalid contact-resolution event");
  }
  if (event.type === "DOMAIN_VERIFIED" && (typeof event.verificationSource !== "string" || typeof event.confidence !== "number" || event.confidence < 0 || event.confidence > 1)) {
    throw new ConvexError("Domain verification requires source and confidence");
  }
  if (event.type === "CONTACT_RESOLVED" && (typeof event.email !== "string" || typeof event.verificationSource !== "string" || typeof event.confidence !== "number" || event.confidence < 0 || event.confidence > 1)) {
    throw new ConvexError("Resolved contact requires email, source, and confidence");
  }
  if (["DOMAIN_UNUSABLE", "CONTACT_UNRESOLVED", "DELIVERY_BOUNCED", "FAIL"].includes(event.type) && typeof (event.reason ?? event.error) !== "string") {
    throw new ConvexError("A failure reason is required");
  }
}

async function persistThread(
  ctx: ActionContext,
  row: ThreadRow,
  actor: ThreadActor,
): Promise<typeof outboundThreadValidator.type> {
  const snapshot = actor.getSnapshot();
  const context = snapshot.context;
  const state = snapshot.value as OutboundThreadState;
  await ctx.runMutation(internal.outbound.saveThread, {
    threadId: row._id,
    owner: row.owner,
    state,
    context,
    agentThreadId: context.agentThreadId ?? undefined,
    agentMailThreadId: context.agentMailThreadId ?? undefined,
    agentMailInboxId: context.agentMailInboxId ?? undefined,
    labels: context.labels,
    nextFollowUpAt: context.nextFollowUpAt ?? undefined,
  });
  return toThreadView({
    ...row,
    state,
    context,
    agentThreadId: context.agentThreadId ?? undefined,
    agentMailThreadId: context.agentMailThreadId ?? undefined,
    agentMailInboxId: context.agentMailInboxId ?? undefined,
    labels: context.labels,
    nextFollowUpAt: context.nextFollowUpAt ?? undefined,
    updatedAt: context.updatedAt,
  });
}

async function transitionOwnedThread(
  ctx: ActionContext,
  threadId: ThreadId,
  owner: string,
  event: OutboundThreadEvent,
): Promise<typeof outboundThreadValidator.type> {
  const row = (await ctx.runQuery(internal.outbound.getOwnedThread, { threadId, owner })) as ThreadRow | null;
  if (!row) throw new ConvexError("Outbound thread not found");
  const actor = actorForRow(row);
  actor.start();
  actor.send(event);
  return await persistThread(ctx, row, actor);
}

export const getOwnedContactResolution = internalQuery({
  args: { resolutionId: v.id("contactResolutions"), owner: v.string() },
  returns: v.union(contactResolutionValidator, v.null()),
  handler: async (ctx, args) => {
    const row = (await ctx.db.get(args.resolutionId)) as ContactResolutionRow | null;
    if (!row || row.owner !== args.owner) return null;
    return contactResolutionView(row);
  },
});

export const saveContactResolution = internalMutation({
  args: {
    resolutionId: v.id("contactResolutions"),
    owner: v.string(),
    state: contactResolutionStateValidator,
    context: contactResolutionContextValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const row = (await ctx.db.get(args.resolutionId)) as ContactResolutionRow | null;
    if (!row || row.owner !== args.owner) throw new ConvexError("Contact resolution not found");
    await ctx.db.patch(args.resolutionId, {
      state: args.state,
      context: args.context,
      updatedAt: args.context.updatedAt,
    });
    return null;
  },
});

export const createContactResolutionRecord = internalMutation({
  args: {
    owner: v.string(),
    outboundThreadId: v.optional(v.id("outboundThreads")),
    context: contactResolutionContextValidator,
  },
  returns: v.id("contactResolutions"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("contactResolutions", {
      owner: args.owner,
      outboundThreadId: args.outboundThreadId,
      state: "idle",
      context: args.context,
      createdAt: args.context.startedAt,
      updatedAt: args.context.startedAt,
    });
  },
});

export const getOwnedThread = internalQuery({
  args: { threadId: v.id("outboundThreads"), owner: v.string() },
  returns: v.union(storedThreadValidator, v.null()),
  handler: async (ctx, args) => {
    const row = (await ctx.db.get(args.threadId)) as ThreadRow | null;
    if (!row || row.owner !== args.owner) return null;
    return toStoredThread(row);
  },
});

export const getOwnedCampaign = internalQuery({
  args: { campaignId: v.id("outboundCampaigns"), owner: v.string() },
  returns: v.union(storedCampaignValidator, v.null()),
  handler: async (ctx, args) => {
    const row = (await ctx.db.get(args.campaignId)) as { _id: GenericId<"outboundCampaigns">; owner: string } | null;
    if (!row || row.owner !== args.owner) return null;
    return { campaignId: row._id, owner: row.owner };
  },
});

export const recordInboundReply = internalMutation({
  args: {
    threadId: v.id("outboundThreads"),
    agentMailThreadId: v.string(),
    messageId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const row = (await ctx.db.get(args.threadId)) as ThreadRow | null;
    if (!row) throw new ConvexError("Outbound thread not found");
    const actor = actorForRow(row);
    actor.start();
    actor.send({
      type: "REPLY_RECEIVED",
      at: Date.now(),
      messageId: args.messageId,
      threadId: args.agentMailThreadId,
    });
    const snapshot = actor.getSnapshot();
    const context = snapshot.context;
    await ctx.db.patch(args.threadId, {
      state: snapshot.value as OutboundThreadState,
      context,
      agentThreadId: context.agentThreadId ?? undefined,
      agentMailThreadId: context.agentMailThreadId ?? undefined,
      agentMailInboxId: context.agentMailInboxId ?? undefined,
      labels: context.labels,
      nextFollowUpAt: context.nextFollowUpAt ?? undefined,
      updatedAt: context.updatedAt,
    });
    return null;
  },
});

export const saveThread = internalMutation({
  args: {
    threadId: v.id("outboundThreads"),
    owner: v.string(),
    state: outboundStateValidator,
    context: outboundContextValidator,
    agentThreadId: v.optional(v.string()),
    agentMailThreadId: v.optional(v.string()),
    agentMailInboxId: v.optional(v.string()),
    labels: v.array(v.string()),
    nextFollowUpAt: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const row = (await ctx.db.get(args.threadId)) as ThreadRow | null;
    if (!row || row.owner !== args.owner) throw new ConvexError("Outbound thread not found");
    await ctx.db.patch(args.threadId, {
      state: args.state,
      context: args.context,
      agentThreadId: args.agentThreadId,
      agentMailThreadId: args.agentMailThreadId,
      agentMailInboxId: args.agentMailInboxId,
      labels: args.labels,
      nextFollowUpAt: args.nextFollowUpAt,
      updatedAt: args.context.updatedAt,
    });
    return null;
  },
});

export const createThread = internalMutation({
  args: {
    owner: v.string(),
    campaignId: v.id("outboundCampaigns"),
    context: outboundContextValidator,
  },
  returns: v.id("outboundThreads"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("outboundThreads", {
      owner: args.owner,
      campaignId: args.campaignId,
      state: "drafting",
      context: args.context,
      labels: args.context.labels,
      createdAt: args.context.createdAt,
      updatedAt: args.context.updatedAt,
    });
  },
});

export const addDomain = mutation({
  args: {
    domain: v.string(),
    localPartPrefixes: v.optional(v.array(v.string())),
    dailyLimit: v.optional(v.number()),
  },
  returns: outboundDomainValidator,
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const normalized = args.domain.trim().toLowerCase();
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(normalized)) throw new ConvexError("Invalid domain");
    const existing = (await ctx.db.query("outboundDomains").collect()).find(
      (row) => row.owner === owner && row.domain === normalized,
    );
    if (existing) return { ...existing, domainId: existing._id } as typeof outboundDomainValidator.type;
    const now = Date.now();
    const id = await ctx.db.insert("outboundDomains", {
      owner,
      domain: normalized,
      status: "pending" as const,
      localPartPrefixes: args.localPartPrefixes ?? [],
      dailyLimit: args.dailyLimit ?? 30,
      sentToday: 0,
      warmupScore: 0,
      createdAt: now,
      updatedAt: now,
    });
    return {
      domainId: id,
      owner,
      domain: normalized,
      status: "pending" as const,
      localPartPrefixes: args.localPartPrefixes ?? [],
      dailyLimit: args.dailyLimit ?? 30,
      sentToday: 0,
      warmupScore: 0,
      createdAt: now,
      updatedAt: now,
    };
  },
});

export const setDomainStatus = mutation({
  args: {
    domainId: v.id("outboundDomains"),
    status: v.union(
      v.literal("pending"),
      v.literal("verified"),
      v.literal("warming"),
      v.literal("paused"),
      v.literal("error"),
    ),
    warmupScore: v.optional(v.number()),
  },
  returns: outboundDomainValidator,
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const row = (await ctx.db.get(args.domainId)) as {
      _id: GenericId<"outboundDomains">;
      owner: string;
      domain: string;
      status: "pending" | "verified" | "warming" | "paused" | "error";
      localPartPrefixes: string[];
      dailyLimit: number;
      sentToday: number;
      warmupScore: number;
      createdAt: number;
      updatedAt: number;
    } | null;
    if (!row || row.owner !== owner) throw new ConvexError("Sending domain not found");
    await ctx.db.patch(args.domainId, {
      status: args.status,
      warmupScore: args.warmupScore ?? row.warmupScore,
      updatedAt: Date.now(),
    });
    return {
      domainId: row._id,
      owner: row.owner,
      domain: row.domain,
      status: args.status,
      localPartPrefixes: row.localPartPrefixes,
      dailyLimit: row.dailyLimit,
      sentToday: row.sentToday,
      warmupScore: args.warmupScore ?? row.warmupScore,
      createdAt: row.createdAt,
      updatedAt: Date.now(),
    };
  },
});

export const addInbox = mutation({
  args: {
    domain: v.string(),
    localPart: v.string(),
    agentMailInboxId: v.optional(v.string()),
    displayName: v.optional(v.string()),
    dailyLimit: v.optional(v.number()),
  },
  returns: outboundInboxValidator,
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const domain = args.domain.trim().toLowerCase();
    const localPart = args.localPart.trim().toLowerCase();
    const domainRow = (await ctx.db.query("outboundDomains").collect()).find(
      (row) => row.owner === owner && row.domain === domain,
    );
    if (!domainRow) throw new ConvexError("Sending domain not found");
    const address = `${localPart}@${domain}`;
    const existing = (await ctx.db.query("outboundInboxes").collect()).find(
      (row) => row.owner === owner && row.address === address,
    );
    if (existing) return { ...existing, inboxId: existing._id } as typeof outboundInboxValidator.type;
    const now = Date.now();
    const id = await ctx.db.insert("outboundInboxes", {
      owner,
      domain,
      localPart,
      address,
      agentMailInboxId: args.agentMailInboxId,
      displayName: args.displayName ?? `${localPart} | Rank Outreach`,
      status: "warming" as const,
      dailyLimit: args.dailyLimit ?? 20,
      sentToday: 0,
      createdAt: now,
      updatedAt: now,
    });
    return {
      inboxId: id,
      owner,
      domain,
      localPart,
      address,
      agentMailInboxId: args.agentMailInboxId,
      displayName: args.displayName ?? `${localPart} | Rank Outreach`,
      status: "warming" as const,
      dailyLimit: args.dailyLimit ?? 20,
      sentToday: 0,
      createdAt: now,
      updatedAt: now,
    };
  },
});

export const setInboxStatus = mutation({
  args: {
    inboxId: v.id("outboundInboxes"),
    status: v.union(
      v.literal("active"),
      v.literal("warming"),
      v.literal("paused"),
      v.literal("error"),
    ),
  },
  returns: outboundInboxValidator,
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const row = (await ctx.db.get(args.inboxId)) as {
      _id: GenericId<"outboundInboxes">;
      owner: string;
      domain: string;
      localPart: string;
      address: string;
      displayName: string;
      status: "active" | "warming" | "paused" | "error";
      dailyLimit: number;
      sentToday: number;
      createdAt: number;
      updatedAt: number;
    } | null;
    if (!row || row.owner !== owner) throw new ConvexError("Outbound inbox not found");
    const now = Date.now();
    await ctx.db.patch(args.inboxId, { status: args.status, updatedAt: now });
    return { ...row, inboxId: row._id, status: args.status, updatedAt: now };
  },
});

export const provisionInboxPool = mutation({
  args: {
    domain: v.string(),
    userName: v.string(),
    additionalPrefixes: v.optional(v.array(v.string())),
    dailyLimit: v.optional(v.number()),
  },
  returns: v.array(outboundInboxValidator),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const domain = args.domain.trim().toLowerCase();
    const domainRow = (await ctx.db.query("outboundDomains").collect()).find(
      (row) => row.owner === owner && row.domain === domain,
    );
    if (!domainRow) throw new ConvexError("Sending domain not found");
    const prefixes = Array.from(
      new Set([normalizeInboxPrefix(args.userName), ...(args.additionalPrefixes ?? []).map(normalizeInboxPrefix)]),
    );
    const existing = await ctx.db.query("outboundInboxes").collect();
    const now = Date.now();
    const created: Array<typeof outboundInboxValidator.type> = [];
    for (const localPart of prefixes) {
      const address = buildPrefixedInboxAddress(localPart, domain);
      const current = existing.find((row) => row.owner === owner && row.address === address);
      if (current) {
        created.push({ ...current, inboxId: current._id } as typeof outboundInboxValidator.type);
        continue;
      }
      const id = await ctx.db.insert("outboundInboxes", {
        owner,
        domain,
        localPart,
        address,
        displayName: `${localPart} | Rank Outreach`,
        status: "warming" as const,
        dailyLimit: args.dailyLimit ?? 20,
        sentToday: 0,
        createdAt: now,
        updatedAt: now,
      });
      created.push({
        inboxId: id,
        owner,
        domain,
        localPart,
        address,
        displayName: `${localPart} | Rank Outreach`,
        status: "warming",
        dailyLimit: args.dailyLimit ?? 20,
        sentToday: 0,
        createdAt: now,
        updatedAt: now,
      });
    }
    return created;
  },
});

export const createCampaign = mutation({
  args: { name: v.string(), dailySendLimit: v.optional(v.number()) },
  returns: outboundCampaignValidator,
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const now = Date.now();
    const id = await ctx.db.insert("outboundCampaigns", {
      owner,
      name: args.name,
      goal: "guest_post",
      status: "draft",
      dailySendLimit: args.dailySendLimit ?? 25,
      createdAt: now,
      updatedAt: now,
    });
    return {
      campaignId: id,
      owner,
      name: args.name,
      goal: "guest_post" as const,
      status: "draft" as const,
      dailySendLimit: args.dailySendLimit ?? 25,
      createdAt: now,
      updatedAt: now,
    };
  },
});

export const listDomains = query({
  args: { status: v.optional(v.string()) },
  returns: v.array(outboundDomainValidator),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const rows = await ctx.db.query("outboundDomains").collect();
    return rows
      .filter((row) => !args.status || row.status === args.status)
      .map((row) => ({ ...row, domainId: row._id }));
  },
});

export const listInboxes = query({
  args: { status: v.optional(v.string()), domain: v.optional(v.string()) },
  returns: v.array(outboundInboxValidator),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const rows = await ctx.db.query("outboundInboxes").collect();
    return rows
      .filter((row) => (!args.status || row.status === args.status) && (!args.domain || row.domain === args.domain))
      .map((row) => ({ ...row, inboxId: row._id }));
  },
});

export const listCampaigns = query({
  args: { status: v.optional(v.string()) },
  returns: v.array(outboundCampaignValidator),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const rows = await ctx.db.query("outboundCampaigns").collect();
    return rows
      .filter((row) => !args.status || row.status === args.status)
      .map((row) => ({ ...row, campaignId: row._id }));
  },
});

export const listThreads = query({
  args: { state: v.optional(v.string()), campaignId: v.optional(v.id("outboundCampaigns")) },
  returns: v.array(outboundThreadValidator),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const rows = await ctx.db.query("outboundThreads").collect();
    return rows
      .filter((row) => row.owner === owner && (!args.state || row.state === args.state))
      .map((row) => toThreadView(row as ThreadRow));
  },
});

export const getThread = query({
  args: { threadId: v.id("outboundThreads") },
  returns: v.union(outboundThreadValidator, v.null()),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const row = (await ctx.db.get(args.threadId)) as ThreadRow | null;
    if (!row || row.owner !== owner) return null;
    return toThreadView(row);
  },
});

export const getOwnedPool = internalQuery({
  args: { owner: v.string() },
  returns: v.object({ domains: v.array(v.any()), inboxes: v.array(v.any()) }),
  handler: async (ctx, args) => {
    const [domainRows, inboxRows] = await Promise.all([
      ctx.db.query("outboundDomains").collect(),
      ctx.db.query("outboundInboxes").collect(),
    ]);
    return {
      domains: domainRows.filter((row) => row.owner === args.owner),
      inboxes: inboxRows.filter((row) => row.owner === args.owner),
    };
  },
});

export const getPool = query({
  args: {},
  returns: v.object({ domains: v.array(outboundDomainValidator), inboxes: v.array(outboundInboxValidator) }),
  handler: async (ctx) => {
    const owner = await requireOwner(ctx);
    const [domainRows, inboxRows] = await Promise.all([
      ctx.db.query("outboundDomains").collect(),
      ctx.db.query("outboundInboxes").collect(),
    ]);
    return {
      domains: domainRows
        .filter((row) => row.owner === owner && row.status === "verified")
        .map((row) => ({ ...row, domainId: row._id })),
      inboxes: inboxRows
        .filter((row) => row.owner === owner && row.status === "active")
        .map((row) => ({ ...row, inboxId: row._id })),
    };
  },
});

export const selectPoolInbox = query({
  args: { preferredDomain: v.optional(v.string()) },
  returns: v.union(outboundInboxValidator, v.null()),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const [domainRows, inboxRows] = await Promise.all([
      ctx.db.query("outboundDomains").collect(),
      ctx.db.query("outboundInboxes").collect(),
    ]);
    const selected = selectSharedInbox({
      domains: domainRows
        .filter((row) => row.owner === owner)
        .map((row) => ({ domain: row.domain, status: row.status, warmupScore: row.warmupScore })),
      inboxes: inboxRows
        .filter((row) => row.owner === owner)
        .map((row) => ({
          id: row._id,
          domain: row.domain,
          localPart: row.localPart,
          address: row.address,
          status: row.status,
          dailyLimit: row.dailyLimit,
          sentToday: row.sentToday,
        })),
      preferredDomain: args.preferredDomain,
    });
    if (!selected) return null;
    const row = inboxRows.find((inbox) => inbox._id === selected.id);
    return row ? { ...row, inboxId: row._id } : null;
  },
});

export const assignPoolInbox = action({
  args: { threadId: v.id("outboundThreads"), preferredDomain: v.optional(v.string()) },
  returns: outboundThreadValidator,
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const pool = (await ctx.runQuery(internal.outbound.getOwnedPool, { owner })) as {
      domains: Array<{ domain: string; status: "pending" | "verified" | "warming" | "paused" | "error"; warmupScore: number }>;
      inboxes: Array<{ _id: GenericId<"outboundInboxes">; domain: string; localPart: string; address: string; status: "active" | "warming" | "paused" | "error"; dailyLimit: number; sentToday: number; agentMailInboxId?: string }>;
    };
    const selected = selectSharedInbox({
      domains: pool.domains.map((row) => ({ domain: row.domain, status: row.status, warmupScore: row.warmupScore })),
      inboxes: pool.inboxes.map((row) => ({
        id: row._id,
        domain: row.domain,
        localPart: row.localPart,
        address: row.address,
        status: row.status,
        dailyLimit: row.dailyLimit,
        sentToday: row.sentToday,
      })),
      preferredDomain: args.preferredDomain,
    });
    if (!selected) throw new ConvexError("No healthy shared inbox is available");
    const row = pool.inboxes.find((inbox) => inbox._id === selected.id);
    const providerInboxId = row?.agentMailInboxId;
    if (!providerInboxId) throw new ConvexError("Selected inbox has no AgentMail provider ID");
    return await transitionOwnedThread(ctx, args.threadId, owner, {
      type: "ASSIGN_INBOX",
      at: Date.now(),
      inboxId: providerInboxId,
    });
  },
});

export const listDueFollowUps = query({
  args: { now: v.optional(v.number()) },
  returns: v.array(outboundThreadValidator),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const now = args.now ?? Date.now();
    const rows = (await ctx.db.query("outboundThreads").collect()).filter(
      (row) => row.owner === owner && row.nextFollowUpAt !== undefined && row.nextFollowUpAt <= now,
    );
    return rows.slice(0, 100).map((row) => toThreadView(row as ThreadRow));
  },
});

export const releaseFollowUp = action({
  args: { threadId: v.id("outboundThreads"), now: v.optional(v.number()) },
  returns: outboundThreadValidator,
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const row = (await ctx.runQuery(internal.outbound.getOwnedThread, {
      threadId: args.threadId,
      owner,
    })) as ThreadRow | null;
    if (!row) throw new ConvexError("Outbound thread not found");
    const now = args.now ?? Date.now();
    if (row.state !== "follow_up_scheduled" || row.context.nextFollowUpAt === null || row.context.nextFollowUpAt > now) {
      throw new ConvexError("Follow-up is not due");
    }
    return await transitionOwnedThread(ctx, args.threadId, owner, { type: "FOLLOW_UP_DUE", at: now });
  },
});

export const startThread = action({
  args: { threadId: v.id("outboundThreads") },
  returns: outboundThreadValidator,
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    return await transitionOwnedThread(ctx, args.threadId, owner, { type: "START", at: Date.now() });
  },
});

export const transitionThread = action({
  args: { threadId: v.id("outboundThreads"), event: outboundEventValidator },
  returns: outboundThreadValidator,
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    assertEvent(args.event);
    return await transitionOwnedThread(ctx, args.threadId, owner, args.event);
  },
});

export const linkAgentThread = action({
  args: { threadId: v.id("outboundThreads"), agentThreadId: v.string() },
  returns: outboundThreadValidator,
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    return await transitionOwnedThread(ctx, args.threadId, owner, {
      type: "ATTACH_AGENT_THREAD",
      at: Date.now(),
      threadId: args.agentThreadId,
    });
  },
});

export const linkAgentMailThread = action({
  args: {
    threadId: v.id("outboundThreads"),
    agentMailThreadId: v.string(),
    inboxId: v.string(),
    messageId: v.optional(v.string()),
  },
  returns: outboundThreadValidator,
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    return await transitionOwnedThread(ctx, args.threadId, owner, {
      type: "ATTACH_AGENTMAIL_THREAD",
      at: Date.now(),
      threadId: args.agentMailThreadId,
      inboxId: args.inboxId,
      messageId: args.messageId,
    });
  },
});

export const recordReply = action({
  args: { threadId: v.id("outboundThreads"), messageId: v.string(), agentMailThreadId: v.string() },
  returns: outboundThreadValidator,
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    return await transitionOwnedThread(ctx, args.threadId, owner, {
      type: "REPLY_RECEIVED",
      at: Date.now(),
      messageId: args.messageId,
      threadId: args.agentMailThreadId,
    });
  },
});

export const recordReplyAnalysis = action({
  args: { threadId: v.id("outboundThreads"), analysis: outboundAnalysisValidator },
  returns: outboundThreadValidator,
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    assertAnalysis(args.analysis as unknown as Record<string, unknown>);
    return await transitionOwnedThread(ctx, args.threadId, owner, {
      type: "ANALYSIS_READY",
      at: Date.now(),
      analysis: args.analysis as OutboundReplyAnalysis,
    });
  },
});

export const scheduleFollowUp = action({
  args: { threadId: v.id("outboundThreads"), dueAt: v.number() },
  returns: outboundThreadValidator,
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    return await transitionOwnedThread(ctx, args.threadId, owner, {
      type: "SCHEDULE_FOLLOW_UP",
      at: Date.now(),
      dueAt: args.dueAt,
    });
  },
});

export const createContactResolution = action({
  args: {
    outboundThreadId: v.optional(v.id("outboundThreads")),
    domain: v.string(),
    candidateEmail: v.string(),
    contactName: v.string(),
    publicationUrl: v.string(),
  },
  returns: contactResolutionValidator,
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    if (args.outboundThreadId) {
      const thread = await ctx.runQuery(internal.outbound.getOwnedThread, {
        threadId: args.outboundThreadId,
        owner,
      });
      if (!thread) throw new ConvexError("Outbound thread not found");
    }
    const now = Date.now();
    const context: ContactResolutionContext = {
      owner,
      domain: args.domain,
      candidateEmail: args.candidateEmail,
      contactName: args.contactName,
      publicationUrl: args.publicationUrl,
      resolvedEmail: null,
      verificationSource: null,
      confidence: null,
      reason: null,
      attempt: 0,
      checkedAt: null,
      error: null,
      startedAt: now,
      updatedAt: now,
    };
    const resolutionId = await ctx.runMutation(internal.outbound.createContactResolutionRecord, {
      owner,
      outboundThreadId: args.outboundThreadId,
      context,
    });
    return {
      resolutionId,
      owner,
      outboundThreadId: args.outboundThreadId,
      state: "idle" as const,
      context,
      createdAt: now,
      updatedAt: now,
    };
  },
});

export const transitionContactResolution = action({
  args: { resolutionId: v.id("contactResolutions"), event: contactResolutionEventValidator },
  returns: contactResolutionValidator,
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    assertContactEvent(args.event);
    const row = (await ctx.runQuery(internal.outbound.getOwnedContactResolution, {
      resolutionId: args.resolutionId,
      owner,
    })) as ContactResolutionRow | null;
    if (!row) throw new ConvexError("Contact resolution not found");
    const actor = contactResolutionActor(row);
    actor.start();
    actor.send(args.event);
    const snapshot = actor.getSnapshot();
    const context = snapshot.context;
    await ctx.runMutation(internal.outbound.saveContactResolution, {
      resolutionId: row._id,
      owner,
      state: snapshot.value as ContactResolutionState,
      context,
    });
    return contactResolutionView({
      ...row,
      state: snapshot.value as ContactResolutionState,
      context,
      updatedAt: context.updatedAt,
    });
  },
});

export const listContactResolutions = query({
  args: { state: v.optional(v.string()) },
  returns: v.array(contactResolutionValidator),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const rows = await ctx.db.query("contactResolutions").collect();
    return rows
      .filter((row) => row.owner === owner && (!args.state || row.state === args.state))
      .map((row) => contactResolutionView(row as ContactResolutionRow));
  },
});

export const getContactResolution = query({
  args: { resolutionId: v.id("contactResolutions") },
  returns: v.union(contactResolutionValidator, v.null()),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const row = (await ctx.db.get(args.resolutionId)) as ContactResolutionRow | null;
    if (!row || row.owner !== owner) return null;
    return contactResolutionView(row);
  },
});

export const createOutboundThread = action({
  args: {
    campaignId: v.id("outboundCampaigns"),
    prospect: outboundProspectValidator,
    brand: outboundBrandValidator,
  },
  returns: outboundThreadValidator,
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const campaign = await ctx.runQuery(internal.outbound.getOwnedCampaign, {
      campaignId: args.campaignId,
      owner,
    });
    if (!campaign) throw new ConvexError("Campaign not found");
    const now = Date.now();
    const context: OutboundThreadContext = {
      owner,
      campaignId: args.campaignId,
      prospect: args.prospect as OutboundProspect,
      brand: args.brand as OutboundBrandContext,
      goal: "guest_post",
      draft: null,
      analysis: null,
      agentThreadId: null,
      agentMailThreadId: null,
      agentMailInboxId: null,
      agentMailMessageId: null,
      idempotencyKey: null,
      labels: ["outbound", "guest-post", "drafting"],
      attempt: 0,
      nextFollowUpAt: null,
      error: null,
      createdAt: now,
      updatedAt: now,
    };
    const id = await ctx.runMutation(internal.outbound.createThread, {
      owner,
      campaignId: args.campaignId,
      context,
    });
    return {
      threadId: id,
      owner,
      campaignId: args.campaignId,
      state: "drafting" as const,
      context,
      labels: context.labels,
      createdAt: now,
      updatedAt: now,
    };
  },
});
