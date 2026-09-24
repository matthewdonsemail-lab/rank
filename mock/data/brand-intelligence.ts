import type { BrandEntity, CommunityPick, DocBackingMetadata } from "../schema.ts";
import { isCommunityPick } from "../../lib/brand/types.ts";

/**
 * Route: POST /api/brand/intelligence
 * Description: Discovery enrichment for competitor domains, target communities, and selected keywords.
 * Backed by authoritative documentation in docs/brand/README.md.
 */
export const docBacking: DocBackingMetadata = {
  docPath: "docs/brand/README.md",
  specSection: "Brand Intelligence & Discovery",
  specUrl: "https://listeningkit.com/docs/brand#intelligence",
  requiredFields: ["competitors", "targetCommunities"],
  lastVerified: "2026-09-25",
};

export interface BrandIntelligenceInput {
  competitors?: string[];
  targetCommunities?: CommunityPick[];
  selectedKeyword?: string;
}

export function handlePostBrandIntelligence(
  body: BrandIntelligenceInput,
  brand: BrandEntity | null
): { brand: BrandEntity } {
  if (!brand) {
    throw new Error("No brand yet - complete onboarding first");
  }

  const competitors = [...brand.intelligence.competitors];
  for (const domain of body.competitors ?? []) {
    const clean = domain.trim();
    if (clean && !competitors.includes(clean)) competitors.push(clean);
  }

  const seen = new Set(brand.intelligence.targetCommunities.map((pick) => pick.id));
  const targetCommunities = [...brand.intelligence.targetCommunities];
  for (const pick of body.targetCommunities ?? []) {
    if (isCommunityPick(pick) && !seen.has(pick.id)) {
      seen.add(pick.id);
      targetCommunities.push(pick);
    }
  }

  const updated: BrandEntity = {
    ...brand,
    intelligence: {
      ...brand.intelligence,
      ...(body.selectedKeyword !== undefined ? { selectedKeyword: body.selectedKeyword } : {}),
      competitors,
      targetCommunities,
    },
    updatedAt: new Date().toISOString(),
  };

  return { brand: updated };
}
