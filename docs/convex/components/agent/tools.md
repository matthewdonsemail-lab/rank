# Agent Tool Calling & Integration

How to register custom domain tools into the Convex Agent Component.

---

## Tool Calling Pattern

The Agent component executes tools defined with standard parameter schemas. In Rank, we connect our core reranking and evaluation engines directly as agent tools:

```typescript
// convex/agentTools.ts
import { action } from "./_generated/server.js";
import { v } from "convex/values";
import { NebiusRerankClient } from "../lib/nebius/rerank/index.js";
import { TypeSafeEvaluator } from "../lib/typesafe/evaluator/index.js";

const reranker = new NebiusRerankClient();
const evaluator = new TypeSafeEvaluator();

export const rerankTool = {
  name: "rerankCandidates",
  description: "Rerank candidate passages against a search query using Nebius cross-encoders.",
  parameters: v.object({
    query: v.string(),
    candidates: v.array(v.string()),
    topK: v.optional(v.number()),
  }),
  execute: async (ctx: any, args: { query: string; candidates: string[]; topK?: number }) => {
    const results = await reranker.rerank({
      query: args.query,
      candidates: args.candidates,
      topK: args.topK,
    });
    return results;
  },
};

export const evaluateDecisionTool = {
  name: "evaluateDecision",
  description: "Evaluate a typed choice or classification with calibrated confidence scores.",
  parameters: v.object({
    question: v.string(),
    options: v.array(v.object({ id: v.string(), label: v.string() })),
  }),
  execute: async (ctx: any, args: { question: string; options: { id: string; label: string }[] }) => {
    const evaluation = await evaluator.evaluate({
      type: "Choice",
      question: args.question,
      options: args.options,
    });
    return evaluation;
  },
};
```

---

## Tool Execution Guarantees

1. **Transactional Boundaries:** Tool actions can read from or write to the primary Convex database using standard `ctx.runQuery` and `ctx.runMutation`.
2. **Deterministic Fallbacks:** When downstream GPU APIs encounter rate limits, tool execution gracefully handles error reporting so the agent can select fallback providers.
3. **Receipt Generation:** Every tool invocation automatically logs duration and token counts for auditing.
