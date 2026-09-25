import type { RerankCandidate, RerankResult } from '../types.js';
import { normalizeScores } from './score-normalizer.js';

/**
 * A local stand-in that ignores the query: it keeps the candidates in the order given and scores them 1, 1/2, 1/3 and
 * so on. It exists for tests and offline runs, and it is NOT a relevance model. `NebiusRerankClient` never falls back
 * to it, so a missing key or a failed call cannot pass off an unranked list as a ranked one.
 */
export function baselineRank(candidates: (string | RerankCandidate)[], topK: number = candidates.length): RerankResult[] {
  const normalized = candidates.map((c): RerankCandidate => (typeof c === 'string' ? { text: c } : c));
  const raw = normalized.map((_, i) => 1 / (i + 1));
  const scaled = normalizeScores(raw);
  return normalized
    .map((candidate, index) => ({ index, score: raw[index], normalizedScore: scaled[index], candidate }))
    .slice(0, topK);
}
