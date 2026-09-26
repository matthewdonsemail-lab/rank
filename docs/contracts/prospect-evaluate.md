# prospect.evaluate — operation contract

Status: contract only. No adapter (CLI, MCP, HTTP) may claim this capability
until it calls the shared operation defined here and passes the parity tests.

## Operation

`prospect.evaluate`: judge one prospect against the brand and save a
human-reviewable result. It never sends outreach, mutates other owners' data,
or changes workflow state beyond its own run row.

This is the safe first slice: evaluate and persist, nothing else.

## Inputs

| Field | Type | Required | Notes |
|---|---|---|---|
| `prospect.url` | string | yes | Must normalize via `normalizeCrawlUrl`; rejected otherwise |
| `prospect.title` | string \| null | no | |
| `prospect.description` | string \| null | no | |
| `prospect.sourceDomain` | string \| null | no | |
| `prospect.anchorText` | string \| null | no | |
| `prospect.targetDomain` | string \| null | no | |
| `prospect.fitRationale` | string \| null | no | |
| `prospect.brandSummary` | string \| null | no | |
| `prospect.metrics` | any | no | Opaque caller-supplied metrics |
| `prospect.content` | string \| null | no | |
| `sourceDiscoveryRunId` | id | no | Must reference a completed run owned by the caller |

Shape follows `prospectInputValidator` in `convex/prospectEvaluation.ts`.
Unknown fields are rejected, not ignored.

## Auth

The caller authenticates as a Clerk identity; the operation resolves it to an
owner via `requireOwner` and scopes everything to that owner:

- The run row is written with the caller's owner.
- A `sourceDiscoveryRunId` belonging to another owner, or to a run that has
  not completed, is rejected — never read across the boundary.
- Reads return only the caller's rows. There is no cross-owner path.

Unauthenticated callers receive an authentication failure, never a partial
result.

## Side effects

Allowed:

- One Firecrawl homepage read for the prospect's URL (one credit).
- One Nebius rerank call when `NEBIUS_API_KEY` is set.
- Exactly one persisted `prospectEvaluations` row, including judgment,
  scores, and provenance (`rerankStatus`, `homepageRead`).

Forbidden:

- No outreach, no messages, no emails.
- No mutation of discovery runs, brand records, or any other owner's rows.
- No network calls except the homepage read and the rerank call above.

## Output

The public run shape (`prospectEvaluationRunValidator`): `runId`, `url`,
`state` (`idle` | `evaluating` | `completed` | `failed` | `cancelled`),
`context` (prospect, judgment or null, error or null, attempt, timestamps),
`createdAt`, `updatedAt`. Owner is never exposed in the public shape.

Judgment, when present, is `act` | `review` | `drop` plus confidence, scores,
model, and reasons — a recommendation for a human, not an instruction to act.

## Failure cases

| Case | Behavior |
|---|---|
| Unauthenticated caller | Authentication failure, no row written |
| Unnormalizable URL | Rejected with the normalizer's reason, no row written |
| Unknown or incomplete `sourceDiscoveryRunId` | Rejected; another owner's run is indistinguishable from missing |
| Nebius key absent | Ranking skipped, discovery order kept, `rerankStatus: skipped` with reason |
| Nebius call fails | Discovery order kept, `rerankStatus: failed` with reason |
| Homepage unreadable | `homepageRead: false`, evaluation continues on metadata |
| Run row missing mid-advance | `ConvexError("Prospect evaluation run not found")` |

An unranked list is never stored as ranked: `rerankStatus` always says which
of `ranked`, `skipped`, or `failed` produced the order.

## Adapters

Each surface translates transport only and delegates to this operation:

- CLI: flags in, exit code out. No ranking logic.
- MCP: tool schema and content objects. `stdout` stays protocol traffic;
  diagnostics go to `stderr`. No ranking logic.
- HTTP: only if a real external client needs it, with explicit auth,
  validation, and documented status/error codes. No ranking logic.

A surface that cannot reach the authenticated operation must not advertise
this capability.
