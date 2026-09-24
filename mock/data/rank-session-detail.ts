import type { RankSession, Candidate, Receipt, DocBackingMetadata } from "../schema.ts";
import { mockRankSessionsData } from "./rank-sessions.ts";
import { mockCandidatesData } from "./candidates.ts";
import { mockReceiptsData } from "./receipts.ts";

export interface RankSessionDetail {
  session: RankSession;
  candidates: Candidate[];
  receipt: Receipt | null;
}

/**
 * Route: GET /api/v1/sessions/:id
 * Description: Retrieves full session breakdown with candidates and billing receipt.
 * Backed by authoritative documentation in docs/architecture.md.
 */
export const docBacking: DocBackingMetadata = {
  docPath: "docs/architecture.md",
  specSection: "Relational Session Breakdown",
  specUrl: "https://rank.listeningkit.com/docs/architecture",
  requiredFields: ["session", "candidates"],
  lastVerified: "2026-09-25",
};
export function handleGetRankSessionDetail(sessionId: string): RankSessionDetail | null {
  const session = mockRankSessionsData.find((s) => s.id === sessionId);
  if (!session) return null;

  const candidates = mockCandidatesData
    .filter((c) => c.sessionId === sessionId)
    .sort((a, b) => a.finalRank - b.finalRank);

  const receipt = mockReceiptsData.find((r) => r.sessionId === sessionId) ?? null;

  return { session, candidates, receipt };
}
