import { describe, expect, it } from "vitest";
import { createActor } from "xstate";
import {
  prospectEvaluationMachine,
  type ProspectEvaluationInput,
} from "./index.js";
import type { ProspectJudgment } from "../../typesafe/evaluator/index.js";

const input: ProspectEvaluationInput = {
  owner: "owner_1",
  sourceDiscoveryRunId: "discovery_1",
  prospect: { url: "https://example.com/article", title: "Example article" },
  startedAt: 1_000,
};

const judgment: ProspectJudgment = {
  action: "act",
  confidence: 0.91,
  route: "act",
  reasons: ["Strong fit"],
};

describe("prospect evaluation machine", () => {
  it("moves from idle through evaluation to completed", () => {
    const actor = createActor(prospectEvaluationMachine, { input }).start();

    actor.send({ type: "START", at: 1_001 });
    expect(actor.getSnapshot().value).toBe("evaluating");

    actor.send({ type: "JUDGMENT_READY", at: 1_002, judgment });
    expect(actor.getSnapshot().value).toBe("completed");
    expect(actor.getSnapshot().context.judgment).toEqual(judgment);
  });

  it("restores an in-progress evaluation", () => {
    const actor = createActor(prospectEvaluationMachine, { input }).start();
    actor.send({ type: "START", at: 1_001 });
    const persisted = JSON.parse(JSON.stringify(actor.getPersistedSnapshot()));
    expect(persisted.machine.version).toBe("1");

    const restored = createActor(prospectEvaluationMachine, { input, snapshot: persisted }).start();
    expect(restored.getSnapshot().value).toBe("evaluating");
    expect(restored.getSnapshot().context.prospect.url).toBe(input.prospect.url);
  });

  it("retries failures and supports cancellation", () => {
    const actor = createActor(prospectEvaluationMachine, { input }).start();
    actor.send({ type: "START", at: 1_001 });
    actor.send({ type: "EVALUATION_FAILED", at: 1_002, error: "Provider unavailable" });
    expect(actor.getSnapshot().value).toBe("failed");
    expect(actor.getSnapshot().context.error).toBe("Provider unavailable");

    actor.send({ type: "RETRY", at: 1_003 });
    expect(actor.getSnapshot().value).toBe("evaluating");
    expect(actor.getSnapshot().context.attempt).toBe(1);

    actor.send({ type: "CANCEL", at: 1_004 });
    expect(actor.getSnapshot().value).toBe("cancelled");
  });
});
