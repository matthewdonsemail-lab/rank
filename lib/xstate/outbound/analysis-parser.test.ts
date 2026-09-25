import { describe, expect, it } from "vitest";
import {
  OutboundAnalysisParseError,
  parseOutboundReplyAnalysis,
} from "./analysis-parser.ts";

describe("outbound reply analysis parser", () => {
  it("parses a fenced model response", () => {
    const result = parseOutboundReplyAnalysis(`\`\`\`json
      {"intent":"question","sentiment":0.3,"confidence":0.8,"dealLikelihood":0.5,"nextAction":"draft_follow_up","labels":["reply:question"],"rationale":"The editor asked for an outline."}
    \`\`\``);
    expect(result.intent).toBe("question");
    expect(result.nextAction).toBe("draft_follow_up");
  });

  it("rejects out-of-range or malformed model output", () => {
    expect(() => parseOutboundReplyAnalysis({ intent: "interested", sentiment: 2 })).toThrow(
      OutboundAnalysisParseError,
    );
    expect(() => parseOutboundReplyAnalysis("not json")).toThrow("valid JSON");
  });
});
