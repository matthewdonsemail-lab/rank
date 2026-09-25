import { normalizeCrawlUrl } from "../../../firecrawl/crawl/index.js";
import type { CompetitorCandidate } from "../types.js";

const MAX_RAW_CANDIDATES = 100;
const ROW_KEYS = ["results", "rows", "items", "competitors", "data", "output", "raw"];
const DOMAIN_KEYS = ["domain", "competitorDomain", "competitor_domain", "website", "url", "competitor", "domainName"];
const NAME_KEYS = ["name", "companyName", "competitorName", "domainName"];
const RANK_KEYS = ["rank", "position", "domainRank", "rankPosition"];
const COMMON_TERM_KEYS = ["commonTerms", "commonKeywords", "sharedKeywords", "keywordOverlap", "overlap", "commonTermsCount"];

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as UnknownRecord : null;
}

function findRows(value: unknown, depth = 0): unknown[] {
  if (Array.isArray(value)) return value;
  if (depth >= 4) return [];
  const record = asRecord(value);
  if (!record) return [];
  for (const key of ROW_KEYS) {
    const nested = record[key];
    if (Array.isArray(nested)) return nested;
    if (nested && typeof nested === "object") {
      const rows = findRows(nested, depth + 1);
      if (rows.length) return rows;
    }
  }
  return [];
}

function valueFor(record: UnknownRecord, keys: string[]): unknown {
  const lower = new Map(Object.entries(record).map(([key, value]) => [key.toLowerCase(), value]));
  for (const key of keys) {
    const value = lower.get(key.toLowerCase());
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numberValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
}

export function normalizeCompetitorDomain(value: string): string | null {
  const normalized = normalizeCrawlUrl(value);
  if (!normalized.ok) return null;
  return new URL(normalized.url).hostname.toLowerCase().replace(/^www\./, "");
}

export function parseCompetitorCandidates(
  payload: unknown,
  sourceEndpoint: string,
): CompetitorCandidate[] {
  const candidates: CompetitorCandidate[] = [];
  for (const item of findRows(payload)) {
    const record = asRecord(item);
    if (!record) continue;
    const domain = stringValue(valueFor(record, DOMAIN_KEYS));
    const normalizedDomain = domain ? normalizeCompetitorDomain(domain) : null;
    if (!normalizedDomain) continue;
    candidates.push({
      domain: normalizedDomain,
      name: stringValue(valueFor(record, NAME_KEYS)),
      rank: numberValue(valueFor(record, RANK_KEYS)),
      commonTerms: numberValue(valueFor(record, COMMON_TERM_KEYS)),
      sourceEndpoint,
    });
    if (candidates.length >= MAX_RAW_CANDIDATES) break;
  }
  return candidates;
}

function candidateScore(candidate: CompetitorCandidate): number {
  const commonTerms = candidate.commonTerms ?? -1;
  const rank = candidate.rank ?? Number.MAX_SAFE_INTEGER;
  return commonTerms * 1_000_000 - rank;
}

export function normalizeCompetitorCandidates(
  candidates: CompetitorCandidate[],
  sourceDomain: string,
  limit: number,
): CompetitorCandidate[] {
  const byDomain = new Map<string, CompetitorCandidate>();
  for (const candidate of candidates) {
    const domain = normalizeCompetitorDomain(candidate.domain);
    if (!domain || domain === sourceDomain) continue;
    const normalized = { ...candidate, domain };
    const existing = byDomain.get(domain);
    if (!existing || candidateScore(normalized) > candidateScore(existing)) byDomain.set(domain, normalized);
  }
  return [...byDomain.values()]
    .sort((left, right) => candidateScore(right) - candidateScore(left))
    .slice(0, Math.max(1, Math.min(limit, 50)));
}
