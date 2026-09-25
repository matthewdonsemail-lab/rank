import { setup, types } from "xstate";
import type { LinkProspect, ProspectJudgment } from "../../typesafe/evaluator/index.js";
import type {
  ProspectEvaluationContext,
  ProspectEvaluationInput,
  ProspectEvaluationState,
} from "./types.js";

const prospectEvaluationSetup = setup({
  schemas: {
    context: types<ProspectEvaluationContext>(),
    input: types<ProspectEvaluationInput>(),
    events: {
      START: types<{ at: number }>(),
      JUDGMENT_READY: types<{ at: number; judgment: ProspectJudgment }>(),
      EVALUATION_FAILED: types<{ at: number; error: string }>(),
      RETRY: types<{ at: number }>(),
      CANCEL: types<{ at: number }>(),
    },
  },
});

export const prospectEvaluationMachine = prospectEvaluationSetup.createMachine({
  id: "prospect-evaluation",
  version: "1",
  initial: "idle",
  context: ({ input }) => ({
    owner: input.owner,
    sourceDiscoveryRunId: input.sourceDiscoveryRunId ?? null,
    prospect: input.prospect,
    judgment: null,
    error: null,
    attempt: 0,
    startedAt: input.startedAt,
    updatedAt: input.startedAt,
  }),
  states: {
    idle: {
      on: {
        START: { target: "evaluating", context: ({ event }) => ({ updatedAt: event.at }) },
        CANCEL: { target: "cancelled", context: ({ event }) => ({ updatedAt: event.at }) },
      },
    },
    evaluating: {
      on: {
        JUDGMENT_READY: {
          target: "completed",
          context: ({ event }) => ({
            judgment: event.judgment,
            error: null,
            updatedAt: event.at,
          }),
        },
        EVALUATION_FAILED: {
          target: "failed",
          context: ({ event }) => ({ error: event.error, updatedAt: event.at }),
        },
        CANCEL: { target: "cancelled", context: ({ event }) => ({ updatedAt: event.at }) },
      },
    },
    failed: {
      on: {
        RETRY: {
          target: "evaluating",
          context: ({ context, event }) => ({
            judgment: null,
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

export function isTerminalProspectEvaluationState(state: ProspectEvaluationState): boolean {
  return state === "completed" || state === "failed" || state === "cancelled";
}
