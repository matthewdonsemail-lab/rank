import type { TregCallReceipt, DocBackingMetadata } from "../schema.ts";

/**
 * Route: GET /api/treg/calls
 * Description: Audit trail and spend receipts from the @listeningkit/treg encapsulated calls table.
 * Backed by authoritative documentation in docs/convex/components/treg/spend-ledger.md.
 */
export const docBacking: DocBackingMetadata = {
  docPath: "docs/convex/components/treg/spend-ledger.md",
  specSection: "Ledger Schema",
  specUrl: "https://treg.to/docs/ledger",
  requiredFields: ["callId", "ownerHash", "endpoint", "costMicro", "servedVia", "at"],
  lastVerified: "2026-09-25",
};

export const mockTregCallsData: TregCallReceipt[] = [
  {
    callId: "call_treg_9a81b2c3d4e5",
    ownerHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    endpoint: "spyfu.google.domain.competitors",
    costMicro: 200,
    servedVia: "direct",
    at: 1727226300000,
  },
  {
    callId: "call_treg_7f6e5d4c3b2a",
    ownerHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    endpoint: "brave.web.search",
    costMicro: 800,
    servedVia: "cache-hit",
    at: 1727226450000,
  },
];

export function handleGetTregCalls(ownerHash?: string): TregCallReceipt[] {
  if (ownerHash) {
    return mockTregCallsData.filter((c) => c.ownerHash === ownerHash);
  }
  return mockTregCallsData;
}
