import {
  NebiusRerankClient,
  type RerankCandidate,
  type RerankResult,
  type RerankOptions,
  type NebiusRerankConfig,
  calculateRrfScore,
  normalizeScores,
} from '../lib/nebius/rerank/index.js';
import {
  brandEnrichmentMachine,
  isTerminalEnrichmentState,
} from '../lib/xstate/enrichment/index.js';
import type {
  EnrichmentContext,
  EnrichmentDocument,
  EnrichmentEvent,
  EnrichmentFacts,
  EnrichmentInput,
  EnrichmentState,
} from '../lib/xstate/enrichment/index.js';
import {
  competitorDiscoveryMachine,
  isTerminalCompetitorDiscoveryState,
} from '../lib/xstate/competitor-discovery/index.js';
import {
  TypeSafeEvaluator,
  TypeSafeApiError,
  choice,
  noul,
  score,
} from '../lib/typesafe/evaluator/index.js';
import type {
  CalibratedConfidence,
  ChoiceAnswer,
  ChoiceCriteria,
  ChoiceQuestion,
  DecisionEvaluationRequest,
  DecisionEvaluationResult,
  DecisionOption,
  LinkProspect,
  NoulAnswer,
  NoulCriteria,
  NoulQuestion,
  ProspectAction,
  ProspectJudgment,
  ProspectJudgmentOptions,
  RetryPolicy,
  ScoreAnswer,
  ScoreCriteria,
  ScoreQuestion,
  SystemOneCallOptions,
  SystemOneEvaluationRequest,
  SystemOneRequestErrorOptions,
  SystemOneResult,
  TypeSafeAnswer,
  TypeSafeEntry,
  TypeSafeEvaluatorConfig,
  TypeSafeQuestion,
  TypeSafeQuestionType,
  TypeSafeQuestions,
  TypeSafeUsage,
} from '../lib/typesafe/evaluator/index.js';
import {
  prospectEvaluationMachine,
  isTerminalProspectEvaluationState,
} from '../lib/xstate/prospect-evaluation/index.js';
import type {
  ProspectEvaluationContext,
  ProspectEvaluationEvent,
  ProspectEvaluationInput,
  ProspectEvaluationState,
} from '../lib/xstate/prospect-evaluation/index.js';
import type {
  CompetitorCandidate,
  CompetitorDiscoveryContext,
  CompetitorDiscoveryEvent,
  CompetitorDiscoveryInput,
  CompetitorDiscoveryState,
} from '../lib/xstate/competitor-discovery/index.js';

export type {
  RerankCandidate as RankCandidate,
  RerankResult as RankResult,
  RerankOptions as RankOptions,
  NebiusRerankConfig as RankClientConfig,
};

export {
  NebiusRerankClient as RankClient,
  calculateRrfScore,
  normalizeScores,
};

export type {
  EnrichmentContext,
  EnrichmentDocument,
  EnrichmentEvent,
  EnrichmentFacts,
  EnrichmentInput,
  EnrichmentState,
};

export {
  brandEnrichmentMachine,
  isTerminalEnrichmentState,
};

export type {
  CompetitorCandidate,
  CompetitorDiscoveryContext,
  CompetitorDiscoveryEvent,
  CompetitorDiscoveryInput,
  CompetitorDiscoveryState,
};

export {
  competitorDiscoveryMachine,
  isTerminalCompetitorDiscoveryState,
};

export type {
  ProspectEvaluationContext,
  ProspectEvaluationEvent,
  ProspectEvaluationInput,
  ProspectEvaluationState,
};

export {
  prospectEvaluationMachine,
  isTerminalProspectEvaluationState,
};

export type {
  CalibratedConfidence,
  ChoiceAnswer,
  ChoiceCriteria,
  ChoiceQuestion,
  DecisionEvaluationRequest,
  DecisionEvaluationResult,
  DecisionOption,
  LinkProspect,
  NoulAnswer,
  NoulCriteria,
  NoulQuestion,
  ProspectAction,
  ProspectJudgment,
  ProspectJudgmentOptions,
  RetryPolicy,
  ScoreAnswer,
  ScoreCriteria,
  ScoreQuestion,
  SystemOneCallOptions,
  SystemOneEvaluationRequest,
  SystemOneRequestErrorOptions,
  SystemOneResult,
  TypeSafeAnswer,
  TypeSafeEntry,
  TypeSafeEvaluatorConfig,
  TypeSafeQuestion,
  TypeSafeQuestionType,
  TypeSafeQuestions,
  TypeSafeUsage,
};

export {
  TypeSafeApiError,
  TypeSafeEvaluator,
  choice,
  noul,
  score,
};

export {
  OutboundAnalysisParseError,
  buildOutboundReplyPrompt,
  buildPrefixedInboxAddress,
  mergeOutboundLabels,
  normalizeInboxPrefix,
  isTerminalOutboundThreadState,
  outboundThreadMachine,
  parseOutboundReplyAnalysis,
  resolveOutboundAnalysis,
  selectSharedInbox,
} from '../lib/xstate/outbound/index.js';

export {
  contactResolutionMachine,
  contactResolutionStateValues,
  isTerminalContactResolutionState,
} from '../lib/xstate/contact-resolution/index.js';

export type {
  ContactResolutionContext,
  ContactResolutionEvent,
  ContactResolutionInput,
  ContactResolutionState,
} from '../lib/xstate/contact-resolution/index.js';

export type {
  DomainPoolItem,
  InboxPoolItem,
  OutboundAgentAdapter,
  OutboundAgentMailAdapter,
  OutboundAgentRequest,
  OutboundAgentResult,
  OutboundBrandContext,
  OutboundDraft,
  OutboundIntent,
  OutboundMailDraftRequest,
  OutboundMailSendRequest,
  OutboundNextAction,
  OutboundProspect,
  OutboundProviderBundle,
  OutboundProviderLink,
  OutboundReplyAnalysis,
  OutboundResolution,
  OutboundThreadContext,
  OutboundThreadEvent,
  OutboundThreadInput,
  OutboundThreadState,
} from '../lib/xstate/outbound/index.js';
