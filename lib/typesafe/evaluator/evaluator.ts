import {
  TypeSafeApiError,
  type ChoiceAnswer,
  type DecisionEvaluationRequest,
  type DecisionEvaluationResult,
  type LinkProspect,
  type NoulAnswer,
  type ProspectAction,
  type ProspectJudgment,
  type ProspectJudgmentOptions,
  type RetryPolicy,
  type ScoreAnswer,
  type SystemOneCallOptions,
  type SystemOneEvaluationRequest,
  type SystemOneResult,
  type TypeSafeAnswer,
  type TypeSafeEntry,
  type TypeSafeEvaluatorConfig,
  type TypeSafeQuestion,
  type TypeSafeQuestions,
} from './types.js';
import { buildCalibratedConfidence, choice, noul, score } from './helpers/index.js';

const DEFAULT_BASE_URL = 'https://api.typesafe.ai';
const DEFAULT_MODEL = 'jev-latest';
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_INITIAL_DELAY_MS = 500;
const DEFAULT_MAX_DELAY_MS = 5_000;
const DEFAULT_MAX_RETRY_AFTER_MS = 60_000;
const PROSPECT_ACTION_THRESHOLD = 0.8;
const PROSPECT_FIT_THRESHOLD = 1;
const PROSPECT_SPAM_THRESHOLD = 0.5;

const prospectQuestions: TypeSafeQuestions = {
  route: choice('Choose the next action for this link prospect.', {
    act: 'The prospect is relevant, trustworthy, and worth pursuing now.',
    review: 'The prospect may be relevant, but a human should verify it before action.',
    drop: 'The prospect is irrelevant, unsafe, low quality, or not worth pursuing.',
  }),
  fit: score('How strong is the prospect fit for the requested business use?', [
    'No meaningful fit',
    'Possible fit',
    'Strong fit',
  ]),
  is_spam: noul('Does this prospect show signs of spam, deception, or an unsafe link source?', {
    true: 'Treat the prospect as unsafe or low quality.',
    false: 'No clear spam or safety concern is present.',
  }),
};

function environmentValue(name: string): string | undefined {
  const runtime = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  };
  return runtime.process?.env?.[name];
}

function defaultRetryStatuses(): ReadonlySet<number> {
  const statuses = new Set<number>([408, 429]);
  for (let status = 500; status <= 599; status += 1) statuses.add(status);
  return statuses;
}

