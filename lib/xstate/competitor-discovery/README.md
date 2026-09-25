# Competitor Discovery Machine

`competitorDiscoveryMachine` is the XState v6 contract for competitor retrieval after a completed brand enrichment run.

## Flow

```text
idle → discovering → normalizing → completed
          ↘ failed ↙
failed → discovering (RETRY)
active states → cancelled
```

The Convex action owns authentication and Treg calls. The current allowlist is:

- `spyfu.google.domain.competitors`
- `serpstat.google.domain.competitors`
- `seranking.google.domain.competitors`

The persisted context contains the source domain, provider endpoint, bounded candidates, normalized candidates, attempt count, error, and timestamps. A completed run with zero usable candidates is valid.

## Entry points

- `startCompetitorDiscovery`
- `advanceCompetitorDiscovery`
- `retryCompetitorDiscovery`
- `cancelCompetitorDiscovery`
- `getCompetitorDiscovery`
- `listCompetitorDiscoveryRuns`

The machine test is `machine.test.ts`; the generated inventory is maintained in `docs/xstate/machines.md`.
