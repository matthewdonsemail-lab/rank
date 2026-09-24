# Features Reference

> Feature index and runtime capabilities of **Rank by ListeningKit**.

---

## Core Capabilities

### 1. Cross-Encoder Semantic Reranking
- **Model Support:** `BAAI/bge-reranker-v2-m3`, `bge-reranker-large`, and custom fine-tuned checkpoints deployed on Nebius AI Studio.
- **Full Cross-Attention:** Computes direct query-document interactions rather than isolated vector dot-products.
- **Top-K Truncation:** Returns scored and sorted candidates with normalized probabilities.

### 2. Multi-Signal Hybrid Search & Fusion
- Combines sparse lexical matches (BM25) with dense embeddings and cross-encoder logits.
- Built-in **Reciprocal Rank Fusion (RRF)** ensures robust performance across varied query domains (legal, code, product catalogs, social conversations).

### 3. System One Intent & Confidence Gating
- Powered by TypeSafe's **Jev** model.
- Returns **Confidence** alongside scores, allowing applications to:
  - Automatically route high-confidence answers.
  - Escalate low-confidence ambiguous queries to reasoning models or human verification.
  - Filter out hallucinated or irrelevant passages before passing them to LLM generation prompts.

### 4. Sub-Millisecond Exact Match Caching
- High-performance LRU cache for query-candidate signature hashes (`sha256(query + candidate_ids)`).
- Sub-millisecond latency on repeated queries or common hot-path search terms.

### 5. Spend Safety & Cost Ceilings
- Every ranking session enforces an optional cost ceiling (`max_cost_usd`).
- Idempotency keys (`Idempotency-Key`) ensure network retries never incur duplicate inference charges.

### 6. Model Context Protocol (MCP) Server
- Turn-key MCP tools (`rank_candidates`, `rerank_search_results`, `evaluate_decision`) for Claude Code, Cursor, Codex, and agent frameworks.
