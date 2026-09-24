# Convex Components Directory

This directory contains complete documentation, API references, architecture guides, and schema definitions for the Convex components installed and active in the **Rank** project.

---

## Active Components in Rank

| Component | Package | Version | Mount Point | Documentation | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Agent** | `@convex-dev/agent` | `^0.7.3` | `components.agent` | [agent/README.md](agent/README.md) | Autonomous AI agent workflows, persistent chat threads, tool execution, and websocket streaming deltas. |
| **AgentMail** | `@agentmail/convex` | `^0.1.0` | `components.agentmail` | [agentmail/README.md](agentmail/README.md) | Stateful email inboxes, thread persistence, reactive inbound webhooks, and durable outbound delivery. |

---

## Architecture Overview

Convex components execute inside isolated sandboxes within the Convex deployment. Each component owns its schema and tables, protecting application tables from naming collisions and migration conflicts.

```
Convex App (rank)
│
├── convex.config.ts (app definition & component mounting)
│   ├── app.use(agent)
│   └── app.use(agentmail)
│
├── _generated/api.ts (exposes components.agent, components.agentmail)
│
├── components/agent/
│   ├── Schema: threads, messages
│   └── API: thread creation, streaming, tool invocation
│
└── components/agentmail/
    ├── Schema: inboxes, inboundMessages, outboundMessages, events
    └── API: sendMessage, listInboundMessages, handleWebhook
```

---

## Configuration & Setup

Both components are registered in `convex/convex.config.ts`:

```typescript
import { defineApp } from "convex/server";
import agent from "@convex-dev/agent/convex.config";
import agentmail from "@agentmail/convex/convex.config";

const app = defineApp();

app.use(agent);
app.use(agentmail);

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
