import { describe, expect, it, vi } from 'vitest'
import {
  DISCOVERY_LIMIT,
  EVALUATION_LIMIT,
  RunError,
  plainMessage,
  runProspecting,
  type QueueItem,
  type RunApi,
  type StepName,
} from './pipeline'

const enrichment = { runId: 'e1', state: 'completed', context: { facts: { name: 'Acme', tagline: 'Plumbing in Leeds' }, error: null } }
const discovery = { runId: 'd1', state: 'completed', context: { normalizedCandidates: [{}, {}, {}], error: null } }
const summaries = [
  { runId: 'p2', url: 'https://www.beta.com/', state: 'completed', action: 'review' as const, confidence: 0.6 },
  { runId: 'p1', url: 'https://alpha.com/', state: 'completed', action: 'act' as const, confidence: 0.9 },
  { runId: 'p3', url: 'https://gamma.com/', state: 'failed', action: null, confidence: null },
]
const item = (runId: string, url: string, action: QueueItem['action'], confidence: number): QueueItem => ({
  runId,
  url,
  action,
  confidence,
  judgment: { fitScore: 2, spamProbability: 0.05, reasons: [`reason for ${runId}`] },
})

function fakeApi(overrides: Partial<RunApi> = {}): RunApi {
  return {
    startEnrichment: vi.fn(async () => enrichment),
    startDiscovery: vi.fn(async () => discovery),
    startEvaluations: vi.fn(async () => summaries),
    listQueue: vi.fn(async (action) =>
      action === 'act' ? [item('p1', 'https://alpha.com/', 'act', 0.91)] : action === 'review' ? [item('p2', 'https://www.beta.com/', 'review', 0.62)] : [],
    ),
    ...overrides,
  }
}

describe('runProspecting', () => {
  it('runs the three steps in order with the caps, and returns prospects in ranked order with their judgments', async () => {
    const api = fakeApi()
    const steps: string[] = []
    const result = await runProspecting(api, 'https://acme.com', (step, status) => steps.push(`${step}:${status}`))

    expect(steps).toEqual(['enrichment:running', 'enrichment:done', 'discovery:running', 'discovery:done', 'evaluation:running', 'evaluation:done'])
    expect(api.startEnrichment).toHaveBeenCalledWith('https://acme.com')
    expect(api.startDiscovery).toHaveBeenCalledWith('e1', DISCOVERY_LIMIT)
    expect(api.startEvaluations).toHaveBeenCalledWith('d1', EVALUATION_LIMIT)

    expect(result.brand).toEqual({ name: 'Acme', tagline: 'Plumbing in Leeds' })
    expect(result.competitorsFound).toBe(3)
    expect(result.prospects.map((p) => [p.position, p.domain, p.action])).toEqual([
      [1, 'beta.com', 'review'],
      [2, 'alpha.com', 'act'],
      [3, 'gamma.com', 'failed'],
    ])
    expect(result.prospects[1]).toMatchObject({ confidence: 0.91, fitScore: 2, spamProbability: 0.05, reasons: ['reason for p1'] })
    expect(result.prospects[2]).toMatchObject({ confidence: null, fitScore: null, reasons: [] })
  })

  it('stops at a website it could not read, and says why in the backend words', async () => {
    const api = fakeApi({ startEnrichment: vi.fn(async () => ({ runId: 'e1', state: 'failed', context: { facts: null, error: 'That site blocked us.' } })) })
    const error = await runProspecting(api, 'https://acme.com').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(RunError)
    expect(error).toMatchObject({ step: 'enrichment', message: 'That site blocked us.' })
    expect(api.startDiscovery).not.toHaveBeenCalled()
  })

  it('stops when no competitors come back, without spending judgments', async () => {
    const api = fakeApi({ startDiscovery: vi.fn(async () => ({ runId: 'd1', state: 'completed', context: { normalizedCandidates: [], error: null } })) })
    await expect(runProspecting(api, 'https://acme.com')).rejects.toMatchObject({ step: 'discovery' })
    expect(api.startEvaluations).not.toHaveBeenCalled()
  })

  it('turns a thrown backend error into a plain sentence at the step that failed', async () => {
    const api = fakeApi({
      startEvaluations: vi.fn(async () => {
        throw new Error('[Request ID: abc123] Server Error\nUncaught ConvexError: Authentication required\n  at handler')
      }),
    })
    const seen: StepName[] = []
    const error = await runProspecting(api, 'https://acme.com', (s, status) => status === 'running' && seen.push(s)).catch((e: unknown) => e)
    expect(error).toMatchObject({ step: 'evaluation', message: 'Authentication required' })
    expect(seen).toEqual(['enrichment', 'discovery', 'evaluation'])
  })
})

describe('plainMessage', () => {
  it('keeps the sentence the backend wrote and drops the request wrapper', () => {
    expect(plainMessage(new Error('[Request ID: x] Server Error\nUncaught Error: Brand enrichment must complete first'))).toBe('Brand enrichment must complete first')
    expect(plainMessage(new Error('plain'))).toBe('plain')
    expect(plainMessage('a string')).toBe('a string')
    expect(plainMessage(new Error(''))).toBe('Something went wrong.')
  })
})
