# Agent Context & RAG Grounding

The brand entity provides the grounding layer for the Convex agent (`@convex-dev/agent`) and inference reranking modules.

## 1. System Prompt Grounding

The compiled brand prompt from `buildBrandSystemPrompt(brand)` is injected as the initial instructions during agent thread initialization:

```ts
import { buildBrandSystemPrompt } from "@/lib/brand/index.js";

const instructions = buildBrandSystemPrompt(brand);
```

## 2. Up-Front Retrieval (RAG Grounding)

Before generating replies or evaluating candidate suitability, `retrieveSourceRefs(brand, queryText)` executes keyword-overlap ranking across indexed brand pages (`brand.sources`).

Matching passages are surfaced with their canonical URL and excerpt, preventing hallucinations and ensuring direct citations.
