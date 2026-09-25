import { setup, types } from "xstate";
import type {
  CompetitorCandidate,
  CompetitorDiscoveryContext,
  CompetitorDiscoveryInput,
  CompetitorDiscoveryState,
} from "./types.js";

const competitorDiscoverySetup = setup({
  schemas: {
    context: types<CompetitorDiscoveryContext>(),
    input: types<CompetitorDiscoveryInput>(),
    events: {
      START: types<{ at: number }>(),
      COMPETITORS_RECEIVED: types<{ at: number; candidates: CompetitorCandidate[] }>(),
      DISCOVERY_FAILED: types<{ at: number; error: string }>(),
      CANDIDATES_READY: types<{ at: number; candidates: CompetitorCandidate[] }>(),
      NORMALIZATION_FAILED: types<{ at: number; error: string }>(),
      RETRY: types<{ at: number }>(),
      CANCEL: types<{ at: number }>(),
    },
  },
});

export const competitorDiscoveryMachine = competitorDiscoverySetup.createMachine({
  id: "competitor-discovery",
  version: "1",
  initial: "idle",
  context: ({ input }) => ({
    owner: input.owner,
    sourceEnrichmentRunId: input.sourceEnrichmentRunId,
    sourceUrl: input.sourceUrl,
    sourceDomain: input.sourceDomain,
    endpoint: input.endpoint,
    limit: input.limit,
    candidates: [],
    normalizedCandidates: [],
    error: null,
    attempt: 0,
    startedAt: input.startedAt,
    updatedAt: input.startedAt,
  }),
  states: {
    idle: {
      on: {
        START: { target: "discovering", context: ({ event }) => ({ updatedAt: event.at }) },
        CANCEL: { target: "cancelled", context: ({ event }) => ({ updatedAt: event.at }) },
      },
    },
    discovering: {
      on: {
        COMPETITORS_RECEIVED: {
          target: "normalizing",
          context: ({ context, event }) => ({
            candidates: event.candidates,
            endpoint: event.candidates[0]?.sourceEndpoint ?? context.endpoint,
            error: null,
            updatedAt: event.at,
          }),
        },
        DISCOVERY_FAILED: {
          target: "failed",
          context: ({ event }) => ({ error: event.error, updatedAt: event.at }),
        },
        CANCEL: { target: "cancelled", context: ({ event }) => ({ updatedAt: event.at }) },
      },
    },
    normalizing: {
      on: {
        CANDIDATES_READY: {
          target: "completed",
          context: ({ event }) => ({
            normalizedCandidates: event.candidates,
            error: null,
            updatedAt: event.at,
          }),
        },
        NORMALIZATION_FAILED: {
          target: "failed",
          context: ({ event }) => ({ error: event.error, updatedAt: event.at }),
        },
        CANCEL: { target: "cancelled", context: ({ event }) => ({ updatedAt: event.at }) },
      },
    },
    failed: {
      on: {
        RETRY: {
          target: "discovering",
          context: ({ context, event }) => ({
            candidates: [],
            normalizedCandidates: [],
            error: null,
            attempt: context.attempt + 1,
            updatedAt: event.at,
          }),
        },
        CANCEL: { target: "cancelled", context: ({ event }) => ({ updatedAt: event.at }) },
      },
    },
    completed: { type: "final" },
    cancelled: { type: "final" },
  },
});

export function isTerminalCompetitorDiscoveryState(state: CompetitorDiscoveryState): boolean {
  return state === "completed" || state === "failed" || state === "cancelled";
}
