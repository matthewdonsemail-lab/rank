# Firecrawl Crawl Domain

This domain wraps the official `@firecrawl/firecrawl-convex` component for application code. The component owns durable crawl state, page storage, webhook handling, and Firecrawl API calls; the application owns authentication, authorization, URL policy, and business persistence.

## Responsibilities

- Scrape one public URL into markdown, HTML, screenshots, summaries, or structured JSON.
- Map URLs on a site.
- Search the web with optional result scraping.
- Start and observe durable site crawls.
- Read paginated crawl pages.
- Cancel, delete, or resume crawls.

The wrapper is intentionally small. It normalizes crawl URLs and delegates the component protocol instead of duplicating Firecrawl API behavior.

## Installation

The package is pinned in the project dependencies:

```text
@firecrawl/firecrawl-convex@0.1.1
```

The component is mounted in `convex/convex.config.ts` as `components.firecrawl` with the `/firecrawl/` webhook prefix.

## Environment

Set the values on the Convex deployment:

```bash
npx convex env set FIRECRAWL_API_KEY fc-your-key
npx convex env set FIRECRAWL_WEBHOOK_SECRET whsec-your-secret
```

`FIRECRAWL_API_URL` is optional and can point to a self-hosted Firecrawl instance. `FIRECRAWL_WEBHOOK_SECRET` is optional for the component but required for signed webhook verification when webhook mode is used.

## Application boundary

Do not expose component functions directly to clients. Convex components cannot read the application’s `ctx.auth`, so paid operations must be wrapped by app-owned actions that:

1. Require an authenticated identity.
2. Validate the requested URL and crawl limits.
3. Check workspace ownership for crawl IDs.
4. Apply rate, credit, and concurrency policy.
5. Persist only application-specific references and context.

The app-level wrapper is `convex/firecrawl.ts`. The reusable domain client is `lib/firecrawl/crawl/client.ts`.

## Usage

```ts
import { FirecrawlClient } from "@firecrawl/firecrawl-convex";
import { components } from "./_generated/api.js";
import { FirecrawlCrawlClient } from "../lib/firecrawl/crawl/index.js";

const firecrawl = FirecrawlCrawlClient.fromComponent(components.firecrawl);
const page = await firecrawl.scrape(ctx, "https://example.com", {
  formats: ["markdown"],
  onlyMainContent: true,
});
```

Start a durable crawl from an authenticated action:

```ts
const result = await firecrawl.startCrawl(ctx, {
  url: "https://example.com",
  options: {
    limit: 50,
    includePaths: ["^/docs/.*"],
    scrapeOptions: { formats: ["markdown"], onlyMainContent: true },
  },
  onComplete: internal.firecrawl.onCrawlComplete,
  context: { workspaceId },
});
```

Use `getCrawl` for progress and `listPages` for paginated page data. A terminal crawl has status `completed`, `failed`, or `cancelled`; `isTerminalCrawlStatus` centralizes that check.

## Webhook and local development

Webhook mode is the default for a reachable Convex deployment and uses Firecrawl callbacks at `/firecrawl/webhook`. Use `mode: "poll"` for local or network-isolated development when Firecrawl cannot reach the deployment.

## Operational rules

- Cap crawl limits and page content before starting a job.
- Use an internal completion mutation for application processing.
- Store workspace ownership alongside every app-level crawl reference.
- Never accept an API key or component function reference from a client.
- Do not assume every page was stored; inspect `unstored` and `truncated`.
- Treat Firecrawl credits and crawl concurrency as billable resources.
- Preserve source URLs and timestamps when copying component pages into application tables.
- Do not send raw Firecrawl responses to clients when they contain unnecessary metadata.

## Testing

Use the component’s test registration helper with `convex-test` and stub `fetch` for Firecrawl responses. Cover:

- URL rejection for private, malformed, and non-HTTP targets.
- Authentication and workspace ownership on every app endpoint.
- Webhook signature failures.
- Crawl start, progress, terminal callback, cancellation, and pagination.
- Truncated or unstored pages.
- Retry and rate-limit behavior without making real paid requests.
