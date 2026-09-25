# Convex Components Directory

This directory contains complete documentation, API references, architecture guides, and schema definitions for the Convex components installed and active in the **Rank** project.

---

## Active Components in Rank

| Component | Package | Version | Mount Point | Documentation | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Agent** | `@convex-dev/agent` | `^0.7.3` | `components.agent` | [agent/README.md](agent/README.md) | Autonomous AI agent workflows, persistent chat threads, tool execution, and websocket streaming deltas. |
| **AgentMail** | `@agentmail/convex` | `^0.1.0` | `components.agentmail` | [agentmail/README.md](agentmail/README.md) | Stateful email inboxes, thread persistence, reactive inbound webhooks, and durable outbound delivery. |
| **Firecrawl** | `@firecrawl/firecrawl-convex` | `0.1.1` | `components.firecrawl` | [Firecrawl crawl domain](../../../lib/firecrawl/crawl/README.md) | Scrape, map, search, and durable reactive website crawls. |
| **Treg** | `@listeningkit/treg` | `^0.1.3` | `components.treg` | [treg/README.md](treg/README.md) | Server-side external tool calls, credential routing, and spend receipts. |

---

## Architecture Overview

Convex components execute inside isolated sandboxes within the Convex deployment. Each component owns its schema and tables, protecting application tables from naming collisions and migration conflicts.

```
Convex App (rank)
│
├── convex.config.ts (app definition & component mounting)
│   ├── app.use(agent)
│   ├── app.use(agentmail)
│   ├── app.use(firecrawl)
│   └── app.use(treg)
│
├── _generated/api.ts (exposes mounted component APIs)
│
├── components/agent/
│   ├── Schema: threads, messages
│   └── API: thread creation, streaming, tool invocation
│
├── components/agentmail/
│   ├── Schema: inboxes, inboundMessages, outboundMessages, events
│   └── API: sendMessage, listInboundMessages, handleWebhook
│
├── components/firecrawl/
│   ├── Schema: crawls, pages
│   └── API: scrape, map, search, crawl progress, pages, cancellation
│
└── components/treg/
    ├── Schema: calls ledger
    └── API: authenticated external tool routing and spend receipts
```

---

## Configuration & Setup

Components are registered in `convex/convex.config.ts`. Firecrawl receives the app-owned API key through typed component environment values and mounts its webhook route under `/firecrawl/`:

```typescript
import { defineApp } from "convex/server";
import { v } from "convex/values";
import agent from "@convex-dev/agent/convex.config";
import agentmail from "@agentmail/convex/convex.config";
import firecrawl from "@firecrawl/firecrawl-convex/convex.config";
import treg from "@listeningkit/treg/convex.config";

const app = defineApp({
  env: {
    FIRECRAWL_API_KEY: v.string(),
    FIRECRAWL_API_URL: v.optional(v.string()),
    FIRECRAWL_WEBHOOK_SECRET: v.optional(v.string()),
  },
});

app.use(agent);
app.use(agentmail);
app.use(firecrawl, {
  httpPrefix: "/firecrawl/",
  env: {
    FIRECRAWL_API_KEY: app.env.FIRECRAWL_API_KEY,
    FIRECRAWL_API_URL: app.env.FIRECRAWL_API_URL,
    FIRECRAWL_WEBHOOK_SECRET: app.env.FIRECRAWL_WEBHOOK_SECRET,
  },
});
app.use(treg);

export default app;
```

---

## Documentation Subsystems

- **[Agent Component Reference](agent/README.md)**
  - [Architecture & Sandboxing](agent/architecture.md)
  - [Tools & Model Calling](agent/tools.md)
  - [Threads & Conversation Context](agent/threads.md)
- **[AgentMail Component Reference](agentmail/README.md)**
  - [Architecture & Schemas](agentmail/architecture.md)
  - [Webhooks & Inbound Routing](agentmail/webhooks.md)
  - [Durable Sending & Lifecycle](agentmail/sending.md)
- **[Firecrawl Domain Guide](../../../lib/firecrawl/crawl/README.md)**
  - Application boundary, environment, durable crawls, and operational rules
- **[Treg Component Reference](treg/README.md)**
  - [Tool Execution](treg/tools.md)
  - [Spend Ledger](treg/spend-ledger.md)
