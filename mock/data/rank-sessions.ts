import type { RankSession, DocBackingMetadata } from "../schema.ts";

/**
 * Route: GET /api/v1/sessions
 * Description: Retrieves list of past ranking sessions for a workspace.
 * Backed by authoritative documentation in docs/nebius/llms.txt.
 */
export const docBacking: DocBackingMetadata = {
  docPath: "docs/nebius/llms.txt",
  specSection: "Reranking & Inference APIs",
  specUrl: "https://docs.nebius.ai/studio/inference/models/reranker",
  requiredFields: ["id", "workspaceId", "query", "strategy", "model", "candidateCount", "latencyMs"],
  lastVerified: "2026-09-25",
};
export const mockRankSessionsData: RankSession[] = [
  {
    id: "rs_rank_01",
    workspaceId: "ws_rank_01",
    query: "What is the inference latency of bge-reranker-v2-m3 on Nebius AI Studio?",
    strategy: "cross-encoder",
    model: "BAAI/bge-reranker-v2-m3",
    candidateCount: 3,
    latencyMs: 14.8,
    createdAt: 1727226000000,
  },
  {
    id: "rs_rank_02",
    workspaceId: "ws_rank_01",
    query: "How does TypeSafe AI ensure zero hallucination in evaluation?",
    strategy: "cross-encoder-hybrid",
    model: "BAAI/bge-reranker-v2-m3",
    candidateCount: 4,
    latencyMs: 16.2,
    createdAt: 1727226200000,
  },
  {
    id: "rs_rank_03",
    workspaceId: "ws_rank_02",
    query: "Compare dense vector search with cross-encoder reranking.",
    strategy: "reciprocal-rank-fusion",
    model: "BAAI/bge-reranker-v2-m3",
    candidateCount: 2,
    latencyMs: 12.1,
    createdAt: 1727226400000,
  },
];

export function handleGetRankSessions(filter?: { workspaceId?: string }): RankSession[] {
  if (filter?.workspaceId) {
    return mockRankSessionsData.filter((s) => s.workspaceId === filter.workspaceId);
  }
  return mockRankSessionsData;
}
