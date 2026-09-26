import { v } from "convex/values";
import { components } from "./_generated/api.js";
import { Telnyx } from "@listeningkit/telnyx/client";
import { action, requireOwner } from "./lib/server.js";

const telnyx = new Telnyx(components.telnyx);

/**
 * Send an SMS as the signed-in Rank owner.
 *
 * `from` is optional: the component falls back to its own `TELNYX_FROM_NUMBER`
 * env, so the sender number is configured in exactly one place.
 */
export const sendSms = action({
  args: {
    to: v.string(),
    text: v.string(),
    from: v.optional(v.string()),
    webhookUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx);
    return telnyx.sendSms(ctx, { owner, ...args });
  },
});
