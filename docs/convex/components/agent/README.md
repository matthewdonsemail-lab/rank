# Convex Agent Component (`@convex-dev/agent`)

The Convex Agent Component provides building blocks for autonomous AI agents on Convex with persistent conversation history, tool calling, and streaming over WebSockets.

---

## Overview

The Agent component decouples long-running AI agent workflows from the user interface while preserving live, reactive updates on every connected client.

### Key Capabilities

- **Persistent Threads:** Multi-turn conversation history stored directly in Convex tables (`threads`, `messages`).
- **Tool Calling:** Agents can execute synchronous and asynchronous tools implemented as Convex functions.
- **WebSocket Streaming:** Text and object generation streams delta updates over WebSockets without HTTP chunking overhead.
- **Context Injection:** Automatic retrieval of relevant thread history and optional vector search across prior sessions.
- **Usage & Rate Gating:** Built-in usage attribution per model and rate limiter integration.

---

## Installation & App Registration

Install the package via npm or pnpm:

```bash
pnpm add @convex-dev/agent
```

Mount the component in `convex/convex.config.ts`:

```typescript
import { defineApp } from "convex/server";
import agent from "@convex-dev/agent/convex.config";

const app = defineApp();
app.use(agent);

export default app;
```

---

## Basic Usage

Initialize an Agent instance using `components.agent` in `convex/agent.ts`:

```typescript
import { Agent } from "@convex-dev/agent";
import { components } from "./_generated/api.js";
import { action } from "./_generated/server.js";
import { v } from "convex/values";

export const rankAgent = new Agent(components.agent, {
  name: "Rank Orchestrator",
  instructions: "You evaluate queries and route candidate passages to Nebius cross-encoders.",
});

export const runAgentTurn = action({
  args: { prompt: v.string() },
  handler: async (ctx, { prompt }) => {
    const { threadId, thread } = await rankAgent.createThread(ctx);
    const result = await thread.generateText({ prompt });
    return { threadId, text: result.text };
  },
});
```

---

## Subsystem Documentation

- **[Architecture & Sandboxing](architecture.md):** Sandboxed data tables, transactions, and execution boundaries.
- **[Tool Calling & Model Integration](tools.md):** Registering Nebius rerankers and TypeSafe evaluators as callable tools.
- **[Threads & Context Memory](threads.md):** Managing thread state, search, and message lifecycles.
