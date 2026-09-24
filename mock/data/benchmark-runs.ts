import type { BenchmarkRun, DocBackingMetadata } from "../schema.ts";

/**
 * Route: GET /api/benchmarks
 * Description: Retrieves benchmark evaluation runs (NDCG@10, MRR, latency).
 * Backed by authoritative documentation in docs/typesafe/confidence.md.
 */
export const docBacking: DocBackingMetadata = {
  docPath: "docs/typesafe/confidence.md",
  specSection: "Deterministic Evaluation & Metrics",
  specUrl: "https://typesafe.ai/docs/confidence",
  requiredFields: ["id", "workspaceId", "dataset", "ndcg10", "mrr", "avgLatencyMs", "completedAt"],
  lastVerified: "2026-09-25",
};
export const mockBenchmarkRunsData: BenchmarkRun[] = [
  {
    id: "bm_rank_01",
    workspaceId: "ws_rank_01",
    dataset: "MS-MARCO-v2",
    ndcg10: 0.884,
    mrr: 0.892,
    avgLatencyMs: 14.6,
    completedAt: 1727224000000,
  },
  {
    id: "bm_rank_02",
    workspaceId: "ws_rank_01",
    dataset: "TREC-COVID",
    ndcg10: 0.912,
    mrr: 0.925,
    avgLatencyMs: 13.9,
    completedAt: 1727225000000,
  },
  {
    id: "bm_rank_03",
    workspaceId: "ws_rank_01",
    dataset: "BEIR-HotpotQA",
    ndcg10: 0.841,
    mrr: 0.856,
    avgLatencyMs: 15.3,
    completedAt: 1727225800000,
  },
  {
    id: "bm_rank_04",
    workspaceId: "ws_rank_02",
    dataset: "MS-MARCO-v2",
    ndcg10: 0.852,
    mrr: 0.864,
    avgLatencyMs: 18.2,
    completedAt: 1727226000000,
  },
];

export function handleGetBenchmarkRuns(workspaceId?: string): BenchmarkRun[] {
  if (workspaceId) {
    return mockBenchmarkRunsData.filter((b) => b.workspaceId === workspaceId);
  }
  return mockBenchmarkRunsData;
}
