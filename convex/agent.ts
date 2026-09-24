import { Agent } from "@convex-dev/agent";
import { components } from "./_generated/api.js";
import { action } from "./_generated/server.js";
import { v } from "convex/values";

export const rankAssistant = new Agent(components.agent, {
  name: "Rank Assistant",
  instructions: "You are the autonomous ranking, reranking, and model decision router for Rank by ListeningKit.",
});

export const createAgentSession = action({
  args: { prompt: v.string() },
  handler: async (ctx, { prompt }) => {
    const { threadId, thread } = await (rankAssistant as any).createThread(ctx);
    const result = await thread.generateText({ prompt });
    return { threadId, text: result.text };
  },
});
