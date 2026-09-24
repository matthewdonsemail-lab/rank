export interface InboundEmailPayload {
  messageId: string;
  inboxId: string;
  threadId: string;
  from: string;
  to: string[];
  subject: string;
  text?: string;
  html?: string;
  receivedAt: number;
}

export interface OutboundEmailRequest {
  inboxId: string;
  to: string;
  subject: string;
  text: string;
  labels?: string[];
}

export interface WebhookVerificationResult {
  isValid: boolean;
  eventId?: string;
  error?: string;
}
