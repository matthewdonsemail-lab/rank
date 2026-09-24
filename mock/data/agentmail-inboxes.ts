import type { AgentMailInbox } from "../schema.ts";

/**
 * Route: GET /api/agentmail/inboxes
 * Description: Retrieves AgentMail reactive inboxes for a workspace.
 */
export const mockAgentMailInboxesData: AgentMailInbox[] = [
  {
    id: "inbox_rank_01",
    workspaceId: "ws_rank_01",
    email: "triage@rank.listeningkit.com",
    displayName: "Production Triage Inbox",
    createdAt: 1727223000000,
  },
  {
    id: "inbox_rank_02",
    workspaceId: "ws_rank_02",
    email: "test-alerts@rank.listeningkit.com",
    displayName: "Staging Test Alerts",
    createdAt: 1727226000000,
  },
];

export function handleGetAgentMailInboxes(workspaceId?: string): AgentMailInbox[] {
  if (workspaceId) {
    return mockAgentMailInboxesData.filter((i) => i.workspaceId === workspaceId);
  }
  return mockAgentMailInboxesData;
}
