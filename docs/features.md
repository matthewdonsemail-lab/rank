# Features Reference

> Feature index and runtime capabilities of **Rank by ListeningKit**.

---

## Core Capabilities

### 1. Cross-Encoder Opportunity Reranking ("Rank")
- **Model Support:** `BAAI/bge-reranker-v2-m3`, `bge-reranker-large`, and custom fine-tuned checkpoints deployed on Nebius AI Studio.
- **Full Cross-Attention:** Computes joint token interactions between candidate web pages and your brand's published articles, research, and offerings rather than isolated embeddings.
- **Calibrated Scoring:** Normalizes logits to an interpretable 0–100 relevance score reflecting placement viability and editorial alignment.

### 2. Live Web Scraping (Never Stale Databases)
- **Real-Time Data:** Discovers opportunities live on every run, ensuring metrics, organic traffic estimates, and contact details reflect the target publication today.
- **Dynamic Angle Discovery:** Identifies newly published roundups, resource directories, and editorial guides as they appear.

### 3. PBN & Link Farm Spam Filter
- **Automated Hygiene:** Evaluates candidate sites against known patterns of private blog networks (PBNs), automated link farms, and zero-traffic ghost sites.
- **Editorial Standards:** Only passes through legitimate publications with real organic traffic and verifiable editorial ownership.

### 4. Plain-Language Fit Rationales & Placement Angles
- **Explainable Scoring:** Every ranked candidate is paired with a clear, concise fit rationale explaining why the page is a suitable placement.
- **Angle Formulation:** Recommends specific editorial angles:
  - *Data/Statistics Citation:* Citing original research or benchmarks published by the brand.
  - *Missing Tool/Alternative:* Pitching inclusion in an existing software roundup or comparison article.
  - *Resource Directory Addition:* Recommending tools or guides for curated reference lists.
  - *Guest Editorial:* Proposing expert contributor articles on topics the publication actively covers.

### 5. Autonomous Outreach & First-Reply Handoff
- **Context-Grounded Pitch Generation:** Powered by `@convex-dev/agent` to draft personalized pitches referencing the author's specific paragraphs and brand citation excerpts.
- **Isolated Sending Pool:** Dispatches via `@agentmail/convex` warmed inboxes, keeping your primary domain reputation completely isolated from cold outreach volume.
- **First-Reply Detection:** Automated follow-ups run autonomously until the prospect replies. The moment a response arrives, automation pauses and routes the conversation to your personal mailbox.

### 6. Monitor-and-Cancel Opportunity Queue
- **Full Visibility:** Daily queue presents target URL, SEO metrics, fit rationale, and generated email draft.
- **User Control:** Cancel any opportunity that is not a fit before it sends; otherwise, outreach proceeds automatically.

### 7. Model Context Protocol (MCP) Server
- **AI Assistant Integration:** Connect Claude Code, Cursor, or Codex directly to your link-building pipeline.
- **Available MCP Tools:** `rank_backlink_prospects`, `evaluate_prospect_fit`, `get_opportunity_queue`, `get_pipeline_stats`.

### 8. Sub-Millisecond Hot-Path Caching & Spend Safety
- **LRU Cache:** In-memory caching for query-candidate signature hashes (`sha256(content_hash + target_url)`).
- **Spend Ceilings:** Enforces optional cost ceilings (`max_cost_usd`) on batch scoring and scraping operations.
