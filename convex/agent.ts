import { Agent, mockModel } from "@convex-dev/agent";
import { buildOutboundReplyPrompt } from "../lib/xstate/outbound/index.js";
import { components } from "./_generated/api.js";
import { action } from "./_generated/server.js";
import { v } from "convex/values";

export const rankAssistant = new Agent(components.agent, {
  name: "Rank Assistant",
  languageModel: mockModel({ modelId: "rank-placeholder" }),
  instructions: "You are the ranking, reranking, and model decision router for Rank by ListeningKit.",
});

export const createAgentSession = action({
  args: { prompt: v.string() },
  handler: async (ctx, { prompt }) => {
    const { threadId, thread } = await (rankAssistant as any).createThread(ctx);
    const result = await thread.generateText({ prompt });
    return { threadId, text: result.text };
  },
});

export const startOutboundReasoning = action({
  args: {
    outboundThreadId: v.string(),
    brand: v.object({
      name: v.string(),
      voice: v.string(),
      guestPostAngle: v.string(),
    }),
    prospect: v.object({
      name: v.string(),
      email: v.string(),
      url: v.string(),
      publication: v.string(),
      fitRationale: v.string(),
    }),
    replyText: v.string(),
    confidence: v.number(),
    dealLikelihood: v.number(),
  },
  returns: v.object({
    outboundThreadId: v.string(),
    agentThreadId: v.string(),
    text: v.string(),
  }),
  handler: async (ctx, args) => {
    const { threadId, thread } = await (rankAssistant as any).createThread(ctx);
    const result = await thread.generateText({
      prompt: buildOutboundReplyPrompt({
        goal: "guest_post",
        brand: args.brand,
        prospect: args.prospect,
        replyText: args.replyText,
        confidence: args.confidence,
        dealLikelihood: args.dealLikelihood,
      }),
    });
    return { outboundThreadId: args.outboundThreadId, agentThreadId: threadId, text: result.text };
  },
});
