# API & MCP Reference

> REST API and Model Context Protocol (MCP) server endpoints for **Rank by ListeningKit**.

---

## 🌐 Base URLs

- **Production API:** `https://rank.listeningkit.com/api`
- **Local Development:** `http://localhost:3000/api`

---

## 🔑 Authentication

Include your API key as a Bearer token in the `Authorization` header:

```http
Authorization: Bearer sk-rank-your_api_key_here
```

---

## 📡 REST Endpoints

### 1. `POST /v1/rerank`

Score and sort a list of candidate documents or strings against a query.

#### Request Body

```json
{
  "query": "GPU inference latency benchmarks on NVIDIA H100",
  "candidates": [
    { "id": "doc_1", "text": "Nebius provides bare-metal and managed H100 clusters with high throughput." },
    { "id": "doc_2", "text": "Sourdough bread fermentation requires wild yeast culture." },
    { "id": "doc_3", "text": "Benchmarking LLM inference across vLLM and TensorRT-LLM." }
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
      "id": "doc_1",
      "score": 0.9842,
      "text": "Nebius provides bare-metal and managed H100 clusters with high throughput."
    },
    {
      "index": 2,
      "id": "doc_3",
      "score": 0.8915,
      "text": "Benchmarking LLM inference across vLLM and TensorRT-LLM."
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

Evaluate a candidate or decision using TypeSafe System One (Jev).

#### Request Body

```json
{
  "state": "User reported their card was billed twice for annual subscription.",
  "questions": {
    "is_billing": { "type": "noul", "instructions": "Is this inquiry related to billing?" },
    "urgency": { "type": "score", "instructions": "Rate urgency", "criteria": ["low", "medium", "high"] }
  }
}
```

#### Response (`200 OK`)

```json
{
  "answers": {
    "is_billing": { "noul": 0.992, "confidence": 0.98 },
    "urgency": { "score": "high", "confidence": 0.94 }
  },
  "request_id": "req_881fbc"
}
```

---

## 🤖 Model Context Protocol (MCP) Server

Connect your AI coding assistants (Claude Code, Cursor, Codex) directly to Rank:

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
- `rank_candidates`: Rerank arbitrary texts or structured records against a search prompt.
- `evaluate_decision`: Ask structured System One questions with calibrated confidence outputs.
- `model_benchmark`: Compare latency and score quality across Nebius model endpoints.
