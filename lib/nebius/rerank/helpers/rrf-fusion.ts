import type { RerankResult, RrfOptions } from '../types.js';

export const DEFAULT_RRF_K = 60;

/**
 * Calculates Reciprocal Rank Fusion (RRF) score for a given rank position.
 * Formula: 1 / (k + rank) where rank is 1-indexed.
 */
export function calculateRrfScore(rank: number, k: number = DEFAULT_RRF_K): number {
  return 1 / (k + Math.max(1, rank));
}

/**
 * Merges multiple ranked lists using Reciprocal Rank Fusion.
 */
export function mergeRankings(
  rankedLists: RerankResult[][],
  options: RrfOptions = {}
): RerankResult[] {
  const k = options.k ?? DEFAULT_RRF_K;
  const scoreMap = new Map<string, { candidate: RerankResult['candidate']; totalScore: number }>();

  for (const list of rankedLists) {
    list.forEach((item, index) => {
      const key = item.candidate.id || item.candidate.text;
      const current = scoreMap.get(key) || { candidate: item.candidate, totalScore: 0 };
      current.totalScore += calculateRrfScore(index + 1, k);
      scoreMap.set(key, current);
    });
  }

  const merged = Array.from(scoreMap.values())
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((item, index) => ({
      index,
      score: item.totalScore,
      candidate: item.candidate,
    }));

  return merged;
}
