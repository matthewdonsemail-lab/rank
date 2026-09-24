import { Treg } from "@listeningkit/treg";
import { components } from "./_generated/api.js";
import { action, query } from "./_generated/server.js";
import { v } from "convex/values";

export const tregClient = new Treg(components.treg);

/**
 * Host action to invoke developer tools catalogued on treg.to with
 * owner privacy hashing, reserve ceiling, and audit ledger tracking.
 */
export const callTool = action({
  args: {
    owner: v.string(),
    endpoint: v.string(),
    params: v.any(),
    maxCostUsd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await tregClient.call(ctx, {
      owner: args.owner,
      endpoint: args.endpoint,
      params: args.params,
      maxCostUsd: args.maxCostUsd ?? 0.05,
    });
  },
});

/**
 * Host query to read recent spend receipts for an owner from
 * the component's encapsulated calls ledger.
 */
export const getUsage = query({
  args: {
    owner: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await tregClient.getCalls(ctx, {
      owner: args.owner,
      limit: args.limit ?? 20,
    });
  },
});
