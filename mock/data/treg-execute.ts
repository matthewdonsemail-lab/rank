import crypto from "node:crypto";
import type { TregExecuteRequest, TregExecuteResponse, DocBackingMetadata } from "../schema.ts";

/**
 * Route: POST /api/treg/call
 * Description: Simulates developer tool execution through @listeningkit/treg.
 * Enforces reserve ceiling guardrails (maxCostUsd) and creates a spend receipt.
 * Backed by authoritative documentation in docs/convex/components/treg/tools.md.
 */
export const docBacking: DocBackingMetadata = {
  docPath: "docs/convex/components/treg/tools.md",
  specSection: "Tool Execution Flow",
  specUrl: "https://treg.to/docs/execution",
  requiredFields: ["callId", "endpoint", "result", "costMicro", "servedVia", "at"],
  lastVerified: "2026-09-25",
};

export function handlePostTregExecute(body: TregExecuteRequest): TregExecuteResponse {
  const maxCostUsd = body.maxCostUsd ?? 0.05;

  // Mock costs per endpoint in USD
  const endpointCosts: Record<string, number> = {
    "spyfu.google.domain.competitors": 0.0002,
    "seranking.google.domain.competitors": 0.0179,
    "serpstat.google.domain.competitors": 0.0005,
    "brave.web.search": 0.0008,
  };

  const expectedCostUsd = endpointCosts[body.endpoint] ?? 0.001;

  if (expectedCostUsd > maxCostUsd) {
    throw new Error(
      `Treg HTTP 402: Upfront cost reserve (${expectedCostUsd} USD) exceeds maxCostUsd ceiling (${maxCostUsd} USD)`
    );
  }

  const callId = `call_treg_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const costMicro = Math.round(expectedCostUsd * 1_000_000);

  // Generate realistic domain/competitor results
  let result: Record<string, unknown> = {};
  if (body.endpoint.includes("competitors")) {
    const domain = String(body.params.domain || "example.com");
    result = {
      domain,
      competitors: [
        { domain: `comp1-${domain}`, commonKeywords: 1420, organicTraffic: 58000 },
        { domain: `comp2-${domain}`, commonKeywords: 980, organicTraffic: 32000 },
        { domain: `comp3-${domain}`, commonKeywords: 640, organicTraffic: 19500 },
      ],
      totalFound: 3,
    };
  } else if (body.endpoint.includes("search")) {
    const query = String(body.params.query || "");
    result = {
      query,
      results: [
        { title: `Top search hit for ${query}`, url: `https://example.com/result-1`, score: 0.94 },
        { title: `Secondary information for ${query}`, url: `https://example.com/result-2`, score: 0.88 },
      ],
    };
  } else {
    result = { status: "success", executed: body.endpoint, params: body.params };
  }

  return {
    callId,
    endpoint: body.endpoint,
    result,
    costMicro,
    servedVia: "direct",
    at: Date.now(),
  };
}
