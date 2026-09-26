import { ConvexError } from "convex/values";
import { describe, expect, test } from "bun:test";
import { validateSessionToken, VALIDATION_PATH } from "./auth.ts";

function okCaller(
  result: unknown,
  log: Array<{ path: string; token: string }>,
): (deploymentUrl: string, authToken: string, path: string, args: Record<string, unknown>) => Promise<unknown> {
  return async (_url, authToken, path) => {
    log.push({ path, token: authToken });
    return result;
  };
}

const failCaller = (error: unknown) => async () => {
  throw error;
};

describe("validateSessionToken", () => {
  test("reports missing deployment URL without calling out", async () => {
    const saved = process.env["CONVEX_URL"];
    delete process.env["CONVEX_URL"];
    try {
      const calls: Array<{ path: string; token: string }> = [];
      const result = await validateSessionToken({
        authToken: "tok",
        caller: okCaller([], calls),
      });
      expect(result).toEqual({ ok: false, error: { kind: "config", message: expect.stringContaining("CONVEX_URL") } });
      expect(calls).toEqual([]);
    } finally {
      if (saved !== undefined) process.env["CONVEX_URL"] = saved;
      else delete process.env["CONVEX_URL"];
    }
  });

  test("reports an empty token", async () => {
    const result = await validateSessionToken({
      deploymentUrl: "https://x.convex.cloud",
      authToken: "   ",
      caller: failCaller(new Error("unreachable")),
    });
    expect(result).toEqual({ ok: false, error: { kind: "config", message: expect.stringContaining("token") } });
  });

  test("falls back to CONVEX_URL when deploymentUrl is omitted", async () => {
    const saved = process.env["CONVEX_URL"];
    process.env["CONVEX_URL"] = "https://env-deployment.convex.cloud";
    try {
      let seenUrl = "";
      const result = await validateSessionToken({
        authToken: "tok",
        caller: async (url) => {
          seenUrl = url;
          return [];
        },
      });
      expect(result).toEqual({ ok: true });
      expect(seenUrl).toBe("https://env-deployment.convex.cloud");
    } finally {
      if (saved !== undefined) process.env["CONVEX_URL"] = saved;
      else delete process.env["CONVEX_URL"];
    }
  });

  test("succeeds for the owner-gated list query on any accepted shape", async () => {
    const log: Array<{ path: string; token: string }> = [];
    const result = await validateSessionToken({
      deploymentUrl: "https://x.convex.cloud",
      authToken: "good-token",
      caller: okCaller([], log),
    });
    expect(result).toEqual({ ok: true });
    expect(log).toEqual([{ path: VALIDATION_PATH, token: "good-token" }]);
  });

  test("classifies an authentication rejection as auth", async () => {
    const result = await validateSessionToken({
      deploymentUrl: "https://x.convex.cloud",
      authToken: "bad-token",
      caller: failCaller(new ConvexError("Authentication required")),
    });
    expect(result).toEqual({ ok: false, error: { kind: "auth", message: expect.stringContaining("rejected") } });
  });

  test("classifies any other Convex error as operation", async () => {
    const result = await validateSessionToken({
      deploymentUrl: "https://x.convex.cloud",
      authToken: "tok",
      caller: failCaller(new ConvexError("Something else broke")),
    });
    expect(result).toEqual({ ok: false, error: { kind: "operation", message: "Something else broke" } });
  });

  test("classifies network and unexpected-shape failures as transport", async () => {
    const network = await validateSessionToken({
      deploymentUrl: "https://x.convex.cloud",
      authToken: "tok",
      caller: failCaller(new Error("fetch failed")),
    });
    expect(network).toEqual({ ok: false, error: { kind: "transport", message: "fetch failed" } });

    const shape = await validateSessionToken({
      deploymentUrl: "https://x.convex.cloud",
      authToken: "tok",
      caller: okCaller({ unexpected: true }, []),
    });
    expect(shape).toEqual({
      ok: false,
      error: { kind: "transport", message: expect.stringContaining("unexpected shape") },
    });
  });

  test("never leaks the token into any error message", async () => {
    const result = await validateSessionToken({
      deploymentUrl: "https://x.convex.cloud",
      authToken: "sekrit-token-value",
      caller: failCaller(new Error("connection refused")),
    });
    const text = JSON.stringify(result);
    expect(text).not.toContain("sekrit-token-value");
  });
});