// Domain types
export type {
  NebiusRerankConfig,
  RerankCandidate,
  RerankOptions,
  RerankOutcome,
  RerankResult,
  RrfOptions,
} from './types.js';

// Domain client implementation
export { NebiusRerankClient, NebiusError, NEBIUS_DEFAULT_BASE_URL, NEBIUS_DEFAULT_RERANK_MODEL } from './client.js';

// Re-exported domain helpers for clean public consumption
export {
  normalizeScores,
  sigmoid,
  calculateRrfScore,
  mergeRankings,
  baselineRank,
  buildBrandQuery,
  candidateDocument,
  rankCandidates,
  DEFAULT_RRF_K,
  type BrandFacts,
  type RankableCandidate,
  type RankedCandidate,
  type RankStatus,
  type Reranker,
} from './helpers/index.js';
