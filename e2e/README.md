# prospect.evaluate E2E harness (rank-o9fu) — FAKE + LOCAL, NOT live

## What this proves

`prospect.evaluate` is verified at the **furthest reachable layer without live
credentials**: the `ConvexActionCaller` transport seam in
`packages/rank-core/src/prospect/prospect.ts`.

- Every step below is labeled **FAKE** (injected `caller` returning recorded
  shapes, no network) or **LOCAL** (loopback HTTP against `mock/server.ts`).
- Nothing here touches a live Convex deployment. No row is persisted anywhere
  except in-memory recorded fixtures.
- The existing `packages/rank-core/src/prospect/prospect.test.ts` proves adapter
  behavior with minimal fakes; this harness goes further by replaying
  **recorded live-shaped runs incl. judgment + provenance** (`rerankStatus`,
  `homepageRead`) and every mappable failure kind from
  `docs/contracts/prospect-evaluate.md`.

## Reachability (checked 2026-09-26, presence only, no values printed)

- `CONVEX_URL`: ABSENT in environment
- `RANK_AUTH_TOKEN`: ABSENT in environment
- This worktree has no `.env` files (gitignored). No secret was created,
  echoed, or stored by this harness.

Conclusion: **LIVE is not reachable from here.** Live verification remains open
(see below).

## Files (new, harness-only; no operation/adapter source touched)

- `e2e/prospect-evaluate.transport.test.ts` — **FAKE** transport-seam suite.
  Drives the real `evaluateProspect` with a fake `ConvexActionCaller`.
- `e2e/prospect-evaluate.http-local.test.ts` — **LOCAL** HTTP-adjacent probe.
  Boots the real `mock/server.ts` on an ephemeral port and proves there is
  currently no prospect-evaluate HTTP route (so the seam above is the furthest
  reachable layer).
- `e2e/README.md` — this file.

## Commands (each harness file runs green on its own)

```powershell
bun test e2e/prospect-evaluate.transport.test.ts
bun test e2e/prospect-evaluate.http-local.test.ts
bun test e2e
```

Repo gates touched (must stay green):

```powershell
bun test packages/rank-core
```

## Contract failure-table coverage (all FAKE unless noted)

| Contract case | Harness test | Expected |
|---|---|---|
| Success: persisted run with judgment/provenance | `FAKE success returns persisted run shape with judgment and provenance` | `ok:true`, `state:completed`, judgment `act`, `metrics.rerankStatus:ranked`, `homepageRead:true` |
| Nebius call fails → `rerankStatus:failed`, order kept | `FAKE provider-failed run still persists judgment with failed provenance` | `ok:true`, `rerankStatus:failed`, `homepageRead:false`, judgment present |
| Homepage unreadable → `homepageRead:false`, continues | Same provider-failed fixture (`homepageRead:false` with judgment) | `ok:true`, evaluation continues on metadata |
| Unauthenticated caller → auth failure, no row | `FAKE backend auth rejection maps to auth` | `ok:false`, `kind:auth` |
| Unnormalizable URL (backend normalizer) → rejected | `FAKE backend URL normalizer rejection maps to operation` (`http://localhost/...` passes client pre-check, backend rejects as non-public) | `ok:false`, `kind:operation`, caller WAS reached |
| Unnormalizable URL (client pre-check) → rejected, no call | `FAKE client-side bad URL never reaches transport` (`"not a url"`) | `ok:false`, `kind:input`, caller NOT reached |
| Unknown/incomplete `sourceDiscoveryRunId` → rejected | `FAKE unknown discovery run maps to operation` | `ok:false`, `kind:operation` |
| Run row missing mid-advance | `FAKE missing run row maps to operation` (`ConvexError("Prospect evaluation run not found")`) | `ok:false`, `kind:operation` |
| Unexpected run shape → transport | `FAKE unexpected run shape maps to transport` | `ok:false`, `kind:transport` |
| Missing deployment URL / token → config | `FAKE missing deployment URL and token report config` | `ok:false`, `kind:config`, message names `CONVEX_URL` / `RANK_AUTH_TOKEN` |
| HTTP-adjacent prospect route | `LOCAL mock server has health but no prospect-evaluate route` | `/health` 200, prospect path 404 → proves seam is furthest reachable |

`rerankStatus: skipped` (Nebius key absent) is a backend-side branch inside
`convex/prospectEvaluation.ts` (`startCompetitorProspectEvaluations`, bulk path);
the single-prospect `startProspectEvaluation` action carries no rerank step, so
the transport shape asserts `ranked` vs `failed` provenance only. The skipped
variant remains a LIVE-only observation.

## What would close LIVE verification

1. Provide (outside the repo, never in a file) `CONVEX_URL` pointing to a usable
   Convex deployment and `RANK_AUTH_TOKEN` holding a valid Clerk session token
   for that deployment.
2. Run the real operation with default caller (no injected `caller`):
   - **LIVE success**: `evaluateProspect({ url: "https://example.com/page" })`
     → expect `ok:true`, `state:completed`, one persisted `prospectEvaluations`
     row with judgment + provenance (`rerankStatus`, `homepageRead`).
   - **LIVE failure (bad URL)**: `evaluateProspect({ url: "http://localhost/bad" })`
     or another backend-unnormalizable URL → expect `ok:false`,
     `kind:operation` with the normalizer's reason, and no row written.
3. Confirm row scoping via `getProspectEvaluation` as the same owner.
