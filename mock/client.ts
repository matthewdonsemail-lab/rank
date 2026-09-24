import { mockStore } from "./store.ts";
import { handlePostRankInference, docBacking as rankDoc } from "./data/rank-inference.ts";
import { handlePostTregExecute, docBacking as tregExecDoc } from "./data/treg-execute.ts";
import { docBacking as workspacesDoc } from "./data/workspaces.ts";
import { docBacking as apiKeysDoc } from "./data/api-keys.ts";
import { docBacking as rankSessionsDoc } from "./data/rank-sessions.ts";
import { docBacking as candidatesDoc } from "./data/candidates.ts";
import { docBacking as receiptsDoc } from "./data/receipts.ts";
import { docBacking as benchmarkRunsDoc } from "./data/benchmark-runs.ts";
import { docBacking as agentThreadsDoc } from "./data/agent-threads.ts";
import { docBacking as agentMessagesDoc } from "./data/agent-messages.ts";
import { docBacking as agentMailInboxesDoc } from "./data/agentmail-inboxes.ts";
import { docBacking as agentMailThreadsDoc } from "./data/agentmail-threads.ts";
import { docBacking as agentMailMessagesDoc } from "./data/agentmail-messages.ts";
import { docBacking as tregToolsDoc } from "./data/treg-tools.ts";
import { docBacking as tregCallsDoc } from "./data/treg-calls.ts";
import { docBacking as brandDoc } from "./data/brand.ts";
import { docBacking as brandSourcesDoc } from "./data/brand-sources.ts";
import { docBacking as brandIntelDoc } from "./data/brand-intelligence.ts";
import { wrapWithDocBacking } from "./validator.ts";
import type { RankInferenceRequest, TregExecuteRequest, DocBackingMetadata } from "./schema.ts";

/**
 * Drop-in mock client bridge emulating Convex query, mutation, and action interfaces.
 * Provides transparent access to mock relational data without requiring live Convex.
 */
export class ConvexMockClient {
  /**
   * Emulates ctx.db.query or convexClient.query
   */
  public async query(endpoint: string, args: Record<string, unknown> = {}): Promise<unknown> {
    const verifyDoc = Boolean(args.verifyDocBacking || args.backedByDoc);
    let result: unknown;
    let docMeta: DocBackingMetadata | null = null;

    switch (endpoint) {
      case "workspaces:list":
      case "workspaces:get":
        result = mockStore.workspaces;
        docMeta = workspacesDoc;
        break;

      case "workspaces:getBySlug":
        result = mockStore.getWorkspaceBySlug(String(args.slug || ""));
        docMeta = workspacesDoc;
        break;

      case "apiKeys:list":
        result = mockStore.getApiKeysByWorkspace(String(args.workspaceId || "ws_rank_01"));
        docMeta = apiKeysDoc;
        break;

      case "rankSessions:list":
        result = mockStore.getRankSessionsByWorkspace(String(args.workspaceId || "ws_rank_01"));
        docMeta = rankSessionsDoc;
        break;

      case "rankSessions:get":
        result = mockStore.getFullSession(String(args.sessionId || ""));
        docMeta = rankSessionsDoc;
        break;

      case "candidates:listBySession":
        result = mockStore.getCandidatesBySession(String(args.sessionId || ""));
        docMeta = candidatesDoc;
        break;

      case "receipts:getBySession":
        result = mockStore.getReceiptBySession(String(args.sessionId || ""));
        docMeta = receiptsDoc;
        break;

      case "benchmarkRuns:list":
        result = mockStore.getBenchmarkRunsByWorkspace(String(args.workspaceId || "ws_rank_01"));
        docMeta = benchmarkRunsDoc;
        break;

      case "agent:listThreads":
        result = mockStore.getAgentThreadsByWorkspace(String(args.workspaceId || "ws_rank_01"));
        docMeta = agentThreadsDoc;
        break;

      case "agent:listMessages":
        result = mockStore.getAgentMessagesByThread(String(args.threadId || ""));
        docMeta = agentMessagesDoc;
        break;

      case "agentmail:listInboxes":
        result = mockStore.getAgentMailInboxesByWorkspace(String(args.workspaceId || "ws_rank_01"));
        docMeta = agentMailInboxesDoc;
        break;

      case "agentmail:listThreads":
        result = mockStore.getAgentMailThreadsByInbox(String(args.inboxId || ""));
        docMeta = agentMailThreadsDoc;
        break;

      case "agentmail:listMessages":
        result = mockStore.getAgentMailMessagesByThread(String(args.threadId || ""));
        docMeta = agentMailMessagesDoc;
        break;

      case "treg:listTools":
        result = mockStore.getTregTools(args as { category?: string; provider?: string });
        docMeta = tregToolsDoc;
        break;

      case "treg:listCalls":
        result = mockStore.getTregCalls(args.ownerHash ? String(args.ownerHash) : undefined);
        docMeta = tregCallsDoc;
        break;

      case "brand:get":
        result = mockStore.getBrand();
        docMeta = brandDoc;
        break;

      case "brand:sources:list":
        result = mockStore.getBrandSources();
        docMeta = brandSourcesDoc;
        break;

      default:
        throw new Error(`Unknown mock query endpoint: ${endpoint}`);
    }

    if (verifyDoc && docMeta) {
      return wrapWithDocBacking(result, docMeta);
    }
    return result;
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

      case "brand:save": {
        return mockStore.upsertBrand(args);
      }

      case "brand:appendIntelligence": {
        return mockStore.appendBrandIntelligence(args);
      }

      case "brand:sources:index": {
        return mockStore.indexBrandSources(args as { urls?: string[]; sitemap?: boolean });
      }

      case "brand:sources:remove": {
        return mockStore.removeBrandSource(String(args.url || ""));
      }

      case "brand:clear": {
        mockStore.clearBrand();
        return null;
      }

      default:
        throw new Error(`Unknown mock mutation endpoint: ${endpoint}`);
    }
  }

  /**
   * Emulates action calls such as AI reranker, agent execution, or Treg tool call
   */
  public async action(endpoint: string, args: Record<string, unknown> = {}): Promise<unknown> {
    switch (endpoint) {
      case "rank:execute": {
        const req = args as unknown as RankInferenceRequest;
        return handlePostRankInference(req);
      }

      case "treg:callTool": {
        const req = args as unknown as TregExecuteRequest;
        const callResult = handlePostTregExecute(req);
        mockStore.insertTregCall({
          callId: callResult.callId,
          ownerHash: req.owner ? `hash_${req.owner.slice(0, 8)}` : "hash_anonymous",
          endpoint: callResult.endpoint,
          costMicro: callResult.costMicro,
          servedVia: callResult.servedVia,
          at: callResult.at,
        });
        return callResult;
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
