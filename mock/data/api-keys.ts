import type { ApiKey, DocBackingMetadata } from "../schema.ts";

/**
 * Route: GET /api/keys
 * Description: Retrieves provisioned hashed API keys for a workspace.
 * Backed by authoritative documentation in docs/api-and-mcp.md.
 */
export const docBacking: DocBackingMetadata = {
  docPath: "docs/api-and-mcp.md",
  specSection: "Authentication & Scopes",
  specUrl: "https://rank.listeningkit.com/docs/api#auth",
  requiredFields: ["id", "workspaceId", "hashedKey", "label", "scopes"],
  lastVerified: "2026-09-25",
};
export const mockApiKeysData: ApiKey[] = [
  {
    id: "key_rank_01",
    workspaceId: "ws_rank_01",
    hashedKey: "rnk_live_9a8f27364b104928e",
    label: "production-cross-encoder-key",
    scopes: ["rank:execute", "sessions:read", "benchmarks:read"],
    lastUsedAt: 1727226500000,
    createdAt: 1727222400000,
  },
  {
    id: "key_rank_02",
    workspaceId: "ws_rank_01",
    hashedKey: "rnk_live_41c0e812d8f9930ba",
    label: "agentmail-triage-key",
    scopes: ["rank:execute", "agentmail:read", "agentmail:write"],
    lastUsedAt: 1727226400000,
    createdAt: 1727223000000,
  },
  {
    id: "key_rank_03",
    workspaceId: "ws_rank_02",
    hashedKey: "rnk_test_57d23190ab7784ec1",
    label: "staging-test-key",
    scopes: ["rank:execute"],
    lastUsedAt: 1727225000000,
    createdAt: 1727226000000,
  },
];

export function handleGetApiKeys(filter?: { workspaceId?: string }): ApiKey[] {
  if (filter?.workspaceId) {
    return mockApiKeysData.filter((k) => k.workspaceId === filter.workspaceId);
  }
  return mockApiKeysData;
}
