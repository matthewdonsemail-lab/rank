import { describe, expect, it, vi } from 'vitest';
import { TypeSafeEvaluator } from './index.js';

function response(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

function systemOneResponse(answers: Record<string, unknown>): Response {
  return response({
    model: 'jev-latest',
    answers,
    usage: { input_tokens: 20, output_tokens: 8 },
  });
}

describe('TypeSafeEvaluator', () => {
  it('calls System One with the documented request and parses typed answers', async () => {
    const calls: Array<{ input: Parameters<typeof fetch>[0]; init?: RequestInit }> = [];
    const fetchMock = vi.fn(async (input: Parameters<typeof fetch>[0], init?: RequestInit) => {
      calls.push({ input, init });
      return systemOneResponse({
        urgent: { type: 'noul', noul: 0.91 },
        team: {
          type: 'choice',
          choice: 'billing',
          probabilities: { billing: 0.81, technical: 0.19 },
          confidence: 0.81,
        },
        severity: {
          type: 'score',
          score: 1.4,
          legend: { '0': 'Low', '1': 'Medium', '2': 'High' },
          probabilities: { '0': 0.1, '1': 0.5, '2': 0.4 },
          confidence: 0.5,
        },
      });
    }) as unknown as typeof fetch;
    const evaluator = new TypeSafeEvaluator({ apiKey: 'test-key', fetch: fetchMock });

    const result = await evaluator.systemOne({
      state: { message: 'My payout failed' },
      questions: {
        urgent: { type: 'noul', instructions: 'Is this urgent?' },
        team: { type: 'choice', instructions: 'Which team?', criteria: { billing: 'Payments', technical: 'Bugs' } },
        severity: { type: 'score', instructions: 'How severe?', criteria: ['Low', 'Medium', 'High'] },
      },
    });

    expect(calls).toHaveLength(1);
    expect(String(calls[0].input)).toBe('https://api.typesafe.ai/v1/systemone');
    expect(calls[0].init?.headers).toMatchObject({
      Authorization: 'Bearer test-key',
      'Content-Type': 'application/json',
    });
    expect(JSON.parse(String(calls[0].init?.body))).toEqual({
      state: { message: 'My payout failed' },
      model: 'jev-latest',
      questions: {
        urgent: { type: 'noul', instructions: 'Is this urgent?' },
        team: { type: 'choice', instructions: 'Which team?', criteria: { billing: 'Payments', technical: 'Bugs' } },
        severity: { type: 'score', instructions: 'How severe?', criteria: ['Low', 'Medium', 'High'] },
      },
    });
    expect(result.answers.urgent).toEqual({ type: 'noul', noul: 0.91 });
    expect(result.answers.team.type).toBe('choice');
    expect(result.usage).toEqual({ input_tokens: 20, output_tokens: 8 });
  });

  it('retries transient HTTP responses without replacing model confidence', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ error: 'rate limited' }, 429, { 'retry-after-ms': '0' }))
      .mockResolvedValueOnce(systemOneResponse({
        decision: { type: 'choice', choice: 'act', probabilities: { act: 0.76, review: 0.24 }, confidence: 0.76 },
      })) as unknown as typeof fetch;
    const sleep = vi.fn(async () => undefined);
    const evaluator = new TypeSafeEvaluator({ apiKey: 'test-key', fetch: fetchMock, sleep, retry: { maxRetries: 1 } });

    const result = await evaluator.evaluate({
      type: 'Choice',
      question: 'What should we do?',
      options: [{ id: 'act', label: 'act' }, { id: 'review', label: 'review' }],
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledWith(0);
    expect(result.winnerId).toBe('act');
    expect(result.modelConfidence).toBe(0.76);
    expect(result.confidence.probability).toBe(0.76);
  });

  it('routes a confident, relevant prospect to act', async () => {
    const fetchMock = vi.fn(async () => systemOneResponse({
      route: {
        type: 'choice',
        choice: 'act',
        probabilities: { act: 0.92, review: 0.05, drop: 0.03 },
        confidence: 0.9,
      },
      fit: {
        type: 'score',
        score: 2,
        legend: { '0': 'No fit', '1': 'Possible fit', '2': 'Strong fit' },
        probabilities: { '0': 0.01, '1': 0.09, '2': 0.9 },
        confidence: 0.89,
      },
      is_spam: { type: 'noul', noul: 0.02 },
    })) as unknown as typeof fetch;
    const evaluator = new TypeSafeEvaluator({ apiKey: 'test-key', fetch: fetchMock });

    const judgment = await evaluator.judgeProspect({ url: 'https://example.com/article' });

    expect(judgment.action).toBe('act');
    expect(judgment.confidence).toBe(0.9);
    expect(judgment.fitScore).toBe(2);
    expect(judgment.spamProbability).toBe(0.02);
    expect(judgment.reasons).toContain('TypeSafe confidently recommends acting on the prospect');
  });

  it('routes low-confidence or unsafe prospects to review', async () => {
    const lowConfidence = vi.fn(async () => systemOneResponse({
      route: { type: 'choice', choice: 'act', probabilities: { act: 0.61, review: 0.39 }, confidence: 0.61 },
      fit: {
        type: 'score',
        score: 2,
        legend: { '0': 'No fit', '1': 'Possible fit', '2': 'Strong fit' },
        probabilities: { '0': 0.01, '1': 0.09, '2': 0.9 },
        confidence: 0.89,
      },
      is_spam: { type: 'noul', noul: 0.02 },
    })) as unknown as typeof fetch;
    const evaluator = new TypeSafeEvaluator({ apiKey: 'test-key', fetch: lowConfidence });

    const judgment = await evaluator.judgeProspect({ url: 'https://example.com/article' });

    expect(judgment.action).toBe('review');
    expect(judgment.reasons).toContain('The act route is below the action confidence threshold');
  });

  it('preserves a confident drop decision', async () => {
    const fetchMock = vi.fn(async () => systemOneResponse({
      route: {
        type: 'choice',
        choice: 'drop',
        probabilities: { act: 0.02, review: 0.05, drop: 0.93 },
        confidence: 0.91,
      },
      fit: {
        type: 'score',
        score: 0,
        legend: { '0': 'No fit', '1': 'Possible fit', '2': 'Strong fit' },
        probabilities: { '0': 0.93, '1': 0.05, '2': 0.02 },
        confidence: 0.91,
      },
      is_spam: { type: 'noul', noul: 0.02 },
    })) as unknown as typeof fetch;
    const evaluator = new TypeSafeEvaluator({ apiKey: 'test-key', fetch: fetchMock });

    const judgment = await evaluator.judgeProspect({ url: 'https://spam.example/article' });

    expect(judgment.action).toBe('drop');
    expect(judgment.route).toBe('drop');
    expect(judgment.reasons).toContain('TypeSafe confidently recommends dropping the prospect');
  });

  it('fails closed to review when the API is unavailable', async () => {
    const fetchMock = vi.fn(async () => response({ error: 'unauthorized' }, 401)) as unknown as typeof fetch;
    const evaluator = new TypeSafeEvaluator({ apiKey: 'test-key', fetch: fetchMock });

    const judgment = await evaluator.judgeProspect({ url: 'https://example.com/article' });

    expect(judgment.action).toBe('review');
    expect(judgment.confidence).toBe(0);
    expect(judgment.reasons[0]).toContain('HTTP 401');
  });
});
