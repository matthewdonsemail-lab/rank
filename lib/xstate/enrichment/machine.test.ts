import { describe, expect, it } from "vitest";
import { createActor } from "xstate";
import { brandEnrichmentMachine, type EnrichmentFacts, type EnrichmentInput } from "./index.js";

const input: EnrichmentInput = {
  owner: "owner_1",
  sourceUrl: "https://example.com",
  startedAt: 1_000,
};

const facts: EnrichmentFacts = {
  name: "Example",
  tagline: "Example business",
  offerings: [{ name: "Consulting", detail: "Example service" }],
};

describe("brand enrichment machine", () => {
  it("moves from idle through extraction to completed", () => {
    const actor = createActor(brandEnrichmentMachine, { input }).start();

    actor.send({ type: "START", at: 1_001 });
    expect(actor.getSnapshot().value).toBe("mapping");

    actor.send({ type: "MAP_SUCCEEDED", at: 1_002, urls: ["https://example.com/about"] });
    expect(actor.getSnapshot().value).toBe("scraping");
    expect(actor.getSnapshot().context.mappedUrls).toEqual(["https://example.com/about"]);

    actor.send({
      type: "SCRAPE_SUCCEEDED",
      at: 1_003,
      documents: [{
        url: "https://example.com",
        title: "Example",
        description: null,
        markdownExcerpt: "Example content",
        facts,
      }],
    });
    expect(actor.getSnapshot().value).toBe("extracting");

    actor.send({ type: "EXTRACT_SUCCEEDED", at: 1_004, facts });
    expect(actor.getSnapshot().value).toBe("completed");
    expect(actor.getSnapshot().context.facts).toEqual(facts);
  });

  it("restores a persisted state and context", () => {
    const actor = createActor(brandEnrichmentMachine, { input }).start();
    actor.send({ type: "START", at: 1_001 });
    actor.send({ type: "MAP_SUCCEEDED", at: 1_002, urls: ["https://example.com/about"] });
    const persisted = JSON.parse(JSON.stringify(actor.getPersistedSnapshot()));
    expect(persisted.machine.version).toBe("1");

    const restored = createActor(brandEnrichmentMachine, { input, snapshot: persisted }).start();
    expect(restored.getSnapshot().value).toBe("scraping");
    expect(restored.getSnapshot().context.mappedUrls).toEqual(["https://example.com/about"]);
  });

  it("persists a failure and resets the attempt on retry", () => {
    const actor = createActor(brandEnrichmentMachine, { input }).start();
    actor.send({ type: "START", at: 1_001 });
    actor.send({ type: "MAP_FAILED", at: 1_002, error: "Firecrawl unavailable" });

    expect(actor.getSnapshot().value).toBe("failed");
    expect(actor.getSnapshot().context.error).toBe("Firecrawl unavailable");

    actor.send({ type: "RETRY", at: 1_003 });
    expect(actor.getSnapshot().value).toBe("mapping");
    expect(actor.getSnapshot().context.attempt).toBe(1);
    expect(actor.getSnapshot().context.error).toBeNull();
  });

  it("allows active work to be cancelled", () => {
    const actor = createActor(brandEnrichmentMachine, { input }).start();
    actor.send({ type: "CANCEL", at: 1_001 });
    expect(actor.getSnapshot().value).toBe("cancelled");
  });
});
