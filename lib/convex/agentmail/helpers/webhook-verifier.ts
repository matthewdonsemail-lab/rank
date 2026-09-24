import type { WebhookVerificationResult } from '../types.js';

/**
 * Validates header requirements for an inbound AgentMail Svix webhook.
 */
export function validateWebhookHeaders(headers: Record<string, string | undefined>): WebhookVerificationResult {
  const svixId = headers['svix-id'];
  const svixTimestamp = headers['svix-timestamp'];
  const svixSignature = headers['svix-signature'];

  if (!svixId || !svixTimestamp || !svixSignature) {
    return {
      isValid: false,
      error: 'Missing required Svix verification headers (svix-id, svix-timestamp, svix-signature).',
    };
  }

  // Reject payloads older than 5 minutes
  const timestampNum = parseInt(svixTimestamp, 10);
  if (isNaN(timestampNum) || Math.abs(Date.now() / 1000 - timestampNum) > 300) {
    return {
      isValid: false,
      error: 'Webhook timestamp expired or invalid.',
    };
  }

  return {
    isValid: true,
    eventId: svixId,
  };
}

/**
 * Parses and extracts text content from an email body payload.
 */
export function extractCleanEmailBody(rawText?: string, rawHtml?: string): string {
  if (rawText && rawText.trim().length > 0) {
    return rawText.trim();
  }
  if (rawHtml) {
    // Strip simple HTML tags for LLM prompt ingestion
    return rawHtml.replace(/<[^>]*>?/gm, '').trim();
  }
  return '';
}
