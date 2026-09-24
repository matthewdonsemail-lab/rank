# rank

> High-throughput, ultra-low latency AI ranking & reranking engine built for Nebius AI infrastructure.

---

## ⚡ What's the Craic?

In modern AI architectures—whether semantic search, RAG pipelines, social firehoses, or agentic routing—initial retrieval is only half the battle. Vector databases and keyword lookups surface plausible candidates, but they lack fine-grained nuance.

**`rank`** is a dedicated ranking and reranking microservice and SDK tailored for the **Nebius AI Studio & Cloud** ecosystem. By leveraging Nebius-hosted high-throughput inference endpoints (cross-encoders, open-weights foundation models, and embedding backbones), `rank` elevates candidate quality, optimizes token economy, and delivers scored, calibrated results in milliseconds.

```
Query / Candidates
       │
       ▼
┌──────────────┐
│     rank     │ ◄─── Reciprocal Rank Fusion & Cross-Encoder Pipelines
└──────┬───────┘
       │
       ├─────────────────────────────────┐
       ▼                                 ▼
┌───────────────────────────┐     ┌────────────────────────────┐
│   Nebius AI Studio API    │     │ In-Memory Fast Cache Layer │
│  (Cross-Encoders / LLMs)  │     │   (Sub-ms Frequent Hits)   │
└───────────────────────────┘     └────────────────────────────┘
       │
       ▼
Sorted & Scored Results
```

---

## 🎯 Key Capabilities

- **Cross-Encoder Semantic Reranking:** Precision scoring over retrieved candidate passages, documents, or social posts via Nebius-hosted models.
- **LLM Output & Intent Evaluation:** Rank synthetic candidate completions and agent plans based on intent alignment and safety criteria.
- **Hybrid Fusion Engine:** Combine BM25/lexical scores, dense vector similarity, and cross-encoder logits using Reciprocal Rank Fusion (RRF).
- **Latency & Cost Optimization:** Intelligent token gating, early stopping thresholds, and prompt cache compatibility.
- **Developer-First SDK:** Lightweight, type-safe clients for TypeScript and Python with zero friction setup.

---

## 🛠 Tech Stack & Architecture

- **Compute & Inference:** [Nebius AI Studio](https://nebius.com/)
- **Core Engine:** TypeScript / Node.js & Python
- **Protocols:** REST API & TypeSafe Client SDK
- **Data & Caching:** In-memory LRU / Redis-compatible caching layer

---

## 🚀 Quickstart

### 1. Environment Setup

Copy `.env.example` to `.env` and provide your Nebius AI API credentials:

```bash
cp .env.example .env
```

```env
NEBIUS_API_KEY=your_nebius_api_key_here
NEBIUS_BASE_URL=https://api.studio.nebius.ai/v1
DEFAULT_RANK_MODEL=BAAI/bge-reranker-v2-m3
PORT=3000
```

### 2. Basic Usage

```typescript
import { RankClient } from "./src";

const ranker = new RankClient({
  apiKey: process.env.NEBIUS_API_KEY,
});

const results = await ranker.rank({
  query: "High performance inference on GPU clusters",
  candidates: [
    "Nebius provides specialized NVIDIA H100/H200 infrastructure with ultra-low latency.",
    "Baking sourdough bread requires precise flour-to-water ratios.",
    "Vector search algorithms like HNSW enable fast nearest neighbor searches.",
  ],
  topK: 2,
});

console.log(results);
// [
//   { index: 0, score: 0.982, text: "Nebius provides specialized NVIDIA H100/H200 infrastructure..." },
//   { index: 2, score: 0.741, text: "Vector search algorithms like HNSW..." }
// ]
```

---

## 🗺 Roadmap

- [ ] Initial project skeleton & package configuration
- [ ] Nebius AI Studio adapter client (OpenAI-compatible & custom inference endpoints)
- [ ] Cross-encoder reranking endpoint (`/v1/rerank`)
- [ ] Reciprocal Rank Fusion (RRF) & multi-signal scoring pipelines
- [ ] Benchmarking harness for latency, throughput, and NDCG@10 metrics
- [ ] Live demo dashboard & interactive playground

---

## 📄 License

MIT © [matthewdonsemail-lab](https://github.com/matthewdonsemail-lab)
