# Rank Relational Mock Architecture

The `mock/` directory provides an in-memory, relational data store and standalone mock API server for the Rank engine. It allows full-stack UI development, agent workflows, and integration testing without creating tables, columns, or rows in live Convex Cloud.

---

## Key Principles

1. **Zero Live Convex Dependency:** All data operations are handled in-memory. No test or mock rows are ever written to production or development Convex deployments.
2. **One Piece of Data Per Route:** Every API endpoint has its own dedicated data fixture module inside `mock/data/`, maintaining clean separation between routing and fixture payloads.
3. **Full Referential Integrity:** Relationships link Clerk users, organizations, workspaces, API keys, ranking sessions, candidates, receipts, benchmark evaluations, agent threads, and AgentMail inboxes.
4. **Zero-Dependency Mock Server:** Built on Node's native `node:http` module, the mock API server starts instantly and provides full REST endpoints with CORS and JSON parsing.
5. **Drop-in Convex Client Bridge:** `mock/client.ts` implements Convex query, mutation, and action interfaces, allowing code to switch between mock and live backends without refactoring.

---

## Directory Layout

```text
mock/
├── README.md                          # Architecture guide and route reference
├── schema.ts                          # Relational TypeScript interfaces
├── store.ts                           # In-memory relational store with referential queries
├── server.ts                          # Native Node HTTP mock API server
├── client.ts                          # Drop-in mock client emulating Convex query/mutation APIs
└── data/                              # "One piece of data per route" fixtures
    ├── auth-user.ts                   # Route: GET /api/auth/user
    ├── auth-organization.ts           # Route: GET /api/auth/organization
    ├── workspaces.ts                  # Route: GET /api/workspaces
    ├── workspace-detail.ts            # Route: GET /api/workspaces/:slug
    ├── api-keys.ts                    # Route: GET /api/keys
    ├── rank-sessions.ts               # Route: GET /api/v1/sessions
    ├── rank-session-detail.ts         # Route: GET /api/v1/sessions/:id
    ├── candidates.ts                  # Route: GET /api/v1/sessions/:id/candidates
    ├── receipts.ts                    # Route: GET /api/v1/receipts
    ├── benchmark-runs.ts              # Route: GET /api/benchmarks
    ├── rank-inference.ts              # Route: POST /api/v1/rank (Cross-encoder mock)
    ├── agent-threads.ts               # Route: GET /api/agent/threads
    ├── agent-messages.ts              # Route: GET /api/agent/messages
    ├── agentmail-inboxes.ts           # Route: GET /api/agentmail/inboxes
    ├── agentmail-threads.ts           # Route: GET /api/agentmail/threads
    └── agentmail-messages.ts          # Route: GET /api/agentmail/messages
```

---

## Supported Routes & Fixtures

| Route | Method | Fixture Module | Description | Relational Parent |
|---|---|---|---|---|
| `/api/auth/user` | GET | `mock/data/auth-user.ts` | Authenticated Clerk user profile | Root identity |
| `/api/auth/organization` | GET | `mock/data/auth-organization.ts` | Clerk active organization & RBAC roles | Belongs to user |
| `/api/workspaces` | GET | `mock/data/workspaces.ts` | List workspaces for organization | Belongs to organization |
| `/api/workspaces/:slug` | GET | `mock/data/workspace-detail.ts` | Single workspace detail & aggregates | Filter by slug |
| `/api/keys` | GET | `mock/data/api-keys.ts` | Provisioned API keys with scopes | Belongs to workspace |
| `/api/v1/rank` | POST | `mock/data/rank-inference.ts` | Rerank candidates with Nebius BGE | Belongs to workspace |
| `/api/v1/sessions` | GET | `mock/data/rank-sessions.ts` | List past ranking sessions | Belongs to workspace |
| `/api/v1/sessions/:id` | GET | `mock/data/rank-session-detail.ts` | Specific session, candidates, & receipt | Filter by sessionId |
| `/api/v1/sessions/:id/candidates` | GET | `mock/data/candidates.ts` | Ranked candidate items with scores | Belongs to rankSession |
| `/api/v1/receipts` | GET | `mock/data/receipts.ts` | Inference token & cost attribution | Belongs to rankSession |
| `/api/benchmarks` | GET | `mock/data/benchmark-runs.ts` | Evaluation runs (NDCG@10, MRR) | Belongs to workspace |
| `/api/agent/threads` | GET | `mock/data/agent-threads.ts` | Convex agent persistent threads | Belongs to workspace |
| `/api/agent/messages` | GET | `mock/data/agent-messages.ts` | Convex agent multi-turn turns | Belongs to agentThread |
| `/api/agentmail/inboxes` | GET | `mock/data/agentmail-inboxes.ts` | AgentMail inboxes | Belongs to workspace |
| `/api/agentmail/threads` | GET | `mock/data/agentmail-threads.ts` | AgentMail email conversations | Belongs to inbox |
| `/api/agentmail/messages` | GET | `mock/data/agentmail-messages.ts` | Inbound/outbound email messages | Belongs to mailThread |

---

## Running the Mock Server

To start the mock server programmatically or via Node:

```typescript
import { startMockServer } from "./mock/server";

// Starts listening on default port 3002
const server = await startMockServer(3002);
```

Using the verification script:

```bash
node scripts/verify-mock.mjs
```

---

## Using the Mock Client Bridge

In application code or test suites, import `mockClient` directly:

```typescript
import { mockClient } from "./mock/client";

// Emulates convexClient.query
const sessions = await mockClient.query("rankSessions:list", {
  workspaceId: "ws_rank_01",
});

// Emulates convexClient.mutation
const newSessionId = await mockClient.mutation("rankSessions:create", {
  workspaceId: "ws_rank_01",
  query: "What is reciprocal rank fusion?",
  candidateCount: 4,
});

// Emulates AI reranking action
const rankResult = await mockClient.action("rank:execute", {
  query: "Nebius AI Studio latency",
  candidates: [
    { text: "TensorRT-LLM optimized cross-encoder kernels" },
    { text: "Unrelated passage about cooking recipes" },
  ],
});
```
