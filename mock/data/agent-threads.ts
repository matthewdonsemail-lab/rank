import type { AgentThread, DocBackingMetadata } from "../schema.ts";

/**
 * Route: GET /api/agent/threads
 * Description: Retrieves persistent AI agent threads managed by @convex-dev/agent.
 * Backed by authoritative documentation in docs/convex/components/agent/README.md.
 */
export const docBacking: DocBackingMetadata = {
  docPath: "docs/convex/components/agent/README.md",
  specSection: "Persistent Threads",
  specUrl: "https://github.com/get-convex/agent",
  requiredFields: ["id", "workspaceId", "title", "model"],
  lastVerified: "2026-09-25",
};
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
