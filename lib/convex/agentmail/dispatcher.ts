import type {
  InboundEmailPayload,
  OutboundEmailRequest,
  WebhookVerificationResult,
} from './types.js';
import { extractCleanEmailBody, validateWebhookHeaders } from './helpers/index.js';

export class ConvexAgentMailDispatcher {
  private defaultInboxId?: string;

  constructor(defaultInboxId?: string) {
    this.defaultInboxId = defaultInboxId;
  }

  /**
   * Validates incoming webhook headers before routing into Convex action.
   */
  verifyHeaders(headers: Record<string, string | undefined>): WebhookVerificationResult {
    return validateWebhookHeaders(headers);
  }

  /**
   * Prepares and cleans an inbound email payload for Rank candidate evaluation.
   */
  prepareInboundCandidate(payload: InboundEmailPayload): {
    candidateText: string;
    sender: string;
    subject: string;
  } {
    const cleanBody = extractCleanEmailBody(payload.text, payload.html);
    return {
      candidateText: `Subject: ${payload.subject}\n\n${cleanBody}`,
      sender: payload.from,
      subject: payload.subject,
    };
  }

  /**
   * Formats an outbound email request payload with default labels.
   */
  buildOutboundPayload(request: OutboundEmailRequest): OutboundEmailRequest {
    return {
      ...request,
      inboxId: request.inboxId || this.defaultInboxId || '',
      labels: Array.from(new Set([...(request.labels || []), 'rank-dispatch'])),
    };
  }
}
