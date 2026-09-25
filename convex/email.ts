import { createActor } from "xstate";
import { query, mutation, action, internalMutation } from "./_generated/server.js";
import { components, internal } from "./_generated/api.js";
import { AgentMail } from "@agentmail/convex";
import { ConvexError, v, type GenericId } from "convex/values";
import { outboundThreadMachine, type OutboundThreadContext, type OutboundThreadState } from "../lib/xstate/outbound/index.js";
import { requireOwner } from "./lib/server.js";

const agentmail = new AgentMail(components.agentmail, {
  onEvent: internal.email?.handleAgentMailEvent,
  onMessageReceived: internal.email?.handleIncomingEmail,
});

export const listThread = query({
  args: { threadId: v.string() },
  handler: async (ctx, { threadId }) => {
    return ctx.runQuery(components.agentmail.lib.listInboundMessages, { threadId });
  },
});

export const listInboxMessages = query({
  args: { inboxId: v.string() },
  handler: async (ctx, { inboxId }) => {
    return ctx.runQuery(components.agentmail.lib.listInboundMessages, { inboxId });
  },
});

export const getSendStatus = query({
  args: { outboundId: v.string() },
  handler: async (ctx, { outboundId }) => {
    return await agentmail.status(ctx as any, outboundId as never);
  },
});

export const provisionAgentMailInbox = action({
  args: {
    localPart: v.string(),
    domain: v.string(),
    displayName: v.optional(v.string()),
  },
  returns: v.object({
    agentMailInboxId: v.string(),
    email: v.string(),
    displayName: v.optional(v.string()),
    clientId: v.string(),
  }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    const localPart = args.localPart.trim().toLowerCase();
    const domain = args.domain.trim().toLowerCase();
    if (!/^[a-z0-9._-]+$/.test(localPart) || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) {
      throw new ConvexError("Invalid inbox address");
    }
    const clientId = `rank:${owner}:${localPart}@${domain}`;
    const inbox = (await agentmail.createInbox(ctx as any, {
      username: localPart,
      domain,
      displayName: args.displayName,
      clientId,
    })) as { inbox_id?: string; email?: string; display_name?: string; client_id?: string };
    if (!inbox.inbox_id || !inbox.email) throw new ConvexError("AgentMail did not return an inbox");
    return {
      agentMailInboxId: inbox.inbox_id,
      email: inbox.email,
      displayName: inbox.display_name,
      clientId: inbox.client_id ?? clientId,
    };
  },
});

export const sendRankNotification = mutation({
  args: {
    inboxId: v.string(),
    to: v.string(),
    subject: v.string(),
    text: v.string(),
    labels: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await agentmail.sendMessage(ctx as any, args.inboxId, {
      to: args.to,
      subject: args.subject,
      text: args.text,
      labels: args.labels ?? ["rank-notification"],
    });
  },
});

const outboundDeliveryValidator = v.object({
  deliveryId: v.id("outboundDeliveries"),
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
  duplicate: v.boolean(),
});

type OutboundThreadRow = {
  _id: GenericId<"outboundThreads">;
  owner: string;
  state: OutboundThreadState;
  context: OutboundThreadContext;
  labels: string[];
  createdAt: number;
  updatedAt: number;
};

type OutboundThreadActor = {
  start: () => unknown;
  send: (
    event:
      | { type: "SEND"; at: number; idempotencyKey: string }
      | { type: "SENT"; at: number; messageId: string; threadId: string }
      | { type: "DELIVERY_BOUNCED"; at: number; reason: string }
      | { type: "FAIL"; at: number; error: string },
  ) => void;
  getSnapshot: () => { value: unknown; context: OutboundThreadContext };
};

