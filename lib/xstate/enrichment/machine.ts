import { setup, types } from "xstate";
import { limitEnrichmentUrls } from "./helpers/index.js";
import type {
  EnrichmentContext,
  EnrichmentDocument,
  EnrichmentFacts,
  EnrichmentInput,
  EnrichmentState,
} from "./types.js";

const enrichmentSetup = setup({
  schemas: {
    context: types<EnrichmentContext>(),
    input: types<EnrichmentInput>(),
    events: {
      START: types<{ at: number }>(),
      MAP_SUCCEEDED: types<{ at: number; urls: string[] }>(),
      MAP_FAILED: types<{ at: number; error: string }>(),
      SCRAPE_SUCCEEDED: types<{ at: number; documents: EnrichmentDocument[] }>(),
      SCRAPE_FAILED: types<{ at: number; error: string }>(),
      EXTRACT_SUCCEEDED: types<{ at: number; facts: EnrichmentFacts }>(),
      EXTRACT_FAILED: types<{ at: number; error: string }>(),
      RETRY: types<{ at: number }>(),
      CANCEL: types<{ at: number }>(),
    },
  },
});

export const brandEnrichmentMachine = enrichmentSetup.createMachine({
  id: "brand-enrichment",
  version: "1",
  initial: "idle",
  context: ({ input }) => ({
    owner: input.owner,
    sourceUrl: input.sourceUrl,
    mappedUrls: [],
    documents: [],
    facts: null,
    error: null,
    attempt: 0,
    startedAt: input.startedAt,
    updatedAt: input.startedAt,
  }),
  states: {
    idle: {
      on: {
        START: { target: "mapping", context: ({ event }) => ({ updatedAt: event.at }) },
        CANCEL: { target: "cancelled", context: ({ event }) => ({ updatedAt: event.at }) },
      },
    },
    mapping: {
      on: {
        MAP_SUCCEEDED: {
          target: "scraping",
          context: ({ event }) => ({
            mappedUrls: limitEnrichmentUrls(event.urls),
            error: null,
            updatedAt: event.at,
          }),
        },
        MAP_FAILED: {
          target: "failed",
          context: ({ event }) => ({ error: event.error, updatedAt: event.at }),
        },
        CANCEL: { target: "cancelled", context: ({ event }) => ({ updatedAt: event.at }) },
      },
    },
    scraping: {
      on: {
        SCRAPE_SUCCEEDED: {
          target: "extracting",
          context: ({ event }) => ({
            documents: event.documents,
            error: null,
            updatedAt: event.at,
          }),
        },
        SCRAPE_FAILED: {
          target: "failed",
          context: ({ event }) => ({ error: event.error, updatedAt: event.at }),
        },
        CANCEL: { target: "cancelled", context: ({ event }) => ({ updatedAt: event.at }) },
      },
    },
    extracting: {
      on: {
        EXTRACT_SUCCEEDED: {
          target: "completed",
          context: ({ event }) => ({
            facts: event.facts,
            error: null,
            updatedAt: event.at,
          }),
        },
        EXTRACT_FAILED: {
          target: "failed",
          context: ({ event }) => ({ error: event.error, updatedAt: event.at }),
        },
        CANCEL: { target: "cancelled", context: ({ event }) => ({ updatedAt: event.at }) },
      },
    },
    failed: {
      on: {
        RETRY: {
          target: "mapping",
          context: ({ context, event }) => ({
            mappedUrls: [],
            documents: [],
            facts: null,
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

export function isTerminalEnrichmentState(state: EnrichmentState): boolean {
  return state === "completed" || state === "failed" || state === "cancelled";
}
