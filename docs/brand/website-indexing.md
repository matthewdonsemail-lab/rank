# Website Indexing & Source Grounding

Brand sources represent indexed website pages (`BrandPage[]`) that back model responses, candidate matching, and quotation references.

## 1. Sitemap Resolution

`POST /api/brand/index` resolves pages from the website sitemap:
- In mock mode, `seedSourcesFor(website, brandName)` deterministically seeds primary pages: Home, Services, About, and Contact.
- In live mode, the official `@firecrawl/firecrawl-convex` component maps the site and the application stores the returned links.
- Durable Firecrawl crawls are started through the authenticated `convex/firecrawl.ts` boundary and remain reactive through the component.

## 2. Page Status States

- `indexed`: Fully retrieved and available for keyword overlap ranking and citation.
- `pending`: Registered URL awaiting scrape or map resolution.
- `failed`: Errored page preserved without retry loop to protect scraping credits.

## 3. Operations

- `GET /api/brand/sources`: Lists all indexed pages.
- `POST /api/brand/index`: Triggers sitemap resolution or appends explicit URL candidates.
- `DELETE /api/brand/sources`: Removes an indexed page by exact URL.
