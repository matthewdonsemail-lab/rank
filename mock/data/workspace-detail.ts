import type { Workspace } from "../schema.ts";
import { mockWorkspacesData } from "./workspaces.ts";

export interface WorkspaceDetail extends Workspace {
  stats: {
    totalSessions: number;
    activeKeys: number;
    avgLatencyMs: number;
    ndcg10: number;
  };
}

/**
 * Route: GET /api/workspaces/:slug
 * Description: Retrieves workspace detail and telemetry aggregates by slug.
 */
export const mockWorkspaceDetails: Record<string, WorkspaceDetail> = {
  "nebius-core-prod": {
    ...mockWorkspacesData[0],
    stats: {
      totalSessions: 14820,
      activeKeys: 2,
      avgLatencyMs: 14.6,
      ndcg10: 0.884,
    },
  },
  "staging-rerank": {
    ...mockWorkspacesData[1],
    stats: {
      totalSessions: 520,
      activeKeys: 1,
      avgLatencyMs: 18.2,
      ndcg10: 0.852,
    },
  },
};

export function handleGetWorkspaceDetail(slug: string): WorkspaceDetail | null {
  return mockWorkspaceDetails[slug] ?? null;
}
