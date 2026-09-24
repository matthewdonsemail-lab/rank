import type { Receipt, DocBackingMetadata } from "../schema.ts";

/**
 * Route: GET /api/v1/receipts
 * Description: Retrieves inference billing receipts and token attribution.
 * Backed by authoritative documentation in docs/architecture.md.
 */
export const docBacking: DocBackingMetadata = {
  docPath: "docs/architecture.md",
  specSection: "Billing & Cost Accounting",
  specUrl: "https://rank.listeningkit.com/docs/architecture",
  requiredFields: ["id", "sessionId", "provider", "model", "tokensUsed", "costUsd", "timestamp"],
  lastVerified: "2026-09-25",
};
export const mockReceiptsData: Receipt[] = [
  {
    id: "rec_rank_01",
    sessionId: "rs_rank_01",
    provider: "nebius",
    model: "BAAI/bge-reranker-v2-m3",
    tokensUsed: 384,
    costUsd: 0.0000768,
    timestamp: 1727226000015,
  },
  {
    id: "rec_rank_02",
    sessionId: "rs_rank_02",
    provider: "nebius",
    model: "BAAI/bge-reranker-v2-m3",
    tokensUsed: 492,
    costUsd: 0.0000984,
    timestamp: 1727226200016,
  },
  {
    id: "rec_rank_03",
    sessionId: "rs_rank_03",
    provider: "nebius",
    model: "BAAI/bge-reranker-v2-m3",
    tokensUsed: 260,
    costUsd: 0.000052,
    timestamp: 1727226400012,
  },
];

export function handleGetReceipts(sessionId?: string): Receipt[] {
  if (sessionId) {
    return mockReceiptsData.filter((r) => r.sessionId === sessionId);
  }
  return mockReceiptsData;
}
