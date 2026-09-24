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
- **Last updated:** 2026-09-25T03:56:30Z

## Log

### 2026-09-25 - hono documentation pull and router reference
Fetched complete Hono documentation suite (87 guides, full/small llms reference, context, routing, middleware) into `docs/hono/` and added `docs/hono/` to `.gitignore`.

### 2026-09-25 - agentmail documentation pull and integration reference
Fetched the complete AgentMail API and documentation suite (237 guides, OpenAPI 3.0 spec, webhooks, WebSockets, and inboxes) into `docs/agentmail/` and added `docs/agentmail/` to `.gitignore`.

### 2026-09-25 - repository initialization, documentation architecture, diagrams, and gating
Initialized public GitHub repository `matthewdonsemail-lab/rank` for the Nebius AI Studio Hackathon. Set up complete domain-separated documentation architecture (`docs/architecture.md`, `docs/features.md`, `docs/api-and-mcp.md`, `docs/self-hosting.md`, `docs/contributing.md`), 5 standalone Mermaid diagrams in `docs/diagrams/` with interactive gallery, attached branded banner, established MIT license, configured pre-push gating (`lefthook.yml`) with brand rules and hackathon log verification, and pulled reference documentation for Nebius AI, TypeSafe AI, and Convex.
