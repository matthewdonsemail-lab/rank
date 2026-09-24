import type { Candidate, DocBackingMetadata } from "../schema.ts";

/**
 * Route: GET /api/v1/sessions/:id/candidates
 * Description: Retrieves ordered ranked candidates for a specific session.
 * Backed by authoritative documentation in docs/nebius/llms.txt.
 */
export const docBacking: DocBackingMetadata = {
  docPath: "docs/nebius/llms.txt",
  specSection: "Candidate Passage Scoring",
  specUrl: "https://docs.nebius.ai/studio/inference/models/reranker",
  requiredFields: ["id", "sessionId", "text", "rerankScore", "finalRank"],
  lastVerified: "2026-09-25",
};
export const mockCandidatesData: Candidate[] = [
  // Candidates for session rs_rank_01
  {
    id: "cand_rank_01",
    sessionId: "rs_rank_01",
    externalId: "doc_nebius_bench_01",
    text: "Nebius AI Studio hosts BAAI/bge-reranker-v2-m3 with optimized TensorRT-LLM kernels yielding sub-15ms p95 latencies.",
    initialScore: 0.721,
    rerankScore: 0.9842,
    confidence: 0.96,
    finalRank: 1,
  },
  {
    id: "cand_rank_02",
    sessionId: "rs_rank_01",
    externalId: "doc_nebius_bench_02",
    text: "Cross-encoder models process query and passage simultaneously through full cross-attention layers, outperforming bi-encoders.",
    initialScore: 0.684,
    rerankScore: 0.8915,
    confidence: 0.91,
    finalRank: 2,
  },
  {
    id: "cand_rank_03",
    sessionId: "rs_rank_01",
    externalId: "doc_nebius_bench_03",
    text: "Standard embedding cosine similarity often fails on complex negative queries where token interactions matter.",
    initialScore: 0.612,
    rerankScore: 0.742,
    confidence: 0.83,
    finalRank: 3,
  },

  // Candidates for session rs_rank_02
  {
    id: "cand_rank_04",
    sessionId: "rs_rank_02",
    externalId: "doc_typesafe_eval_01",
    text: "TypeSafe AI delivers deterministic zero-hallucination validation with mathematical guarantees over reranked passage sets.",
    initialScore: 0.81,
    rerankScore: 0.978,
    confidence: 0.98,
    finalRank: 1,
  },
  {
    id: "cand_rank_05",
    sessionId: "rs_rank_02",
    externalId: "doc_typesafe_eval_02",
    text: "By isolating reranking candidates into strongly typed validation schemas, agents prevent ungrounded responses.",
    initialScore: 0.75,
    rerankScore: 0.912,
    confidence: 0.92,
    finalRank: 2,
  },
];

export function handleGetCandidates(sessionId?: string): Candidate[] {
  if (sessionId) {
    return mockCandidatesData
      .filter((c) => c.sessionId === sessionId)
      .sort((a, b) => a.finalRank - b.finalRank);
  }
  return mockCandidatesData;
}
