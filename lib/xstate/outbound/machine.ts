import { setup, types } from "xstate";
import {
  mergeOutboundLabels,
  resolveOutboundAnalysis,
} from "./helpers/resolve-outbound-analysis.ts";
import type {
  OutboundThreadContext,
  OutboundThreadEvent,
  OutboundThreadInput,
  OutboundThreadState,
} from "./types.ts";

export const outboundThreadMachine = setup({
  schemas: {
    context: types<OutboundThreadContext>(),
    events: {
      START: types<Extract<OutboundThreadEvent, { type: "START" }>>(),
      DRAFT_READY: types<Extract<OutboundThreadEvent, { type: "DRAFT_READY" }>>(),
      APPROVE: types<Extract<OutboundThreadEvent, { type: "APPROVE" }>>(),
      SEND: types<Extract<OutboundThreadEvent, { type: "SEND" }>>(),
      SENT: types<Extract<OutboundThreadEvent, { type: "SENT" }>>(),
      REPLY_RECEIVED: types<Extract<OutboundThreadEvent, { type: "REPLY_RECEIVED" }>>(),
      DELIVERY_BOUNCED: types<Extract<OutboundThreadEvent, { type: "DELIVERY_BOUNCED" }>>(),
      ANALYSIS_READY: types<Extract<OutboundThreadEvent, { type: "ANALYSIS_READY" }>>(),
      REANALYZE: types<Extract<OutboundThreadEvent, { type: "REANALYZE" }>>(),
      SCHEDULE_FOLLOW_UP: types<Extract<OutboundThreadEvent, { type: "SCHEDULE_FOLLOW_UP" }>>(),
      FOLLOW_UP_DUE: types<Extract<OutboundThreadEvent, { type: "FOLLOW_UP_DUE" }>>(),
      FOLLOW_UP_SENT: types<Extract<OutboundThreadEvent, { type: "FOLLOW_UP_SENT" }>>(),
      NEGOTIATION_STARTED: types<Extract<OutboundThreadEvent, { type: "NEGOTIATION_STARTED" }>>(),
      GUEST_POST_SCHEDULED: types<Extract<OutboundThreadEvent, { type: "GUEST_POST_SCHEDULED" }>>(),
      CLOSE_WON: types<Extract<OutboundThreadEvent, { type: "CLOSE_WON" }>>(),
      CLOSE_LOST: types<Extract<OutboundThreadEvent, { type: "CLOSE_LOST" }>>(),
      ATTACH_AGENT_THREAD: types<Extract<OutboundThreadEvent, { type: "ATTACH_AGENT_THREAD" }>>(),
      ASSIGN_INBOX: types<Extract<OutboundThreadEvent, { type: "ASSIGN_INBOX" }>>(),
      ATTACH_AGENTMAIL_THREAD: types<Extract<OutboundThreadEvent, { type: "ATTACH_AGENTMAIL_THREAD" }>>(),
      FAIL: types<Extract<OutboundThreadEvent, { type: "FAIL" }>>(),
      RETRY: types<Extract<OutboundThreadEvent, { type: "RETRY" }>>(),
      CANCEL: types<Extract<OutboundThreadEvent, { type: "CANCEL" }>>(),
    },
    input: types<OutboundThreadInput>(),
  },
}).createMachine({
  id: "outboundThread",
  version: "1",
  context: ({ input }) => ({
    owner: input.owner,
    campaignId: input.campaignId,
    prospect: input.prospect,
    brand: input.brand,
    goal: "guest_post",
    draft: null,
    analysis: null,
    agentThreadId: null,
    agentMailThreadId: null,
    agentMailInboxId: null,
    agentMailMessageId: null,
    idempotencyKey: null,
    labels: ["outbound", "guest-post"],
    attempt: 0,
    nextFollowUpAt: null,
    error: null,
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
  }),
  initial: "idle",
  on: {
    ATTACH_AGENT_THREAD: ({ context, event }) => ({
      context: {
        ...context,
        agentThreadId: event.threadId,
        updatedAt: event.at,
      },
    }),
    ASSIGN_INBOX: ({ context, event }) => ({
      context: {
        ...context,
        agentMailInboxId: event.inboxId,
        updatedAt: event.at,
        labels: mergeOutboundLabels(context.labels, ["inbox-assigned"]),
      },
    }),
    ATTACH_AGENTMAIL_THREAD: ({ context, event }) => ({
      context: {
        ...context,
        agentMailThreadId: event.threadId,
        agentMailInboxId: event.inboxId,
        agentMailMessageId: event.messageId ?? null,
        updatedAt: event.at,
      },
    }),
    CANCEL: ({ context, event }) => ({
      target: "cancelled",
      context: {
        ...context,
        error: null,
        updatedAt: event.at,
        labels: mergeOutboundLabels(context.labels, ["cancelled"], [
          "approved",
          "sending",
          "follow-up-scheduled",
          "follow-up-due",
        ]),
      },
    }),
  },
  states: {
    idle: {
      on: {
        START: {
          target: "drafting",
          context: ({ context, event }) => ({
            labels: mergeOutboundLabels(context.labels, ["drafting"]),
            updatedAt: event.at,
          }),
        },
      },
    },
    drafting: {
      on: {
        DRAFT_READY: {
          target: "review_required",
          context: ({ context, event }) => ({
            draft: event.draft,
            error: null,
            updatedAt: event.at,
            labels: mergeOutboundLabels(
              context.labels,
              ["draft-ready", "review-required"],
              ["drafting"],
            ),
          }),
        },
        FAIL: {
          target: "failed",
          context: ({ context, event }) => ({
            error: event.error,
            updatedAt: event.at,
            labels: mergeOutboundLabels(context.labels, ["failed"]),
          }),
        },
      },
    },
    review_required: {
      on: {
        APPROVE: {
          target: "ready_to_send",
          context: ({ context, event }) => ({
            updatedAt: event.at,
            labels: mergeOutboundLabels(
              context.labels,
              ["approved", "ready-to-send"],
              ["draft-ready", "review-required"],
            ),
          }),
        },
        REANALYZE: {
          target: "analyzing_reply",
          context: ({ context, event }) => ({
            updatedAt: event.at,
            labels: mergeOutboundLabels(context.labels, ["analyzing-reply"], ["review-required"]),
          }),
        },
      },
    },
    ready_to_send: {
      on: {
        SEND: {
          target: "sending",
          context: ({ context, event }) => ({
            idempotencyKey: event.idempotencyKey,
            error: null,
            updatedAt: event.at,
            labels: mergeOutboundLabels(
              context.labels,
              ["sending"],
              ["approved", "ready-to-send", "follow-up-due"],
            ),
          }),
        },
      },
    },
    sending: {
      on: {
        SENT: {
          target: "awaiting_reply",
          context: ({ context, event }) => ({
            agentMailThreadId: event.threadId,
            agentMailMessageId: event.messageId,
            idempotencyKey: null,
            error: null,
            updatedAt: event.at,
            labels: mergeOutboundLabels(context.labels, ["sent", "awaiting-reply"], [
              "sending",
              "ready-to-send",
            ]),
          }),
        },
        DELIVERY_BOUNCED: {
          target: "failed",
          context: ({ context, event }) => ({
            error: event.reason,
            updatedAt: event.at,
            labels: mergeOutboundLabels(context.labels, ["failed", "delivery:bounced"], [
              "sending",
              "awaiting-reply",
            ]),
          }),
        },
        FAIL: {
          target: "failed",
          context: ({ context, event }) => ({
            error: event.error,
            updatedAt: event.at,
            labels: mergeOutboundLabels(context.labels, ["failed"]),
          }),
        },
      },
    },
    awaiting_reply: {
      on: {
        REPLY_RECEIVED: {
          target: "analyzing_reply",
          context: ({ context, event }) => ({
            agentMailThreadId: event.threadId,
            agentMailMessageId: event.messageId,
            updatedAt: event.at,
            labels: mergeOutboundLabels(context.labels, ["reply-received", "analyzing-reply"], [
              "awaiting-reply",
            ]),
          }),
        },
        SCHEDULE_FOLLOW_UP: {
          target: "follow_up_scheduled",
          context: ({ context, event }) => ({
            nextFollowUpAt: event.dueAt,
            updatedAt: event.at,
            labels: mergeOutboundLabels(context.labels, ["follow-up-scheduled"], [
              "awaiting-reply",
            ]),
          }),
        },
        CLOSE_LOST: {
          target: "closed_lost",
          context: ({ context, event }) => ({
            updatedAt: event.at,
            labels: mergeOutboundLabels(context.labels, ["closed-lost"]),
          }),
        },
        DELIVERY_BOUNCED: {
          target: "failed",
          context: ({ context, event }) => ({
            error: event.reason,
            updatedAt: event.at,
            labels: mergeOutboundLabels(context.labels, ["failed", "delivery:bounced"], [
              "awaiting-reply",
            ]),
          }),
        },
      },
    },
    analyzing_reply: {
      on: {
        ANALYSIS_READY: ({ context, event }) => {
          const resolution = resolveOutboundAnalysis(event.analysis);
          return {
            target: resolution.state,
            context: {
              ...context,
              analysis: {
                ...event.analysis,
                nextAction: resolution.nextAction,
                labels: resolution.labels,
              },
              error: resolution.state === "failed" ? "delivery_bounce" : null,
              updatedAt: event.at,
              labels: mergeOutboundLabels(
                context.labels,
                [...resolution.labels, `state:${resolution.state}`],
                ["reply-received", "analyzing-reply"],
              ),
            },
          };
        },
        FAIL: {
          target: "failed",
          context: ({ context, event }) => ({
            error: event.error,
            updatedAt: event.at,
            labels: mergeOutboundLabels(context.labels, ["failed"]),
          }),
        },
      },
    },
    follow_up_scheduled: {
      on: {
        FOLLOW_UP_DUE: {
          target: "follow_up_due",
          context: ({ context, event }) => ({
            nextFollowUpAt: null,
            updatedAt: event.at,
            labels: mergeOutboundLabels(context.labels, ["follow-up-due"], [
              "follow-up-scheduled",
            ]),
          }),
        },
        CANCEL: {
          target: "cancelled",
          context: ({ context, event }) => ({
            updatedAt: event.at,
            labels: mergeOutboundLabels(context.labels, ["cancelled"]),
          }),
        },
      },
    },
    follow_up_due: {
      on: {
        SEND: {
          target: "sending",
          context: ({ context, event }) => ({
            idempotencyKey: event.idempotencyKey,
            error: null,
            updatedAt: event.at,
            labels: mergeOutboundLabels(context.labels, ["sending", "follow-up-sending"], [
              "follow-up-due",
            ]),
          }),
        },
        FOLLOW_UP_SENT: {
          target: "awaiting_reply",
          context: ({ context, event }) => ({
            agentMailMessageId: event.messageId,
            agentMailThreadId: event.threadId,
            nextFollowUpAt: null,
            idempotencyKey: null,
            updatedAt: event.at,
            labels: mergeOutboundLabels(context.labels, ["follow-up-sent", "awaiting-reply"], [
              "follow-up-due",
            ]),
          }),
        },
        FAIL: {
          target: "failed",
          context: ({ context, event }) => ({
            error: event.error,
            updatedAt: event.at,
            labels: mergeOutboundLabels(context.labels, ["failed"]),
          }),
        },
      },
    },
    engaged: {
      on: {
        NEGOTIATION_STARTED: {
          target: "negotiating",
          context: ({ context, event }) => ({
            updatedAt: event.at,
            labels: mergeOutboundLabels(context.labels, ["negotiating", "engaged"], [
              "awaiting-reply",
            ]),
          }),
        },
        GUEST_POST_SCHEDULED: {
          target: "scheduled",
          context: ({ context, event }) => ({
            updatedAt: event.at,
            labels: mergeOutboundLabels(context.labels, ["scheduled", "deal:on-track"], [
              "engaged",
            ]),
          }),
        },
        SCHEDULE_FOLLOW_UP: {
          target: "follow_up_scheduled",
          context: ({ context, event }) => ({
            nextFollowUpAt: event.dueAt,
            updatedAt: event.at,
            labels: mergeOutboundLabels(context.labels, ["follow-up-scheduled"]),
          }),
        },
        CLOSE_LOST: {
          target: "closed_lost",
          context: ({ context, event }) => ({
            updatedAt: event.at,
            labels: mergeOutboundLabels(context.labels, ["closed-lost"]),
          }),
        },
      },
    },
    negotiating: {
      on: {
        GUEST_POST_SCHEDULED: {
          target: "scheduled",
          context: ({ context, event }) => ({
            updatedAt: event.at,
            labels: mergeOutboundLabels(context.labels, ["scheduled", "deal:on-track"], [
              "negotiating",
            ]),
          }),
        },
        SCHEDULE_FOLLOW_UP: {
          target: "follow_up_scheduled",
          context: ({ context, event }) => ({
            nextFollowUpAt: event.dueAt,
            updatedAt: event.at,
            labels: mergeOutboundLabels(context.labels, ["follow-up-scheduled"]),
          }),
        },
        CLOSE_WON: {
          target: "closed_won",
          context: ({ context, event }) => ({
            updatedAt: event.at,
            labels: mergeOutboundLabels(context.labels, ["closed-won", "deal:won"], [
              "negotiating",
            ]),
          }),
        },
        CLOSE_LOST: {
          target: "closed_lost",
          context: ({ context, event }) => ({
            updatedAt: event.at,
            labels: mergeOutboundLabels(context.labels, ["closed-lost", "deal:lost"], [
              "negotiating",
            ]),
          }),
        },
      },
    },
    scheduled: {
      on: {
        CLOSE_WON: {
          target: "closed_won",
          context: ({ context, event }) => ({
            updatedAt: event.at,
            labels: mergeOutboundLabels(context.labels, ["closed-won", "deal:won"], [
              "scheduled",
            ]),
          }),
        },
        CLOSE_LOST: {
          target: "closed_lost",
          context: ({ context, event }) => ({
            updatedAt: event.at,
            labels: mergeOutboundLabels(context.labels, ["closed-lost", "deal:lost"], [
              "scheduled",
            ]),
          }),
        },
      },
    },
    closed_won: { type: "final" },
    closed_lost: { type: "final" },
    failed: {
      on: {
        RETRY: {
          target: "ready_to_send",
          context: ({ context, event }) => ({
            attempt: context.attempt + 1,
            error: null,
            updatedAt: event.at,
            labels: mergeOutboundLabels(context.labels, ["retrying", "ready-to-send"], [
              "failed",
            ]),
          }),
        },
      },
    },
    cancelled: { type: "final" },
  },
});

export function isTerminalOutboundThreadState(state: OutboundThreadState): boolean {
  return state === "closed_won" || state === "closed_lost" || state === "cancelled";
}

export const outboundThreadStateValues: OutboundThreadState[] = [
  "idle",
  "drafting",
  "review_required",
  "ready_to_send",
  "sending",
  "awaiting_reply",
  "analyzing_reply",
  "follow_up_scheduled",
  "follow_up_due",
  "engaged",
  "negotiating",
  "scheduled",
  "closed_won",
  "closed_lost",
  "failed",
  "cancelled",
];
