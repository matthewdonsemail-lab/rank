# Spend Ledger & Audit Trail

The Treg component maintains an append-only, sandboxed ledger of all tool invocations and costs inside its encapsulated `calls` table.

---

## Ledger Schema

The component's internal database partition stores spend records with the following fields:

| Field | Type | Description |
|---|---|---|
| `callId` | `string` | Cryptographic idempotency ID (`crypto.randomUUID()`) matching upstream receipt |
| `ownerHash` | `string` | SHA-256 hash of the caller identity (`customer=<hash>`), preserving tenant privacy |
| `endpoint` | `string` | Catalog endpoint invoked (e.g. `spyfu.google.domain.competitors`) |
| `costMicro` | `number` | Billed cost in micro-dollars ($1.00 = 1,000,000 micro-dollars) |
| `servedVia` | `string` | Provider route executed (e.g. `direct`, `proxy-eu-1`, `cache-hit`) |
| `at` | `number` | Unix millisecond timestamp of call completion |

---

## Querying Receipts

Host applications can query usage without accessing the internal table directly:

```typescript
import { query } from "./_generated/server";
import { components } from "./_generated/api";
import { Treg } from "@listeningkit/treg";

const treg = new Treg(components.treg);

export const getUserSpend = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    return await treg.getCalls(ctx, {
      owner: identity.subject,
      limit: 50,
    });
  },
});
```

---

## Multi-Tenant Privacy Guarantee

To prevent user PII or raw database IDs from leaking upstream to third-party tool vendors:
- The `Treg` wrapper hashes the `owner` parameter using SHA-256 before forwarding it to the proxy header `X-Treg-Customer`.
- The ledger groups spend and enforces rate limits per tenant hash, ensuring multi-tenant accounting with zero PII exposure.
