export interface RerankCandidate {
  id?: string;
  text: string;
  metadata?: Record<string, unknown>;
}

export interface RerankResult {
  /** Position of the candidate in the list that was sent. */
  index: number;
  /** The model's relevance score. Higher is more relevant. Scores from different models are not comparable. */
  score: number;
  /** `score` rescaled to 0 to 1 across this result set (the best is 1). Meaningless for a set of one. */
  normalizedScore?: number;
  candidate: RerankCandidate;
}

export interface NebiusRerankConfig {
  /** Defaults to the NEBIUS_API_KEY environment variable. */
  apiKey?: string;
  /** Defaults to NEBIUS_BASE_URL, then https://api.tokenfactory.nebius.com/v1. */
  baseUrl?: string;
  /** Defaults to DEFAULT_RANK_MODEL, then Qwen/Qwen3-Reranker-8B (the model Nebius documents for /v1/rerank). */
  defaultModel?: string;
  /** For tests; defaults to the global fetch. */
  fetcher?: typeof fetch;
  /** Per attempt. Defaults to 30 seconds. */
  timeoutMs?: number;
  /** Extra attempts after a 429 or 5xx answer, or a network failure. Defaults to 2. */
  maxRetries?: number;
  /** Wait before the first retry, doubled after each one. Defaults to 500 ms. */
  retryDelayMs?: number;
}

export interface RerankOptions {
  query: string;
  candidates: (string | RerankCandidate)[];
  /** Keep only the best N. Defaults to all of them. */
  topK?: number;
  model?: string;
  /** `flex` trades speed for a lower price; Nebius picks when it is `auto` (the default). */
  serviceTier?: 'auto' | 'flex';
}

/** The ranked list plus what Nebius reported about the call. */
export interface RerankOutcome {
  results: RerankResult[];
  model: string;
  usage: { promptTokens: number; totalTokens: number };
}

export interface RrfOptions {
  k?: number;
}
