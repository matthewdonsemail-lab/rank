import type { LinkProspect, ProspectJudgment } from "../../typesafe/evaluator/index.js";

export type ProspectEvaluationState =
  | "idle"
  | "evaluating"
  | "completed"
  | "failed"
  | "cancelled";

export interface ProspectEvaluationContext {
  owner: string;
  sourceDiscoveryRunId: string | null;
  prospect: LinkProspect;
  judgment: ProspectJudgment | null;
  error: string | null;
  attempt: number;
  startedAt: number;
  updatedAt: number;
}

export interface ProspectEvaluationInput {
  owner: string;
  sourceDiscoveryRunId?: string;
  prospect: LinkProspect;
  startedAt: number;
}

export type ProspectEvaluationEvent =
  | { type: "START"; at: number }
  | { type: "JUDGMENT_READY"; at: number; judgment: ProspectJudgment }
  | { type: "EVALUATION_FAILED"; at: number; error: string }
  | { type: "RETRY"; at: number }
  | { type: "CANCEL"; at: number };
