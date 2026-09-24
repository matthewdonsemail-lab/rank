import type { BrandEntity, BrandPage, DocBackingMetadata } from "../schema.ts";
import { resolveSitemap } from "../../lib/brand/helpers/sources.ts";

/**
 * Route: GET /api/brand/sources, POST /api/brand/index, DELETE /api/brand/sources
 * Description: Indexed website pages and sitemap resolution for brand RAG grounding.
 * Backed by authoritative documentation in docs/brand/website-indexing.md.
 */
export const docBacking: DocBackingMetadata = {
  docPath: "docs/brand/website-indexing.md",
  specSection: "Sitemap Resolution and Brand Sources",
  specUrl: "https://listeningkit.com/docs/brand/website-indexing",
  requiredFields: ["url", "title", "headings", "text", "status", "fetchedAt"],
  lastVerified: "2026-09-25",
};

export const mockBrandSourcesData: BrandPage[] = [
  {
    url: "https://listeningkit.com",
    title: "Home - Rank by ListeningKit",
    headings: ["Overview", "Why Choose Rank"],
    text: "Rank by ListeningKit delivers ultra-low latency AI ranking on Nebius infrastructure. Every request is metered and verified.",
    status: "indexed",
    fetchedAt: "2026-09-25T00:00:00.000Z",
  },
  {
    url: "https://listeningkit.com/services",
    title: "Services - Rank by ListeningKit",
    headings: ["Inference", "Reranking"],
    text: "Services include cross-encoder scoring, reciprocal rank fusion, and benchmark evaluations with zero hidden fees.",
    status: "indexed",
    fetchedAt: "2026-09-25T00:00:00.000Z",
  },
  {
    url: "https://listeningkit.com/about",
    title: "About - Rank by ListeningKit",
    headings: ["Architecture", "Engineering"],
    text: "Engineered for high-throughput candidate evaluation with Nebius AI Studio and Convex components.",
    status: "indexed",
    fetchedAt: "2026-09-25T00:00:00.000Z",
  },
  {
    url: "https://listeningkit.com/contact",
    title: "Contact - Rank by ListeningKit",
    headings: ["Support", "Enterprise Inquiries"],
    text: "Reach the engineering team 24/7 for dedicated cluster provisioning and SLA support.",
    status: "indexed",
    fetchedAt: "2026-09-25T00:00:00.000Z",
  },
];

export function handleGetBrandSources(brand: BrandEntity | null): { sources: BrandPage[] } {
  return { sources: brand?.sources ?? [] };
}

export function handlePostBrandIndex(
  body: { urls?: string[]; sitemap?: boolean },
  brand: BrandEntity | null
): { brand: BrandEntity; sources: BrandPage[] } {
  if (!brand) {
    throw new Error("No brand yet - complete onboarding first");
  }
  const seen = new Set(brand.sources.map((page) => page.url));
  const next: BrandPage[] = [...brand.sources];

  if (body && Array.isArray(body.urls)) {
    for (const url of body.urls) {
      if (typeof url !== "string" || !url.trim() || seen.has(url.trim())) continue;
      seen.add(url.trim());
      next.push({
        url: url.trim(),
        title: url.trim(),
        headings: [],
        text: "",
        status: "pending",
        fetchedAt: new Date().toISOString(),
      });
    }
  } else {
    const site = brand.identity.website || brand.sourceUrl || "https://listeningkit.com";
    const name = brand.identity.name || "Rank by ListeningKit";
    for (const page of resolveSitemap(site, name)) {
      if (seen.has(page.url)) continue;
      seen.add(page.url);
      next.push(page);
    }
  }

  const updatedBrand: BrandEntity = {
    ...brand,
    sources: next,
    updatedAt: new Date().toISOString(),
  };

  return { brand: updatedBrand, sources: next };
}

export function handleDeleteBrandSource(
  url: string,
  brand: BrandEntity | null
): { brand: BrandEntity; sources: BrandPage[] } {
  if (!brand) {
    throw new Error("No brand yet - complete onboarding first");
  }
  const remaining = brand.sources.filter((page) => page.url !== url);
  const updatedBrand: BrandEntity = {
    ...brand,
    sources: remaining,
    updatedAt: new Date().toISOString(),
  };
  return { brand: updatedBrand, sources: remaining };
}
