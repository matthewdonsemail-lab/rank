import { describe, expect, it } from "vitest";
import { createActor } from "xstate";
import {
  contactResolutionMachine,
  type ContactResolutionInput,
} from "./index.ts";

const input: ContactResolutionInput = {
  owner: "user_1",
  domain: "example.com",
  candidateEmail: "editor@example.com",
  contactName: "Avery Editor",
  publicationUrl: "https://example.com/about",
  startedAt: 1_000,
};

describe("contact resolution machine", () => {
  it("resolves a verified contact and persists the result", () => {
    const actor = createActor(contactResolutionMachine, { input }).start();
    actor.send({ type: "START", at: 1_001 });
    actor.send({ type: "DOMAIN_VERIFIED", at: 1_002, verificationSource: "dns", confidence: 0.95 });
    actor.send({
      type: "CONTACT_RESOLVED",
      at: 1_003,
      email: "editor@example.com",
      verificationSource: "publication-page",
      confidence: 0.9,
    });
    expect(actor.getSnapshot().value).toBe("deliverable");
    expect(actor.getSnapshot().context.resolvedEmail).toBe("editor@example.com");
    const persisted = JSON.parse(JSON.stringify(actor.getPersistedSnapshot()));
    expect(persisted.machine.version).toBe("1");
    const restored = createActor(contactResolutionMachine, { input, snapshot: persisted }).start();
    expect(restored.getSnapshot().value).toBe("deliverable");
  });

  it("routes bounces to an alternate-contact retry", () => {
    const actor = createActor(contactResolutionMachine, { input }).start();
    actor.send({ type: "START", at: 1_001 });
    actor.send({ type: "DOMAIN_VERIFIED", at: 1_002, verificationSource: "dns", confidence: 0.8 });
    actor.send({
      type: "CONTACT_RESOLVED",
      at: 1_003,
      email: "editor@example.com",
      verificationSource: "dns",
      confidence: 0.8,
    });
    actor.send({ type: "DELIVERY_BOUNCED", at: 1_004, reason: "550 mailbox unavailable" });
    expect(actor.getSnapshot().value).toBe("bounced");
    actor.send({ type: "RETRY", at: 1_005 });
    expect(actor.getSnapshot().value).toBe("checking_domain");
    expect(actor.getSnapshot().context.attempt).toBe(1);
  });
});
