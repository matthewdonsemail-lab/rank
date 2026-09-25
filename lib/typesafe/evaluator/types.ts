export type DecisionType = 'Choice' | 'Score' | 'Noul';

export interface DecisionOption {
  id: string;
  label: string;
  weight?: number;
}

export type ProspectAction = 'act' | 'review' | 'drop';

export type TypeSafeEntry =
  | string
  | number
  | boolean
  | null
  | TypeSafeEntry[]
  | { [key: string]: TypeSafeEntry };

export type TypeSafeQuestionType = 'noul' | 'choice' | 'score';

export type NoulCriteria = {
  true?: TypeSafeEntry;
  false?: TypeSafeEntry;
};

export type ChoiceCriteria = Readonly<Record<string, TypeSafeEntry>>;

export type ScoreCriteria = readonly [TypeSafeEntry, TypeSafeEntry, ...TypeSafeEntry[]];

export interface NoulQuestion {
  type: 'noul';
  instructions?: TypeSafeEntry;
  criteria?: NoulCriteria | null;
}

export interface ChoiceQuestion {
  type: 'choice';
  instructions: TypeSafeEntry;
  criteria: ChoiceCriteria;
}

export interface ScoreQuestion {
  type: 'score';
  instructions: TypeSafeEntry;
  criteria: ScoreCriteria;
}

export type TypeSafeQuestion = NoulQuestion | ChoiceQuestion | ScoreQuestion;

export type TypeSafeQuestions = Readonly<Record<string, TypeSafeQuestion>>;

export interface NoulAnswer {
  readonly type: 'noul';
  readonly noul: number;
}

export interface ChoiceAnswer {
  readonly type: 'choice';
  readonly choice: string;
  readonly probabilities: Readonly<Record<string, number>>;
  readonly confidence: number;
}

export interface ScoreAnswer {
  readonly type: 'score';
  readonly score: number;
  readonly legend: Readonly<Record<string, string>>;
  readonly probabilities: Readonly<Record<string, number>>;
  readonly confidence: number;
}

export type TypeSafeAnswer = NoulAnswer | ChoiceAnswer | ScoreAnswer;

export interface TypeSafeUsage {
  readonly input_tokens: number;
  readonly output_tokens: number;
}

export interface SystemOneResult {
  readonly model: string;
  readonly answers: Readonly<Record<string, TypeSafeAnswer>>;
  readonly usage: TypeSafeUsage;
}

export interface SystemOneEvaluationRequest {
  state: TypeSafeEntry;
  questions: TypeSafeQuestions;
  model?: string;
}

export interface SystemOneCallOptions {
  model?: string;
  signal?: AbortSignal;
}

export interface RetryPolicy {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  maxRetryAfterMs: number;
  retryStatuses: ReadonlySet<number>;
  respectRetryAfter: boolean;
  retryConnectionErrors: boolean;
}

export interface TypeSafeEvaluatorConfig {
  apiKey?: string;
  baseURL?: string;
  defaultModel?: string;
  fetch?: typeof fetch;
  timeoutMs?: number;
  timeout?: number;
  retry?: Partial<RetryPolicy>;
  sleep?: (delayMs: number) => Promise<void>;
}

export interface DecisionEvaluationRequest {
  type: DecisionType;
  question: string;
  options: DecisionOption[];
  context?: string | Record<string, unknown>;
}

export interface CalibratedConfidence {
  probability: number;
  confidenceInterval: [number, number];
  calibrationScore: number;
}

export interface DecisionEvaluationResult {
  winnerId: string;
  distribution: Record<string, number>;
  confidence: CalibratedConfidence;
  model?: string;
  modelConfidence?: number;
}

export interface LinkProspect {
  url: string;
  [key: string]: unknown;
  title?: string | null;
  description?: string | null;
  sourceDomain?: string | null;
  anchorText?: string | null;
  targetDomain?: string | null;
  fitRationale?: string | null;
  brandSummary?: string | null;
  metrics?: Record<string, unknown>;
  content?: string | null;
}

export interface ProspectJudgment {
  action: ProspectAction;
  confidence: number;
  route?: string | null;
  fitScore?: number | null;
  fitConfidence?: number | null;
  spamProbability?: number | null;
  model?: string | null;
  reasons: string[];
}

export interface ProspectJudgmentOptions {
  actionConfidenceThreshold?: number;
  minimumFitScore?: number;
  spamProbabilityThreshold?: number;
}

export type SystemOneRequestErrorOptions = {
  status?: number;
  body?: unknown;
  retryable?: boolean;
  cause?: unknown;
};

export class TypeSafeApiError extends Error {
  readonly status?: number;
  readonly body?: unknown;
  readonly retryable: boolean;
  readonly cause?: unknown;

  constructor(message: string, options: SystemOneRequestErrorOptions = {}) {
    super(message);
    this.name = 'TypeSafeApiError';
    this.status = options.status;
    this.body = options.body;
    this.retryable = options.retryable ?? false;
    this.cause = options.cause;
  }
}