function outboundActor(row: OutboundThreadRow): OutboundThreadActor {
  const snapshot = outboundThreadMachine.resolveState({ value: row.state, context: row.context });
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

async function saveOutboundActor(
  ctx: { db: { patch: (id: GenericId<"outboundThreads">, patch: Record<string, unknown>) => Promise<unknown> } },
  row: OutboundThreadRow,
  actor: OutboundThreadActor,
): Promise<void> {
  const snapshot = actor.getSnapshot();
  await ctx.db.patch(row._id, {
    state: snapshot.value as OutboundThreadState,
    context: snapshot.context,
    labels: snapshot.context.labels,
    nextFollowUpAt: snapshot.context.nextFollowUpAt ?? undefined,
    updatedAt: snapshot.context.updatedAt,
  });
}

export const queueOutboundMessage = mutation({
  args: {
    threadId: v.id("outboundThreads"),
    inboxId: v.string(),
    to: v.string(),
    subject: v.string(),
    text: v.string(),
    labels: v.optional(v.array(v.string())),
    idempotencyKey: v.string(),
  },
  returns: outboundDeliveryValidator,
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    if (!args.idempotencyKey.trim()) throw new ConvexError("idempotencyKey is required");
    const row = (await ctx.db.get(args.threadId)) as OutboundThreadRow | null;
    if (!row || row.owner !== owner) throw new ConvexError("Outbound thread not found");
    if (row.state !== "ready_to_send" && row.state !== "follow_up_due") {
      throw new ConvexError(`Cannot send from outbound state: ${row.state}`);
    }

    const existing = (await ctx.db.query("outboundDeliveries").collect()).find(
      (delivery) => delivery.owner === owner && delivery.idempotencyKey === args.idempotencyKey,
    ) as { _id: GenericId<"outboundDeliveries">; threadId: GenericId<"outboundThreads">; idempotencyKey: string; provider: string; status: "reserved" | "sent" | "failed" | "bounced"; providerMessageId?: string } | undefined;
    if (existing) {
      return {
        deliveryId: existing._id,
        threadId: existing.threadId,
        idempotencyKey: existing.idempotencyKey,
        provider: existing.provider,
        status: existing.status,
        providerMessageId: existing.providerMessageId,
        duplicate: true,
      };
    }

    const now = Date.now();
    const deliveryId = await ctx.db.insert("outboundDeliveries", {
      owner,
      threadId: args.threadId,
      idempotencyKey: args.idempotencyKey,
      provider: "agentmail",
      status: "reserved",
      attemptedAt: now,
    });

    const actor = outboundActor(row);
    actor.start();
    actor.send({ type: "SEND", at: now, idempotencyKey: args.idempotencyKey });
    await saveOutboundActor(ctx, row, actor);

    try {
      const outboundId = await agentmail.sendMessage(ctx as any, args.inboxId, {
        to: args.to,
        subject: args.subject,
        text: args.text,
        labels: Array.from(new Set([
          ...(args.labels ?? []),
          "outbound",
          "guest-post",
          `campaign-id:${row.context.campaignId}`,
          `outbound-thread:${args.threadId}`,
        ])),
      });
      await ctx.db.patch(deliveryId, {
        providerMessageId: String(outboundId),
      });
      return {
        deliveryId,
        threadId: args.threadId,
        idempotencyKey: args.idempotencyKey,
        provider: "agentmail",
        status: "reserved" as const,
        providerMessageId: String(outboundId),
        duplicate: false,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "AgentMail send failed";
      await ctx.db.patch(deliveryId, { status: "failed" });
      const currentRow = (await ctx.db.get(args.threadId)) as OutboundThreadRow | null;
      if (currentRow) {
        const failedActor = outboundActor(currentRow);
        failedActor.start();
        failedActor.send({ type: "FAIL", at: Date.now(), error: message.slice(0, 500) });
        await saveOutboundActor(ctx, currentRow, failedActor);
      }
      throw new ConvexError(message.slice(0, 500));
    }
  },
});

export const recordOutboundDelivery = internalMutation({
  args: {
    owner: v.string(),
    deliveryId: v.id("outboundDeliveries"),
    status: v.union(v.literal("sent"), v.literal("failed"), v.literal("bounced")),
    providerMessageId: v.optional(v.string()),
    agentMailThreadId: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const delivery = (await ctx.db.get(args.deliveryId)) as {
      _id: GenericId<"outboundDeliveries">;
      owner: string;
      threadId: GenericId<"outboundThreads">;
      status: string;
    } | null;
    if (!delivery || delivery.owner !== args.owner) throw new ConvexError("Outbound delivery not found");
    const row = (await ctx.db.get(delivery.threadId)) as OutboundThreadRow | null;
    if (!row || row.owner !== args.owner) throw new ConvexError("Outbound thread not found");
    const actor = outboundActor(row);
    actor.start();
    if (args.status === "sent") {
      if (!args.providerMessageId || !args.agentMailThreadId) {
        throw new ConvexError("Sent delivery requires provider identifiers");
      }
      actor.send({
        type: "SENT",
        at: Date.now(),
        messageId: args.providerMessageId,
        threadId: args.agentMailThreadId,
      });
      await ctx.db.patch(args.deliveryId, {
        status: "sent",
        providerMessageId: args.providerMessageId,
        sentAt: Date.now(),
      });
    } else {
      if (args.status === "bounced") {
        actor.send({
          type: "DELIVERY_BOUNCED",
          at: Date.now(),
          reason: args.error ?? "Delivery bounced",
        });
      } else {
        actor.send({ type: "FAIL", at: Date.now(), error: args.error ?? `Delivery ${args.status}` });
      }
      await ctx.db.patch(args.deliveryId, { status: args.status });
    }
    await saveOutboundActor(ctx, row, actor);
    return null;
  },
});

export const handleAgentMailEvent = internalMutation({
  args: { event: v.any() },
  returns: v.object({ handled: v.boolean(), status: v.optional(v.string()) }),
  handler: async (ctx, args) => {
    const event = (args.event ?? {}) as {
      event_type?: string;
      domain?: { domain?: string; name?: string };
      message?: { thread_id?: string; message_id?: string; labels?: unknown; error_message?: string };
      delivery?: { thread_id?: string; message_id?: string; labels?: unknown; error_message?: string };
      bounce?: { thread_id?: string; message_id?: string; labels?: unknown; error_message?: string };
      thread?: { thread_id?: string; labels?: unknown };
    };
    const eventType = event.event_type ?? "";
    if (eventType === "domain.verified") {
      const domain = event.domain?.domain ?? event.domain?.name;
      if (domain) {
        const rows = (await ctx.db.query("outboundDomains").collect()).filter(
          (row) => row.domain === domain.toLowerCase(),
        );
        for (const row of rows) {
          await ctx.db.patch(row._id, { status: "verified", warmupScore: 1, updatedAt: Date.now() });
        }
      }
      return { handled: Boolean(domain), status: "verified" };
    }
    if (!["message.sent", "message.delivered", "message.bounced", "message.complained", "message.rejected"].includes(eventType)) {
      return { handled: false };
    }
    const payload = event.message ?? event.delivery ?? event.bounce ?? {};
    const labels = [
      ...(Array.isArray(payload.labels) ? payload.labels : []),
      ...(Array.isArray(event.thread?.labels) ? event.thread.labels : []),
    ].filter((label): label is string => typeof label === "string");
    const outboundThreadId = labels
      .find((label) => label.startsWith("outbound-thread:"))
      ?.slice("outbound-thread:".length);
    const agentMailThreadId = payload.thread_id ?? event.thread?.thread_id;
    const providerMessageId = payload.message_id;
    if ((!outboundThreadId || !/^[A-Za-z0-9]+$/.test(outboundThreadId)) && !agentMailThreadId) {
      return { handled: false };
    }
    if (!providerMessageId) return { handled: false };
    const thread = outboundThreadId && /^[A-Za-z0-9]+$/.test(outboundThreadId)
      ? ((await ctx.db.get(outboundThreadId as never)) as (OutboundThreadRow & { _id: GenericId<"outboundThreads"> }) | null)
      : ((await ctx.db.query("outboundThreads").collect()).find(
          (row) => row.context.agentMailThreadId === agentMailThreadId,
        ) as (OutboundThreadRow & { _id: GenericId<"outboundThreads"> }) | undefined) ?? null;
    if (!thread) return { handled: false };
    const delivery = (await ctx.db.query("outboundDeliveries").collect()).find(
      (item) => item.threadId === thread._id && item.status === "reserved",
    ) as { _id: GenericId<"outboundDeliveries"> } | undefined;
    if (!delivery) return { handled: false };
    const status = eventType === "message.bounced" ? "bounced" : eventType === "message.sent" || eventType === "message.delivered" ? "sent" : "failed";
    await ctx.runMutation(internal.email.recordOutboundDelivery, {
      owner: thread.owner,
      deliveryId: delivery._id,
      status,
      providerMessageId,
      agentMailThreadId,
      error: payload.error_message,
    });
    return { handled: true, status };
  },
});

export const handleIncomingEmail = internalMutation({
  args: { message: v.any(), thread: v.any(), eventId: v.string() },
  handler: async (ctx, args) => {
    const message = (args.message ?? {}) as { message_id?: string; thread_id?: string; labels?: unknown };
    const thread = (args.thread ?? {}) as { thread_id?: string; labels?: unknown };
    const labels = [
      ...(Array.isArray(message.labels) ? message.labels : []),
      ...(Array.isArray(thread.labels) ? thread.labels : []),
    ].filter((label): label is string => typeof label === "string");
    const outboundLabel = labels.find((label) => label.startsWith("outbound-thread:"));
    const agentMailThreadId = thread.thread_id ?? message.thread_id;
    const messageId = message.message_id;
    const outboundThreadId = outboundLabel?.slice("outbound-thread:".length);
    if (outboundThreadId && /^[A-Za-z0-9]+$/.test(outboundThreadId) && agentMailThreadId && messageId) {
      await ctx.runMutation(internal.outbound.recordInboundReply, {
        threadId: outboundThreadId,
        agentMailThreadId,
        messageId,
      });
    }
    return {
      received: true,
      eventId: args.eventId,
      threadId: agentMailThreadId,
      outboundThreadId: outboundThreadId ?? null,
    };
  },
});
