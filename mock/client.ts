import { mockStore } from "./store.ts";
import { handlePostRankInference } from "./data/rank-inference.ts";
import type { RankInferenceRequest } from "./schema.ts";

/**
 * Drop-in mock client bridge emulating Convex query, mutation, and action interfaces.
 * Provides transparent access to mock relational data without requiring live Convex.
 */
export class ConvexMockClient {
  /**
   * Emulates ctx.db.query or convexClient.query
   */
  public async query(endpoint: string, args: Record<string, unknown> = {}): Promise<unknown> {
    switch (endpoint) {
      case "workspaces:list":
      case "workspaces:get":
        return mockStore.workspaces;

      case "workspaces:getBySlug":
        return mockStore.getWorkspaceBySlug(String(args.slug || ""));

      case "apiKeys:list":
        return mockStore.getApiKeysByWorkspace(String(args.workspaceId || "ws_rank_01"));

      case "rankSessions:list":
        return mockStore.getRankSessionsByWorkspace(String(args.workspaceId || "ws_rank_01"));

      case "rankSessions:get":
        return mockStore.getFullSession(String(args.sessionId || ""));

      case "candidates:listBySession":
        return mockStore.getCandidatesBySession(String(args.sessionId || ""));

      case "receipts:getBySession":
        return mockStore.getReceiptBySession(String(args.sessionId || ""));

      case "benchmarkRuns:list":
        return mockStore.getBenchmarkRunsByWorkspace(String(args.workspaceId || "ws_rank_01"));

      case "agent:listThreads":
        return mockStore.getAgentThreadsByWorkspace(String(args.workspaceId || "ws_rank_01"));

      case "agent:listMessages":
        return mockStore.getAgentMessagesByThread(String(args.threadId || ""));

      case "agentmail:listInboxes":
        return mockStore.getAgentMailInboxesByWorkspace(String(args.workspaceId || "ws_rank_01"));

      case "agentmail:listThreads":
        return mockStore.getAgentMailThreadsByInbox(String(args.inboxId || ""));

      case "agentmail:listMessages":
        return mockStore.getAgentMailMessagesByThread(String(args.threadId || ""));

      default:
        throw new Error(`Unknown mock query endpoint: ${endpoint}`);
    }
  }

  /**
   * Emulates ctx.db.insert or convexClient.mutation
   */
  public async mutation(endpoint: string, args: Record<string, unknown> = {}): Promise<unknown> {
    switch (endpoint) {
      case "rankSessions:create": {
        const sessionId = `rs_mock_${Date.now()}`;
        const newSession = {
          id: sessionId,
          workspaceId: String(args.workspaceId || "ws_rank_01"),
          query: String(args.query || ""),
          strategy: String(args.strategy || "cross-encoder"),
          model: String(args.model || "BAAI/bge-reranker-v2-m3"),
          candidateCount: Number(args.candidateCount || 0),
          latencyMs: Number(args.latencyMs || 15.0),
          createdAt: Date.now(),
        };
        mockStore.rankSessions.unshift(newSession);
        return sessionId;
      }

      case "apiKeys:create": {
        const newKey = {
          id: `key_mock_${Date.now()}`,
          workspaceId: String(args.workspaceId || "ws_rank_01"),
          hashedKey: `rnk_mock_${Math.random().toString(36).substring(2)}`,
          label: String(args.label || "new-key"),
          scopes: (args.scopes as string[]) || ["rank:execute"],
          createdAt: Date.now(),
        };
        mockStore.apiKeys.unshift(newKey);
        return newKey;
      }

      default:
        throw new Error(`Unknown mock mutation endpoint: ${endpoint}`);
    }
  }

  /**
   * Emulates action calls such as AI reranker or agent execution
   */
  public async action(endpoint: string, args: Record<string, unknown> = {}): Promise<unknown> {
    switch (endpoint) {
      case "rank:execute": {
        const req = args as unknown as RankInferenceRequest;
        return handlePostRankInference(req);
      }

      case "agent:runTurn": {
        const threadId = String(args.threadId || "ath_rank_01");
        const prompt = String(args.prompt || "");

        const userMsg = {
          id: `amsg_mock_${Date.now()}`,
          threadId,
          role: "user" as const,
          content: prompt,
          createdAt: Date.now(),
        };
        mockStore.agentMessages.push(userMsg);

        const assistantMsg = {
          id: `amsg_mock_${Date.now() + 1}`,
          threadId,
          role: "assistant" as const,
          content: `Mock AI response: Evaluated and ranked candidates for prompt "${prompt}".`,
          createdAt: Date.now() + 10,
        };
        mockStore.agentMessages.push(assistantMsg);

        return assistantMsg;
      }

      default:
        throw new Error(`Unknown mock action endpoint: ${endpoint}`);
    }
  }
}

export const mockClient = new ConvexMockClient();
