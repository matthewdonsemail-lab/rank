# Treg Convex Component (`@listeningkit/treg`)

The Treg Convex Component embeds **treg.to** — the OpenRouter for developer tools — directly into Convex applications. It allows AI agents and backend workflows to run, route, and pay for 2,600+ tools through an isolated, sandboxed database ledger and unified API.

---

## Architectural Principles

1. **Sandboxed Database Isolation:** The component defines its own internal database schema with a `calls` table. Spend receipts logged by tool invocations remain strictly encapsulated inside the component boundary and never pollute the host application's data model.
2. **Typed Environment Injection:** Environment variables (`TREG_TOKEN` and optional `TREG_BASE_URL`) are bound directly in `convex.config.ts`. Host action callers never need to manage or pass raw API secrets as function arguments.
3. **Ergonomic Client Wrapper Pattern:** This package exports the `Treg` wrapper class:
   ```typescript
   import { Treg } from "@listeningkit/treg";
   import { components } from "./_generated/api";

   export const treg = new Treg(components.treg);
   ```
   The wrapper provides strongly typed methods, auto-hashing of owner identifiers, and transparent context forwarding.

---

## Installation & Setup

Install the package via npm or pnpm:

```bash
pnpm add @listeningkit/treg
```

Register the component in `convex/convex.config.ts`:

```typescript
import { defineApp } from "convex/server";
import agent from "@convex-dev/agent/convex.config";
import agentmail from "@agentmail/convex/convex.config";
import treg from "@listeningkit/treg/convex.config";

const app = defineApp();
app.use(agent);
app.use(agentmail);
app.use(treg);

export default app;
```

Configure environment variables on your Convex deployment:

```bash
npx convex env set TREG_TOKEN="your-treg-team-token"
npx convex env set TREG_BASE_URL="https://treg.to"
```

---

## Production Guardrails

| Guardrail | Mechanism | Benefit |
|---|---|---|
| **Max Cost Ceiling** | `X-Treg-Route-Max-Cost` header | Treg refuses the call upfront (HTTP 402) if reserve exceeds max cost; zero funds charged. |
| **Idempotency Guarantee** | Fresh `crypto.randomUUID()` header per call | Upstream retries or network replays are never double-billed. |
| **Privacy Attribution** | SHA-256 hashed owner (`customer=<hash>`) | Per-tenant spend ledger and multi-tenant scoping without leaking raw user IDs or PII upstream. |
| **Audit Ledger** | Isolated `calls` table in component schema | Automatically stores `callId`, `ownerHash`, `endpoint`, `costMicro`, `servedVia`, and `at`. |
| **Fail-Safe Timeout** | `AbortSignal.timeout(55_000)` | Prevents hung actions from consuming backend execution budget. |
