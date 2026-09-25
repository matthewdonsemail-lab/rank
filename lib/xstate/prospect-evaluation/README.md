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
