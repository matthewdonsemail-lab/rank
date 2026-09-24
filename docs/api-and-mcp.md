# API & MCP Reference

> REST API and Model Context Protocol (MCP) server endpoints for **Rank by ListeningKit**.

---

## Base URLs

- **Production API:** `https://rank.listeningkit.com/api`
- **Local Development:** `http://localhost:3000/api`

---

## Authentication

Include your API key as a Bearer token in the `Authorization` header:

```http
Authorization: Bearer sk-rank-your_api_key_here
```

---

## REST Endpoints

### 1. `POST /v1/rerank`

Score and rank candidate web pages, roundups, and articles against a brand content asset or citation query.

#### Request Body

```json
{
  "query": "Guide to low-latency AI inference routing and GPU cross-encoders: benchmarks, memory optimization, and TTFT metrics",
  "candidates": [
    {
      "id": "prospect_01",
      "text": "Engineering deep dive on optimizing LLM inference pipelines with cross-encoders and model decision routers."
    },
    {
      "id": "prospect_02",
      "text": "Weekend guide to the best artisanal bakeries and cafes in central Dublin."
    },
    {
      "id": "prospect_03",
      "text": "Curated list of AI developer tools, benchmarking frameworks, and high-performance inference servers."
    }
  ],
  "top_k": 2,
  "model": "BAAI/bge-reranker-v2-m3"
}
```

#### Response (`200 OK`)

```json
{
  "results": [
    {
      "index": 0,
      "id": "prospect_01",
      "score": 0.9842,
      "text": "Engineering deep dive on optimizing LLM inference pipelines with cross-encoders and model decision routers."
    },
    {
      "index": 2,
      "id": "prospect_03",
      "score": 0.8915,
      "text": "Curated list of AI developer tools, benchmarking frameworks, and high-performance inference servers."
    }
  ],
  "meta": {
    "model": "BAAI/bge-reranker-v2-m3",
    "latency_ms": 14.2,
    "tokens_evaluated": 118,
    "cached": false
  }
}
```

---

### 2. `POST /v1/evaluate`

Evaluate backlink prospect suitability, PBN/spam indicators, or editorial angles using TypeSafe System One (Jev).

#### Request Body

```json
{
  "state": "Target site is a tech publication with 45k monthly organic visitors covering AI infrastructure. Article discusses open-weights rerankers.",
  "questions": {
    "is_real_publication": { "type": "noul", "instructions": "Is this a genuine publication rather than a PBN or link farm?" },
    "fit_quality": { "type": "score", "instructions": "Rate editorial citation fit quality", "criteria": ["low", "medium", "high"] }
  }
}
```

#### Response (`200 OK`)

```json
{
  "answers": {
    "is_real_publication": { "noul": 0.992, "confidence": 0.98 },
    "fit_quality": { "score": "high", "confidence": 0.94 }
  },
  "request_id": "req_881fbc"
}
```

---

## Model Context Protocol (MCP) Server

Connect your AI coding assistants (Claude Code, Cursor, Codex) directly to your live link-building pipeline:

### MCP Server Config (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "rank": {
      "command": "npx",
      "args": ["-y", "@listeningkit/rank-mcp"],
      "env": {
        "RANK_API_KEY": "sk-rank-..."
      }
    }
  }
}
```

### Available MCP Tools
- `rank_backlink_prospects`: Rerank discovered web articles and resource pages against brand content assets.
- `evaluate_prospect_fit`: Ask structured System One questions with calibrated confidence outputs regarding prospect quality and spam risk.
- `get_opportunity_queue`: Retrieve the active daily backlink opportunities, fit rationales, and outreach drafts.
- `get_pipeline_stats`: Query active campaigns, outreach volume, reply rates, and earned citations.
