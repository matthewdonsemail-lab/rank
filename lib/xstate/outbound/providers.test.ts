import { describe, expect, it } from "vitest";
import { buildOutboundReplyPrompt } from "./agent-prompt.ts";

describe("outbound agent prompt", () => {
  it("includes goal, brand voice, prospect context, confidence, and deal likelihood", () => {
    const prompt = buildOutboundReplyPrompt({
      goal: "guest_post",
      brand: {
        name: "Rank",
        voice: "direct and useful",
        guestPostAngle: "A practical evaluation guide",
      },
      prospect: {
        name: "Avery Editor",
        email: "avery@example.com",
        url: "https://example.com",
        publication: "Example Journal",
        fitRationale: "The audience matches the product.",
      },
      replyText: "Could you send an outline?",
      confidence: 0.82,
      dealLikelihood: 0.64,
    });

    expect(prompt).toContain("Explicit goal: guest_post");
    expect(prompt).toContain("Brand voice: direct and useful");
    expect(prompt).toContain("Prospect: Avery Editor");
    expect(prompt).toContain("Current confidence: 0.820");
    expect(prompt).toContain("Current deal likelihood: 0.640");
    expect(prompt).toContain("Return JSON");
  });
});
