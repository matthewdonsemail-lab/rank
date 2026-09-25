import type { FirecrawlDocument } from "../../../firecrawl/crawl/index.js";
import type { EnrichmentDocument, EnrichmentFacts } from "../types.js";

const MAX_MARKDOWN_EXCERPT_LENGTH = 12_000;

function textValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

export function toEnrichmentDocument(
  url: string,
  document: FirecrawlDocument,
  facts: EnrichmentFacts | null,
): EnrichmentDocument {
  const markdown = typeof document.markdown === "string" ? document.markdown : "";
  return {
    url,
    title: textValue(document.metadata?.title),
    description: textValue(document.metadata?.description),
    markdownExcerpt: markdown.slice(0, MAX_MARKDOWN_EXCERPT_LENGTH),
    facts,
  };
}
