import http from "node:http";
import { URL } from "node:url";

import { handleGetAuthUser, docBacking as authUserDoc } from "./data/auth-user.ts";
import { handleGetAuthOrganization, docBacking as authOrgDoc } from "./data/auth-organization.ts";
import { handleGetWorkspaces, docBacking as workspacesDoc } from "./data/workspaces.ts";
import { handleGetWorkspaceDetail, docBacking as workspaceDetailDoc } from "./data/workspace-detail.ts";
import { handleGetApiKeys, docBacking as apiKeysDoc } from "./data/api-keys.ts";
import { handleGetRankSessions, docBacking as rankSessionsDoc } from "./data/rank-sessions.ts";
import { handleGetRankSessionDetail, docBacking as rankSessionDetailDoc } from "./data/rank-session-detail.ts";
import { handleGetCandidates, docBacking as candidatesDoc } from "./data/candidates.ts";
import { handleGetReceipts, docBacking as receiptsDoc } from "./data/receipts.ts";
import { handleGetBenchmarkRuns, docBacking as benchmarkRunsDoc } from "./data/benchmark-runs.ts";
import { handlePostRankInference, docBacking as rankInferenceDoc } from "./data/rank-inference.ts";
import { handleGetAgentThreads, docBacking as agentThreadsDoc } from "./data/agent-threads.ts";
import { handleGetAgentMessages, docBacking as agentMessagesDoc } from "./data/agent-messages.ts";
import { handleGetAgentMailInboxes, docBacking as agentMailInboxesDoc } from "./data/agentmail-inboxes.ts";
import { handleGetAgentMailThreads, docBacking as agentMailThreadsDoc } from "./data/agentmail-threads.ts";
import { handleGetAgentMailMessages, docBacking as agentMailMessagesDoc } from "./data/agentmail-messages.ts";
import { handleGetTregTools, docBacking as tregToolsDoc } from "./data/treg-tools.ts";
import { handleGetTregCalls, docBacking as tregCallsDoc } from "./data/treg-calls.ts";
import { handlePostTregExecute, docBacking as tregExecuteDoc } from "./data/treg-execute.ts";
import { docBacking as brandDoc } from "./data/brand.ts";
import { docBacking as brandSourcesDoc } from "./data/brand-sources.ts";
import { docBacking as brandIntelDoc } from "./data/brand-intelligence.ts";
import { mockStore } from "./store.ts";
import { wrapWithDocBacking } from "./validator.ts";
import type { RankInferenceRequest, TregExecuteRequest, DocBackingMetadata } from "./schema.ts";

const DEFAULT_PORT = 3002;

function sendJson(res: http.ServerResponse, statusCode: number, data: unknown) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Verify-Doc-Backing",
  });
  res.end(JSON.stringify(data, null, 2));
}

function parseJsonBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function respondWithDocCheck(
  res: http.ServerResponse,
  statusCode: number,
  data: unknown,
  metadata: DocBackingMetadata,
  verifyDocBacking: boolean
) {
  if (verifyDocBacking) {
    const wrapped = wrapWithDocBacking(data, metadata);
    return sendJson(res, statusCode, wrapped);
  }
  return sendJson(res, statusCode, data);
}

