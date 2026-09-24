import http from "node:http";
import { URL } from "node:url";

import { handleGetAuthUser } from "./data/auth-user.ts";
import { handleGetAuthOrganization } from "./data/auth-organization.ts";
import { handleGetWorkspaces } from "./data/workspaces.ts";
import { handleGetWorkspaceDetail } from "./data/workspace-detail.ts";
import { handleGetApiKeys } from "./data/api-keys.ts";
import { handleGetRankSessions } from "./data/rank-sessions.ts";
import { handleGetRankSessionDetail } from "./data/rank-session-detail.ts";
import { handleGetCandidates } from "./data/candidates.ts";
import { handleGetReceipts } from "./data/receipts.ts";
import { handleGetBenchmarkRuns } from "./data/benchmark-runs.ts";
import { handlePostRankInference } from "./data/rank-inference.ts";
import { handleGetAgentThreads } from "./data/agent-threads.ts";
import { handleGetAgentMessages } from "./data/agent-messages.ts";
import { handleGetAgentMailInboxes } from "./data/agentmail-inboxes.ts";
import { handleGetAgentMailThreads } from "./data/agentmail-threads.ts";
import { handleGetAgentMailMessages } from "./data/agentmail-messages.ts";
import { mockStore } from "./store.ts";
import type { RankInferenceRequest } from "./schema.ts";

const DEFAULT_PORT = 3002;

function sendJson(res: http.ServerResponse, statusCode: number, data: unknown) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
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

export function createMockServer() {
  return http.createServer(async (req, res) => {
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      });
      res.end();
      return;
    }

    const host = req.headers.host || "localhost";
    const url = new URL(req.url || "/", `http://${host}`);
    const pathname = url.pathname;
    const query = Object.fromEntries(url.searchParams.entries());

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
        return sendJson(res, 200, handleGetAuthUser());
      }
      if (pathname === "/api/auth/organization") {
        return sendJson(res, 200, handleGetAuthOrganization());
      }

      // 3. Workspaces routes
      if (pathname === "/api/workspaces") {
        return sendJson(res, 200, handleGetWorkspaces(query));
      }
      if (pathname.startsWith("/api/workspaces/")) {
        const slug = pathname.replace("/api/workspaces/", "");
        const detail = handleGetWorkspaceDetail(slug);
        if (!detail) {
          return sendJson(res, 404, { error: `Workspace not found: ${slug}` });
        }
        return sendJson(res, 200, detail);
      }

      // 4. API keys
      if (pathname === "/api/keys") {
        return sendJson(res, 200, handleGetApiKeys(query));
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

        return sendJson(res, 200, inferenceResult);
      }

      if (pathname === "/api/v1/sessions") {
        return sendJson(res, 200, handleGetRankSessions(query));
      }

      // Pattern: /api/v1/sessions/:id/candidates
      const candMatch = pathname.match(/^\/api\/v1\/sessions\/([^/]+)\/candidates$/);
      if (candMatch) {
        const sessionId = candMatch[1];
        return sendJson(res, 200, handleGetCandidates(sessionId));
      }

      // Pattern: /api/v1/sessions/:id
      const sessionMatch = pathname.match(/^\/api\/v1\/sessions\/([^/]+)$/);
      if (sessionMatch) {
        const sessionId = sessionMatch[1];
        const detail = handleGetRankSessionDetail(sessionId);
        if (!detail) {
          return sendJson(res, 404, { error: `Session not found: ${sessionId}` });
        }
        return sendJson(res, 200, detail);
      }

      // 6. Receipts
      if (pathname === "/api/v1/receipts") {
        return sendJson(res, 200, handleGetReceipts(query.sessionId));
      }

      // 7. Benchmarks
      if (pathname === "/api/benchmarks") {
        return sendJson(res, 200, handleGetBenchmarkRuns(query.workspaceId));
      }

      // 8. Agent Component routes
      if (pathname === "/api/agent/threads") {
        return sendJson(res, 200, handleGetAgentThreads(query.workspaceId));
      }
      if (pathname === "/api/agent/messages") {
        return sendJson(res, 200, handleGetAgentMessages(query.threadId));
      }

      // 9. AgentMail Component routes
      if (pathname === "/api/agentmail/inboxes") {
        return sendJson(res, 200, handleGetAgentMailInboxes(query.workspaceId));
      }
      if (pathname === "/api/agentmail/threads") {
        return sendJson(res, 200, handleGetAgentMailThreads(query.inboxId));
      }
      if (pathname === "/api/agentmail/messages") {
        return sendJson(res, 200, handleGetAgentMailMessages(query.threadId));
      }

      // 10. Fallback 404
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
