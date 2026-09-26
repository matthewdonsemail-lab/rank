# Project Instructions for AI Agents

This file provides instructions and context for AI coding agents working on this project.

<!-- BEGIN TBD INTEGRATION format=f08 surface=agents-md -->
## tbd

This repository uses **tbd** for git-native issue tracking (beads), spec-driven
planning, and on-demand engineering guidelines.
As the agent, you operate tbd on the user’s behalf: translate their requests into tbd
actions rather than telling them to run commands.

- Run `tbd prime` to load current project state and the full tbd workflow.
- Run `tbd skill` for the complete reusable tbd skill instructions.
- Run `tbd shortcut --list` and `tbd guidelines --list` for on-demand resources.
- Track all work as beads: `tbd create`, `tbd ready`, `tbd close`, and `tbd sync`.

<!-- END TBD INTEGRATION -->

## Build & Test

```bash
# Install dependencies
pnpm install

# Development
pnpm web:dev              # Start web frontend
pnpm convex:dev           # Start Convex dev server

# Testing
pnpm test                 # Run tests
pnpm mock:verify          # Verify mock implementations

# Type checking
pnpm typecheck            # Check all TypeScript
pnpm typecheck:convex     # Check Convex functions

# Quality gates
pnpm check:pre-push       # Run all pre-push checks
```

## Architecture Overview

**Rank** is an AI-assisted link-building and backlink prospect ranking engine built for the Nebius AI Studio Hackathon. It turns a brand's content into grounded evidence, finds publications where that content is useful, explains editorial fit, and prepares personalized outreach decisions.

**Tech Stack:**
- **Backend:** Convex Cloud (database, server functions, auth, scheduling)
- **Frontend:** React + Vite + TypeScript (apps/web)
- **AI/ML:** Nebius AI Studio (reranking with Qwen/Qwen3-Reranker-8B), TypeSafe AI (System One)
- **State Management:** XState v6 machines for workflow orchestration
- **Integrations:** Firecrawl (web scraping), Treg (competitor discovery), Telnyx (SMS), Clerk (auth)

**Key Components:**
1. **Brand Grounding** (`lib/brand/`, `convex/brand.ts`) - Stores brand identity, offerings, voice, and sources
2. **Prospect Discovery** (`lib/xstate/competitor-discovery/`, `convex/competitorDiscovery.ts`) - Finds competitor domains using Treg
3. **Prospect Evaluation** (`lib/nebius/rerank/`, `convex/prospectEvaluation.ts`) - Reads homepages, ranks with Nebius, judges with TypeSafe
4. **Outbound Workflow** (`lib/xstate/outbound/`, `convex/outbound.ts`) - Contact resolution, guest-post approval, reply handling

**Project Structure:**
```
nebius-hackathon/
├── apps/web/              # React frontend (Vite + TypeScript)
├── convex/                # Convex backend functions and schema
├── packages/
│   ├── rank-cli/         # CLI tool
│   ├── rank-core/        # Core shared libraries
│   └── rank-mcp/         # MCP server
├── lib/                  # Shared business logic
├── docs/                 # Documentation
└── e2e/                 # End-to-end tests
```

## Conventions & Patterns

- **TypeScript-first:** All code is TypeScript with strict type checking
- **XState machines:** Workflow state is managed through XState v6 machines
- **Convex functions:** Backend logic is implemented as Convex queries, mutations, and actions
- **Provider boundaries:** External services (Firecrawl, Treg, TypeSafe, Nebius) are isolated behind client abstractions
- **Mock-first testing:** External providers have mock implementations for testing
- **Documentation-first:** Contracts and architecture are documented before implementation
- **Quality gates:** Pre-push hooks enforce code quality (naming, docs, machine contracts, brand guidelines)
