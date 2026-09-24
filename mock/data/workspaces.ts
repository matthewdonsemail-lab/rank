import type { Workspace } from "../schema.ts";

/**
 * Route: GET /api/workspaces
 * Description: Retrieves list of workspaces for organization.
 */
export const mockWorkspacesData: Workspace[] = [
  {
    id: "ws_rank_01",
    organizationId: "org_rank_01",
    name: "Nebius Core Production",
    slug: "nebius-core-prod",
    ownerId: "usr_rank_01",
    plan: "enterprise",
    createdAt: 1727222400000,
  },
  {
    id: "ws_rank_02",
    organizationId: "org_rank_01",
    name: "Staging Rerank Cluster",
    slug: "staging-rerank",
    ownerId: "usr_rank_01",
    plan: "growth",
    createdAt: 1727226000000,
  },
];

export function handleGetWorkspaces(filter?: { ownerId?: string; organizationId?: string }): Workspace[] {
  let list = mockWorkspacesData;
  if (filter?.ownerId) {
    list = list.filter((ws) => ws.ownerId === filter.ownerId);
  }
  if (filter?.organizationId) {
    list = list.filter((ws) => ws.organizationId === filter.organizationId);
  }
  return list;
}
