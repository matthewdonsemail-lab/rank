import type { FormattedThreadMessage } from '../types.js';

/**
 * Normalizes raw thread message entries into a clean structured schema.
 */
export function formatThreadMessage(raw: Record<string, any>): FormattedThreadMessage {
  return {
    id: raw._id || raw.id || String(Date.now()),
    role: raw.role || 'assistant',
    text: typeof raw.content === 'string' ? raw.content : JSON.stringify(raw.content ?? ''),
    timestamp: raw._creationTime || raw.timestamp,
    toolCalls: Array.isArray(raw.toolCalls) ? raw.toolCalls : undefined,
  };
}

/**
 * Filters a thread message list to only relevant user and assistant conversation turns.
 */
export function filterVisibleMessages(messages: FormattedThreadMessage[]): FormattedThreadMessage[] {
  return messages.filter((m) => m.role === 'user' || m.role === 'assistant');
}
