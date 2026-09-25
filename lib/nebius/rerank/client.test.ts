import { describe, expect, it, vi } from 'vitest';
import { baselineRank, NebiusError, NebiusRerankClient } from './index.js';

const KEY = 'nb-test-secret-value';
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

// The shape Nebius documents for POST /v1/rerank: results come back best first, each with the index it was sent at.
const answer = {
  id: 'rerank-1',
  model: 'Qwen/Qwen3-Reranker-8B',
  usage: { prompt_tokens: 65, total_tokens: 65 },
  results: [
    { index: 1, document: { text: 'Belgrade' }, relevance_score: 0.94 },
    { index: 2, document: { text: "Shrek's swamp" }, relevance_score: 0.82 },
    { index: 0, document: { text: 'Amsterdam' }, relevance_score: 0.16 },
  ],
};
const docs = ['Amsterdam', 'Belgrade', "Shrek's swamp"];

function client(fetcher: typeof fetch, extra = {}) {
  return new NebiusRerankClient({ apiKey: KEY, fetcher, retryDelayMs: 0, ...extra });
}

describe('NebiusRerankClient', () => {
  it('posts the query and document texts to /v1/rerank on Token Factory with the key', async () => {
    const fetcher = vi.fn<typeof fetch>(async () => json(answer));
    await client(fetcher).rerank({ query: 'capital of Serbia', candidates: docs });
    const [url, init] = fetcher.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.tokenfactory.nebius.com/v1/rerank');
    expect((init.headers as Record<string, string>).Authorization).toBe(`Bearer ${KEY}`);
    expect(JSON.parse(init.body as string)).toEqual({
      model: 'Qwen/Qwen3-Reranker-8B',
      query: 'capital of Serbia',
      documents: docs,
    });
  });

  it('maps scores back onto the candidates that were sent, best first, with metadata kept', async () => {
    const fetcher = vi.fn<typeof fetch>(async () => json(answer));
    const candidates = [{ id: 'a', text: 'Amsterdam', metadata: { url: 'x' } }, 'Belgrade', "Shrek's swamp"];
    const results = await client(fetcher).rerank({ query: 'q', candidates });
    expect(results.map((r) => r.index)).toEqual([1, 2, 0]);
    expect(results.map((r) => r.score)).toEqual([0.94, 0.82, 0.16]);
    expect(results[0].normalizedScore).toBe(1);
    expect(results[2].normalizedScore).toBe(0);
    expect(results[2].candidate).toEqual({ id: 'a', text: 'Amsterdam', metadata: { url: 'x' } });
  });

  it('sorts the answer itself if Nebius sends it out of order, and applies topK', async () => {
    const shuffled = { ...answer, results: [answer.results[2], answer.results[0], answer.results[1]] };
    const fetcher = vi.fn<typeof fetch>(async () => json(shuffled));
    const results = await client(fetcher).rerank({ query: 'q', candidates: docs, topK: 2 });
    expect(results.map((r) => r.index)).toEqual([1, 2]);
  });

  it('passes the model and service tier, and reports the model and tokens used', async () => {
    const fetcher = vi.fn<typeof fetch>(async () => json(answer));
    const outcome = await client(fetcher).rerankDetailed({ query: 'q', candidates: docs, model: 'other/model', serviceTier: 'flex' });
    const sent = JSON.parse((fetcher.mock.calls[0][1] as RequestInit).body as string);
    expect(sent).toMatchObject({ model: 'other/model', service_tier: 'flex' });
    expect(outcome.model).toBe('Qwen/Qwen3-Reranker-8B');
    expect(outcome.usage).toEqual({ promptTokens: 65, totalTokens: 65 });
  });

  it('retries a 503 and a network failure, then succeeds', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(json({}, 503))
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce(json(answer));
    await client(fetcher).rerank({ query: 'q', candidates: docs });
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it('gives up after the retries and says why, without the key or the body', async () => {
    const fetcher = vi.fn<typeof fetch>(async () => json({ detail: `key ${KEY} rejected` }, 503));
    const error = await client(fetcher).rerank({ query: 'q', candidates: docs }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(NebiusError);
    expect((error as NebiusError).status).toBe(503);
    expect((error as Error).message).not.toContain(KEY);
    expect((error as Error).message).not.toContain('detail');
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it('does not retry a refused key or an unknown model', async () => {
    for (const [status, words] of [[401, 'refused the API key'], [404, 'does not know that model']] as const) {
      const fetcher = vi.fn<typeof fetch>(async () => json({}, status));
      await expect(client(fetcher).rerank({ query: 'q', candidates: docs })).rejects.toThrow(words);
      expect(fetcher).toHaveBeenCalledTimes(1);
    }
  });

  it('refuses bad input before sending anything, and never quietly falls back to an unranked list', async () => {
    const fetcher = vi.fn<typeof fetch>();
    const saved = process.env.NEBIUS_API_KEY;
    delete process.env.NEBIUS_API_KEY;
    try {
      await expect(new NebiusRerankClient({ fetcher }).rerank({ query: 'q', candidates: docs })).rejects.toThrow('NEBIUS_API_KEY');
    } finally {
      if (saved !== undefined) process.env.NEBIUS_API_KEY = saved;
    }
    await expect(client(fetcher).rerank({ query: '  ', candidates: docs })).rejects.toThrow('query is empty');
    await expect(client(fetcher).rerank({ query: 'q', candidates: ['ok', ' '] })).rejects.toThrow('no text');
    await expect(client(fetcher).rerank({ query: 'q', candidates: docs, topK: 0 })).rejects.toThrow('topK');
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('returns an empty list for no candidates without calling Nebius', async () => {
    const fetcher = vi.fn<typeof fetch>();
    expect(await client(fetcher).rerank({ query: 'q', candidates: [] })).toEqual([]);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('rejects an answer with a bad index, a repeated index, a non-number score, or no results', async () => {
    const shapes = [
      { ...answer, results: [{ index: 9, relevance_score: 0.5 }] },
      { ...answer, results: [{ index: 0, relevance_score: 0.5 }, { index: 0, relevance_score: 0.4 }] },
      { ...answer, results: [{ index: 0, relevance_score: 'high' }] },
      { model: 'm' },
      'nope',
    ];
    for (const shape of shapes) {
      const fetcher = vi.fn<typeof fetch>(async () => json(shape));
      await expect(client(fetcher).rerank({ query: 'q', candidates: docs })).rejects.toThrow('unexpected shape');
    }
  });
});

describe('baselineRank', () => {
  it('keeps the given order and is plainly not a relevance model', () => {
    const ranked = baselineRank(['a', 'b', 'c'], 2);
    expect(ranked.map((r) => r.candidate.text)).toEqual(['a', 'b']);
    expect(ranked[0].score).toBe(1);
    expect(ranked[1].score).toBe(0.5);
  });
});
