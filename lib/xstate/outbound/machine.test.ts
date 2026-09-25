import { describe, expect, it } from "vitest";
import { createActor } from "xstate";
import {
  outboundThreadMachine,
  type OutboundThreadInput,
} from "./index.js";

const input: OutboundThreadInput = {
  owner: "user_1",
  campaignId: "campaign_1",
  prospect: {
    name: "Avery Editor",
    email: "avery@example.com",
    url: "https://example.com",
    publication: "Example Journal",
    fitRationale: "Strong topical fit and prior guest contributions.",
  },
  brand: {
    name: "Rank",
    voice: "direct, useful, evidence-led",
    guestPostAngle: "A practical guide to evaluating link opportunities.",
  },
  createdAt: 1_000,
};

function startThread() {
  return createActor(outboundThreadMachine, { input }).start();
}

describe("outbound thread machine", () => {
  it("backs provider links, approval, and first delivery", () => {
    const actor = startThread();
    actor.send({ type: "ATTACH_AGENT_THREAD", at: 1_001, threadId: "agent_thread_1" });
    actor.send({
      type: "ATTACH_AGENTMAIL_THREAD",
      at: 1_002,
      threadId: "agentmail_thread_1",
      inboxId: "inbox_1",
    });
    actor.send({ type: "START", at: 1_003 });
    actor.send({
      type: "DRAFT_READY",
      at: 1_004,
      draft: { subject: "A guest post idea for Example Journal", text: "Hello Avery", labels: ["outbound"] },
    });
    actor.send({ type: "APPROVE", at: 1_005 });
    actor.send({ type: "SEND", at: 1_006, idempotencyKey: "outbound_1" });
    actor.send({
      type: "SENT",
      at: 1_007,
      messageId: "message_1",
      threadId: "agentmail_thread_1",
    });

    expect(actor.getSnapshot().value).toBe("awaiting_reply");
    expect(actor.getSnapshot().context.agentThreadId).toBe("agent_thread_1");
    expect(actor.getSnapshot().context.agentMailThreadId).toBe("agentmail_thread_1");
    expect(actor.getSnapshot().context.labels).toEqual(
      expect.arrayContaining(["sent", "awaiting-reply"]),
    );
  });

  it("maps reply intent to a deal path and labels", () => {
    const actor = startThread();
    actor.send({ type: "START", at: 1_001 });
    actor.send({
      type: "DRAFT_READY",
      at: 1_002,
      draft: { subject: "Idea", text: "Pitch", labels: [] },
    });
    actor.send({ type: "APPROVE", at: 1_003 });
    actor.send({ type: "SEND", at: 1_004, idempotencyKey: "outbound_2" });
    actor.send({ type: "SENT", at: 1_005, messageId: "message_2", threadId: "thread_2" });
    actor.send({ type: "REPLY_RECEIVED", at: 1_006, messageId: "reply_1", threadId: "thread_2" });
    actor.send({
      type: "ANALYSIS_READY",
      at: 1_007,
      analysis: {
        intent: "interested",
        sentiment: 0.8,
        confidence: 0.91,
        dealLikelihood: 0.76,
        nextAction: "qualify",
        labels: ["reply:positive"],
        rationale: "The editor asked for a pitch and timeline.",
      },
    });
    actor.send({ type: "NEGOTIATION_STARTED", at: 1_008 });
    actor.send({ type: "GUEST_POST_SCHEDULED", at: 1_009 });
    actor.send({ type: "CLOSE_WON", at: 1_010 });

    expect(actor.getSnapshot().value).toBe("closed_won");
    expect(actor.getSnapshot().context.labels).toEqual(
      expect.arrayContaining(["deal:won", "intent:interested", "deal:high"]),
    );
  });

  it("releases a follow-up through the same idempotent delivery boundary", () => {
    const actor = startThread();
    actor.send({ type: "START", at: 1_001 });
    actor.send({ type: "DRAFT_READY", at: 1_002, draft: { subject: "Idea", text: "Pitch", labels: [] } });
    actor.send({ type: "APPROVE", at: 1_003 });
    actor.send({ type: "SEND", at: 1_004, idempotencyKey: "first" });
    actor.send({ type: "SENT", at: 1_005, messageId: "first_message", threadId: "mail_thread" });
    actor.send({ type: "REPLY_RECEIVED", at: 1_006, messageId: "first_reply", threadId: "mail_thread" });
    actor.send({
      type: "ANALYSIS_READY",
      at: 1_007,
      analysis: {
        intent: "unknown",
        sentiment: 0,
        confidence: 0.3,
        dealLikelihood: 0.1,
        nextAction: "review",
        labels: ["review"],
        rationale: "The reply is ambiguous.",
      },
    });
    expect(actor.getSnapshot().value).toBe("review_required");
    actor.send({ type: "REANALYZE", at: 1_008 });
    expect(actor.getSnapshot().value).toBe("analyzing_reply");
    actor.send({
      type: "ANALYSIS_READY",
      at: 1_009,
      analysis: {
        intent: "question",
        sentiment: 0.3,
        confidence: 0.8,
        dealLikelihood: 0.5,
        nextAction: "draft_follow_up",
        labels: ["reply:question"],
        rationale: "The prospect asked for an outline.",
      },
    });
    actor.send({ type: "SCHEDULE_FOLLOW_UP", at: 1_010, dueAt: 1_100 });
    actor.send({ type: "FOLLOW_UP_DUE", at: 1_011 });
    expect(actor.getSnapshot().value).toBe("follow_up_due");
    actor.send({ type: "SEND", at: 1_012, idempotencyKey: "follow_up" });
    expect(actor.getSnapshot().value).toBe("sending");
    expect(actor.getSnapshot().context.idempotencyKey).toBe("follow_up");
  });

  it("routes bounces to failure and restores a persisted snapshot", () => {
    const actor = startThread();
    actor.send({ type: "START", at: 1_001 });
    actor.send({ type: "DRAFT_READY", at: 1_002, draft: { subject: "Idea", text: "Pitch", labels: [] } });
    actor.send({ type: "APPROVE", at: 1_003 });
    actor.send({ type: "SEND", at: 1_004, idempotencyKey: "outbound_3" });
    actor.send({ type: "DELIVERY_BOUNCED", at: 1_005, reason: "550 mailbox unavailable" });
    expect(actor.getSnapshot().value).toBe("failed");
    const persisted = JSON.parse(JSON.stringify(actor.getPersistedSnapshot()));
    const restored = createActor(outboundThreadMachine, { input, snapshot: persisted }).start();
    expect(restored.getSnapshot().value).toBe("failed");
    expect(restored.getSnapshot().context.error).toBe("550 mailbox unavailable");
    restored.send({ type: "RETRY", at: 1_006 });
    expect(restored.getSnapshot().value).toBe("ready_to_send");
  });
});
