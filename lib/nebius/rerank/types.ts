export interface RerankCandidate {
  id?: string;
  text: string;
  metadata?: Record<string, unknown>;
}

export interface RerankResult {
  index: number;
  score: number;
  normalizedScore?: number;
  candidate: RerankCandidate;
}

export interface NebiusRerankConfig {
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
}

export interface RerankOptions {
  query: string;
  candidates: (string | RerankCandidate)[];
  topK?: number;
  model?: string;
}

export interface RrfOptions {
  k?: number;
}
