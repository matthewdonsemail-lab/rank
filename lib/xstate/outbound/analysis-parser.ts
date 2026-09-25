import type {
  OutboundIntent,
  OutboundNextAction,
  OutboundReplyAnalysis,
} from "./types.ts";

const intents: OutboundIntent[] = ["unknown", "interested", "question", "negative", "bounce", "accepted"];
const nextActions: OutboundNextAction[] = [
  "review",
  "draft_follow_up",
  "qualify",
  "close_lost",
  "schedule_guest_post",
  "retry_delivery",
];

export class OutboundAnalysisParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OutboundAnalysisParseError";
  }
}

function numberInRange(value: unknown, field: string, minimum: number, maximum: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < minimum || value > maximum) {
    throw new OutboundAnalysisParseError(`${field} must be a number between ${minimum} and ${maximum}`);
  }
  return value;
}

export function parseOutboundReplyAnalysis(input: string | unknown): OutboundReplyAnalysis {
  let value: unknown = input;
  if (typeof input === "string") {
    const normalized = input.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    try {
      value = JSON.parse(normalized);
    } catch {
      throw new OutboundAnalysisParseError("Analysis must be valid JSON");
    }
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new OutboundAnalysisParseError("Analysis must be an object");
  }
  const record = value as Record<string, unknown>;
  const intent = record.intent;
  const nextAction = record.nextAction;
  if (typeof intent !== "string" || !intents.includes(intent as OutboundIntent)) {
    throw new OutboundAnalysisParseError("intent is invalid");
  }
  if (typeof nextAction !== "string" || !nextActions.includes(nextAction as OutboundNextAction)) {
    throw new OutboundAnalysisParseError("nextAction is invalid");
  }
  const labels = Array.isArray(record.labels)
    ? record.labels.filter((label): label is string => typeof label === "string")
    : [];
  if (typeof record.rationale !== "string" || !record.rationale.trim()) {
    throw new OutboundAnalysisParseError("rationale is required");
  }
  return {
    intent: intent as OutboundIntent,
    sentiment: numberInRange(record.sentiment, "sentiment", -1, 1),
    confidence: numberInRange(record.confidence, "confidence", 0, 1),
    dealLikelihood: numberInRange(record.dealLikelihood, "dealLikelihood", 0, 1),
    nextAction: nextAction as OutboundNextAction,
    labels,
    rationale: record.rationale,
  };
}
