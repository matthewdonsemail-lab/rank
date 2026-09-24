# TypeSafe AI Documentation Index

> Local offline copy of documentation from [docs.typesafe.ai](https://docs.typesafe.ai).

TypeSafe AI develops **Jev**, the flagship **System One model**. Unlike standard LLMs that generate freeform text, System One models make fast, structured decisions directly from state and typed questions—returning calibrated probabilities, confidence scores, and structured answers without needing prompt parsing.

---

## 📚 Complete Aggregated References

- **Full Documentation (Single File):** [`llms-full.txt`](./llms-full.txt) (910 KB complete reference across all guides, cookbooks, and SDKs)
- **Index List:** [`llms.txt`](./llms.txt)

---

## 🧭 Documentation Overview & Navigation

### 1. Getting Started & Concepts
- [Introduction](./introduction.md) — What System One is and how typed questions work.
- [Quick Start](./introduction/quickstart.md) — Dive in with installation and first calls.
- [Jev with Coding Agents](./introduction/coding-agents.md) — Using Jev in agentic loops.
- [System One](./concepts/system-one.md) — Philosophy and execution model.
- [State](./concepts/state.md) — How to format state and context.
- [Confidence](./confidence.md) — Understanding certainty vs probability.
- [How to Build with TypeSafe](./concepts/how-to-build-with-system-one.md) — Architecting software around System One.
- [AI Primer](./introduction/machine-learning-primer.md) — Calibrated probabilities vs generative text.

### 2. Primitives (Questions)
- [Primitives Overview](./primitives.md) — The three core question types.
- [Choice](./primitives/choice.md) — Categorical selection from a defined set with confidence.
- [Score](./primitives/score.md) — Rating against ordered, descriptive levels.
- [Noul](./primitives/noul.md) — Calibrated yes/no probability evaluation.
- [Advanced Structures](./primitives/advanced.md) — JSON-structured criteria and instructions.

### 3. Architectural Patterns
- [Patterns Hub](./patterns.md) — Design patterns for production systems.
- [Speculative Fan-Out](./patterns/fan-out.md) — Batch multiple speculative questions in one request.
- [Confidence-Gated Routing](./patterns/confidence-routing.md) — Using confidence as an action threshold.
- [Composite Scoring](./patterns/composite-scoring.md) — Breaking complex judgments into weighted atomic scores.
- [Intent Routing](./patterns/intent-routing.md) — Routing queries to deterministic code, specialist models, or humans.

### 4. Cookbooks & Real-World Pipelines
- [Cookbooks Index](./cookbooks.md)
- [Re-ranking](./cookbooks/rerank_typesafe.md) — Two-stage retrieval: fast search (BM25) + TypeSafe candidate reranking.
- [Parallel Questions](./cookbooks/parallel_questions.md) — High-throughput batching (12.2x cheaper, 10x faster).
- [Line-by-Line Search](./cookbooks/semantic_find.md) — Fine-grained semantic document search.
- [Structure Recovery](./cookbooks/autoformat.md) — Reconstructing Markdown from unstructured text.
- [Function Calling](./cookbooks/function_calling.md) — Deterministic mapping to typed code functions.
- [Skill Suggestion](./cookbooks/skill_suggestion.md) — Selecting optimal tools/skills for agent turns.
- [Entity Alignment](./cookbooks/entity_alignment.md) — Knowledge graph entity deduplication and alignment.
- [Classifying RAG Passages](./cookbooks/classifying_rag_passages.md) — Filtering context passages before LLM generation.
- [Citation Checking](./cookbooks/citation_check.md) — Verifying source quotes and preventing hallucinations.
- [Guardrails for LLMs](./cookbooks/llm_guardrails.md) — Inbound/outbound safety and policy screens.
- [SDE Cascade](./cookbooks/sde_cascade.md) — Structured data extraction cascades.
- [Hierarchical Classification](./cookbooks/hierarchical_classification.md) — Deep taxonomy beam-search classification.

### 5. SDKs & API Reference
- [HTTP API Reference](./api.md) — Full evaluation endpoint REST specification.
- [Models Reference](./models.md) — Available models and capabilities.
- [Python SDK](./sdk/python.md) — Python installation, async/sync clients, and usage patterns.
- [JavaScript / TypeScript SDK](./sdk/javascript.md) — Node/browser SDK reference, classes, and types.
- [Agent Skill Integration](./agent-skill.md) — Drop-in skill for agent environments.
