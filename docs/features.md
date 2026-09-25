# Features

This page lists capabilities that exist in the source tree and separates them from planned integrations.

## Implemented Capabilities

### Brand grounding

- `BrandEntity` stores identity, voice, offerings, location, memory, channels, and intelligence.
- `BrandClient` exposes typed mock/API operations for the brand record and source list.
- `buildBrandSystemPrompt()` produces a deterministic, versioned prompt.
- `retrieveSourceRefs()` returns source references using keyword-overlap matching.
- `simulateOutbound()` provides a local reply simulation helper.

### Firecrawl operations

- Map a site to candidate URLs.
- Scrape selected pages with structured formats.
- Search through the Firecrawl component boundary.
- Start, inspect, cancel, resume, and delete crawls.

### XState v6 workflows

- `brandEnrichmentMachine` persists mapping, scraping, extraction, failure, retry, and cancellation state.
- `competitorDiscoveryMachine` persists provider results and normalized candidates.
- `prospectEvaluationMachine` persists TypeSafe judgments as `act`, `review`, or `drop`.
- `contactResolutionMachine` persists domain/contact checks, alternate-contact decisions, and bounce recovery.
- `outboundThreadMachine` persists guest-post draft approval, Agent/AgentMail links, reply sentiment, deal likelihood, negotiation, follow-up, and delivery failure state.
- Machine snapshots are versioned and tested through JSON round trips.

### TypeSafe evaluation

- Typed `noul`, `choice`, and `score` questions.
- `/v1/systemone` requests through an injectable Fetch transport.
- Bounded retries for transient responses.
- `judgeProspect()` applies confidence and safety gates before returning a decision.
- Owner-scoped Convex queues expose active, review, and dropped prospects.

### Outbound and provider bridge

- User-owned sending domains and prefixed shared inboxes are represented in Convex tables and mock routes.
- Agent reasoning IDs and AgentMail thread/inbox IDs remain separate in `outboundThreadMachine` context.
- `buildOutboundReplyPrompt()` includes the explicit goal, brand voice, guest-post angle, prospect context, confidence, and deal likelihood.
- `parseOutboundReplyAnalysis()` validates a future model's JSON intent, sentiment, confidence, deal likelihood, next action, labels, and rationale.
- Mock Agent and AgentMail adapters demonstrate reply analysis and draft creation without live credentials.
- `queueOutboundMessage` reserves an idempotency key, requires an approved state, adds an outbound thread label, and leaves delivery confirmation to the AgentMail lifecycle.
- Inbound AgentMail labels can transition the matching thread to `analyzing_reply`.

### Ranking utility

- `NebiusRerankClient` reranks candidates through the Nebius Token Factory `POST /v1/rerank` endpoint and maps the scores back onto the candidates, best first, with `topK`. It is covered by tests against the documented response shape but has not been run against the live API yet. `baselineRank` is a separate local stand-in that keeps the given order and is not a relevance model.
- `normalizeScores()`, `mergeRankings()`, and related helpers are available as standalone utilities.
- A remote model request is not part of the current machine chain.

## Planned Model Integration

The outbound Agent action and prompt contract exist with a mock model. A future Nebius token-factory adapter can validate a reply analysis and feed `ANALYSIS_READY` to the existing machine. Live model credentials, response validation, and provider failure handling remain future work.

## Verification

```bash
pnpm test
pnpm build
pnpm mock:verify
pnpm check:machines
pnpm check:docs
```
