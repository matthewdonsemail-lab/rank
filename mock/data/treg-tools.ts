import type { TregTool, DocBackingMetadata } from "../schema.ts";

/**
 * Route: GET /api/treg/tools
 * Description: Catalog of developer tools available through @listeningkit/treg.
 * Backed by authoritative documentation in docs/convex/components/treg/tools.md.
 */
export const docBacking: DocBackingMetadata = {
  docPath: "docs/convex/components/treg/tools.md",
  specSection: "Catalog & Endpoint Selection",
  specUrl: "https://treg.to/catalog",
  requiredFields: ["id", "endpoint", "name", "provider", "category", "approxCostUsd"],
  lastVerified: "2026-09-25",
};

export const mockTregToolsData: TregTool[] = [
  {
    id: "tool_spyfu_competitors",
    endpoint: "spyfu.google.domain.competitors",
    name: "SpyFu Domain Competitors",
    provider: "SpyFu",
    category: "seo",
    approxCostUsd: 0.0002,
    description: "Keyword-overlap ranking and SEO competitor discovery across search engines.",
  },
  {
    id: "tool_seranking_competitors",
    endpoint: "seranking.google.domain.competitors",
    name: "SE Ranking Competitors",
    provider: "SE Ranking",
    category: "seo",
    approxCostUsd: 0.0179,
    description: "In-depth organic competitor domain metrics, traffic estimations, and visibility scores.",
  },
  {
    id: "tool_serpstat_serp",
    endpoint: "serpstat.google.domain.competitors",
    name: "Serpstat Competitor Discovery",
    provider: "Serpstat",
    category: "search",
    approxCostUsd: 0.0005,
    description: "Multi-engine SERP scraping and organic keyword domain intersect analysis.",
  },
  {
    id: "tool_brave_search",
    endpoint: "brave.web.search",
    name: "Brave Web Search",
    provider: "Brave",
    category: "web-search",
    approxCostUsd: 0.0008,
    description: "Privacy-focused web index search for real-time agent grounding and passage retrieval.",
  },
];

export function handleGetTregTools(filter?: { category?: string; provider?: string }): TregTool[] {
  let list = mockTregToolsData;
  if (filter?.category) {
    list = list.filter((t) => t.category === filter.category);
  }
  if (filter?.provider) {
    list = list.filter((t) => t.provider.toLowerCase() === filter.provider?.toLowerCase());
  }
  return list;
}