export function createMockServer() {
  return http.createServer(async (req, res) => {
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Verify-Doc-Backing",
      });
      res.end();
      return;
    }

    const host = req.headers.host || "localhost";
    const url = new URL(req.url || "/", `http://${host}`);
    const pathname = url.pathname;
    const query = Object.fromEntries(url.searchParams.entries());
    const verifyDocBacking =
      query.verifyDocBacking === "true" ||
      query.backedByDoc === "true" ||
      req.headers["x-verify-doc-backing"] === "true";

    try {
      // 1. Health check
      if (pathname === "/health" || pathname === "/api/health") {
        return sendJson(res, 200, {
          status: "healthy",
          engine: "rank-mock-api",
          timestamp: Date.now(),
        });
      }

      // 2. Auth routes
      if (pathname === "/api/auth/user") {
        return respondWithDocCheck(res, 200, handleGetAuthUser(), authUserDoc, verifyDocBacking);
      }
      if (pathname === "/api/auth/organization") {
        return respondWithDocCheck(res, 200, handleGetAuthOrganization(), authOrgDoc, verifyDocBacking);
      }

      // 3. Workspaces routes
      if (pathname === "/api/workspaces") {
        return respondWithDocCheck(res, 200, handleGetWorkspaces(query), workspacesDoc, verifyDocBacking);
      }
      if (pathname.startsWith("/api/workspaces/")) {
        const slug = pathname.replace("/api/workspaces/", "");
        const detail = handleGetWorkspaceDetail(slug);
        if (!detail) {
          return sendJson(res, 404, { error: `Workspace not found: ${slug}` });
        }
        return respondWithDocCheck(res, 200, detail, workspaceDetailDoc, verifyDocBacking);
      }

      // 4. API keys
      if (pathname === "/api/keys") {
        return respondWithDocCheck(res, 200, handleGetApiKeys(query), apiKeysDoc, verifyDocBacking);
      }

      // 5. Ranking sessions and inference
      if (pathname === "/api/v1/rank" && req.method === "POST") {
        const body = (await parseJsonBody(req)) as unknown as RankInferenceRequest;
        const inferenceResult = handlePostRankInference(body);

        // Record session into mock relational store
        mockStore.insertRankSession(
          {
            id: inferenceResult.sessionId,
            workspaceId: body.workspaceId || "ws_rank_01",
            query: inferenceResult.query,
            strategy: "cross-encoder",
            model: inferenceResult.model,
            candidateCount: inferenceResult.results.length,
            latencyMs: inferenceResult.latencyMs,
            createdAt: Date.now(),
          },
          inferenceResult.results.map((r: { id: string; text: string; score: number; rank: number }) => ({
            id: r.id,
            sessionId: inferenceResult.sessionId,
            text: r.text,
            rerankScore: r.score,
            finalRank: r.rank,
          })),
          {
            id: `rec_${inferenceResult.sessionId}`,
            sessionId: inferenceResult.sessionId,
            provider: "nebius",
            model: inferenceResult.model,
            tokensUsed: 350,
            costUsd: 0.00007,
            timestamp: Date.now(),
          }
        );

        return respondWithDocCheck(res, 200, inferenceResult, rankInferenceDoc, verifyDocBacking);
      }

      if (pathname === "/api/v1/sessions") {
        return respondWithDocCheck(res, 200, handleGetRankSessions(query), rankSessionsDoc, verifyDocBacking);
      }

      // Pattern: /api/v1/sessions/:id/candidates
      const candMatch = pathname.match(/^\/api\/v1\/sessions\/([^/]+)\/candidates$/);
      if (candMatch) {
        const sessionId = candMatch[1];
        return respondWithDocCheck(res, 200, handleGetCandidates(sessionId), candidatesDoc, verifyDocBacking);
      }

      // Pattern: /api/v1/sessions/:id
      const sessionMatch = pathname.match(/^\/api\/v1\/sessions\/([^/]+)$/);
      if (sessionMatch) {
        const sessionId = sessionMatch[1];
        const detail = handleGetRankSessionDetail(sessionId);
        if (!detail) {
          return sendJson(res, 404, { error: `Session not found: ${sessionId}` });
        }
        return respondWithDocCheck(res, 200, detail, rankSessionDetailDoc, verifyDocBacking);
      }

      // 6. Receipts
      if (pathname === "/api/v1/receipts") {
        return respondWithDocCheck(res, 200, handleGetReceipts(query.sessionId), receiptsDoc, verifyDocBacking);
      }

      // 7. Benchmarks
      if (pathname === "/api/benchmarks") {
        return respondWithDocCheck(res, 200, handleGetBenchmarkRuns(query.workspaceId), benchmarkRunsDoc, verifyDocBacking);
      }

      // 8. Agent Component routes
      if (pathname === "/api/agent/threads") {
        return respondWithDocCheck(res, 200, handleGetAgentThreads(query.workspaceId), agentThreadsDoc, verifyDocBacking);
      }
      if (pathname === "/api/agent/messages") {
        return respondWithDocCheck(res, 200, handleGetAgentMessages(query.threadId), agentMessagesDoc, verifyDocBacking);
      }

      // 9. AgentMail Component routes
      if (pathname === "/api/agentmail/inboxes") {
        return respondWithDocCheck(res, 200, handleGetAgentMailInboxes(query.workspaceId), agentMailInboxesDoc, verifyDocBacking);
      }
      if (pathname === "/api/agentmail/threads") {
        return respondWithDocCheck(res, 200, handleGetAgentMailThreads(query.inboxId), agentMailThreadsDoc, verifyDocBacking);
      }
      if (pathname === "/api/agentmail/messages") {
        return respondWithDocCheck(res, 200, handleGetAgentMailMessages(query.threadId), agentMailMessagesDoc, verifyDocBacking);
      }

      // 10. Treg Developer Tools routes
      if (pathname === "/api/treg/tools") {
        return respondWithDocCheck(res, 200, handleGetTregTools(query), tregToolsDoc, verifyDocBacking);
      }
      if (pathname === "/api/treg/calls") {
        return respondWithDocCheck(res, 200, handleGetTregCalls(query.ownerHash), tregCallsDoc, verifyDocBacking);
      }
      if (pathname === "/api/treg/call" && req.method === "POST") {
        const body = (await parseJsonBody(req)) as unknown as TregExecuteRequest;
        const callResult = handlePostTregExecute(body);

        // Record spend receipt in mockStore
        mockStore.insertTregCall({
          callId: callResult.callId,
          ownerHash: body.owner ? `hash_${body.owner.slice(0, 8)}` : "hash_anonymous",
          endpoint: callResult.endpoint,
          costMicro: callResult.costMicro,
          servedVia: callResult.servedVia,
          at: callResult.at,
        });

        return respondWithDocCheck(res, 200, callResult, tregExecuteDoc, verifyDocBacking);
      }

      // 11. Brand Domain routes
      if (pathname === "/api/brand" && req.method === "GET") {
        return respondWithDocCheck(res, 200, { brand: mockStore.getBrand() }, brandDoc, verifyDocBacking);
      }
      if (pathname === "/api/brand" && req.method === "PUT") {
        const body = await parseJsonBody(req);
        const updated = mockStore.upsertBrand(body);
        return respondWithDocCheck(res, 200, { brand: updated }, brandDoc, verifyDocBacking);
      }
      if (pathname === "/api/brand" && req.method === "DELETE") {
        mockStore.clearBrand();
        return respondWithDocCheck(res, 200, { brand: null }, brandDoc, verifyDocBacking);
      }
      if (pathname === "/api/brand/intelligence" && req.method === "POST") {
        const body = await parseJsonBody(req);
        const updated = mockStore.appendBrandIntelligence(body);
        return respondWithDocCheck(res, 200, { brand: updated }, brandIntelDoc, verifyDocBacking);
      }
      if (pathname === "/api/brand/sources" && req.method === "GET") {
        return respondWithDocCheck(res, 200, { sources: mockStore.getBrandSources() }, brandSourcesDoc, verifyDocBacking);
      }
      if (pathname === "/api/brand/index" && req.method === "POST") {
        const body = await parseJsonBody(req);
        const result = mockStore.indexBrandSources(body);
        return respondWithDocCheck(res, 200, result, brandSourcesDoc, verifyDocBacking);
      }
      if (pathname === "/api/brand/sources" && req.method === "DELETE") {
        const body = await parseJsonBody(req);
        const result = mockStore.removeBrandSource(String(body.url || ""));
        return respondWithDocCheck(res, 200, result, brandSourcesDoc, verifyDocBacking);
      }

      // 12. Fallback 404
      return sendJson(res, 404, {
        error: "Route not found",
        pathname,
        availableRoutes: [
          "/api/auth/user",
          "/api/auth/organization",
          "/api/workspaces",
          "/api/workspaces/:slug",
          "/api/keys",
          "/api/v1/rank",
          "/api/v1/sessions",
          "/api/v1/sessions/:id",
          "/api/v1/sessions/:id/candidates",
          "/api/v1/receipts",
          "/api/benchmarks",
          "/api/agent/threads",
          "/api/agent/messages",
          "/api/agentmail/inboxes",
          "/api/agentmail/threads",
          "/api/agentmail/messages",
          "/api/treg/tools",
          "/api/treg/calls",
          "/api/treg/call",
          "/api/brand",
          "/api/brand/intelligence",
          "/api/brand/sources",
          "/api/brand/index",
        ],
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return sendJson(res, 500, { error: "Internal Mock Server Error", message: errorMessage });
    }
  });
}

export function startMockServer(port: number = DEFAULT_PORT) {
  const server = createMockServer();
  return new Promise<http.Server>((resolve) => {
    server.listen(port, () => {
      console.log(`Rank standalone mock API server listening on http://localhost:${port}`);
      resolve(server);
    });
  });
}

// Standalone execution check
const isMain = process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("mock/server.ts");
if (isMain) {
  startMockServer(Number(process.env.PORT) || DEFAULT_PORT);
}
