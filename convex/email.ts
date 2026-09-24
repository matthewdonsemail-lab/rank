import { query, mutation, internalMutation } from "./_generated/server.js";
import { components, internal } from "./_generated/api.js";
import { AgentMail } from "@agentmail/convex";
import { v } from "convex/values";

const agentmail = new AgentMail(components.agentmail, {
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

export const handleIncomingEmail = internalMutation({
  args: { message: v.any(), thread: v.any(), eventId: v.string() },
  handler: async (_ctx, args) => {
    // Triggers agentic ranking evaluation and receipt persistence
    return {
      received: true,
      eventId: args.eventId,
      threadId: args.thread?.thread_id ?? args.message?.thread_id,
    };
  },
});
