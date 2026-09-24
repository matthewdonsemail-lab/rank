import type { AgentMailMessage } from "../schema.ts";

/**
 * Route: GET /api/agentmail/messages
 * Description: Retrieves individual email messages in an AgentMail thread.
 */
export const mockAgentMailMessagesData: AgentMailMessage[] = [
  {
    id: "mmsg_rank_01",
    threadId: "mth_rank_01",
    from: "monitoring@alerts.nebius.ai",
    to: "triage@rank.listeningkit.com",
    subject: "Urgent: Latency spike on rerank cluster node 4",
    bodyText: "Observed p99 latency increase to 42ms on cluster node 4. Initiating auto-scaling failover to backup worker.",
    status: "triaged",
    receivedAt: 1727226100000,
  },
  {
    id: "mmsg_rank_02",
    threadId: "mth_rank_01",
    from: "triage@rank.listeningkit.com",
    to: "monitoring@alerts.nebius.ai",
    subject: "Re: Urgent: Latency spike on rerank cluster node 4",
    bodyText: "Automated triage executed. Traffic redirected to worker pool 2. Verified p95 latency returned to 14.8ms.",
    status: "processed",
    receivedAt: 1727226200000,
  },
  {
    id: "mmsg_rank_03",
    threadId: "mth_rank_02",
    from: "reports@listeningkit.com",
    to: "triage@rank.listeningkit.com",
    subject: "Daily Reranking Telemetry Digest",
    bodyText: "Summary for 2026-09-24: 14,820 queries served, avg latency 14.6ms, 0 errors, total cost $0.00114.",
    status: "received",
    receivedAt: 1727226400000,
  },
];

export function handleGetAgentMailMessages(threadId?: string): AgentMailMessage[] {
  if (threadId) {
    return mockAgentMailMessagesData.filter((m) => m.threadId === threadId);
  }
  return mockAgentMailMessagesData;
}
