import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server.js";
import { components, internal } from "./_generated/api.js";
import { AgentMail } from "@agentmail/convex";
import { Telnyx } from "@listeningkit/telnyx/client";
import capabilities from "../config/capabilities.json" with { type: "json" };
import envVars from "../config/env-vars.json" with { type: "json" };

const agentmail = new AgentMail(components.agentmail);
const telnyx = new Telnyx(components.telnyx);
const http = httpRouter();

/**
 * Read-only Rank routes.
 *
 * These serve the same registry and environment manifest that the CLI and the
 * MCP server read, so a capability cannot be advertised on one surface and
 * missing on another. They are read-only by design: anything that changes state
 * stays behind an authenticated Convex function, not a public route.
 *
 * HTTP actions cannot read `process.env`, so the status route asks a query.
 */
const readOnlyRoutes: Array<{ path: string; build: (ctx: any) => unknown }> = [
  {
    path: "/rank/status",
    build: async (ctx) => ({
      service: "rank",
      capabilities: capabilities.capabilities.length,
      environment: await ctx.runQuery(internal.rank.envStatus, {}),
    }),
  },
  { path: "/rank/environment", build: () => envVars },
  { path: "/rank/capabilities", build: () => capabilities },
];

for (const route of readOnlyRoutes) {
  http.route({
    path: route.path,
    method: "GET",
    handler: httpAction(async (ctx) => Response.json(await route.build(ctx))),
  });
}

http.route({
  path: "/agentmail/webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => agentmail.handleWebhook(ctx as any, req)),
});

http.route({
  path: "/telnyx/webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const rawBody = await req.text();
    const event = await telnyx.verifyWebhook(ctx, {
      rawBody,
      headers: Object.fromEntries(req.headers.entries()),
    });
    if (!event) return new Response("invalid Telnyx signature", { status: 401 });
    return Response.json({ ok: true, eventId: event.id, eventType: event.event_type });
  }),
});

export default http;
