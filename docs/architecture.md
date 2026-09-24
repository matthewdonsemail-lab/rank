# Architecture Reference

> Technical design, data models, and system topology for **Rank by ListeningKit**.

---

## 🏛 System Overview

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

## 🧩 Core Subsystems

### 1. Ingestion & API Gateway
- **HTTP Routing:** Type-safe Hono API routing requests for `/v1/rank`, `/v1/rerank`, and `/v1/evaluate`.
- **Authentication:** SHA-256 hashed API token authorization matching keys against the workspace registry in Convex.
- **Rate Limiting & Safety:** Adaptive concurrency controls to respect downstream provider rate ceilings.

### 2. The Two-Stage Retrieval Paradigm
1. **Stage 1: Fast Candidate Retrieval**
   - High-throughput vector search (dense embeddings) or BM25 keyword matching cuts a large corpus (thousands to millions of items) down to a manageable shortlist of 20–100 candidates.
2. **Stage 2: Cross-Encoder Precision Reranking**
   - The query and each candidate passage are concatenated and scored jointly through a cross-encoder model (e.g. `BAAI/bge-reranker-v2-m3` on Nebius AI Studio) to compute true contextual cross-attention logits.

### 3. TypeSafe AI (System One) Evaluator
- Integrates with TypeSafe's **Jev** System One model to evaluate typed questions (Choice, Score, Noul) without freeform text generation.
- Returns calibrated probability distributions and confidence scores used for intent routing and threshold gating.

### 4. Reciprocal Rank Fusion (RRF)
Combines signals across multiple rank lists into a unified score using:
$$RRF(d) = \sum_{m \in M} \frac{w_m}{k + r_m(d)}$$
where $k$ is a smoothing constant (default: 60), $w_m$ is the weight of model $m$, and $r_m(d)$ is the 1-based rank of document $d$.

### 5. Persistent State & Convex Ledger
- Every scoring operation records an asynchronous receipt in Convex containing token usage, model identifiers, latency breakdown, and customer metadata tags.
- Provides real-time reactive observability into latency and NDCG metrics.
