import type { RankSession, Candidate, Receipt } from "../schema.ts";
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
 */
export function handleGetRankSessionDetail(sessionId: string): RankSessionDetail | null {
  const session = mockRankSessionsData.find((s) => s.id === sessionId);
  if (!session) return null;

  const candidates = mockCandidatesData
    .filter((c) => c.sessionId === sessionId)
    .sort((a, b) => a.finalRank - b.finalRank);

  const receipt = mockReceiptsData.find((r) => r.sessionId === sessionId) ?? null;

  return { session, candidates, receipt };
}
