import { ConvexError } from "convex/values";
import { query, mutation, action, internalMutation, internalQuery, internalAction } from "../_generated/server.js";

export { query, mutation, action, internalMutation, internalQuery, internalAction };

export async function requireOwner(ctx: {
  auth: { getUserIdentity: () => Promise<{ tokenIdentifier: string } | null> };
}): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ConvexError("Authentication required");
  return identity.tokenIdentifier;
}
