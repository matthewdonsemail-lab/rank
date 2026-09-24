import type { AuthOrganization } from "../schema.ts";

/**
 * Route: GET /api/auth/organization
 * Description: Retrieves active Clerk organization context.
 */
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
