import type { RerankOptions, RerankOutcome } from '../types.js';

/** What is known about the brand that is looking for links. Matches the enrichment facts. */
export interface BrandFacts {
  name: string;
  tagline?: string;
  offerings?: { name: string; detail?: string }[];
}

/** A discovered competitor domain. Matches the competitor discovery candidates. */
export interface RankableCandidate {
  domain: string;
  name: string | null;
  rank: number | null;
  commonTerms: number | null;
  sourceEndpoint: string;
}

/** Anything that can rerank: the Nebius client, or a stand-in in tests. */
export interface Reranker {
  rerankDetailed(options: RerankOptions): Promise<RerankOutcome>;
}

/** The query stays short: a cross-encoder reads the query and one document together, so length costs every pair. */
const MAX_QUERY_CHARS = 1500;

/** The reranker's query: who the brand is and what it offers. */
export function buildBrandQuery(brand: BrandFacts): string {
  const offerings = (brand.offerings ?? [])
    .slice(0, 6)
    .map((o) => (o.detail ? `${o.name}: ${o.detail}` : o.name))
    .join('; ');
  return [
    `Websites that would genuinely link to ${brand.name}.`,
    brand.tagline,
    offerings ? `It offers: ${offerings}.` : '',
  ]
    .filter(Boolean)
    .join(' ')
    .slice(0, MAX_QUERY_CHARS);
}

/**
 * The text the reranker reads for one candidate. Discovery gives a domain, a name and how it was found, not the page
 * itself, so this is thin; a scraped description or page excerpt would rank better and should be added here when a
 * candidate has one.
 */
export function candidateDocument(candidate: RankableCandidate): string {
  const parts = [`${candidate.name ?? candidate.domain} (${candidate.domain}).`];
  if (candidate.commonTerms !== null) parts.push(`Ranks for ${candidate.commonTerms} of the same search terms as the brand.`);
  return parts.join(' ');
}

export type RankStatus =
  | { status: 'ranked'; model: string; totalTokens: number }
  | { status: 'skipped'; reason: string }
  | { status: 'failed'; reason: string };

export interface RankedCandidate<C extends RankableCandidate = RankableCandidate> {
  candidate: C;
  /** The reranker's relevance score, or null when the candidate was not ranked. */
  rerankScore: number | null;
}

/**
 * Order candidates by how well they fit the brand, best first, and keep `limit` of them.
 * When ranking cannot happen (no key, or Nebius fails) the candidates keep the order discovery gave them and the
 * status says why, so the caller and the stored record are never told an unranked list was ranked.
 */
export async function rankCandidates<C extends RankableCandidate>(
  reranker: Reranker | null,
  brand: BrandFacts | null,
  candidates: C[],
  limit: number,
): Promise<{ ranked: RankedCandidate<C>[]; rank: RankStatus }> {
  const unranked = (): RankedCandidate<C>[] => candidates.slice(0, limit).map((candidate) => ({ candidate, rerankScore: null }));
  if (!reranker) return { ranked: unranked(), rank: { status: 'skipped', reason: 'NEBIUS_API_KEY is not set' } };
  if (!brand) return { ranked: unranked(), rank: { status: 'skipped', reason: 'No brand facts to rank against' } };
  if (candidates.length < 2) return { ranked: unranked(), rank: { status: 'skipped', reason: 'Fewer than two candidates' } };

  try {
    const outcome = await reranker.rerankDetailed({
      query: buildBrandQuery(brand),
      candidates: candidates.map((c) => ({ text: candidateDocument(c) })),
      topK: Math.min(limit, candidates.length),
    });
    return {
      ranked: outcome.results.map((r) => ({ candidate: candidates[r.index], rerankScore: r.score })),
      rank: { status: 'ranked', model: outcome.model, totalTokens: outcome.usage.totalTokens },
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message.slice(0, 200) : 'Reranking failed';
    return { ranked: unranked(), rank: { status: 'failed', reason } };
  }
}
