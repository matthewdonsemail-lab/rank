/**
 * The run the hero box starts: read the brand's site, find competitors, then rank and judge the best of them.
 * Each step is one Convex action that already exists (`startBrandEnrichment`, `startCompetitorDiscovery`,
 * `startCompetitorProspectEvaluations`); this file only calls them in order, checks each finished, and shapes the
 * answer for the page. The Convex calls come in through `RunApi`, so this runs the same in tests with a stand-in.
 */

export type StepName = 'enrichment' | 'discovery' | 'evaluation';
export type StepStatus = 'running' | 'done';

export type ProspectAction = 'act' | 'review' | 'drop';

export interface EnrichmentRun {
  runId: string;
  state: string;
  context: { facts: { name: string; tagline: string } | null; error: string | null };
}

export interface DiscoveryRun {
  runId: string;
  state: string;
  context: { normalizedCandidates?: unknown[]; error: string | null };
}

export interface EvaluationSummary {
  runId: string;
  url: string;
  state: string;
  action: ProspectAction | null;
  confidence: number | null;
}

export interface QueueItem {
  runId: string;
  url: string;
  action: ProspectAction;
  confidence: number;
  judgment: { fitScore?: number | null; spamProbability?: number | null; reasons: string[] };
}

/** What the run needs from the backend. */
export interface RunApi {
  startEnrichment(url: string): Promise<EnrichmentRun>;
  startDiscovery(enrichmentRunId: string, limit: number): Promise<DiscoveryRun>;
  startEvaluations(discoveryRunId: string, limit: number): Promise<EvaluationSummary[]>;
  listQueue(action: ProspectAction): Promise<QueueItem[]>;
}

/** Competitors to look up, and how many of the best get ranked and judged. Each judged one costs a TypeSafe call. */
export const DISCOVERY_LIMIT = 20;
export const EVALUATION_LIMIT = 8;

export interface Prospect {
  /** Position after ranking, 1 is the best fit. */
  position: number;
  runId: string;
  url: string;
  domain: string;
  /** `failed` when the judgment itself could not be made. */
  action: ProspectAction | 'failed';
  confidence: number | null;
  /** 0 (poor) to 2 (strong), from TypeSafe. */
  fitScore: number | null;
  spamProbability: number | null;
  reasons: string[];
}

export interface RunResult {
  brand: { name: string; tagline: string };
  /** How many competitors were found before the best were picked. */
  competitorsFound: number;
  prospects: Prospect[];
}

/** A step that failed, with a sentence a visitor can act on. */
export class RunError extends Error {
  constructor(
    readonly step: StepName,
    message: string,
  ) {
    super(message);
    this.name = 'RunError';
  }
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** Convex errors arrive wrapped in text about the request; keep the part the backend wrote for people. */
export function plainMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  const withoutRequest = raw.replace(/^\[Request ID: [^\]]+\]\s*/, '').replace(/^Server Error\s*/i, '');
  const uncaught = withoutRequest.match(/Uncaught (?:ConvexError|Error): ([^\n]+)/);
  return (uncaught?.[1] ?? withoutRequest.split('\n')[0]).trim().slice(0, 240) || 'Something went wrong.';
}

export async function runProspecting(
  api: RunApi,
  websiteUrl: string,
  onStep: (step: StepName, status: StepStatus) => void = () => {},
): Promise<RunResult> {
  const guarded = async <T>(step: StepName, work: () => Promise<T>): Promise<T> => {
    onStep(step, 'running');
    try {
      const value = await work();
      onStep(step, 'done');
      return value;
    } catch (error) {
      if (error instanceof RunError) throw error;
      throw new RunError(step, plainMessage(error));
    }
  };

  const brand = await guarded('enrichment', async () => {
    const run = await api.startEnrichment(websiteUrl);
    if (run.state !== 'completed' || !run.context.facts) {
      throw new RunError('enrichment', run.context.error ?? 'We could not read that website. Check the address and try again.');
    }
    return { runId: run.runId, name: run.context.facts.name, tagline: run.context.facts.tagline };
  });

  const discovery = await guarded('discovery', async () => {
    const run = await api.startDiscovery(brand.runId, DISCOVERY_LIMIT);
    if (run.state !== 'completed') {
      throw new RunError('discovery', run.context.error ?? 'We could not find competitors for that site.');
    }
    const found = run.context.normalizedCandidates?.length ?? 0;
    if (found === 0) throw new RunError('discovery', 'No competitors came back for that site, so there is nothing to rank yet.');
    return { runId: run.runId, found };
  });

  return guarded('evaluation', async () => {
    const summaries = await api.startEvaluations(discovery.runId, EVALUATION_LIMIT);
    const [act, review, drop] = await Promise.all([api.listQueue('act'), api.listQueue('review'), api.listQueue('drop')]);
    const judged = new Map<string, QueueItem>([...act, ...review, ...drop].map((item) => [item.runId, item]));

    // `summaries` is in ranked order (best first); the queues are not, so they are only used to fill in details.
    const prospects: Prospect[] = summaries.map((summary, index) => {
      const item = judged.get(summary.runId);
      return {
        position: index + 1,
        runId: summary.runId,
        url: summary.url,
        domain: hostOf(summary.url),
        action: item?.action ?? summary.action ?? 'failed',
        confidence: item?.confidence ?? summary.confidence,
        fitScore: item?.judgment.fitScore ?? null,
        spamProbability: item?.judgment.spamProbability ?? null,
        reasons: item?.judgment.reasons ?? [],
      };
    });
    return { brand: { name: brand.name, tagline: brand.tagline }, competitorsFound: discovery.found, prospects };
  });
}
