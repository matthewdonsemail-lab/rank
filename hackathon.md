# Hackathon log

- **Project:** Rank by ListeningKit
- **Event:** Nebius AI Studio Hackathon
- **What it does:** Ultra-low latency AI ranking, semantic reranking, and model decision routing engine built for Nebius AI Studio and TypeSafe AI on Convex.
- **Live app:** https://rank.listeningkit.com
- **Repo:** https://github.com/matthewdonsemail-lab/rank
- **Backend:** Convex Cloud
- **Inference Backends:** Nebius AI Studio (BAAI/bge-reranker-v2-m3, Llama-3.3, DeepSeek), TypeSafe AI (Jev / System One)
- **Protocols:** REST API & Model Context Protocol (MCP)
- **Started:** 2026-09-25T01:57:00Z
- **Last updated:** 2026-09-25T04:24:00Z

## Log

### 2026-09-25 - convex project initialization, component installation, and documentation
Configured Convex project 'rank' (`convex.json`) and installed production components `@convex-dev/agent` and `@agentmail/convex`. Mounted both components in `convex/convex.config.ts`, created core database schema in `convex/schema.ts`, exposed the Svix webhook router in `convex/http.ts`, and built reactive email queries, mutations, and triage handlers in `convex/email.ts` and `convex/agent.ts`. Authored full component documentation suites under `docs/convex/components/agent/` and `docs/convex/components/agentmail/` with architecture specs, tools, and webhook guides. Scaffolded corresponding domain wrappers in `lib/convex/agent` and `lib/convex/agentmail` following normalized kebab-case conventions.

### 2026-09-25 - total emoji removal and automated pre-push enforcement
Removed all emoji characters across all repository files (README.md, documentation in docs/, diagrams README, and utility scripts). Implemented strict automated scanner `scripts/check-no-emojis.mjs` using Unicode Extended_Pictographic detection to reject any emoji usage anywhere in the codebase. Wired the check into `lefthook.yml` as a mandatory pre-push gate.

### 2026-09-25 - naming conventions and lib/{library}/{domainname} architecture
Researched TypeScript domain-driven design, module boundaries, and barrel re-export patterns using parallel-web-search. Created the authoritative specification `docs/naming-conventions.md` defining the normalized `lib/{library}/{domainname}/helpers/` architecture, strict kebab-case naming rules, unidirectional helper dependencies, and re-export patterns. Scaffolded starter modules in `lib/nebius/rerank`, `lib/typesafe/evaluator`, and `lib/convex/telemetry` implementing this standard. Implemented automated verification script `scripts/check-naming-conventions.mjs` and wired it into `lefthook.yml` pre-push gating.

### 2026-09-25 - fumadocs and openapi documentation pull
Identified documentation framework used in `apps/docs` (port 3001) as Fumadocs (`fumadocs-openapi`, `fumadocs-ui`, `fumadocs-core`). Fetched complete 166-page Fumadocs documentation suite and full LLM reference into `docs/fumadocs/` and added `docs/fumadocs/` to `.gitignore`.

### 2026-09-25 - hono documentation pull and router reference
Fetched complete Hono documentation suite (87 guides, full/small llms reference, context, routing, middleware) into `docs/hono/` and added `docs/hono/` to `.gitignore`.

### 2026-09-25 - agentmail documentation pull and integration reference
Fetched the complete AgentMail API and documentation suite (237 guides, OpenAPI 3.0 spec, webhooks, WebSockets, and inboxes) into `docs/agentmail/` and added `docs/agentmail/` to `.gitignore`.

### 2026-09-25 - repository initialization, documentation architecture, diagrams, and gating
Initialized public GitHub repository `matthewdonsemail-lab/rank` for the Nebius AI Studio Hackathon. Set up complete domain-separated documentation architecture (`docs/architecture.md`, `docs/features.md`, `docs/api-and-mcp.md`, `docs/self-hosting.md`, `docs/contributing.md`), 5 standalone Mermaid diagrams in `docs/diagrams/` with interactive gallery, attached branded banner, established MIT license, configured pre-push gating (`lefthook.yml`) with brand rules and hackathon log verification, and pulled reference documentation for Nebius AI, TypeSafe AI, and Convex.
