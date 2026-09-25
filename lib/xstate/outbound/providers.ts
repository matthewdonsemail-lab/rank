import type {
  OutboundBrandContext,
  OutboundProspect,
  OutboundReplyAnalysis,
} from "./types.js";

export interface OutboundAgentRequest {
  goal: "guest_post";
  brand: OutboundBrandContext;
  prospect: OutboundProspect;
  replyText: string;
  confidence: number;
  dealLikelihood: number;
}

export interface OutboundAgentResult {
  threadId: string;
  analysis: OutboundReplyAnalysis;
}

export interface OutboundAgentAdapter {
  createThread(request: OutboundAgentRequest): Promise<{ threadId: string }>;
  analyzeReply(request: OutboundAgentRequest, threadId: string): Promise<OutboundAgentResult>;
}

export interface OutboundMailDraftRequest {
  inboxId: string;
  to: string;
  subject: string;
  text: string;
  labels: string[];
}

export interface OutboundMailSendRequest extends OutboundMailDraftRequest {
  threadId: string;
  idempotencyKey: string;
}

export interface OutboundAgentMailAdapter {
  createDraft(request: OutboundMailDraftRequest): Promise<{ draftId: string }>;
  send(request: OutboundMailSendRequest): Promise<{ messageId: string; threadId: string }>;
}

export interface OutboundProviderLink {
  agentThreadId: string | null;
  agentMailThreadId: string | null;
  agentMailInboxId: string | null;
}

export interface OutboundProviderBundle {
  agent: OutboundAgentAdapter;
  mail: OutboundAgentMailAdapter;
}

export function createOutboundProviderLink(input: {
  agentThreadId?: string | null;
  agentMailThreadId?: string | null;
  agentMailInboxId?: string | null;
}): OutboundProviderLink {
  return {
    agentThreadId: input.agentThreadId ?? null,
    agentMailThreadId: input.agentMailThreadId ?? null,
    agentMailInboxId: input.agentMailInboxId ?? null,
  };
}
