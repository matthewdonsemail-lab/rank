/** LOCAL HTTP-adjacent probe for prospect.evaluate (rank-o9fu).
 *
 * Boots the REAL `mock/server.ts` on an ephemeral loopback port and checks
 * the HTTP-adjacent path. Label: LOCAL (no live deployment, no secrets).
 *
 * What it proves: the mock server is reachable over HTTP, but it exposes NO
 * prospect-evaluate route — so the `ConvexActionCaller` transport seam
 * (covered by prospect-evaluate.transport.test.ts) is the furthest reachable
 * layer, and a live Convex deployment is required to go further.
 */
import { describe, expect, test } from "bun:test";
import { createMockServer } from "../mock/server.ts";

function listenEphemeral(): Promise<{ baseUrl: string; close: () => Promise<void> }> {
  const server = createMockServer();
  return new Promise((resolve, reject) => {
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      resolve({
        baseUrl: `http://127.0.0.1:${port}`,
        close: () => new Promise<void>((done) => server.close(() => done())),
      });
    });
  });
}

describe("LOCAL prospect.evaluate HTTP-adjacent path", () => {
  test("LOCAL mock server has health but no prospect-evaluate route", async () => {
    const { baseUrl, close } = await listenEphemeral();
    try {
      const health = await fetch(`${baseUrl}/health`);
      expect(health.status).toBe(200);
      const body = (await health.json()) as { status?: string };
      expect(body.status).toBe("healthy");

      // There is deliberately no prospect route in mock/server.ts; a 404
      // here is the assertion: the HTTP-adjacent layer cannot evaluate.
      const missing = await fetch(`${baseUrl}/api/prospect/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospect: { url: "https://example.com/page" } }),
      });
      expect(missing.status).toBe(404);
    } finally {
      await close();
    }
  });
});
