import type {
  OutboundAgentAdapter,
  OutboundAgentMailAdapter,
  OutboundAgentRequest,
  OutboundAgentResult,
  OutboundMailDraftRequest,
  OutboundMailSendRequest,
} from "../../lib/xstate/outbound/providers.ts";
import type { OutboundReplyAnalysis } from "../../lib/xstate/outbound/types.ts";
import type { DocBackingMetadata } from "../schema.ts";

export const docBacking: DocBackingMetadata = {
  docPath: "docs/convex/components/agent/README.md",
  specSection: "Persistent Threads",
  specUrl: "https://github.com/get-convex/agent",
  requiredFields: ["threadId", "analysis"],
  lastVerified: "2026-09-25",
};

function classifyReply(text: string): OutboundReplyAnalysis {
  const normalized = text.toLowerCase();
  if (normalized.includes("bounce") || normalized.includes("undeliverable")) {
    return {
      intent: "bounce",
      sentiment: -0.2,
      confidence: 0.99,
      dealLikelihood: 0,
      nextAction: "retry_delivery",
      labels: ["delivery:bounce"],
      rationale: "The message indicates a delivery failure.",
    };
  }
  if (normalized.includes("accepted") || normalized.includes("schedule")) {
    return {
      intent: "accepted",
      sentiment: 0.9,
      confidence: 0.94,
      dealLikelihood: 0.92,
      nextAction: "schedule_guest_post",
      labels: ["deal:agreed"],
      rationale: "The prospect explicitly accepted or scheduled the guest post.",
    };
  }
  if (normalized.includes("not interested") || normalized.includes("decline")) {
    return {
      intent: "negative",
      sentiment: -0.8,
      confidence: 0.96,
      dealLikelihood: 0.03,
      nextAction: "close_lost",
      labels: ["reply:negative"],
      rationale: "The prospect declined the opportunity.",
    };
  }
  if (normalized.includes("?") || normalized.includes("outline") || normalized.includes("question")) {
    return {
      intent: "question",
      sentiment: 0.35,
      confidence: 0.78,
      dealLikelihood: 0.42,
      nextAction: "draft_follow_up",
      labels: ["reply:question"],
      rationale: "The prospect asked for more information.",
    };
  }
  return {
    intent: "interested",
    sentiment: 0.65,
    confidence: 0.72,
    dealLikelihood: 0.58,
    nextAction: "qualify",
    labels: ["reply:positive"],
    rationale: "The reply shows positive engagement without an explicit acceptance.",
  };
}

export const mockOutboundAgentAdapter: OutboundAgentAdapter = {
  async createThread(_request: OutboundAgentRequest) {
    return { threadId: "agent_outbound_mock_01" };
  },
  async analyzeReply(request: OutboundAgentRequest, threadId: string): Promise<OutboundAgentResult> {
    return { threadId, analysis: classifyReply(request.replyText) };
  },
};

export const mockOutboundAgentMailAdapter: OutboundAgentMailAdapter = {
  async createDraft(_request: OutboundMailDraftRequest) {
    return { draftId: "agentmail_draft_mock_01" };
  },
  async send(_request: OutboundMailSendRequest) {
    return { messageId: "agentmail_message_mock_01", threadId: "agentmail_thread_mock_01" };
  },
};

export async function handleMockOutboundAnalysis(request: OutboundAgentRequest): Promise<OutboundAgentResult> {
  const { threadId } = await mockOutboundAgentAdapter.createThread(request);
  return await mockOutboundAgentAdapter.analyzeReply(request, threadId);
}

export function buildMockOutboundDraft(input: {
  to: string;
  brandVoice: string;
  guestPostAngle: string;
}): { subject: string; text: string; labels: string[] } {
  return {
    subject: "A guest post idea for your publication",
    text: `Hello ${input.to},\n\nI read your work and thought this angle could be useful: ${input.guestPostAngle}\n\nBest,\n${input.brandVoice}`,
    labels: ["outbound", "guest-post", "draft"],
  };
}
