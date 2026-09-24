import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server.js";
import { components } from "./_generated/api.js";
import { AgentMail } from "@agentmail/convex";

const agentmail = new AgentMail(components.agentmail);
const http = httpRouter();

http.route({
  path: "/agentmail/webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => agentmail.handleWebhook(ctx as any, req)),
});

export default http;
