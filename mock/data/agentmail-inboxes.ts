import type { AgentMailInbox, DocBackingMetadata } from "../schema.ts";

/**
 * Route: GET /api/agentmail/inboxes
 * Description: Retrieves AgentMail reactive inboxes for a workspace.
 * Backed by authoritative documentation in docs/convex/components/agentmail/README.md.
 */
export const docBacking: DocBackingMetadata = {
  docPath: "docs/convex/components/agentmail/README.md",
  specSection: "Inboxes & Webhooks",
  specUrl: "https://agentmail.to/docs/inboxes",
  requiredFields: ["id", "workspaceId", "email", "displayName"],
  lastVerified: "2026-09-25",
};
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
