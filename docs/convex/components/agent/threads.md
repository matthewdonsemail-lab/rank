# Agent Threads & Conversation State

Managing thread lifecycles, message retrieval, and reactive UI subscriptions with `@convex-dev/agent`.

---

## Thread Lifecycle

Threads represent long-lived conversations between human users, client applications, or background workers and an agent.

### 1. Creating a Thread

```typescript
const { threadId, thread } = await agent.createThread(ctx, {
  title: "Inbound Support Triage",
});
```

### 2. Continuing an Existing Thread

```typescript
const { thread } = await agent.continueThread(ctx, { threadId });
const response = await thread.generateText({
  prompt: "What were the top 3 candidates from our previous evaluation?",
});
```

---

## Reactive UI Subscriptions

Client applications subscribe to threads reactively using Convex's WebSocket wire protocol:

```typescript
// Client React Component
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api.js";

export function ConversationView({ threadId }: { threadId: string }) {
  const messages = useQuery(api.agent.getThreadMessages, { threadId });

  if (!messages) return <div>Loading thread history...</div>;

  return (
    <ul>
      {messages.map((msg) => (
        <li key={msg._id}>
          <strong>{msg.role}:</strong> {msg.content}
        </li>
      ))}
    </ul>
  );
}
```

---

## Context Window Management

The component automatically manages LLM context budgets:
- **Sliding Window:** Older messages are summarized or truncated to avoid exceeding token limits.
- **Hybrid Vector Search:** When enabled, relevant historical turns are retrieved semantically rather than packing full raw transcripts.
