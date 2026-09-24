// Domain types
export type {
  InboundEmailPayload,
  OutboundEmailRequest,
  WebhookVerificationResult,
} from './types.js';

// Domain dispatcher service
export { ConvexAgentMailDispatcher } from './dispatcher.js';

// Clean helper re-exports
export {
  validateWebhookHeaders,
  extractCleanEmailBody,
} from './helpers/index.js';
