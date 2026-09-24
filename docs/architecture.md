# Architecture Reference

> Technical design, data models, and system topology for **Rank by ListeningKit**.

---

## System Overview

**Rank by ListeningKit** is an ultra-low-latency AI ranking, semantic reranking, and model decision routing engine built for **Nebius AI Studio** and **TypeSafe AI (Jev / System One)** on **Convex Cloud**.

```
Client / Agent / Search Pipeline
             │
             ▼
     ┌───────────────┐
     │  API Gateway  │  (Hono / TypeScript)
     └───────┬───────┘
             │
      ┌──────┴──────┐
      ▼             ▼
┌───────────┐ ┌───────────┐
│ Fast LRU  │ │ Reciprocal│
│ Cache Hit │ │Rank Fusion│
└───────────┘ └─────┬─────┘
                    │
       ┌────────────┴────────────┐
       ▼                         ▼
┌───────────────┐        ┌───────────────┐
│ Nebius Studio │        │  TypeSafe AI  │
│ Cross-Encoder │        │  (System One) │
└──────┬────────┘        └───────┬───────┘
       │                         │
       └────────────┬────────────┘
                    ▼
          ┌───────────────────┐
          │  Convex Storage   │  (Audit, telemetry & receipts)
          └───────────────────┘
```

---

## Core Subsystems

### 1. Ingestion & API Gateway
- **HTTP Routing:** Type-safe Hono API routing requests for `/v1/rank`, `/v1/rerank`, and `/v1/evaluate`.
- **Authentication:** SHA-256 hashed API token authorization matching keys against the workspace registry in Convex.
- **Rate Limiting & Safety:** Adaptive concurrency controls to respect downstream provider rate ceilings.

### 2. The Two-Stage Lead Retrieval & Intent Paradigm
1. **Stage 1: Social Candidate Retrieval**
   - High-throughput social firehose streaming (Reddit, X, Facebook) matching whole-word listening rules produces batches of raw candidate mentions (20–100 posts per cycle).
2. **Stage 2: Cross-Encoder Precision Reranking & Brand Grounding**
   - The brand query (derived from `BrandEntity` offerings and service scope in `lib/brand/`) and candidate posts are scored jointly through cross-encoders (e.g. `BAAI/bge-reranker-v2-m3` on Nebius AI Studio) to compute true contextual cross-attention logits.

### 3. Brand Grounding & Autonomous Actions
- **Brand Ground Truth (`lib/brand/`):** Strict business profile containing service offerings, geographic bounds (`location`), voice dials, and operational memory boundaries.
- **Autonomous Reply Drafting (`@convex-dev/agent`):** High-ranking leads trigger the Convex Agent to compile deterministic system prompts (`buildBrandSystemPrompt`), retrieve citations from indexed site pages (`BrandPage`), and draft platform-tailored responses.
- **Reactive Alert Dispatch (`@agentmail/convex`):** Inbound webhooks and high-priority lead notifications delivered directly to stakeholder inboxes.
- **Competitor & Keyword Intelligence (`@listeningkit/treg`):** Ranks search visibility, competitor domains, and dorking queries via SpyFu, SE Ranking, and Brave Search.

### 4. TypeSafe AI (System One) Evaluator
- Integrates with TypeSafe's **Jev** System One model to evaluate typed questions (Choice, Score, Noul) without freeform text generation.
- Returns calibrated probability distributions and confidence scores used for intent routing and threshold gating.

### 5. Reciprocal Rank Fusion (RRF)
Combines signals across multiple rank lists into a unified score using:
$$RRF(d) = \sum_{m \in M} \frac{w_m}{k + r_m(d)}$$
where $k$ is a smoothing constant (default: 60), $w_m$ is the weight of model $m$, and $r_m(d)$ is the 1-based rank of document $d$.

### 6. Persistent State & Convex Ledger
- Every scoring operation records an asynchronous receipt in Convex containing token usage, model identifiers, latency breakdown, and customer metadata tags.
- Provides real-time reactive observability into latency and NDCG metrics.

### 7. Module Architecture & Namespacing
Code across Rank is organized into normalized bounded contexts under `lib/{library}/{domainname}/helpers/`:
- **Libraries (`{library}`):** Provider or subsystem layer (`nebius`, `typesafe`, `convex`, `hono`, `treg`, `agentmail`, `fumadocs`, `core`).
- **Domains (`{domainname}`):** Normalized lowercase kebab-case capability bounded contexts (`rerank`, `inference`, `evaluator`, `telemetry`, `registry`, `dispatcher`, `routing`).
- **Helpers (`helpers/`):** Pure internal helper routines re-exported cleanly via `helpers/index.ts` and parent `index.ts`.
- Complete guidelines and anti-patterns: **[Naming & Architecture Conventions](naming-conventions.md)**.
