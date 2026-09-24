# AgentMail Webhooks & Inbound Routing

Configuring HTTP endpoints and signature verification for inbound emails.

---

## Webhook Route Mounting

Mount the webhook handler in `convex/http.ts`:

```typescript
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
```

---

## Svix Cryptographic Verification

AgentMail uses Svix to sign webhook payloads. The component automatically:
1. Validates the `svix-id`, `svix-timestamp`, and `svix-signature` headers against `AGENTMAIL_WEBHOOK_SECRET`.
2. Rejects expired timestamps to prevent replay attacks.
3. Performs idempotent deduplication: repeated events with identical `event_id` are ignored and immediately return HTTP 200.

---

## Event Hooks

Configure custom reactions to inbound emails using the `onMessageReceived` hook:

```typescript
// convex/email.ts
import { internalMutation } from "./_generated/server.js";
import { v } from "convex/values";

export const handleIncomingEmail = internalMutation({
  args: {
    message: v.any(),
    thread: v.any(),
    eventId: v.string(),
  },
  handler: async (ctx, { message, thread, eventId }) => {
    // Process message with Rank LLM or reranking pipelines
    console.log("Inbound email received:", message.subject);
  },
});
```