function defaultRetryPolicy(): RetryPolicy {
  return {
    maxRetries: DEFAULT_MAX_RETRIES,
    initialDelayMs: DEFAULT_INITIAL_DELAY_MS,
    maxDelayMs: DEFAULT_MAX_DELAY_MS,
    maxRetryAfterMs: DEFAULT_MAX_RETRY_AFTER_MS,
    retryStatuses: defaultRetryStatuses(),
    respectRetryAfter: true,
    retryConnectionErrors: true,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isProbability(value: unknown): value is number {
  return isFiniteNumber(value) && value >= 0 && value <= 1;
}

function assertValidQuestions(questions: TypeSafeQuestions): void {
  const entries = Object.entries(questions);
  if (entries.length === 0) throw new TypeError('At least one TypeSafe question is required');

  for (const [name, question] of entries) {
    if (!question || !['noul', 'choice', 'score'].includes(question.type)) {
      throw new TypeError(`Question ${name} has an invalid type`);
    }
    if (question.type === 'choice') {
      const optionCount = Object.keys(question.criteria).length;
      if (optionCount === 0) throw new TypeError(`Choice question ${name} requires criteria`);
      if (optionCount > 255) throw new TypeError(`Choice question ${name} exceeds 255 criteria`);
    }
    if (question.type === 'score') {
      if (question.criteria.length < 2) {
        throw new TypeError(`Score question ${name} requires at least two criteria`);
      }
      if (question.criteria.length > 10) throw new TypeError(`Score question ${name} exceeds ten criteria`);
    }
  }
}

function toTypeSafeEntry(value: unknown): TypeSafeEntry {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('TypeSafe state cannot contain non-finite numbers');
    return value;
  }
  if (Array.isArray(value)) return value.map(toTypeSafeEntry);
  if (isRecord(value)) {
    const result: Record<string, TypeSafeEntry> = {};
    for (const [key, entry] of Object.entries(value)) {
      if (entry !== undefined) result[key] = toTypeSafeEntry(entry);
    }
    return result;
  }
  throw new TypeError(`TypeSafe state cannot contain ${typeof value}`);
}

function assertProbability(value: unknown, field: string): asserts value is number {
  if (!isProbability(value)) throw new TypeError(`${field} must be a probability from zero to one`);
}

function parseProbabilityMap(value: unknown, field: string): Readonly<Record<string, number>> {
  if (!isRecord(value)) throw new TypeError(`${field} must be an object`);
  const probabilities: Record<string, number> = {};
  for (const [key, probability] of Object.entries(value)) {
    assertProbability(probability, `${field}.${key}`);
    probabilities[key] = probability;
  }
  return probabilities;
}

function parseLegend(value: unknown): Readonly<Record<string, string>> {
  if (!isRecord(value)) throw new TypeError('Score legend must be an object');
  const legend: Record<string, string> = {};
  for (const [key, description] of Object.entries(value)) {
    if (typeof description !== 'string') throw new TypeError(`Score legend.${key} must be a string`);
    legend[key] = description;
  }
  return legend;
}

function parseAnswer(value: unknown): TypeSafeAnswer {
  if (!isRecord(value) || typeof value.type !== 'string') {
    throw new TypeError('TypeSafe answer must contain a type');
  }

  if (value.type === 'noul') {
    assertProbability(value.noul, 'noul');
    return { type: 'noul', noul: value.noul };
  }

  if (value.type === 'choice') {
    if (typeof value.choice !== 'string') throw new TypeError('Choice answer must contain a choice');
    assertProbability(value.confidence, 'confidence');
    return {
      type: 'choice',
      choice: value.choice,
      probabilities: parseProbabilityMap(value.probabilities, 'probabilities'),
      confidence: value.confidence,
    };
  }

  if (value.type === 'score') {
    if (!isFiniteNumber(value.score)) throw new TypeError('Score answer must contain a score');
    assertProbability(value.confidence, 'confidence');
    return {
      type: 'score',
      score: value.score,
      legend: parseLegend(value.legend),
      probabilities: parseProbabilityMap(value.probabilities, 'probabilities'),
      confidence: value.confidence,
    };
  }

  throw new TypeError(`Unsupported TypeSafe answer type: ${value.type}`);
}

function assertAnswerMatchesQuestion(
  name: string,
  question: TypeSafeQuestion,
  answer: TypeSafeAnswer,
): void {
  if (question.type !== answer.type) {
    throw new TypeError(`Answer ${name} has type ${answer.type}, expected ${question.type}`);
  }
  if (question.type === 'choice' && isChoiceAnswer(answer)) {
    if (!Object.prototype.hasOwnProperty.call(question.criteria, answer.choice)) {
      throw new TypeError(`Answer ${name} selected an unknown choice`);
    }
  }
  if (question.type === 'score' && isScoreAnswer(answer)) {
    for (let level = 0; level < question.criteria.length; level += 1) {
      if (!Object.prototype.hasOwnProperty.call(answer.probabilities, String(level))) {
        throw new TypeError(`Answer ${name} is missing score level ${level}`);
      }
    }
  }
}

function parseSystemOneResult(value: unknown, questions?: TypeSafeQuestions): SystemOneResult {
  if (!isRecord(value) || typeof value.model !== 'string') {
    throw new TypeError('TypeSafe response must contain a model');
  }
  if (!isRecord(value.answers)) throw new TypeError('TypeSafe response must contain answers');
  if (!isRecord(value.usage)) throw new TypeError('TypeSafe response must contain usage');
  if (!isFiniteNumber(value.usage.input_tokens) || !isFiniteNumber(value.usage.output_tokens)) {
    throw new TypeError('TypeSafe usage must contain numeric token counts');
  }

  const answers: Record<string, TypeSafeAnswer> = {};
  for (const [name, answer] of Object.entries(value.answers)) answers[name] = parseAnswer(answer);
  for (const [name, question] of Object.entries(questions ?? {})) {
    const answer = answers[name];
    if (!answer) throw new TypeError(`TypeSafe response is missing answer ${name}`);
    assertAnswerMatchesQuestion(name, question, answer);
  }

  return {
    model: value.model,
    answers,
    usage: {
      input_tokens: value.usage.input_tokens,
      output_tokens: value.usage.output_tokens,
    },
  };
}

async function readResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';
  try {
    if (contentType.includes('json')) return await response.json();
    return await response.text();
  } catch {
    return null;
  }
}

