# Brand Enrichment Machine

`brandEnrichmentMachine` is the XState v6 contract used by the Convex enrichment action.

## Flow

```text
idle → mapping → scraping → extracting → completed
          -> failed <-
failed → mapping (RETRY)
active states → cancelled
```

The machine is version `1`. Its context contains the owner, source URL, bounded mapped URLs, scraped documents, extracted facts, error, attempt count, and timestamps.

Convex performs authentication, Firecrawl calls, persistence, and ownership checks. The machine receives only typed success or failure events and contains no provider client or secret.

## Entry points

- `startBrandEnrichment`
- `advanceBrandEnrichment`
- `retryBrandEnrichment`
- `cancelBrandEnrichment`
- `getBrandEnrichment`
- `listBrandEnrichmentRuns`

The machine test is `machine.test.ts`. The generated project inventory is maintained in `docs/xstate/machines.md`.
