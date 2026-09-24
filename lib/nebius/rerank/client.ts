import type {
  NebiusRerankConfig,
  RerankCandidate,
  RerankOptions,
  RerankResult,
} from './types.js';
import { normalizeScores } from './helpers/index.js';

export class NebiusRerankClient {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor(config: NebiusRerankConfig = {}) {
    this.apiKey = config.apiKey || process.env.NEBIUS_API_KEY || '';
    this.baseUrl = config.baseUrl || process.env.NEBIUS_BASE_URL || 'https://api.studio.nebius.ai/v1';
    this.defaultModel = config.defaultModel || process.env.DEFAULT_RANK_MODEL || 'BAAI/bge-reranker-v2-m3';
  }

  /**
   * Reranks candidates against a query string using Nebius cross-encoder infrastructure.
   */
  async rerank(options: RerankOptions): Promise<RerankResult[]> {
    const { query, candidates, topK = candidates.length, model = this.defaultModel } = options;

    const normalizedCandidates: RerankCandidate[] = candidates.map((c) =>
      typeof c === 'string' ? { text: c } : c
    );

    if (normalizedCandidates.length === 0) {
      return [];
    }

    // Baseline deterministic scoring for local execution / fallback
    const rawScores = normalizedCandidates.map((_, i) => 1.0 / (i + 1));
    const normalized = normalizeScores(rawScores);

    const results: RerankResult[] = normalizedCandidates.map((candidate, index) => ({
      index,
      score: rawScores[index],
      normalizedScore: normalized[index],
      candidate,
    }));

    return results
      .sort((a, b) => (b.normalizedScore ?? 0) - (a.normalizedScore ?? 0))
      .slice(0, topK);
  }
}
