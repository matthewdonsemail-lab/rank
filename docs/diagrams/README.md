# Architecture Diagrams

These Mermaid files document the system that exists in this repository. The XState machine pipeline is generated from `lib/xstate/**/machine.ts`; do not hand-edit `machine-pipeline.mmd`.

## Source of Truth

- Machine definitions: [`lib/xstate/`](../../lib/xstate/)
- Machine contract manifest: [`docs/xstate/machine-manifest.json`](../xstate/machine-manifest.json)
- Machine documentation: [`docs/xstate/machines.md`](../xstate/machines.md)
- Convex persistence: [`convex/schema.ts`](../../convex/schema.ts)

## Diagrams

| File | Purpose |
|---|---|
| [`machine-pipeline.mmd`](machine-pipeline.mmd) | Generated v6 machine inventory and workflow order |
| [`system-overview.mmd`](system-overview.mmd) | Consumers, machine boundaries, provider clients, and Convex storage |
| [`ranking-pipeline.mmd`](ranking-pipeline.mmd) | Discovery to judgment: homepage reads, Nebius reranking, and TypeSafe prospect evaluation |
| [`brand-context-pipeline.mmd`](brand-context-pipeline.mmd) | Brand entity, source indexing, prompt compilation, and reply context |
| [`brand-feedback-loop.mmd`](brand-feedback-loop.mmd) | Versioned brand context and source-reference flow |
| [`data-model-erd.mmd`](data-model-erd.mmd) | Current Convex tables and relationships |
| [`api-auth-sequence.mmd`](api-auth-sequence.mmd) | Authenticated Convex action and machine-step sequence |
| [`ranking-utility-flow.mmd`](ranking-utility-flow.mmd) | Standalone ranking helpers; not a workflow stage |

## Current Boundary

The four implemented machine stages are `brandEnrichmentMachine`, `competitorDiscoveryMachine`, `prospectEvaluationMachine`, and `outboundThreadMachine`. Firecrawl, Treg, TypeSafe, Agent, and AgentMail calls run from Convex boundaries. The Nebius client calls the Token Factory rerank endpoint from `startCompetitorProspectEvaluations`, which ranks discovered candidates before TypeSafe judges them; it has been tested against the documented response shape but not yet against the live API.
