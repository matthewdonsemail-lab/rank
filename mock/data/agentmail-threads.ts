import type { AgentMailThread } from "../schema.ts";

/**
 * Route: GET /api/agentmail/threads
 * Description: Retrieves email conversation threads for an AgentMail inbox.
 */
export const mockAgentMailThreadsData: AgentMailThread[] = [
  {
    id: "mth_rank_01",
    inboxId: "inbox_rank_01",
    subject: "Urgent: Latency spike on rerank cluster node 4",
    messageCount: 2,
    lastMessageAt: 1727226200000,
  },
  {
    id: "mth_rank_02",
    inboxId: "inbox_rank_01",
    subject: "Daily Reranking Telemetry Digest",
    messageCount: 1,
    lastMessageAt: 1727226400000,
  },
];

export function handleGetAgentMailThreads(inboxId?: string): AgentMailThread[] {
  if (inboxId) {
    return mockAgentMailThreadsData.filter((t) => t.inboxId === inboxId);
  }
  return mockAgentMailThreadsData;
}
