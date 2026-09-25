export interface CompetitorCandidate {
  domain: string;
  name: string | null;
  rank: number | null;
  commonTerms: number | null;
  sourceEndpoint: string;
}

export type CompetitorDiscoveryState =
  | "idle"
  | "discovering"
  | "normalizing"
  | "completed"
  | "failed"
  | "cancelled";

export interface CompetitorDiscoveryContext {
  owner: string;
  sourceEnrichmentRunId: string;
  sourceUrl: string;
  sourceDomain: string;
  endpoint: string;
  limit: number;
  candidates: CompetitorCandidate[];
  normalizedCandidates: CompetitorCandidate[];
  error: string | null;
  attempt: number;
  startedAt: number;
  updatedAt: number;
}

export interface CompetitorDiscoveryInput {
  owner: string;
  sourceEnrichmentRunId: string;
  sourceUrl: string;
  sourceDomain: string;
  endpoint: string;
  limit: number;
  startedAt: number;
}

export type CompetitorDiscoveryEvent =
  | { type: "START"; at: number }
  | { type: "COMPETITORS_RECEIVED"; at: number; candidates: CompetitorCandidate[] }
  | { type: "DISCOVERY_FAILED"; at: number; error: string }
  | { type: "CANDIDATES_READY"; at: number; candidates: CompetitorCandidate[] }
  | { type: "NORMALIZATION_FAILED"; at: number; error: string }
  | { type: "RETRY"; at: number }
  | { type: "CANCEL"; at: number };
