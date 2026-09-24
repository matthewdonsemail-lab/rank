import type { AgentMessage } from "../schema.ts";

/**
 * Route: GET /api/agent/messages
 * Description: Retrieves conversation turns and tool calls for an agent thread.
 */
export const mockAgentMessagesData: AgentMessage[] = [
  {
    id: "amsg_rank_01",
    threadId: "ath_rank_01",
    role: "user",
    content: "Evaluate candidate passages for query: What is the inference latency of bge-reranker-v2-m3?",
    createdAt: 1727225010000,
  },
  {
    id: "amsg_rank_02",
    threadId: "ath_rank_01",
    role: "assistant",
    content: "Executing cross-encoder rerank via Nebius AI Studio BAAI/bge-reranker-v2-m3 endpoint.",
    toolCalls: [
      {
        name: "rerank_passages",
        args: {
          model: "BAAI/bge-reranker-v2-m3",
          candidateCount: 3,
        },
        result: {
          topCandidateId: "cand_rank_01",
          topScore: 0.9842,
          latencyMs: 14.8,
        },
      },
    ],
    createdAt: 1727225025000,
  },
  {
    id: "amsg_rank_03",
    threadId: "ath_rank_02",
    role: "user",
    content: "Incoming inbound email received from security alert system.",
    createdAt: 1727226010000,
  },
  {
    id: "amsg_rank_04",
    threadId: "ath_rank_02",
    role: "assistant",
    content: "Classified priority as high. Routed notice to telemetry webhook and updated AgentMail thread.",
    createdAt: 1727226030000,
  },
];

export function handleGetAgentMessages(threadId?: string): AgentMessage[] {
  if (threadId) {
    return mockAgentMessagesData.filter((m) => m.threadId === threadId);
  }
  return mockAgentMessagesData;
}