function parseRetryAfter(response: Response, policy: RetryPolicy): number | null {
  if (!policy.respectRetryAfter) return null;

  const retryAfterMs = response.headers.get('retry-after-ms');
  if (retryAfterMs !== null) {
    const value = Number(retryAfterMs);
    if (Number.isFinite(value) && value >= 0) return Math.min(value, policy.maxRetryAfterMs);
  }

  const retryAfter = response.headers.get('retry-after');
  if (retryAfter === null) return null;
  const seconds = Number(retryAfter);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(seconds * 1_000, policy.maxRetryAfterMs);
  }

  const date = Date.parse(retryAfter);
  if (Number.isNaN(date)) return null;
  return Math.max(0, Math.min(date - Date.now(), policy.maxRetryAfterMs));
}

function backoffDelay(policy: RetryPolicy, retryNumber: number): number {
  return Math.min(policy.maxDelayMs, policy.initialDelayMs * 2 ** retryNumber);
}

function sleepDefault(delayMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

function isAbortError(error: unknown): boolean {
  return isRecord(error) && error.name === 'AbortError';
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown TypeSafe evaluation error';
}

function clampProbability(value: number, fallback: number): number {
  return isProbability(value) ? value : fallback;
}

function isChoiceAnswer(answer: TypeSafeAnswer | undefined): answer is ChoiceAnswer {
  return answer?.type === 'choice';
}

function isScoreAnswer(answer: TypeSafeAnswer | undefined): answer is ScoreAnswer {
  return answer?.type === 'score';
}

function isNoulAnswer(answer: TypeSafeAnswer | undefined): answer is NoulAnswer {
  return answer?.type === 'noul';
}

function isProspectAction(value: string): value is ProspectAction {
  return value === 'act' || value === 'review' || value === 'drop';
}

function legacyQuestion(request: DecisionEvaluationRequest): TypeSafeQuestion {
  if (request.options.length === 0) throw new TypeError('Evaluation requires at least one option');
  const labels = request.options.map((option) => option.label);
  if (new Set(labels).size !== labels.length) throw new TypeError('Decision option labels must be unique');
  if (new Set(request.options.map((option) => option.id)).size !== request.options.length) {
    throw new TypeError('Decision option IDs must be unique');
  }

  if (request.type === 'Choice') {
    return choice(request.question, Object.fromEntries(labels.map((label) => [label, label])));
  }
  if (request.type === 'Score') {
    return score(request.question, labels as [string, string, ...string[]]);
  }
  return noul(
    request.question,
    request.options.length >= 2
      ? { true: request.options[0].label, false: request.options[1].label }
      : null,
  );
}

function legacyDistribution(
  request: DecisionEvaluationRequest,
  probabilities: Readonly<Record<string, number>>,
): Record<string, number> {
  const distribution: Record<string, number> = {};
  for (const option of request.options) {
    distribution[option.id] = probabilities[option.label] ?? 0;
  }
  return distribution;
}

export class TypeSafeEvaluator {
  private readonly apiKey: string;
  private readonly baseURL: string;
  private readonly defaultModel: string;
  private readonly fetchImpl: typeof fetch;
  private readonly timeoutMs: number;
  private readonly retry: RetryPolicy;
  private readonly sleep: (delayMs: number) => Promise<void>;

  constructor(config: TypeSafeEvaluatorConfig | string = {}) {
    const resolvedConfig = typeof config === 'string'
      ? { baseURL: config.replace(/\/v1\/[^/]+$/, '') }
      : config;
    const apiKey = resolvedConfig.apiKey?.trim() || environmentValue('TYPESAFE_API_KEY');
    if (!apiKey) throw new TypeSafeApiError('TYPESAFE_API_KEY is required');

    const baseURL = resolvedConfig.baseURL?.trim() || environmentValue('TYPESAFE_BASE_URL') || DEFAULT_BASE_URL;
    const defaults = defaultRetryPolicy();
    const retry = resolvedConfig.retry;
    this.apiKey = apiKey;
    this.baseURL = baseURL.replace(/\/+$/, '');
    this.defaultModel = resolvedConfig.defaultModel?.trim() || environmentValue('TYPESAFE_DEFAULT_MODEL') || DEFAULT_MODEL;
    this.fetchImpl = resolvedConfig.fetch ?? globalThis.fetch;
    this.timeoutMs = resolvedConfig.timeoutMs ?? resolvedConfig.timeout ?? DEFAULT_TIMEOUT_MS;
    this.retry = {
      maxRetries: retry?.maxRetries ?? defaults.maxRetries,
      initialDelayMs: retry?.initialDelayMs ?? defaults.initialDelayMs,
      maxDelayMs: retry?.maxDelayMs ?? defaults.maxDelayMs,
      maxRetryAfterMs: retry?.maxRetryAfterMs ?? defaults.maxRetryAfterMs,
      retryStatuses: retry?.retryStatuses ?? defaults.retryStatuses,
      respectRetryAfter: retry?.respectRetryAfter ?? defaults.respectRetryAfter,
      retryConnectionErrors: retry?.retryConnectionErrors ?? defaults.retryConnectionErrors,
    };
    this.sleep = resolvedConfig.sleep ?? sleepDefault;

    if (typeof this.fetchImpl !== 'function') throw new TypeSafeApiError('A Fetch implementation is required');
    if (!Number.isFinite(this.timeoutMs) || this.timeoutMs < 1) throw new TypeError('timeoutMs must be positive');
    if (!Number.isInteger(this.retry.maxRetries) || this.retry.maxRetries < 0) {
      throw new TypeError('maxRetries must be a non-negative integer');
    }
    if (!Number.isFinite(this.retry.initialDelayMs) || this.retry.initialDelayMs < 0) {
      throw new TypeError('initialDelayMs must be non-negative');
    }
    if (!Number.isFinite(this.retry.maxDelayMs) || this.retry.maxDelayMs < 0) {
      throw new TypeError('maxDelayMs must be non-negative');
    }
  }

  async systemOne(
    request: SystemOneEvaluationRequest,
    options: SystemOneCallOptions = {},
  ): Promise<SystemOneResult> {
    assertValidQuestions(request.questions);
    const model = options.model?.trim() || request.model?.trim() || this.defaultModel;
    const state = toTypeSafeEntry(request.state);
    const body = JSON.stringify({ state, model, questions: request.questions });
    const endpoint = `${this.baseURL}/v1/systemone`;
    let retries = 0;

    while (true) {
      let response: Response;
      try {
        response = await this.performRequest(endpoint, body, options.signal);
      } catch (error) {
        if (options.signal?.aborted || (isAbortError(error) && options.signal?.aborted)) throw error;
        if (!this.retry.retryConnectionErrors || retries >= this.retry.maxRetries) {
          throw new TypeSafeApiError(`TypeSafe request failed: ${errorText(error)}`, { cause: error });
        }
        await this.sleep(backoffDelay(this.retry, retries));
        retries += 1;
        continue;
      }

      if (response.ok) {
        try {
          return parseSystemOneResult(await response.json(), request.questions);
        } catch (error) {
          throw new TypeSafeApiError(`TypeSafe returned an invalid response: ${errorText(error)}`, { cause: error });
        }
      }

      const responseBody = await readResponseBody(response);
      const retryable = this.retry.retryStatuses.has(response.status);
      if (!retryable || retries >= this.retry.maxRetries) {
        throw new TypeSafeApiError(`TypeSafe request failed with HTTP ${response.status}`, {
          status: response.status,
          body: responseBody,
          retryable,
          cause: new Error(`HTTP ${response.status}`),
        });
      }

      const retryAfter = parseRetryAfter(response, this.retry);
      await this.sleep(retryAfter ?? backoffDelay(this.retry, retries));
      retries += 1;
    }
  }

  async evaluate(request: DecisionEvaluationRequest): Promise<DecisionEvaluationResult> {
    const state = typeof request.context === 'string'
      ? request.context
      : request.context === undefined
        ? request.question
        : toTypeSafeEntry({ question: request.question, ...request.context });
    const result = await this.systemOne({
      state,
      questions: { decision: legacyQuestion(request) },
    });
    const answer = result.answers.decision;
    const modelConfidence = answer?.type === 'noul'
      ? Math.max(answer.noul, 1 - answer.noul)
      : answer?.confidence;

    if (request.type === 'Noul') {
      if (!isNoulAnswer(answer)) throw new TypeSafeApiError('TypeSafe returned the wrong answer type');
      const yes = request.options[0];
      const no = request.options[1];
      const distribution = no
        ? { [yes.id]: answer.noul, [no.id]: 1 - answer.noul }
        : { [yes.id]: Math.max(answer.noul, 1 - answer.noul) };
      return {
        winnerId: answer.noul >= 0.5 ? yes.id : (no?.id ?? yes.id),
        distribution,
        confidence: buildCalibratedConfidence(modelConfidence ?? 0.5),
        model: result.model,
        modelConfidence,
      };
    }

    if (request.type === 'Choice') {
      if (!isChoiceAnswer(answer)) throw new TypeSafeApiError('TypeSafe returned the wrong answer type');
      const winner = request.options.find((option) => option.label === answer.choice);
      if (!winner) throw new TypeSafeApiError(`TypeSafe returned an unknown choice: ${answer.choice}`);
      return {
        winnerId: winner.id,
        distribution: legacyDistribution(request, answer.probabilities),
        confidence: buildCalibratedConfidence(answer.confidence),
        model: result.model,
        modelConfidence: answer.confidence,
      };
    }

    if (!isScoreAnswer(answer)) throw new TypeSafeApiError('TypeSafe returned the wrong answer type');
    const winner = request.options.reduce((best, option) => {
      const bestProbability = answer.probabilities[best.label] ?? 0;
      const optionProbability = answer.probabilities[option.label] ?? 0;
      return optionProbability > bestProbability ? option : best;
    });
    return {
      winnerId: winner.id,
      distribution: legacyDistribution(request, answer.probabilities),
      confidence: buildCalibratedConfidence(answer.confidence),
      model: result.model,
      modelConfidence: answer.confidence,
    };
  }

  async judgeProspect(
    prospect: LinkProspect,
    options: ProspectJudgmentOptions = {},
  ): Promise<ProspectJudgment> {
    const actionConfidenceThreshold = clampProbability(
      options.actionConfidenceThreshold ?? PROSPECT_ACTION_THRESHOLD,
      PROSPECT_ACTION_THRESHOLD,
    );
    const minimumFitScore = options.minimumFitScore ?? PROSPECT_FIT_THRESHOLD;
    const spamProbabilityThreshold = clampProbability(
      options.spamProbabilityThreshold ?? PROSPECT_SPAM_THRESHOLD,
      PROSPECT_SPAM_THRESHOLD,
    );

    if (!prospect.url.trim()) throw new TypeError('A prospect URL is required');

    try {
      const result = await this.systemOne({
        state: toTypeSafeEntry(prospect),
        questions: prospectQuestions,
      });
      const route = result.answers.route;
      const fit = result.answers.fit;
      const spam = result.answers.is_spam;

      if (!isChoiceAnswer(route) || !isProspectAction(route.choice)) {
        return {
          action: 'review',
          confidence: 0,
          model: result.model,
          reasons: ['TypeSafe did not return a valid prospect route'],
        };
      }

      const judgment: ProspectJudgment = {
        action: 'review',
        confidence: route.confidence,
        route: route.choice,
        fitScore: isScoreAnswer(fit) ? fit.score : undefined,
        fitConfidence: isScoreAnswer(fit) ? fit.confidence : undefined,
        spamProbability: isNoulAnswer(spam) ? spam.noul : undefined,
        model: result.model,
        reasons: [],
      };

      if (route.choice === 'drop') {
        if (route.confidence < actionConfidenceThreshold) {
          judgment.reasons.push('The drop route is below the action confidence threshold');
          return judgment;
        }
        judgment.action = 'drop';
        judgment.reasons.push('TypeSafe confidently recommends dropping the prospect');
        return judgment;
      }

      if (route.choice === 'review') {
        judgment.reasons.push('TypeSafe recommends human review');
        return judgment;
      }

      if (route.confidence < actionConfidenceThreshold) {
        judgment.reasons.push('The act route is below the action confidence threshold');
        return judgment;
      }
      if (!isScoreAnswer(fit)) {
        judgment.reasons.push('TypeSafe did not return a valid fit score');
        return judgment;
      }
      if (fit.confidence < actionConfidenceThreshold) {
        judgment.reasons.push('The fit score is below the action confidence threshold');
        return judgment;
      }
      if (fit.score < minimumFitScore) {
        judgment.reasons.push('The prospect fit score is below the required threshold');
        return judgment;
      }
      if (!isNoulAnswer(spam)) {
        judgment.reasons.push('TypeSafe did not return a valid spam probability');
        return judgment;
      }
      if (spam.noul >= spamProbabilityThreshold) {
        judgment.reasons.push('The prospect exceeds the spam safety threshold');
        return judgment;
      }

      judgment.action = 'act';
      judgment.reasons.push('TypeSafe confidently recommends acting on the prospect');
      return judgment;
    } catch (error) {
      return {
        action: 'review',
        confidence: 0,
        reasons: [`Prospect evaluation unavailable: ${errorText(error)}`],
      };
    }
  }

  private async performRequest(endpoint: string, body: string, signal?: AbortSignal): Promise<Response> {
    const controller = new AbortController();
    const abortFromCaller = (): void => controller.abort();
    if (signal?.aborted) controller.abort();
    else signal?.addEventListener('abort', abortFromCaller, { once: true });

    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      return await this.fetchImpl(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener('abort', abortFromCaller);
    }
  }
}
