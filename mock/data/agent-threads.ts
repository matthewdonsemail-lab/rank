import type { AgentThread } from "../schema.ts";

/**
 * Route: GET /api/agent/threads
 * Description: Retrieves persistent AI agent threads managed by @convex-dev/agent.
 */
export const mockAgentThreadsData: AgentThread[] = [
  {
    id: "ath_rank_01",
    workspaceId: "ws_rank_01",
    title: "Latency Optimization and Routing Decisions",
    model: "meta-llama/Llama-3.3-70B-Instruct",
    createdAt: 1727225000000,
  },
  {
    id: "ath_rank_02",
    workspaceId: "ws_rank_01",
    title: "Email Triage and Model Escalation",
    model: "meta-llama/Llama-3.3-70B-Instruct",
    createdAt: 1727226000000,
  },
];

export function handleGetAgentThreads(workspaceId?: string): AgentThread[] {
  if (workspaceId) {
    return mockAgentThreadsData.filter((t) => t.workspaceId === workspaceId);
  }
  return mockAgentThreadsData;
}
