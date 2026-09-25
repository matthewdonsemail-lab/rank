export type OutboundThreadState =
  | "idle"
  | "drafting"
  | "review_required"
  | "ready_to_send"
  | "sending"
  | "awaiting_reply"
  | "analyzing_reply"
  | "follow_up_scheduled"
  | "follow_up_due"
  | "engaged"
  | "negotiating"
  | "scheduled"
  | "closed_won"
  | "closed_lost"
  | "failed"
  | "cancelled";

export type OutboundIntent =
  | "unknown"
  | "interested"
  | "question"
  | "negative"
  | "bounce"
  | "accepted";

export type OutboundNextAction =
  | "review"
  | "draft_follow_up"
  | "qualify"
  | "close_lost"
  | "schedule_guest_post"
  | "retry_delivery";

export interface OutboundProspect {
  name: string;
  email: string;
  url: string;
  publication: string;
  fitRationale: string;
}

export interface OutboundBrandContext {
  name: string;
  voice: string;
  guestPostAngle: string;
}

export interface OutboundDraft {
  subject: string;
  text: string;
  labels: string[];
}

export interface OutboundResolution {
  state: OutboundThreadState;
  labels: string[];
  nextAction: OutboundNextAction;
}

export interface OutboundReplyAnalysis {
  intent: OutboundIntent;
  sentiment: number;
  confidence: number;
  dealLikelihood: number;
  nextAction: OutboundNextAction;
  labels: string[];
  rationale: string;
}

export interface OutboundThreadContext {
  owner: string;
  campaignId: string;
  prospect: OutboundProspect;
  brand: OutboundBrandContext;
  goal: "guest_post";
  draft: OutboundDraft | null;
  analysis: OutboundReplyAnalysis | null;
  agentThreadId: string | null;
  agentMailThreadId: string | null;
  agentMailInboxId: string | null;
  agentMailMessageId: string | null;
  idempotencyKey: string | null;
  labels: string[];
  attempt: number;
  nextFollowUpAt: number | null;
  error: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface OutboundThreadInput {
  owner: string;
  campaignId: string;
  prospect: OutboundProspect;
  brand: OutboundBrandContext;
  createdAt: number;
}

export type OutboundThreadEvent =
  | { type: "START"; at: number }
  | { type: "DRAFT_READY"; at: number; draft: OutboundDraft }
  | { type: "APPROVE"; at: number }
  | { type: "SEND"; at: number; idempotencyKey: string }
  | { type: "SENT"; at: number; messageId: string; threadId: string }
  | { type: "REPLY_RECEIVED"; at: number; messageId: string; threadId: string }
  | { type: "DELIVERY_BOUNCED"; at: number; reason: string }
  | { type: "ANALYSIS_READY"; at: number; analysis: OutboundReplyAnalysis }
  | { type: "REANALYZE"; at: number }
  | { type: "SCHEDULE_FOLLOW_UP"; at: number; dueAt: number }
  | { type: "FOLLOW_UP_DUE"; at: number }
  | { type: "FOLLOW_UP_SENT"; at: number; messageId: string; threadId: string }
  | { type: "NEGOTIATION_STARTED"; at: number }
  | { type: "GUEST_POST_SCHEDULED"; at: number }
  | { type: "CLOSE_WON"; at: number }
  | { type: "CLOSE_LOST"; at: number }
  | { type: "ATTACH_AGENT_THREAD"; at: number; threadId: string }
  | { type: "ASSIGN_INBOX"; at: number; inboxId: string }
  | {
      type: "ATTACH_AGENTMAIL_THREAD";
      at: number;
      threadId: string;
      inboxId: string;
      messageId?: string;
    }
  | { type: "FAIL"; at: number; error: string }
  | { type: "RETRY"; at: number }
  | { type: "CANCEL"; at: number };
