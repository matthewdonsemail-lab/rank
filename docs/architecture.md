# Architecture

Rank is organized around explicit XState v6 machine contracts and Convex-owned persistence. The machine source is authoritative for states and events; this document explains how those contracts connect to the currently implemented boundaries.

## Runtime Topology

```text
Authenticated client
        |
        v
Convex action/query
        |
        +--> restore XState v6 machine
        +--> perform one external operation
        +--> send one typed event
        +--> persist state and serializable context
        v
Convex tables and owner-scoped queues
```

The generated [machine pipeline diagram](diagrams/machine-pipeline.mmd) shows the five current stages:

1. `brandEnrichmentMachine` maps and scrapes a source site, then extracts structured facts.
2. `competitorDiscoveryMachine` calls configured competitor providers and normalizes candidate domains.
3. `prospectEvaluationMachine` calls `TypeSafeEvaluator` and stores an `act`, `review`, or `drop` judgment.
4. `contactResolutionMachine` checks domain and contact deliverability, including alternate and bounce paths.
5. `outboundThreadMachine` manages personalized guest-post outreach, reply intent, deal likelihood, provider links, and follow-up state.

## Library Boundaries

| Path | Responsibility | Current external behavior |
|---|---|---|
| `lib/brand` | Brand entity, source records, prompt and reply helpers | Configurable HTTP client; mock server used for local verification |
| `lib/firecrawl/crawl` | Firecrawl operation wrapper | Called from Convex enrichment actions |
| `lib/convex/treg` | Treg client types and spend helpers | Called from Convex competitor discovery |
| `lib/typesafe/evaluator` | Typed System One questions, parsing, retries, and prospect judgment | Called from Convex prospect evaluation |
| `lib/nebius/rerank` | Reranking client, types, and score helpers | `NebiusRerankClient` calls the Token Factory rerank endpoint; `convex/prospectEvaluation.ts` constructs it when `NEBIUS_API_KEY` is set. `baselineRank` is the local test-only stand-in |
| `lib/convex/agent` | Agent-facing reasoning boundary and outbound prompt contract | Mock Agent sessions; Nebius adapter remains future work |
| `lib/xstate/outbound` | Outbound thread state, provider contracts, reply prompt, and resolution labels | Used by Convex outbound actions and mock routes |
| AgentMail provider boundary | Domain/inbox/thread/message transport and inbound-label bridge | Mounted component; live credentials are not configured |
| `lib/convex/telemetry` | Telemetry types and formatting helpers | Available as a library boundary; not a current workflow stage |

## Persistence

The Convex schema stores the state and context for enrichment, competitor discovery, prospect evaluation, contact resolution, and outbound threads. A context contains only serializable records needed to resume the next step. Provider clients, sockets, promises, and API keys are not placed in machine context.

Prospect evaluation uses indexed owner/action/updated rows. `act` and `review` are active queue decisions; `drop` records remain queryable for audit and are never silently deleted. Outbound rows additionally persist user-owned domains, prefixed inboxes, campaign state, Agent and AgentMail identifiers, reply analysis, follow-up deadlines, and delivery idempotency keys.

## Agent and AgentMail Union

Agent reasoning and email transport are deliberately separate records. `outboundThreadMachine` stores `agentThreadId`, `agentMailThreadId`, and `agentMailInboxId` independently. `convex/agent.ts` creates a reasoning session and returns its Agent thread ID; `convex/email.ts` queues AgentMail transport, adds an `outbound-thread:<id>` label, and maps inbound messages back to the machine. A provider outage in one boundary must not fabricate the other boundary's identifier.

## Future Model Integration

Two model boundaries exist and they are in different states. Reranking is already remote-capable: `convex/prospectEvaluation.ts` builds a `NebiusRerankClient` when `NEBIUS_API_KEY` is set, and `rankCandidates` keeps discovery order with an explicit `skipped` or `failed` status when it cannot run, so an unranked list is never stored as ranked. Agent reasoning is still mocked: `convex/agent.ts` uses the Agent component's `mockModel`, and a future token-factory adapter can replace it, validate a reply analysis, and send `ANALYSIS_READY` through the existing owner-scoped action. Credentials, model clients, and sockets remain outside machine context.

## Source of Truth

- Machine definitions: `lib/xstate/**/machine.ts`
- Machine manifest: `docs/xstate/machine-manifest.json`
- Machine documentation: `docs/xstate/machines.md`
- Convex schema: `convex/schema.ts`
- Provider wrappers: `lib/firecrawl`, `lib/convex/treg`, `lib/typesafe`, `lib/xstate/outbound`, `convex/email.ts`
