# Architecture and Naming Conventions

Internal modules use explicit library/domain boundaries. The checked source tree is the authority for this document.

## Layout

```text
lib/
├── brand/                         # standalone brand domain
├── convex/
│   ├── agent/
│   ├── agentmail/
│   ├── telemetry/
│   └── treg/
├── firecrawl/
│   └── crawl/
├── nebius/
│   └── rerank/
├── typesafe/
│   └── evaluator/
└── xstate/
    ├── competitor-discovery/
    ├── enrichment/
    └── prospect-evaluation/
```

A normal domain has this shape:

```text
lib/{library}/{domainname}/
├── helpers/
│   ├── <pure-helper>.ts
│   └── index.ts
├── types.ts
├── client.ts or machine.ts
└── index.ts
```

`lib/brand` is the existing standalone-domain exception and has its own `index.ts` and helper barrel.

## Current Domain Registry

| Library | Domain | Responsibility | Primary exports |
|---|---|---|---|
| `brand` | standalone | Brand entity, sources, prompt and reply helpers | `BrandClient`, `buildBrandSystemPrompt`, `retrieveSourceRefs` |
| `convex` | `agent` | Agent-facing client types and helpers | `ConvexAgentClient` |
| `convex` | `agentmail` | Mail boundary types and helpers | `ConvexAgentMailDispatcher` |
| `convex` | `telemetry` | Telemetry types and formatting | `ConvexTelemetryLogger` |
| `convex` | `treg` | Treg client, failover, and spend helpers | `TregDomainClient` |
| `firecrawl` | `crawl` | Firecrawl operation wrapper | `FirecrawlCrawlClient` |
| `nebius` | `rerank` | Candidate reranking through the Nebius rerank endpoint, plus a local test baseline | `NebiusRerankClient`, `baselineRank`, `normalizeScores` |
| `typesafe` | `evaluator` | Typed System One evaluation and prospect judgment | `TypeSafeEvaluator`, `noul`, `choice`, `score` |
| `xstate` | `enrichment` | Brand enrichment machine | `brandEnrichmentMachine` |
| `xstate` | `competitor-discovery` | Competitor discovery machine | `competitorDiscoveryMachine` |
| `xstate` | `prospect-evaluation` | TypeSafe prospect decision machine | `prospectEvaluationMachine` |

## Machine-First Contract

Every file matching `lib/xstate/**/machine.ts` is a behavioral source of truth. A machine must provide:

- A stable machine `id` and `version`.
- Explicit states and typed events.
- A colocated `machine.test.ts`.
- A manifest entry in `docs/xstate/machine-manifest.json`.
- A generated row in `docs/xstate/machines.md`.
- A generated node in `docs/diagrams/machine-pipeline.mmd`.

Run the generator after a machine change:

```bash
node scripts/check-machine-docs.mjs --write
```

The pre-push hook runs the same check without write mode, so an undocumented or stale machine cannot pass the gate.

## XState Version Contract

The project uses `xstate@6.0.0-alpha.59` until a stable v6 package is published. Machine code uses v6 `setup()`, `types<T>()` schemas, inline transition functions, and shallow context patches. The authoritative upstream v6 references are fetched with `pnpm docs:xstate` into the ignored `docs/xstate/upstream/` directory.

## Helper Rules

- Helpers are pure and unit-testable.
- Every helper directory has an explicit `helpers/index.ts` barrel.
- Helpers do not import a parent domain barrel.
- Domain roots expose named exports rather than wildcard mega-barrels.
- External I/O stays in clients or Convex actions, not pure helpers or machine transitions.

## Enforcement

```bash
pnpm check:machines
pnpm check:docs
node scripts/check-naming-conventions.mjs
```
