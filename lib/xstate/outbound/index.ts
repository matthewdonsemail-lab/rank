export {
  isTerminalOutboundThreadState,
  outboundThreadMachine,
  outboundThreadStateValues,
} from "./machine.ts";
export { buildOutboundReplyPrompt } from "./agent-prompt.ts";
export { OutboundAnalysisParseError, parseOutboundReplyAnalysis } from "./analysis-parser.ts";
export {
  buildPrefixedInboxAddress,
  normalizeInboxPrefix,
  selectSharedInbox,
} from "./inbox-pool.ts";
export { mergeOutboundLabels, resolveOutboundAnalysis } from "./helpers/index.ts";
export type {
  DomainPoolItem,
  InboxPoolItem,
} from "./inbox-pool.ts";
export type {
  OutboundAgentAdapter,
  OutboundAgentMailAdapter,
  OutboundAgentRequest,
  OutboundAgentResult,
  OutboundMailDraftRequest,
  OutboundMailSendRequest,
  OutboundProviderBundle,
  OutboundProviderLink,
} from "./providers.ts";
export type {
  OutboundBrandContext,
  OutboundDraft,
  OutboundIntent,
  OutboundNextAction,
  OutboundProspect,
  OutboundReplyAnalysis,
  OutboundResolution,
  OutboundThreadContext,
  OutboundThreadEvent,
  OutboundThreadInput,
  OutboundThreadState,
} from "./types.js";
