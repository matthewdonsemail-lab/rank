import { describe, expect, it } from "vitest";
import { createActor } from "xstate";
import {
  competitorDiscoveryMachine,
  normalizeCompetitorCandidates,
  parseCompetitorCandidates,
  type CompetitorDiscoveryInput,
} from "./index.js";

const input: CompetitorDiscoveryInput = {
  owner: "owner_1",
  sourceEnrichmentRunId: "enrichment_1",
  sourceUrl: "https://example.com",
  sourceDomain: "example.com",
  endpoint: "spyfu.google.domain.competitors",
  limit: 25,
  startedAt: 1_000,
};

describe("competitor discovery machine", () => {
  it("moves from idle through normalization to completed", () => {
    const actor = createActor(competitorDiscoveryMachine, { input }).start();
    actor.send({ type: "START", at: 1_001 });
    expect(actor.getSnapshot().value).toBe("discovering");

    actor.send({
      type: "COMPETITORS_RECEIVED",
      at: 1_002,
      candidates: [{ domain: "competitor.com", name: "Competitor", rank: 1, commonTerms: 12, sourceEndpoint: input.endpoint }],
    });
    expect(actor.getSnapshot().value).toBe("normalizing");

    actor.send({
      type: "CANDIDATES_READY",
      at: 1_003,
      candidates: [{ domain: "competitor.com", name: "Competitor", rank: 1, commonTerms: 12, sourceEndpoint: input.endpoint }],
    });
    expect(actor.getSnapshot().value).toBe("completed");
    expect(actor.getSnapshot().context.normalizedCandidates).toHaveLength(1);
  });

  it("restores a persisted discovery state", () => {
    const actor = createActor(competitorDiscoveryMachine, { input }).start();
    actor.send({ type: "START", at: 1_001 });
    actor.send({
      type: "COMPETITORS_RECEIVED",
      at: 1_002,
      candidates: [{ domain: "competitor.com", name: null, rank: 2, commonTerms: 8, sourceEndpoint: input.endpoint }],
    });
    const persisted = JSON.parse(JSON.stringify(actor.getPersistedSnapshot()));
    expect(persisted.machine.version).toBe("1");
    const restored = createActor(competitorDiscoveryMachine, { input, snapshot: persisted }).start();
    expect(restored.getSnapshot().value).toBe("normalizing");
    expect(restored.getSnapshot().context.candidates[0].domain).toBe("competitor.com");
  });

  it("retries failures and supports cancellation", () => {
    const actor = createActor(competitorDiscoveryMachine, { input }).start();
    actor.send({ type: "START", at: 1_001 });
    actor.send({ type: "DISCOVERY_FAILED", at: 1_002, error: "Provider unavailable" });
    expect(actor.getSnapshot().value).toBe("failed");
    actor.send({ type: "RETRY", at: 1_003 });
    expect(actor.getSnapshot().value).toBe("discovering");
    expect(actor.getSnapshot().context.attempt).toBe(1);
    actor.send({ type: "CANCEL", at: 1_004 });
    expect(actor.getSnapshot().value).toBe("cancelled");
  });
});

describe("competitor response normalization", () => {
  it("parses nested provider rows and removes the source brand", () => {
    const candidates = parseCompetitorCandidates({
      data: {
        results: [
          { domain: "https://www.alpha.example", name: "Alpha", rank: 2, commonTerms: 20 },
          { url: "https://beta.example", position: 1, sharedKeywords: 15 },
          { domain: "example.com", commonTerms: 99 },
        ],
      },
    }, "spyfu.google.domain.competitors");

    const normalized = normalizeCompetitorCandidates(candidates, "example.com", 25);
    expect(normalized.map((candidate) => candidate.domain)).toEqual(["alpha.example", "beta.example"]);
  });

  it("deduplicates domains and prioritizes shared terms", () => {
    const normalized = normalizeCompetitorCandidates([
      { domain: "alpha.example", name: null, rank: 5, commonTerms: 2, sourceEndpoint: "a" },
      { domain: "https://www.alpha.example/", name: "Alpha", rank: 1, commonTerms: 20, sourceEndpoint: "a" },
      { domain: "beta.example", name: null, rank: 1, commonTerms: 10, sourceEndpoint: "a" },
    ], "example.com", 1);
    expect(normalized).toHaveLength(1);
    expect(normalized[0].domain).toBe("alpha.example");
  });
});
