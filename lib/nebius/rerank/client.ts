import type {
  NebiusRerankConfig,
  RerankCandidate,
  RerankOptions,
  RerankOutcome,
  RerankResult,
} from './types.js';
import { normalizeScores } from './helpers/index.js';

export const NEBIUS_DEFAULT_BASE_URL = 'https://api.tokenfactory.nebius.com/v1';
export const NEBIUS_DEFAULT_RERANK_MODEL = 'Qwen/Qwen3-Reranker-8B';

/**
 * A failed call to Nebius, in plain words. `status` is the HTTP status (0 when nothing answered or the request was
 * refused before it was sent). The message never holds the API key or the response body.
 */
export class NebiusError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'NebiusError';
  }
}

const RETRYABLE = new Set([408, 429, 500, 502, 503, 504]);

function reasonFor(status: number): string {
  if (status === 401 || status === 403) return 'Nebius refused the API key';
  if (status === 402) return 'The Nebius account is out of credit';
  if (status === 404) return 'Nebius does not know that model';
  if (status === 422 || status === 400) return 'Nebius rejected the rerank request';
  if (status === 429) return 'Nebius is rate limiting requests';
  return `Nebius answered HTTP ${status}`;
}

/** Reranks candidates against a query with a cross-encoder hosted on Nebius Token Factory (`POST /v1/rerank`). */
export class NebiusRerankClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultModel: string;
  private readonly fetcher: typeof fetch;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly retryDelayMs: number;

  constructor(config: NebiusRerankConfig = {}) {
    this.apiKey = config.apiKey ?? process.env.NEBIUS_API_KEY ?? '';
    this.baseUrl = (config.baseUrl ?? process.env.NEBIUS_BASE_URL ?? NEBIUS_DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.defaultModel = config.defaultModel ?? process.env.DEFAULT_RANK_MODEL ?? NEBIUS_DEFAULT_RERANK_MODEL;
    this.fetcher = config.fetcher ?? ((...args) => fetch(...args));
    this.timeoutMs = config.timeoutMs ?? 30_000;
    this.maxRetries = config.maxRetries ?? 2;
    this.retryDelayMs = config.retryDelayMs ?? 500;
  }

  /** The candidates ordered most relevant first, at most `topK` of them. */
  async rerank(options: RerankOptions): Promise<RerankResult[]> {
    return (await this.rerankDetailed(options)).results;
  }

  /** Like `rerank`, and also returns the model that answered and the tokens used. */
  async rerankDetailed(options: RerankOptions): Promise<RerankOutcome> {
    const { query, candidates, model = this.defaultModel, serviceTier } = options;
    if (!query.trim()) throw new NebiusError('The rerank query is empty', 0);
    const normalized = candidates.map((c): RerankCandidate => (typeof c === 'string' ? { text: c } : c));
    if (normalized.length === 0) return { results: [], model, usage: { promptTokens: 0, totalTokens: 0 } };
    const topK = options.topK ?? normalized.length;
    if (!Number.isInteger(topK) || topK < 1) throw new NebiusError('topK must be a whole number of at least 1', 0);
    if (normalized.some((c) => !c.text.trim())) throw new NebiusError('A candidate has no text to rank', 0);
    if (!this.apiKey) throw new NebiusError('NEBIUS_API_KEY is not set', 0);

    const body = JSON.stringify({
      model,
      query,
      documents: normalized.map((c) => c.text),
      ...(serviceTier ? { service_tier: serviceTier } : {}),
    });
    const raw = await (await this.send(body)).json().catch(() => null);
    return parseResponse(raw, normalized, model, topK);
  }

  private async send(body: string): Promise<Response> {
    let delay = this.retryDelayMs;
    for (let attempt = 0; ; attempt += 1) {
      let res: Response;
      try {
        res = await this.fetcher(`${this.baseUrl}/rerank`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
          body,
          signal: AbortSignal.timeout(this.timeoutMs),
        });
      } catch {
        if (attempt >= this.maxRetries) throw new NebiusError('Could not reach Nebius', 0);
        await sleep(delay);
        delay *= 2;
        continue;
      }
      if (res.ok) return res;
      if (!RETRYABLE.has(res.status) || attempt >= this.maxRetries) throw new NebiusError(reasonFor(res.status), res.status);
      await sleep(delay);
      delay *= 2;
    }
  }
}

function sleep(ms: number): Promise<void> {
  return ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve();
}

/** Map Nebius's answer back onto the candidates that were sent, checking every field that is used. */
function parseResponse(raw: unknown, sent: RerankCandidate[], requestedModel: string, topK: number): RerankOutcome {
  const bad = () => new NebiusError('Nebius sent an answer in an unexpected shape', 200);
  if (typeof raw !== 'object' || raw === null) throw bad();
  const { results, model, usage } = raw as {
    results?: { index?: unknown; relevance_score?: unknown }[];
    model?: unknown;
    usage?: { prompt_tokens?: unknown; total_tokens?: unknown };
  };
  if (!Array.isArray(results)) throw bad();

  const seen = new Set<number>();
  const scored = results.map((row) => {
    const index = row?.index;
    const score = row?.relevance_score;
    if (typeof index !== 'number' || !Number.isInteger(index) || index < 0 || index >= sent.length) throw bad();
    if (typeof score !== 'number' || !Number.isFinite(score) || seen.has(index)) throw bad();
    seen.add(index);
    return { index, score };
  });

  scored.sort((a, b) => b.score - a.score || a.index - b.index);
  const normalizedScores = normalizeScores(scored.map((r) => r.score));
  const ranked: RerankResult[] = scored.map((r, i) => ({
    index: r.index,
    score: r.score,
    normalizedScore: normalizedScores[i],
    candidate: sent[r.index],
  }));

  return {
    results: ranked.slice(0, topK),
    model: typeof model === 'string' ? model : requestedModel,
    usage: {
      promptTokens: typeof usage?.prompt_tokens === 'number' ? usage.prompt_tokens : 0,
      totalTokens: typeof usage?.total_tokens === 'number' ? usage.total_tokens : 0,
    },
  };
}
