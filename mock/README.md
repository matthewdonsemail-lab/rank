# Rank Relational Mock Architecture

The `mock/` directory provides an in-memory, relational data store and standalone mock API server for the Rank engine. It allows full-stack UI development, agent workflows, and integration testing without creating tables, columns, or rows in live Convex Cloud.

---

## Key Principles

1. **Zero Live Convex Dependency:** All data operations are handled in-memory. No test or mock rows are ever written to production or development Convex deployments.
2. **One Piece of Data Per Route:** Every API endpoint has its own dedicated data fixture module inside `mock/data/`, maintaining clean separation between routing and fixture payloads.
3. **Full Referential Integrity:** Relationships link Clerk users, organizations, workspaces, API keys, ranking sessions, candidates, receipts, benchmark evaluations, agent threads, AgentMail inboxes, and Treg developer tools.
4. **Authoritative Documentation Backing:** Every route fixture exports its `docBacking` metadata pointing to authoritative documentation files in `docs/`. When the `verifyDocBacking` argument is supplied, responses are validated against the schema contract and confirmed against local documentation files.
5. **Zero-Dependency Mock Server:** Built on Node's native `node:http` module, the mock API server starts instantly and provides full REST endpoints with CORS, JSON parsing, and doc validation.
6. **Drop-in Convex Client Bridge:** `mock/client.ts` implements Convex query, mutation, and action interfaces, allowing code to switch between mock and live backends without refactoring.

---

## Directory Layout

```text
mock/
├── README.md                          # Architecture guide and route reference
├── schema.ts                          # Relational TypeScript interfaces
├── store.ts                           # In-memory relational store with referential queries
├── server.ts                          # Native Node HTTP mock API server
├── client.ts                          # Drop-in mock client emulating Convex query/mutation APIs
├── validator.ts                       # Documentation backing and schema validation engine
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
    ├── agentmail-messages.ts          # Route: GET /api/agentmail/messages
    ├── treg-tools.ts                  # Route: GET /api/treg/tools
    ├── treg-calls.ts                  # Route: GET /api/treg/calls
    └── treg-execute.ts                # Route: POST /api/treg/call
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
| `/api/treg/tools` | GET | `mock/data/treg-tools.ts` | Treg 2,600+ developer tools catalog | Treg component |
| `/api/treg/calls` | GET | `mock/data/treg-calls.ts` | Treg spend receipts audit ledger | Treg component |
| `/api/treg/call` | POST | `mock/data/treg-execute.ts` | Execute developer tool with cost ceiling | Treg component |

---

## Documentation Backing Validation

To verify that any route or query response is backed by authoritative documentation on disk:

### Via HTTP API

Add the `?verifyDocBacking=true` query parameter or `X-Verify-Doc-Backing: true` header:

```bash
curl "http://localhost:3002/api/treg/tools?verifyDocBacking=true"
```

The response includes the `_meta` documentation verification block:

```json
{
  "data": [ ... ],
  "_meta": {
    "docBacked": true,
    "docPath": "docs/convex/components/treg/tools.md",
    "specSection": "Catalog & Endpoint Selection",
    "specUrl": "https://treg.to/catalog",
    "lastVerified": "2026-09-25",
    "verified": true
  }
}
```

### Via ConvexMockClient

Pass `verifyDocBacking: true` as an argument:

```typescript
import { mockClient } from "./mock/client";

const response = await mockClient.query("treg:listTools", {
  verifyDocBacking: true,
});
// response contains { data, _meta }
```

---

## Running the Mock Server

To start the mock server:

```bash
npm run mock:server
```

To run the full automated verification test suite:

```bash
npm run mock:verify
```
