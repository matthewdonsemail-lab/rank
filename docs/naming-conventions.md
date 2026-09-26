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

## Application Packages

Runnable tools live under `packages/{package}/src/` and follow the same domain shape, so a package is never a flat pile of scripts:

```text
packages/{package}/
├── bin/{entrypoint}    # thin wrapper: argv in, exit code out
├── src/{domain}/
│   ├── helpers/
│   │   ├── <pure-helper>.ts
│   │   └── index.ts
│   ├── types.ts
│   ├── <domain>.ts
│   └── index.ts
└── README.md
```

The same rules apply: helpers are pure, every `helpers/` directory has a barrel, helpers never import the parent barrel, and a domain root exposes named exports. `scripts/check-naming-conventions.mjs` enforces this for `lib/` and every `packages/*/src` root.

Shared domains belong in `packages/rank-core` so two tools cannot disagree. A package that needs the same behaviour as another imports the domain rather than copying it.

Environment variables and capabilities each have exactly one source of truth:

| File | Describes | Enforced by |
|---|---|---|
| `config/env-vars.json` | Every variable Rank reads, who consumes it, and what breaks without it | `pnpm check:surfaces` |
| `config/capabilities.json` | Every capability and the CLI, HTTP, and tool surfaces exposing it | `pnpm check:surfaces` |

The CLI, the protocol server package, and the Convex HTTP routes are implemented separately and checked against those files. `check-surfaces.mjs` fails when a capability is missing a surface, when two capabilities share a CLI command, tool name, or route and method, when an advertised tool or command has no implementation, or when a `requiresEnv` name is not in the environment manifest. That check is catalog consistency by source inspection — shared names, not proven identical behavior. A surface marked `planned` with a recorded reason declares deferred intent and is skipped by the implementation-existence rules. Where a capability's scope differs by surface (for example `env.doctor`, which reads the linked deployment on the CLI but local sources only through the protocol server), the difference is recorded in the capability's summary.

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

### Package Domain Registry

| Package | Domain | Responsibility | Primary exports |
|---|---|---|---|
| `rank-core` | `env` | Resolve the environment manifest against process, file, and deployment | `resolveEnv`, `buildReport`, `renderReport` |
| `rank-core` | `workspace` | Filesystem access and typed views of the manifest and registry | `loadWorkspace`, `resolveRepoRoot` |
| `rank-core` | `convex` | Convex CLI boundary for deployment variables | `readDeploymentEnv` |
| `rank-core` | `capabilities` | Capability registry and consistency checks | `toolDefinitions`, `findGaps`, `renderRegistry` |
| `rank-cli` | `cli` | Command registry, dispatcher, and usage text | `runCli`, `COMMANDS` |

Each package documents its own domains in its README. Two tools share a surface by importing a `rank-core` domain, never by copying it.

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
pnpm check:naming
pnpm check:surfaces
pnpm typecheck:packages
pnpm test:packages
```
