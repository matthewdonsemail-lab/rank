# Website Indexing and Sources

`BrandPage[]` records are the structured source list used by brand context helpers.

## Source operations

- `BrandClient.indexSources()` appends explicit URLs or asks the configured sitemap boundary for candidates.
- `BrandClient.getSources()` lists indexed pages.
- `BrandClient.removeSource()` removes a page by exact URL.
- `resolveSitemap()` and `seedSourcesFor()` provide the domain helpers used by the mock path and source indexing flow.

## Page status

- `indexed`: The page is available to source-reference helpers.
- `pending`: The URL is registered but not yet available as indexed content.
- `failed`: The page remains recorded with its failure state.

The Convex Firecrawl boundary is used by the enrichment machine. Source indexing and page extraction are separate operations, and the brand helpers do not assume that every page has been fetched.
