export type {
  Crawl,
  CrawlCompletePayload,
  CrawlMode,
  CrawlOptions,
  CrawlStatus,
  CrawledPage,
  DocumentMetadata,
  FirecrawlDocument,
  Format,
  FormatObject,
  FormatString,
  MapLink,
  MapOptions,
  MapResult,
  OnCompleteMutation,
  SearchOptions,
  SearchResponse,
  SearchResult,
  ScrapeOptions,
  StartCrawlArgs,
} from "@firecrawl/firecrawl-convex";

import type { FirecrawlClient } from "@firecrawl/firecrawl-convex";

export type FirecrawlActionContext = Parameters<FirecrawlClient["scrape"]>[0];
export type FirecrawlQueryContext = Parameters<FirecrawlClient["getCrawl"]>[0];
export type FirecrawlMutationContext = Parameters<FirecrawlClient["deleteCrawl"]>[0];
export type FirecrawlComponent = ConstructorParameters<typeof FirecrawlClient>[0];
