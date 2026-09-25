# Prospect Evaluation Machine

`prospectEvaluationMachine` is the XState v6 contract for TypeSafe prospect decisions.

## Flow

```text
idle → evaluating → completed
          ↘ failed ↙
failed → evaluating (RETRY)
active states → cancelled
```

The Convex action restores the prospect, calls `TypeSafeEvaluator.judgeProspect()`, and sends `JUDGMENT_READY` or `EVALUATION_FAILED`. The persisted judgment is one of `act`, `review`, or `drop`; dropped records remain available for audit.

`startCompetitorProspectEvaluations` ranks the discovered candidates before it judges any of them: it loads the brand facts from the source enrichment run, reranks every candidate with `NebiusRerankClient`, and evaluates only the best `limit` (default 10, at most 25). Each prospect stores `metrics.rerankScore` and `metrics.rerankStatus` (`ranked`, `skipped` or `failed`). Without `NEBIUS_API_KEY`, without brand facts, or when Nebius fails, the candidates keep discovery order and the status says so. Before ranking, it reads each candidate's homepage with Firecrawl (`readHomepages`, default on; at most 25 pages per run, 5 at a time, 20 seconds each, one Firecrawl credit per page) and gives the reranker the page title, description and the start of its text. A page that cannot be read is ranked on the name, domain and shared-term count alone. The description and excerpt are also stored on the prospect (`description`, `content`) so TypeSafe judges what the site says, and `metrics.homepageRead` records whether the page was read. Pass `readHomepages: false` to skip the reads and their cost.

The context contains the owner, optional discovery run ID, prospect payload, judgment, error, attempt count, and timestamps. Provider clients and secrets never enter context.

## Entry points

- `startProspectEvaluation`
- `startCompetitorProspectEvaluations`
- `advanceProspectEvaluation`
- `retryProspectEvaluation`
- `cancelProspectEvaluation`
- `getProspectEvaluation`
- `listActiveProspects`
- `listReviewProspects`
- `listDroppedProspects`
- `listProspectEvaluationRuns`

The machine test is `machine.test.ts`; the generated inventory is maintained in `docs/xstate/machines.md`.
