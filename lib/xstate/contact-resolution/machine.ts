import { setup, types } from "xstate";
import type {
  ContactResolutionContext,
  ContactResolutionEvent,
  ContactResolutionInput,
  ContactResolutionState,
} from "./types.ts";

export const contactResolutionMachine = setup({
  schemas: {
    context: types<ContactResolutionContext>(),
    events: {
      START: types<Extract<ContactResolutionEvent, { type: "START" }>>(),
      DOMAIN_VERIFIED: types<Extract<ContactResolutionEvent, { type: "DOMAIN_VERIFIED" }>>(),
      DOMAIN_UNUSABLE: types<Extract<ContactResolutionEvent, { type: "DOMAIN_UNUSABLE" }>>(),
      CONTACT_RESOLVED: types<Extract<ContactResolutionEvent, { type: "CONTACT_RESOLVED" }>>(),
      CONTACT_UNRESOLVED: types<Extract<ContactResolutionEvent, { type: "CONTACT_UNRESOLVED" }>>(),
      DELIVERY_BOUNCED: types<Extract<ContactResolutionEvent, { type: "DELIVERY_BOUNCED" }>>(),
      FAIL: types<Extract<ContactResolutionEvent, { type: "FAIL" }>>(),
      RETRY: types<Extract<ContactResolutionEvent, { type: "RETRY" }>>(),
      CANCEL: types<Extract<ContactResolutionEvent, { type: "CANCEL" }>>(),
    },
    input: types<ContactResolutionInput>(),
  },
}).createMachine({
  id: "contact-resolution",
  version: "1",
  initial: "idle",
  context: ({ input }) => ({
    owner: input.owner,
    domain: input.domain,
    candidateEmail: input.candidateEmail,
    contactName: input.contactName,
    publicationUrl: input.publicationUrl,
    resolvedEmail: null,
    verificationSource: null,
    confidence: null,
    reason: null,
    attempt: 0,
    checkedAt: null,
    error: null,
    startedAt: input.startedAt,
    updatedAt: input.startedAt,
  }),
  on: {
    CANCEL: ({ context, event }) => ({
      target: "cancelled",
      context: { ...context, error: null, updatedAt: event.at },
    }),
  },
  states: {
    idle: {
      on: {
        START: {
          target: "checking_domain",
          context: ({ context, event }) => ({
            updatedAt: event.at,
            checkedAt: event.at,
          }),
        },
      },
    },
    checking_domain: {
      on: {
        DOMAIN_VERIFIED: {
          target: "checking_contact",
          context: ({ context, event }) => ({
            verificationSource: event.verificationSource,
            confidence: event.confidence,
            reason: null,
            checkedAt: event.at,
            updatedAt: event.at,
          }),
        },
        DOMAIN_UNUSABLE: {
          target: "needs_alternate",
          context: ({ context, event }) => ({
            reason: event.reason,
            confidence: 0,
            checkedAt: event.at,
            updatedAt: event.at,
          }),
        },
        FAIL: {
          target: "failed",
          context: ({ context, event }) => ({
            error: event.error,
            checkedAt: event.at,
            updatedAt: event.at,
          }),
        },
      },
    },
    checking_contact: {
      on: {
        CONTACT_RESOLVED: {
          target: "deliverable",
          context: ({ context, event }) => ({
            resolvedEmail: event.email,
            verificationSource: event.verificationSource,
            confidence: event.confidence,
            reason: null,
            checkedAt: event.at,
            updatedAt: event.at,
          }),
        },
        CONTACT_UNRESOLVED: {
          target: "needs_alternate",
          context: ({ context, event }) => ({
            confidence: 0,
            reason: event.reason,
            checkedAt: event.at,
            updatedAt: event.at,
          }),
        },
        DELIVERY_BOUNCED: {
          target: "bounced",
          context: ({ context, event }) => ({
            reason: event.reason,
            checkedAt: event.at,
            updatedAt: event.at,
          }),
        },
        FAIL: {
          target: "failed",
          context: ({ context, event }) => ({
            error: event.error,
            checkedAt: event.at,
            updatedAt: event.at,
          }),
        },
      },
    },
    deliverable: {
      on: {
        DELIVERY_BOUNCED: {
          target: "bounced",
          context: ({ context, event }) => ({
            reason: event.reason,
            checkedAt: event.at,
            updatedAt: event.at,
          }),
        },
      },
    },
    needs_alternate: {
      on: {
        RETRY: {
          target: "checking_domain",
          context: ({ context, event }) => ({
            attempt: context.attempt + 1,
            error: null,
            reason: null,
            checkedAt: event.at,
            updatedAt: event.at,
          }),
        },
      },
    },
    bounced: {
      on: {
        RETRY: {
          target: "checking_domain",
          context: ({ context, event }) => ({
            attempt: context.attempt + 1,
            reason: null,
            checkedAt: event.at,
            updatedAt: event.at,
          }),
        },
      },
    },
    failed: {
      on: {
        RETRY: {
          target: "checking_domain",
          context: ({ context, event }) => ({
            attempt: context.attempt + 1,
            error: null,
            checkedAt: event.at,
            updatedAt: event.at,
          }),
        },
      },
    },
    cancelled: { type: "final" },
  },
});

export const contactResolutionStateValues: ContactResolutionState[] = [
  "idle",
  "checking_domain",
  "checking_contact",
  "deliverable",
  "needs_alternate",
  "bounced",
  "failed",
  "cancelled",
];

export function isTerminalContactResolutionState(state: ContactResolutionState): boolean {
  return state === "cancelled";
}
