# Backend & Library Reference

The repository currently exposes typed libraries, Convex functions, and mock HTTP routes. It does not currently ship the production public HTTP gateway described by earlier versions of this document.

## Convex Workflow Functions

### Brand enrichment

- `startBrandEnrichment`
- `advanceBrandEnrichment`
- `retryBrandEnrichment`
- `cancelBrandEnrichment`
- `getBrandEnrichment`
- `listBrandEnrichmentRuns`

These functions require an authenticated Convex identity. They restore `brandEnrichmentMachine`, call the Firecrawl boundary, and persist the next machine state.

### Competitor discovery

- `startCompetitorDiscovery`
- `advanceCompetitorDiscovery`
- `retryCompetitorDiscovery`
- `cancelCompetitorDiscovery`
- `getCompetitorDiscovery`
- `listCompetitorDiscoveryRuns`

These functions restore `competitorDiscoveryMachine`, call the Treg client, normalize candidates, and persist the result.

### Prospect evaluation

- `startProspectEvaluation`
- `startCompetitorProspectEvaluations`
- `advanceProspectEvaluation`
- `retryProspectEvaluation`
- `cancelProspectEvaluation`
- `getProspectEvaluation`
- `listActiveProspects`
- `listReviewProspects`
- `listDroppedProspects`
- `listProspectEvaluationRuns`

The batch action maps normalized competitor candidates to link prospects and calls `TypeSafeEvaluator.judgeProspect()`. Queue queries are owner-scoped and index-backed.

### Outbound conversations

- `addDomain`
- `setDomainStatus`
- `addInbox`
- `setInboxStatus`
- `provisionInboxPool`
- `createCampaign`
- `createOutboundThread`
- `createContactResolution`
- `transitionContactResolution`
- `listContactResolutions`
- `getContactResolution`
- `startThread`
- `transitionThread`
- `linkAgentThread`
- `linkAgentMailThread`
- `recordReply`
- `recordReplyAnalysis`
- `scheduleFollowUp`
- `releaseFollowUp`
- `listDomains`
- `listInboxes`
- `listCampaigns`
- `listThreads`
- `getThread`
- `getPool`
- `selectPoolInbox`
- `assignPoolInbox`
- `listDueFollowUps`

These functions require an authenticated Convex identity. `provisionAgentMailInbox` in `convex/email.ts` creates provider inboxes with deterministic client IDs; Rank pool mutations persist the returned provider ID. Contact resolution persists domain verification, contact confidence, alternate-contact reasons, and bounce recovery. Outbound context keeps `agentThreadId`, `agentMailThreadId`, and `agentMailInboxId` separate. `queueOutboundMessage` in `convex/email.ts` wraps the AgentMail durable queue with an application idempotency record and an `outbound-thread:<id>` label; `getSendStatus` exposes the component's delivery lifecycle.

## Agent and AgentMail union

`convex/agent.ts` exposes `startOutboundReasoning`, which creates a separate Agent thread from the versioned outbound prompt contract in `lib/xstate/outbound/agent-prompt.ts`. `convex/email.ts` owns AgentMail transport and inbound webhook routing. The two IDs are linked only through the outbound state context; neither component is treated as the other.

## TypeSafe System One

The provider boundary is implemented in [`lib/typesafe/evaluator/`](../lib/typesafe/evaluator/):

```http
POST https://api.typesafe.ai/v1/systemone
Authorization: Bearer <TYPESAFE_API_KEY>
Content-Type: application/json
```

The request contains `state`, `model`, and a map of typed questions. The response contains `model`, `answers`, and token `usage`. The client validates answer types, retries transient responses, and fails prospect decisions closed to `review` when the provider is unavailable.

## Reranking Boundary

`NebiusRerankClient` is exported from [`lib/nebius/rerank/`](../lib/nebius/rerank/). The current implementation normalizes a deterministic local score sequence; it does not issue a remote request. The configured model name remains an input for the future provider adapter, not evidence of a completed remote integration.

## Mock HTTP Surface

The mock server in [`mock/`](../mock/) exposes the brand, session, candidate, receipt, Treg, component, contact-resolution, domain-pool, outbound-thread, provider-adapter, and delivery-idempotency routes used by `pnpm mock:verify`. These routes are test fixtures and are not the production API.

## Environment

See [`.env.example`](../.env.example) and [self-hosting.md](self-hosting.md). Provider secrets belong in the runtime environment and must not be placed in machine context.
