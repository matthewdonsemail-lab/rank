import type { OutboundAgentRequest } from "./providers.ts";

export function buildOutboundReplyPrompt(request: OutboundAgentRequest): string {
  return [
    "You are Rank's outbound deal analyst for a guest-post campaign.",
    "Assess the reply as a sales opportunity, not as a generic sentiment classifier.",
    `Explicit goal: ${request.goal}`,
    `Brand: ${request.brand.name}`,
    `Brand voice: ${request.brand.voice}`,
    `Guest-post angle: ${request.brand.guestPostAngle}`,
    `Prospect: ${request.prospect.name}`,
    `Publication: ${request.prospect.publication}`,
    `Prospect URL: ${request.prospect.url}`,
    `Fit rationale: ${request.prospect.fitRationale}`,
    `Current confidence: ${request.confidence.toFixed(3)}`,
    `Current deal likelihood: ${request.dealLikelihood.toFixed(3)}`,
    `Reply:\n${request.replyText}`,
    "Return JSON with intent (unknown, interested, question, negative, bounce, accepted), sentiment (-1 to 1), confidence (0 to 1), dealLikelihood (0 to 1), nextAction (review, draft_follow_up, qualify, close_lost, schedule_guest_post, retry_delivery), labels, and rationale.",
    "Use interested or question for a positive reply, accepted only when the guest post is explicitly agreed, negative for a decline, and bounce for a delivery failure. Lower confidence when the reply is ambiguous.",
  ].join("\n");
}
