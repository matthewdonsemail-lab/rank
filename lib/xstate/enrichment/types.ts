export interface EnrichmentFacts {
  name: string;
  tagline: string;
  offerings: { name: string; detail: string }[];
  tone?: string;
  formality?: "casual" | "professional" | "formal";
  locationLabel?: string;
  logoUrl?: string;
}

export type EnrichmentState =
  | "idle"
  | "mapping"
  | "scraping"
  | "extracting"
  | "completed"
  | "failed"
  | "cancelled";

export interface EnrichmentDocument {
  url: string;
  title: string | null;
  description: string | null;
  markdownExcerpt: string;
  facts: EnrichmentFacts | null;
}

export interface EnrichmentContext {
  owner: string;
  sourceUrl: string;
  mappedUrls: string[];
  documents: EnrichmentDocument[];
  facts: EnrichmentFacts | null;
  error: string | null;
  attempt: number;
  startedAt: number;
  updatedAt: number;
}

export interface EnrichmentInput {
  owner: string;
  sourceUrl: string;
  startedAt: number;
}

export type EnrichmentEvent =
  | { type: "START"; at: number }
  | { type: "MAP_SUCCEEDED"; at: number; urls: string[] }
  | { type: "MAP_FAILED"; at: number; error: string }
  | { type: "SCRAPE_SUCCEEDED"; at: number; documents: EnrichmentDocument[] }
  | { type: "SCRAPE_FAILED"; at: number; error: string }
  | { type: "EXTRACT_SUCCEEDED"; at: number; facts: EnrichmentFacts }
  | { type: "EXTRACT_FAILED"; at: number; error: string }
  | { type: "RETRY"; at: number }
  | { type: "CANCEL"; at: number };
