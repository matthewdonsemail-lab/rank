# AgentMail Convex Component (`@agentmail/convex`)

A Convex component that brings stateful email inboxes to AI agents. Messages sent and received are persisted as threads, complete with full bodies, labels, and delivery lifecycle tracking.

This component is mounted as the transport and inbound-message boundary for the outbound thread machine. Agent reasoning and AgentMail transport remain separate: `convex/agent.ts` creates reasoning sessions, while `convex/email.ts` queues transport messages and maps inbound AgentMail labels back to an outbound thread.

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

## Rank outbound boundary

- `convex/outbound.ts` stores user-owned sending domains, prefixed shared inboxes, their optional AgentMail provider inbox IDs, campaigns, persisted thread state, follow-up deadlines, and delivery idempotency keys.
- `provisionAgentMailInbox` creates a provider inbox with a deterministic `clientId`; persist the returned provider inbox ID on the Rank pool record.
- `queueOutboundMessage` requires an approved `ready_to_send` or `follow_up_due` thread and adds an `outbound-thread:<id>` label before calling the component's durable send queue.
- The AgentMail component owns transport lifecycle; the XState machine owns approval, reply analysis, deal path, and follow-up state.
- `handleIncomingEmail` reads the outbound label and records `REPLY_RECEIVED` against the matching thread instead of creating an unrelated conversational state.
- `handleAgentMailEvent` maps sent/delivered/bounced/complained/rejected events to the Rank delivery record and advances or fails the outbound thread; `domain.verified` marks the matching Rank domain verified.
- The Agent component's `startOutboundReasoning` action creates a separate reasoning thread. A future Nebius token-factory adapter can replace `mockModel` without changing AgentMail transport identifiers.

## Subsystem Documentation

- **[Architecture & Sandboxing](architecture.md):** Isolated tables (`inboxes`, `inboundMessages`, `outboundMessages`, `events`).
- **[Webhooks & Inbound Routing](webhooks.md):** Cryptographic Svix signature verification and event dispatching.
- **[Durable Sending & Workpools](sending.md):** Workpool execution, retry policies, and delivery status tracking.
