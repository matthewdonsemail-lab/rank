import { FirecrawlClient } from "@firecrawl/firecrawl-convex";
import type { PaginationOptions, PaginationResult } from "convex/server";
import { normalizeCrawlUrl } from "./helpers/index.js";
import type {
  Crawl,
  CrawlCompletePayload,
  CrawlMode,
  CrawlOptions,
  CrawledPage,
  FirecrawlActionContext,
  FirecrawlComponent,
  FirecrawlDocument,
  FirecrawlMutationContext,
  FirecrawlQueryContext,
  MapOptions,
  MapResult,
  SearchOptions,
  SearchResponse,
  ScrapeOptions,
  StartCrawlArgs,
} from "./types.js";

export class FirecrawlCrawlClient {
  private readonly client: FirecrawlClient;

  constructor(client: FirecrawlClient) {
    this.client = client;
  }

  static fromComponent(component: FirecrawlComponent): FirecrawlCrawlClient {
    return new FirecrawlCrawlClient(new FirecrawlClient(component));
  }

  scrape(ctx: FirecrawlActionContext, url: string, options?: ScrapeOptions): Promise<FirecrawlDocument> {
    const normalized = normalizeCrawlUrl(url);
    if (!normalized.ok) throw new Error(normalized.reason);
    return this.client.scrape(ctx, normalized.url, options);
  }

  map(ctx: FirecrawlActionContext, url: string, options?: MapOptions): Promise<MapResult> {
    const normalized = normalizeCrawlUrl(url);
    if (!normalized.ok) throw new Error(normalized.reason);
    return this.client.map(ctx, normalized.url, options);
  }

  search(ctx: FirecrawlActionContext, query: string, options?: SearchOptions): Promise<SearchResponse> {
    return this.client.search(ctx, query, options);
  }

  startCrawl(ctx: FirecrawlActionContext, args: StartCrawlArgs): Promise<{ crawlId: string; jobId: string }> {
    const normalized = normalizeCrawlUrl(args.url);
    if (!normalized.ok) throw new Error(normalized.reason);
    return this.client.startCrawl(ctx, { ...args, url: normalized.url });
  }

  getCrawl(ctx: FirecrawlQueryContext, crawlId: string): Promise<Crawl | null> {
    return this.client.getCrawl(ctx, crawlId);
  }

  getPage(ctx: FirecrawlQueryContext, args: { crawlId: string; url: string }): Promise<CrawledPage | null> {
    return this.client.getPage(ctx, args);
  }

  listPages(
    ctx: FirecrawlQueryContext,
    args: { crawlId: string; paginationOpts: PaginationOptions },
  ): Promise<PaginationResult<CrawledPage>> {
    return this.client.listPages(ctx, args);
  }

  cancelCrawl(ctx: FirecrawlActionContext, crawlId: string): Promise<null> {
    return this.client.cancelCrawl(ctx, crawlId);
  }

  deleteCrawl(ctx: FirecrawlMutationContext, crawlId: string): Promise<null> {
    return this.client.deleteCrawl(ctx, crawlId);
  }

  resumeCrawl(ctx: FirecrawlMutationContext, crawlId: string): Promise<boolean> {
    return this.client.resumeCrawl(ctx, crawlId);
  }
}

export type { CrawlCompletePayload, CrawlMode, CrawlOptions };
