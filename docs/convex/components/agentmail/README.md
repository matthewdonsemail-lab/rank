# AgentMail Convex Component (`@agentmail/convex`)

A Convex component that brings stateful email inboxes to AI agents. Messages sent and received are persisted as threads, complete with full bodies, labels, and delivery lifecycle tracking.

---

## Overview

Traditional transactional email providers drop incoming messages into webhooks without maintaining state. In contrast, `@agentmail/convex` maintains an inbox state machine directly inside Convex:

- **Stateful Thread Store:** Every incoming email updates the corresponding thread in your Convex database.
- **Reactive UI:** Components call `useQuery` on threads and inboxes; new emails appear immediately via WebSockets without polling.
- **Durable Sending:** Outbound emails are enqueued transactionally and executed through a bounded-retry workpool.
- **Svix Webhook Ingestion:** Inbound webhooks are cryptographically validated and deduplicated by event ID.

---

## Installation & Setup

Install via pnpm or npm:

```bash
pnpm add @agentmail/convex @convex-dev/workpool svix
```

Register the component in `convex/convex.config.ts`:

```typescript
import { defineApp } from "convex/server";
import agentmail from "@agentmail/convex/convex.config";

const app = defineApp();
app.use(agentmail);

export default app;
```

Configure deployment environment variables:

```bash
npx convex env set AGENTMAIL_API_KEY your_api_key
npx convex env set AGENTMAIL_WEBHOOK_SECRET whsec_your_secret
```

---

## Core API Reference

Initialize the client with `components.agentmail`:

```typescript
import { AgentMail } from "@agentmail/convex";
import { components, internal } from "./_generated/api.js";

export const agentmail = new AgentMail(components.agentmail, {
  onMessageReceived: internal.email.handleIncomingEmail,
});
```

### Queries & Mutations

```typescript
// Query inbound messages for a thread
const messages = await ctx.runQuery(components.agentmail.lib.listInboundMessages, {
  threadId: "th_123",
});

// Enqueue durable send
const outboundId = await agentmail.sendMessage(ctx, "inbox_abc", {
  to: "user@example.com",
  subject: "Rank Evaluation Summary",
  text: "Your candidate rankings are complete.",
  labels: ["notification", "rank-completed"],
});
```

---

## Subsystem Documentation

- **[Architecture & Sandboxing](architecture.md):** Isolated tables (`inboxes`, `inboundMessages`, `outboundMessages`, `events`).
- **[Webhooks & Inbound Routing](webhooks.md):** Cryptographic Svix signature verification and event dispatching.
- **[Durable Sending & Workpools](sending.md):** Workpool execution, retry policies, and delivery status tracking.
