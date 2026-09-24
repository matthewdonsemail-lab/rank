import type { RankInferenceRequest, RankInferenceResponse } from "../schema.ts";

/**
 * Route: POST /api/v1/rank
 * Description: Simulates Nebius BAAI/bge-reranker-v2-m3 cross-encoder inference.
 * Calculates deterministic mock relevance scores based on semantic token overlap.
 */
export function handlePostRankInference(body: RankInferenceRequest): RankInferenceResponse {
  const queryTokens = (body.query || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  const candidatesList = body.candidates || [];

  const scoredCandidates = candidatesList.map((cand: { id?: string; text: string }, idx: number) => {
    const textLower = (cand.text || "").toLowerCase();
    let matchCount = 0;
    for (const token of queryTokens) {
      if (textLower.includes(token)) {
        matchCount++;
      }
    }

    // Base score between 0.4 and 0.98 depending on token overlap and position
    const ratio = queryTokens.length > 0 ? matchCount / queryTokens.length : 0.5;
    const score = Math.min(0.989, Math.max(0.321, 0.4 + ratio * 0.55 - idx * 0.02));
    const roundedScore = Math.round(score * 10000) / 10000;

    return {
      id: cand.id || `cand_mock_${idx + 1}`,
      text: cand.text,
      score: roundedScore,
    };
  });

  // Sort descending by score
  scoredCandidates.sort((a: { score: number }, b: { score: number }) => b.score - a.score);

  const results = scoredCandidates.map((cand: { id: string; text: string; score: number }, idx: number) => ({
    id: cand.id,
    text: cand.text,
    score: cand.score,
    rank: idx + 1,
  }));

  const sessionId = `rs_mock_${Date.now()}`;
  const latencyMs = Math.round((12 + Math.random() * 6) * 10) / 10;

  return {
    sessionId,
    model: body.model || "BAAI/bge-reranker-v2-m3",
    query: body.query,
    latencyMs,
    results,
  };
}
