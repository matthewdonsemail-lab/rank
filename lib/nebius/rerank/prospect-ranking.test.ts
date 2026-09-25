import { describe, expect, it, vi } from 'vitest';
import { buildBrandQuery, candidateDocument, rankCandidates, type RankableCandidate, type Reranker } from './index.js';

const brand = {
  name: 'ListeningKit',
  tagline: 'Find people asking for a tool like yours',
  offerings: [{ name: 'Social listening', detail: 'Reddit, X and Facebook' }, { name: 'Alerts' }],
};
const candidates: RankableCandidate[] = [
  { domain: 'a.com', name: 'A', rank: 1, commonTerms: 40, sourceEndpoint: 'spyfu' },
  { domain: 'b.com', name: null, rank: 2, commonTerms: null, sourceEndpoint: 'seranking' },
  { domain: 'c.com', name: 'C', rank: 3, commonTerms: 5, sourceEndpoint: 'spyfu' },
];

function reranker(order: number[], scores: number[]): Reranker {
  return {
    rerankDetailed: vi.fn(async (options) => ({
      results: order.slice(0, options.topK ?? order.length).map((index, i) => ({
        index,
        score: scores[i],
        candidate: options.candidates[index] as { text: string },
      })),
      model: 'Qwen/Qwen3-Reranker-8B',
      usage: { promptTokens: 5, totalTokens: 5 },
    })),
  };
}

describe('brand query and candidate documents', () => {
  it('describes the brand and its offerings, and stays short', () => {
    const query = buildBrandQuery(brand);
    expect(query).toContain('ListeningKit');
    expect(query).toContain('Social listening: Reddit, X and Facebook');
    expect(query).toContain('Alerts');
    expect(buildBrandQuery({ name: 'x'.repeat(5000) }).length).toBeLessThanOrEqual(1500);
  });

  it('uses the name and domain, and the shared terms only when known', () => {
    expect(candidateDocument(candidates[0])).toBe('A (a.com). Ranks for 40 of the same search terms as the brand.');
    expect(candidateDocument(candidates[1])).toBe('b.com (b.com).');
  });

  it('adds what the homepage says, and cuts a long document', () => {
    const page = { title: 'A | Tools', description: 'Tools for listening.', excerpt: 'We help teams find customers.' };
    const doc = candidateDocument({ ...candidates[0], page });
    expect(doc).toBe('A (a.com). A | Tools. Tools for listening. We help teams find customers. Ranks for 40 of the same search terms as the brand.');
    const huge = candidateDocument({ ...candidates[0], page: { title: null, description: null, excerpt: 'w '.repeat(2000) } });
    expect(huge.length).toBeLessThanOrEqual(1200);
    expect(candidateDocument({ ...candidates[0], page: { title: 'A', description: null, excerpt: null } })).not.toContain('A. A.');
  });
});

describe('rankCandidates', () => {
  it('orders by the reranker, keeps the limit, and reports the score of each', async () => {
    const r = reranker([2, 0, 1], [0.9, 0.5, 0.1]);
    const { ranked, rank } = await rankCandidates(r, brand, candidates, 2);
    expect(ranked.map((x) => x.candidate.domain)).toEqual(['c.com', 'a.com']);
    expect(ranked.map((x) => x.rerankScore)).toEqual([0.9, 0.5]);
    expect(rank).toEqual({ status: 'ranked', model: 'Qwen/Qwen3-Reranker-8B', totalTokens: 5 });
    const sent = (r.rerankDetailed as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(sent.topK).toBe(2);
    expect(sent.candidates).toHaveLength(3);
  });

  it('keeps discovery order and says why when there is no reranker, no brand, or too few candidates', async () => {
    const r = reranker([1, 0], [1, 0]);
    const none = await rankCandidates(null, brand, candidates, 2);
    expect(none.ranked.map((x) => x.candidate.domain)).toEqual(['a.com', 'b.com']);
    expect(none.ranked.every((x) => x.rerankScore === null)).toBe(true);
    expect(none.rank).toMatchObject({ status: 'skipped', reason: expect.stringContaining('NEBIUS_API_KEY') });
    expect((await rankCandidates(r, null, candidates, 2)).rank).toMatchObject({ status: 'skipped' });
    expect((await rankCandidates(r, brand, [candidates[0]], 2)).rank).toMatchObject({ status: 'skipped' });
    expect(r.rerankDetailed).not.toHaveBeenCalled();
  });

  it('falls back to discovery order and records the failure when the reranker throws', async () => {
    const broken: Reranker = { rerankDetailed: vi.fn(async () => { throw new Error('Nebius is rate limiting requests'); }) };
    const { ranked, rank } = await rankCandidates(broken, brand, candidates, 2);
    expect(ranked.map((x) => x.candidate.domain)).toEqual(['a.com', 'b.com']);
    expect(ranked.every((x) => x.rerankScore === null)).toBe(true);
    expect(rank).toEqual({ status: 'failed', reason: 'Nebius is rate limiting requests' });
  });

  it('never asks for more than there are candidates', async () => {
    const r = reranker([0, 1, 2], [3, 2, 1]);
    const { ranked } = await rankCandidates(r, brand, candidates, 25);
    expect(ranked).toHaveLength(3);
  });
});
