import type { AuthOrganization, DocBackingMetadata } from "../schema.ts";

/**
 * Route: GET /api/auth/organization
 * Description: Retrieves active Clerk organization context.
 * Backed by authoritative documentation in docs/clerk/organizations/overview.md.
 */
export const docBacking: DocBackingMetadata = {
  docPath: "docs/clerk/organizations/overview.md",
  specSection: "Organizations Overview",
  specUrl: "https://clerk.com/docs/organizations/overview",
  requiredFields: ["id", "name", "slug", "ownerId", "plan", "membersCount"],
  lastVerified: "2026-09-25",
};
export const mockAuthOrganizationData: AuthOrganization = {
  id: "org_rank_01",
  name: "ListeningKit Lab",
  slug: "listeningkit-lab",
  ownerId: "usr_rank_01",
  plan: "enterprise",
  membersCount: 8,
  createdAt: 1727222400000,
};

export function handleGetAuthOrganization(): AuthOrganization {
  return mockAuthOrganizationData;
}
