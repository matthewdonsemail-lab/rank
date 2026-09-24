# Architecture & Flow Diagrams

This directory contains domain-separated Mermaid diagrams documenting the **Rank by ListeningKit** architecture, retrieval and reranking pipelines, data model, and security flows. Each diagram is maintained as a standalone `.mmd` file for modularity and rendered below with documentation.

---

## 📊 Table of Diagrams

| Domain | Diagram | Source File | Description |
|---|---|---|---|
| **System** | [System Overview](#1-system-overview) | [`system-overview.mmd`](system-overview.mmd) | High-level topology across web clients, AI agents, caching, Nebius Studio, TypeSafe, and Convex |
| **Pipeline** | [Two-Stage Ranking Pipeline](#2-two-stage-ranking-pipeline) | [`ranking-pipeline.mmd`](ranking-pipeline.mmd) | Fast candidate retrieval into precision cross-encoder re-ranking with in-memory caching |
| **Data Model** | [Entity Relationship Diagram](#3-data-model-erd) | [`data-model-erd.mmd`](data-model-erd.mmd) | Schema entities for Workspaces, API Keys, Rank Sessions, Candidates, Receipts, and Models |
| **Security** | [API Key Auth & Execution Flow](#4-api-key-auth--execution-flow) | [`api-auth-sequence.mmd`](api-auth-sequence.mmd) | Client request validation, SHA-256 key check, cache lookup, Nebius relay, and async billing ledger |
| **Scoring** | [Reciprocal Rank Fusion Flow](#5-reciprocal-rank-fusion-flow) | [`rrf-fusion-flow.mmd`](rrf-fusion-flow.mmd) | Multi-signal rank aggregation combining BM25, dense embeddings, and cross-encoders |

---

### 1. System Overview

**File:** [`system-overview.mmd`](system-overview.mmd)

```mermaid
flowchart LR
  subgraph clients["Clients & Upstreams"]
    APP["Web Application<br/>(rank.listeningkit.com)"]
    AGENT["AI Coding Agents<br/>(Cursor, Claude, MCP)"]
    SEARCH["Search / RAG Engines<br/>(Vector DB, BM25)"]
  end

  subgraph rank["Rank Core Engine"]
    GATEWAY["API Gateway / Hono Router<br/>Auth & Rate Limiting"]
    CACHE[("In-Memory Fast Cache<br/>LRU / Exact Query Hits")]
    FUSION["Reciprocal Rank Fusion<br/>Multi-Signal Combiner"]
    ROUTER["Model & Inference Router<br/>Cost & Latency Balancer"]
  end

  subgraph backends["Inference Backends"]
    NEBIUS["Nebius AI Studio<br/>(BGE-Reranker, Llama-3.3, DeepSeek)"]
    TYPESAFE["TypeSafe AI (Jev)<br/>(System One Decisions & Calibration)"]
    TREG["treg.to Proxy<br/>(External Provider Catalog)"]
  end

  subgraph storage["Persistent Storage"]
    CX[("Convex Cloud<br/>Queries, Mutations & Receipts")]
  end

  APP & AGENT & SEARCH --> GATEWAY
  GATEWAY <--> CACHE
  GATEWAY --> FUSION
  FUSION --> ROUTER
  ROUTER --> NEBIUS
  ROUTER --> TYPESAFE
  ROUTER --> TREG
  GATEWAY <--> CX
```

---

### 2. Two-Stage Ranking Pipeline

**File:** [`ranking-pipeline.mmd`](ranking-pipeline.mmd)

```mermaid
flowchart TD
  Q["Incoming Query + Candidate Corpus"] --> FAST["1. Fast Search (BM25 / Vector Search)"]
  FAST --> SHORTLIST["Shortlist of N Candidates (e.g. N=30)"]
  SHORTLIST --> CACHE_CHECK{"Cache Hit?"}
  CACHE_CHECK -- "Yes" --> CACHED_SCORES["Return Cached Logits / Scores"]
  CACHE_CHECK -- "No" --> DISPATCH["2. Precision Scoring Dispatch"]
  
  subgraph scoring["Inference Gating"]
    DISPATCH --> CE["Nebius Cross-Encoder<br/>(BAAI/bge-reranker-v2-m3)"]
    DISPATCH --> S1["TypeSafe System One (Jev)<br/>(Confidence + Typed Primitives)"]
  end

  CE --> RRF["3. Reciprocal Rank Fusion & Normalization"]
  S1 --> RRF
  CACHED_SCORES --> RRF
  RRF --> TOPK["4. Calibrated Top-K Results + Explanations"]
```

---

### 3. Data Model ERD

**File:** [`data-model-erd.mmd`](data-model-erd.mmd)

```mermaid
erDiagram
  WORKSPACE ||--o{ API_KEY : owns
  WORKSPACE ||--o{ RANK_SESSION : executes
  WORKSPACE ||--o{ BENCHMARK_RUN : tracks

  RANK_SESSION ||--|{ CANDIDATE : contains
  RANK_SESSION ||--o{ RECEIPT : incurs
  RANK_SESSION }|..|| MODEL_CONFIG : uses

  WORKSPACE {
    string id PK
    string name
    string slug
    string plan
    datetime createdAt
  }

  API_KEY {
    string id PK
    string workspaceId FK
    string hashedSecret
    string label
    string[] scopes
    datetime lastUsedAt
  }

  RANK_SESSION {
    string id PK
    string workspaceId FK
    string query
    string strategy
    int candidateCount
    float latencyMs
    datetime createdAt
  }

  CANDIDATE {
    string id PK
    string sessionId FK
    string externalId
    string text
    float initialScore
    float rerankScore
    float confidence
    int finalRank
  }

  RECEIPT {
    string id PK
    string sessionId FK
    string provider
    string model
    int tokensUsed
    float costUsd
    datetime timestamp
  }

  MODEL_CONFIG {
    string id PK
    string provider
    string modelId
    float costPer1kTokens
    int maxContextLength
    boolean isDefault
  }

  BENCHMARK_RUN {
    string id PK
    string workspaceId FK
    string dataset
    float ndcg10
    float mrr
    float avgLatencyMs
    datetime completedAt
  }
```

---

### 4. API Key Auth & Execution Flow

**File:** [`api-auth-sequence.mmd`](api-auth-sequence.mmd)

```mermaid
sequenceDiagram
  autonumber
  actor Client as Client / Agent
  participant Gateway as API Gateway (Hono)
  participant Auth as Auth & Rate Limiter
  participant Cache as Fast LRU Cache
  participant Nebius as Nebius AI Studio
  participant Storage as Convex Ledger

  Client->>Gateway: POST /v1/rerank (Bearer sk-rank-...)
  Gateway->>Auth: Validate API Key & Scopes
  Auth-->>Gateway: Key Valid (Workspace: ws_123)
  
  Gateway->>Cache: Lookup hash(query + candidates)
  alt Cache Hit
    Cache-->>Gateway: Return Scored Results (sub-ms)
  else Cache Miss
    Gateway->>Nebius: POST /v1/rerank (Cross-Encoder Batch)
    Nebius-->>Gateway: Raw Logits & Softmax Probs
    Gateway->>Cache: Store Scored Results
    Gateway->)Storage: Record Receipt & Token Telemetry (Async)
  end

  Gateway-->>Client: 200 OK (Ranked Candidates + Metadata)
```

---

### 5. Reciprocal Rank Fusion Flow

**File:** [`rrf-fusion-flow.mmd`](rrf-fusion-flow.mmd)

```mermaid
flowchart TD
  Q["Search Query"] --> BM25["BM25 Lexical Search"]
  Q --> EMB["Dense Vector Embeddings"]
  Q --> S1["TypeSafe Intent Classifier"]

  BM25 --> R1["Rank List 1: Lexical Scores"]
  EMB --> R2["Rank List 2: Cosine Similarity"]
  S1 --> R3["Rank List 3: Confidence Weights"]

  R1 --> RRF["Reciprocal Rank Fusion (RRF)<br/>Score = Σ ( weight_i / (k + rank_i) )"]
  R2 --> RRF
  R3 --> RRF

  RRF --> FUSED["Fused Top Candidates"]
  FUSED --> CE["Nebius Cross-Encoder Re-ranker"]
  CE --> FINAL["Final Scored & Calibrated Output"]
```
