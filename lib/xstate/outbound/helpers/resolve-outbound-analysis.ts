import type {
  OutboundReplyAnalysis,
  OutboundResolution,
  OutboundThreadState,
} from "../types.ts";

function confidenceBand(value: number): "high" | "medium" | "low" {
  if (value >= 0.75) return "high";
  if (value >= 0.45) return "medium";
  return "low";
}

function sentimentBand(value: number): "positive" | "neutral" | "negative" {
  if (value > 0.15) return "positive";
  if (value < -0.15) return "negative";
  return "neutral";
}

export function mergeOutboundLabels(
  current: string[],
  additions: string[],
  removals: string[] = [],
): string[] {
  const removed = new Set(removals);
  return Array.from(new Set([...current.filter((label) => !removed.has(label)), ...additions]));
}

export function resolveOutboundAnalysis(analysis: OutboundReplyAnalysis): OutboundResolution {
  const stateByIntent: Record<OutboundReplyAnalysis["intent"], OutboundThreadState> = {
    unknown: "review_required",
    interested: "engaged",
    question: "engaged",
    negative: "closed_lost",
    bounce: "failed",
    accepted: "scheduled",
  };
  const nextActionByIntent: Record<OutboundReplyAnalysis["intent"], OutboundResolution["nextAction"]> = {
    unknown: "review",
    interested: "qualify",
    question: "draft_follow_up",
    negative: "close_lost",
    bounce: "retry_delivery",
    accepted: "schedule_guest_post",
  };
  return {
    state: stateByIntent[analysis.intent],
    nextAction: nextActionByIntent[analysis.intent],
    labels: mergeOutboundLabels([], [
      ...analysis.labels,
      `intent:${analysis.intent}`,
      `sentiment:${sentimentBand(analysis.sentiment)}`,
      `confidence:${confidenceBand(analysis.confidence)}`,
      `deal:${confidenceBand(analysis.dealLikelihood)}`,
      `next-action:${nextActionByIntent[analysis.intent]}`,
    ]),
  };
}
