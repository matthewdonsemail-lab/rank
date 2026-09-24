# treg.to Documentation Index

> Local offline copy of documentation, specifications, and architecture for [treg.to](https://treg.to) (The Tools Registry).

**treg.to** is a faithful streaming proxy and catalog for 3,600+ external provider APIs across 97+ services (SEO, SERP, backlinks, social intelligence, enrichment, ads, web scraping). With one base URL (`https://treg.to/call/`) and one team token, teams and AI agents can invoke any supported upstream service without juggling individual API keys or managing secret distribution.

---

## 📚 Core Documentation & Specs

- [Architecture & Repo Overview](./OVERVIEW.md) — System design, faithful-relay contract, auth shapes, and module map.
- [llms.txt](./llms.txt) — Upstream AI agent index and system instructions.
- [OpenAPI Specification](./openapi.json) — Full REST API spec for proxy, tools, teams, and billing.
- [CLI Reference (USAGE.md)](./USAGE.md) — Comprehensive reference for the `treg` CLI command set.
- [Providers Catalog](./providers.json) — Full directory of supported API providers and endpoints.
- [Runtime Metadata](./meta.json) — Live deployment metadata and endpoint configurations.

---

## 🧭 Major Subsystems & Context

### 1. Tutorials & Guides
- [Main Tutorial](./docs/TUTORIAL.md) — Step-by-step walkthrough of teams, tools, secrets, and calling APIs.
- [Team Access Control](./tutorial-access.md) — Permission matrices, role-based dials, and local execution security.
- [CLI Import & Shell Mode](./tutorial-import-shell.md) — Turning machine CLIs into team tools via `treg scan` and `treg shell`.
- [Onboarding Guide](./docs/ONBOARDING.md) — First-time developer setup and local bootstrap.
- [Dashboard Tour](./docs/DASHBOARD-TOUR.md) — Browser UI walkthrough for managing tools and credentials.

### 2. Architecture Context Fragments (`docs/context/`)
- [Architecture Index](./docs/context/README.md)
- [Proxy Model & Relay](./docs/context/architecture/proxy-model.md) — Streaming byte relay contract and header filtering.
- [Auth & Secrets](./docs/context/architecture/auth-secrets.md) — Fernet encryption, key rotation, and the 4 auth shapes (`env`, `secret_file`, `oauth`, `cli_auth`).
- [Multi-Tenancy & Pinned Read Scopes](./docs/context/architecture/multi-tenancy.md) — Tenant isolation and customer pin attribution.
- [Catalog & Discovery](./docs/context/architecture/catalog.md) — Catalog search, indexing, and route matching.
- [Money & Billing](./docs/context/architecture/money.md) — Idempotent settlement, spend ceilings, and micro-metering.
- [Local Run Sandbox](./docs/context/architecture/local-run.md) — Sandboxed command execution for registered tools.
- [Media Pipelines](./docs/context/architecture/media.md) — Media intake and asset delivery.

### 3. Agent & AI Integrations
- [Official Claude Skill](./skill.md) — 3-persona (consumer/creator/admin) skill for Claude Code.
- [Agents Guide](./AGENTS.md) — Best practices for coding agents (Claude, Codex, Gemini, Cursor).
- [MCP Plugin Plan](./docs/MCP-PLUGIN-PLAN.md) — Model Context Protocol integration.
- [Claude Connector Submission](./docs/CLAUDE-CONNECTOR-SUBMISSION.md) — Direct Claude connector specifications.

### 4. Commercial & Infrastructure Plans
- [Vendors Reference](./docs/VENDORS.md) — Provider landscape and catalog coverage.
- [Customer Billing Plan](./docs/CUSTOMER-BILLING-PLAN.md) — Multi-tier billing and metering design.
- [Shared Plan Pricing](./docs/SHARED-PLAN-PRICING-PLAN.md) — Pricing structures and margins.
- [Idempotent Calls Plan](./docs/IDEMPOTENT-CALLS-PLAN.md) — Retry safety and duplicate call prevention.
