# AgentMail Component Architecture

Technical specification of `@agentmail/convex` data schemas, isolation sandboxes, and lifecycle states.

---

## Sandbox Database Schema

The component owns four sandboxed tables inside the Convex cluster:

```
Convex Sandbox (@agentmail/convex)
│
├── inboxes
│   ├── inboxId (string)
│   ├── address (string)
│   └── displayName (string)
│
├── inboundMessages
│   ├── messageId (string)
│   ├── inboxId (string)
│   ├── threadId (string)
│   ├── from (string)
│   ├── to (array)
│   ├── subject (string)
│   ├── text (string)
│   ├── html (string)
│   ├── receivedAt (number)
│   └── labels (array of string)
│
├── outboundMessages
│   ├── outboundId (Id)
│   ├── inboxId (string)
│   ├── to (string)
│   ├── subject (string)
│   ├── text (string)
│   ├── status ("pending" | "sent" | "delivered" | "bounced" | "failed")
│   ├── attempts (number)
│   └── error (optional string)
│
└── events
    ├── eventId (string)
    ├── eventType (string)
    ├── payload (any)
    └── processedAt (number)
```

---

## Inbound Email Lifecycle

```mermaid
sequenceDiagram
  autonumber
  actor Sender as External Email Client
  participant AM as AgentMail Servers
  participant HTTP as Convex HTTP (convex/http.ts)
  participant Comp as @agentmail/convex
  participant App as Application Handler (convex/email.ts)
  participant UI as Connected Client (Web / MCP)

  Sender->>AM: Send email to agent@rank.listeningkit.com
  AM->>HTTP: POST /agentmail/webhook (signed with Svix)
  HTTP->>Comp: agentmail.handleWebhook(ctx, req)
  Comp->>Comp: Verify Svix signature & check eventId deduplication
  Comp->>Comp: Persist inboundMessage to sandbox table
  Comp->)App: Dispatch onMessageReceived(message, thread)
  Comp-->>HTTP: Return 200 OK
   App->>App: Record REPLY_RECEIVED for the matching outbound thread
  UI-->>Comp: Live WebSocket query updates thread view instantly
```
