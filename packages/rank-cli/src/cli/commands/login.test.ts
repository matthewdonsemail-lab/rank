import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "bun:test";
import { maskSecret } from "../../../../rank-core/src/env/index.ts";
import { saveSession } from "../../../../rank-core/src/rank-home/index.ts";
import type { RankConfig, RankSessions } from "../../../../rank-core/src/rank-home/index.ts";
import type { CommandContext } from "../types.ts";
import {
  buildAuthorizeUrl,
  loginDeps,
  loginValidateDeps,
  parseLoginArgs,
  parseLogoutArgs,
  runExchangeServer,
  validateHttpUrl,
  runLogin,
  runLogout,
  runWhoami,
} from "./login.ts";

const DEPLOYMENT_A = "https://alpha.convex.cloud";
const DEPLOYMENT_B = "https://bravo.convex.cloud";

const realValidate = loginValidateDeps.validate;
const realOpenBrowser = loginDeps.openBrowser;
const realTimeoutMs = loginDeps.timeoutMs;
const roots: string[] = [];

function makeRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "rank-login-test-"));
  roots.push(root);
  mkdirSync(join(root, "config"), { recursive: true });
  writeFileSync(join(root, "config", "env-vars.json"), "{}");
  writeFileSync(join(root, "config", "capabilities.json"), "{}");
  return root;
}

afterEach(() => {
  loginValidateDeps.validate = realValidate;
  loginDeps.openBrowser = realOpenBrowser;
  loginDeps.timeoutMs = realTimeoutMs;
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function capture(root: string, processEnv: Record<string, string | undefined> = {}) {
  const out: string[] = [];
  const err: string[] = [];
  const context: CommandContext = { root, processEnv, out: (l) => out.push(l), err: (l) => err.push(l) };
  return { context, out, err, joined: () => [...out, ...err].join("\n") };
}

const isoNow = "2026-01-01T00:00:00.000Z";

function seedSession(root: string, deployment: string, token: string): void {
  saveSession(root, { token, deployment, loggedInAt: isoNow }, { convexUrl: deployment });
}

function readSessions(root: string): RankSessions | null {
  try {
    return JSON.parse(readFileSync(join(root, ".rank", "sessions.json"), "utf8")) as RankSessions;
  } catch {
    return null;
  }
}

function readConfig(root: string): RankConfig | null {
  try {
    return JSON.parse(readFileSync(join(root, ".rank", "config.json"), "utf8")) as RankConfig;
  } catch {
    return null;
  }
}

function okValidate() {
  loginValidateDeps.validate = async () => ({ ok: true });
}

async function waitFor<T>(probe: () => T | undefined, timeoutMs = 5_000): Promise<T> {
  const start = Date.now();
  for (;;) {
    const value = probe();
    if (value !== undefined) return value;
    if (Date.now() - start > timeoutMs) throw new Error("waitFor timed out");
    await new Promise((r) => setTimeout(r, 5));
  }
}

// ---------------------------------------------------------------------------
// Pure arg parsing
// ---------------------------------------------------------------------------

describe("parseLoginArgs", () => {
  test("parses every documented flag", () => {
    const parsed = parseLoginArgs(["--web-url", "http://localhost:5173", "--deployment", DEPLOYMENT_A, "--token", "tok", "--json"]);
    expect(parsed).toEqual({ ok: true, webUrl: "http://localhost:5173", deployment: DEPLOYMENT_A, token: "tok", json: true });
  });

  test("no flags is a valid browser-flow request", () => {
    expect(parseLoginArgs([])).toEqual({ ok: true, webUrl: undefined, deployment: undefined, token: undefined, json: false });
  });

  test("missing values, unknown options, and positional args are rejected", () => {
    expect(parseLoginArgs(["--token"]).ok).toBe(false);
    expect(parseLoginArgs(["--bogus"]).ok).toBe(false);
    expect(parseLoginArgs(["stray"]).ok).toBe(false);
  });
});

describe("parseLogoutArgs", () => {
  test("parses --deployment and --json; empty argv is valid", () => {
    expect(parseLogoutArgs(["--deployment", DEPLOYMENT_A, "--json"])).toEqual({ ok: true, deployment: DEPLOYMENT_A, json: true });
    expect(parseLogoutArgs([])).toEqual({ ok: true, deployment: undefined, json: false });
    expect(parseLogoutArgs(["--deployment"]).ok).toBe(false);
    expect(parseLogoutArgs(["--token", "x"]).ok).toBe(false);
  });
});

describe("validateHttpUrl", () => {
  test("accepts http and https only", () => {
    expect(validateHttpUrl("http://localhost:5173")).toBeUndefined();
    expect(validateHttpUrl("https://example.com")).toBeUndefined();
    expect(validateHttpUrl("")).toContain("required");
    expect(validateHttpUrl("ftp://x")).toContain("http or https");
    expect(validateHttpUrl("not a url")).toContain("absolute URL");
  });
});

describe("buildAuthorizeUrl", () => {
  test("carries state, challenge, and the loopback exchange URL", () => {
    const url = new URL(buildAuthorizeUrl("http://localhost:5173", "st-1", "ch-1", "http://127.0.0.1:40000/exchange"));
    expect(url.pathname).toBe("/cli");
    expect(url.searchParams.get("state")).toBe("st-1");
    expect(url.searchParams.get("code_challenge")).toBe("ch-1");
    expect(url.searchParams.get("exchange")).toBe("http://127.0.0.1:40000/exchange");
  });
});

// ---------------------------------------------------------------------------
// Loopback exchange server
// ---------------------------------------------------------------------------

describe("runExchangeServer", () => {
  const STATE = "state-abc";
  const CHALLENGE = "challenge-abc";

  async function post(base: string, payload: unknown): Promise<Response> {
    return fetch(`${base}/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof payload === "string" ? payload : JSON.stringify(payload),
    });
  }

  test("accepts a valid exchange, then stops serving", async () => {
    const server = runExchangeServer({ state: STATE, challenge: CHALLENGE, timeoutMs: 5_000 });
    const base = await server.url;
    const first = await post(base, { code: "abcd", state: STATE, code_challenge: CHALLENGE, token: "tok-1" });
    expect(first.status).toBe(200);
    expect(await first.json()).toEqual({ ok: true });
    expect(await server.result).toEqual({ ok: true, code: "abcd", token: "tok-1" });
    await expect(post(base, { code: "abcd", state: STATE, code_challenge: CHALLENGE, token: "tok-2" })).rejects.toThrow();
  });

  test("refuses to report ok for a token the verifier rejects, and stays open for a retry", async () => {
    const seen: string[] = [];
    const server = runExchangeServer({
      state: STATE,
      challenge: CHALLENGE,
      timeoutMs: 5_000,
      verifyToken: async (token) => {
        seen.push(token);
        return token === "tok-good" ? undefined : "The deployment rejected this session.";
      },
    });
    const base = await server.url;

    const rejected = await post(base, { code: "abcd", state: STATE, code_challenge: CHALLENGE, token: "tok-bad" });
    expect(rejected.status).toBe(401);
    expect(await rejected.json()).toEqual({ ok: false, error: "The deployment rejected this session." });

    // A rejection must not spend the one-shot listener: the page retries once
    // the visitor has a working session.
    const accepted = await post(base, { code: "abcd", state: STATE, code_challenge: CHALLENGE, token: "tok-good" });
    expect(accepted.status).toBe(200);
    expect(await server.result).toEqual({ ok: true, code: "abcd", token: "tok-good" });
    expect(seen).toEqual(["tok-bad", "tok-good"]);
  });

  test("rejects state and challenge mismatches, then times out", async () => {
    const badState = runExchangeServer({ state: STATE, challenge: CHALLENGE, timeoutMs: 150 });
    const stateBase = await badState.url;
    expect((await post(stateBase, { code: "abcd", state: "wrong", code_challenge: CHALLENGE, token: "tok" })).status).toBe(400);
    expect(await badState.result).toEqual({ ok: false, error: "timed out" });

    const badChallenge = runExchangeServer({ state: STATE, challenge: CHALLENGE, timeoutMs: 150 });
    const challengeBase = await badChallenge.url;
    expect(
      (await post(challengeBase, { code: "abcd", state: STATE, code_challenge: "other", token: "tok" })).status,
    ).toBe(400);
    expect(await badChallenge.result).toEqual({ ok: false, error: "timed out" });
  });

  test("rejects a malformed code", async () => {
    const server = runExchangeServer({ state: STATE, challenge: CHALLENGE, timeoutMs: 150 });
    const base = await server.url;
    expect((await post(base, { code: "!!!", state: STATE, code_challenge: CHALLENGE, token: "tok" })).status).toBe(400);
    expect(await server.result).toEqual({ ok: false, error: "timed out" });
  });

  test("rejects non-JSON bodies and oversized payloads", async () => {
    const notJson = runExchangeServer({ state: STATE, challenge: CHALLENGE, timeoutMs: 150 });
    const base = await notJson.url;
    expect((await post(base, "definitely not json{")).status).toBe(400);
    expect(await notJson.result).toEqual({ ok: false, error: "timed out" });

    const big = runExchangeServer({ state: STATE, challenge: CHALLENGE, timeoutMs: 5_000 });
    const bigBase = await big.url;
    expect(
      (await post(bigBase, { code: "abcd", state: STATE, code_challenge: CHALLENGE, token: "x".repeat(70 * 1024) })).status,
    ).toBe(413);
    big.close();
  });

  test("answers CORS preflight and 404s unknown paths", async () => {
    const server = runExchangeServer({ state: STATE, challenge: CHALLENGE, timeoutMs: 5_000 });
    const base = await server.url;
    const preflight = await fetch(`${base}/exchange`, { method: "OPTIONS", headers: { Origin: "http://localhost:5173" } });
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get("access-control-allow-origin")).toBe("*");
    expect((await fetch(`${base}/other`, { method: "GET" })).status).toBe(404);
    server.close();
  });
});

// ---------------------------------------------------------------------------
// rank login
// ---------------------------------------------------------------------------

describe("rank login (paste path)", () => {
  test("fails without any deployment source", async () => {
    const io = capture(makeRoot(), {});
    const result = await runLogin(io.context, ["--token", "tok-1234567890abcdef"]);
    expect(result.code).toBe(1);
    expect(io.joined()).toContain("No Convex deployment URL");
  });

  test(".env.local supplies the deployment when nothing else is set", async () => {
    const root = makeRoot();
    writeFileSync(join(root, ".env.local"), `CONVEX_URL=${DEPLOYMENT_A}\n`);
    const io = capture(root, {});
    okValidate();
    const result = await runLogin(io.context, ["--token", "tok-file-0123456789abcd"]);
    expect(result.code).toBe(0);
    expect(readSessions(root)?.sessions[DEPLOYMENT_A]?.token).toBe("tok-file-0123456789abcd");
  });

  test("process env beats .env.local", async () => {
    const root = makeRoot();
    writeFileSync(join(root, ".env.local"), `CONVEX_URL=${DEPLOYMENT_B}\n`);
    const io = capture(root, { CONVEX_URL: DEPLOYMENT_A });
    okValidate();
    const result = await runLogin(io.context, ["--token", "tok-proc-0123456789abcd"]);
    expect(result.code).toBe(0);
    expect(readSessions(root)?.sessions[DEPLOYMENT_A]?.token).toBe("tok-proc-0123456789abcd");
    expect(readSessions(root)?.sessions[DEPLOYMENT_B]).toBeUndefined();
  });

  test("stores a validated token in .rank/ and never prints it in full", async () => {
    const root = makeRoot();
    const token = "tok-paste-0123456789abcdef";
    const io = capture(root, { CONVEX_URL: DEPLOYMENT_A });
    okValidate();
    const result = await runLogin(io.context, ["--token", token]);
    expect(result.code).toBe(0);
    expect(readSessions(root)?.sessions[DEPLOYMENT_A]?.token).toBe(token);
    expect(readConfig(root)?.convexUrl).toBe(DEPLOYMENT_A);
    expect(io.joined()).toContain(maskSecret(token));
    expect(io.joined()).not.toContain(token);
  });

  test("re-login replaces the stored session for that deployment", async () => {
    const root = makeRoot();
    seedSession(root, DEPLOYMENT_A, "tok-old");
    const io = capture(root, { CONVEX_URL: DEPLOYMENT_A });
    okValidate();
    const result = await runLogin(io.context, ["--token", "tok-new-0123456789"]);
    expect(result.code).toBe(0);
    expect(readSessions(root)?.sessions[DEPLOYMENT_A]?.token).toBe("tok-new-0123456789");
  });

  test("auth and transport failures store nothing", async () => {
    const root = makeRoot();
    const io = capture(root, { CONVEX_URL: DEPLOYMENT_A });
    loginValidateDeps.validate = async () => ({
      ok: false,
      error: { kind: "auth", message: "Convex rejected the session token" },
    });
    expect((await runLogin(io.context, ["--token", "tok-bad"])).code).toBe(1);
    expect(io.joined()).toContain("rejected the session token");

    const io2 = capture(root, { CONVEX_URL: DEPLOYMENT_A });
    loginValidateDeps.validate = async () => ({ ok: false, error: { kind: "transport", message: "network down" } });
    expect((await runLogin(io2.context, ["--token", "tok-t"])).code).toBe(1);
    expect(io2.joined()).toContain("network down");
    expect(readSessions(root)).toBeNull();
  });

  test("--json emits the machine report without the raw token", async () => {
    const root = makeRoot();
    const token = "tok-json-0123456789abcdef";
    const io = capture(root, { CONVEX_URL: DEPLOYMENT_A });
    okValidate();
    const result = await runLogin(io.context, ["--token", token, "--json"]);
    expect(result.code).toBe(0);
    const report = JSON.parse(io.out.join("\n")) as Record<string, unknown>;
    expect(report).toMatchObject({
      ok: true,
      command: "login",
      source: "paste",
      tokenStored: true,
      masked: maskSecret(token),
      deployment: DEPLOYMENT_A,
    });
    expect(io.out.join("\n")).not.toContain(token);
  });
});

describe("rank login (browser path)", () => {
  test("exchanges through the loopback server and stores the result", async () => {
    const root = makeRoot();
    const token = "tok-browser-0123456789ab";
    let openedUrl: string | undefined;
    loginDeps.openBrowser = (url) => {
      openedUrl = url;
      return { ok: true };
    };
    loginDeps.timeoutMs = 5_000;
    okValidate();
    const io = capture(root, { CONVEX_URL: DEPLOYMENT_A });

    const promise = runLogin(io.context, ["--web-url", "http://localhost:5173"]);
    const authorize = new URL(await waitFor(() => openedUrl));
    expect(authorize.pathname).toBe("/cli");
    const response = await fetch(authorize.searchParams.get("exchange") as string, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: "c0de",
        state: authorize.searchParams.get("state"),
        code_challenge: authorize.searchParams.get("code_challenge"),
        token,
      }),
    });
    expect(response.status).toBe(200);

    const result = await promise;
    expect(result.code).toBe(0);
    expect(readSessions(root)?.sessions[DEPLOYMENT_A]?.token).toBe(token);
    expect(io.joined()).not.toContain(token);
  });

  test("times out with a clear message when the browser never completes", async () => {
    const root = makeRoot();
    loginDeps.openBrowser = () => ({ ok: true });
    loginDeps.timeoutMs = 150;
    const io = capture(root, { CONVEX_URL: DEPLOYMENT_A });
    const result = await runLogin(io.context, []);
    expect(result.code).toBe(1);
    expect(io.joined()).toContain("timed out");
    expect(readSessions(root)).toBeNull();
  });

  test("still waits when it cannot open a browser, and says how", async () => {
    const root = makeRoot();
    loginDeps.openBrowser = () => ({ ok: false, error: "no xdg-open" });
    loginDeps.timeoutMs = 150;
    const io = capture(root, { CONVEX_URL: DEPLOYMENT_A });
    const result = await runLogin(io.context, []);
    expect(result.code).toBe(1);
    expect(io.joined()).toContain("no xdg-open");
    expect(io.joined()).toContain("Open this URL manually");
  });
});

// ---------------------------------------------------------------------------
// rank logout
// ---------------------------------------------------------------------------

describe("rank logout", () => {
  test("reports not-signed-in when the home is empty", async () => {
    const io = capture(makeRoot(), {});
    const result = await runLogout(io.context, []);
    expect(result.code).toBe(1);
    expect(io.joined()).toContain("Not signed in to any deployment.");
  });

  test("removes the sole session and deletes the now-empty file", async () => {
    const root = makeRoot();
    seedSession(root, DEPLOYMENT_A, "tok-1");
    const io = capture(root, {});
    const result = await runLogout(io.context, []);
    expect(result.code).toBe(0);
    expect(io.joined()).toContain("No sessions remain");
    expect(readSessions(root)).toBeNull();
  });

  test("requires --deployment when several sessions are stored", async () => {
    const root = makeRoot();
    seedSession(root, DEPLOYMENT_A, "tok-a");
    seedSession(root, DEPLOYMENT_B, "tok-b");
    const io = capture(root, {});
    const ambiguous = await runLogout(io.context, []);
    expect(ambiguous.code).toBe(1);
    expect(io.joined()).toContain("Pass --deployment");

    const pick = capture(root, {});
    expect((await runLogout(pick.context, ["--deployment", DEPLOYMENT_A])).code).toBe(0);
    const sessions = readSessions(root);
    expect(sessions?.sessions[DEPLOYMENT_A]).toBeUndefined();
    expect(sessions?.sessions[DEPLOYMENT_B]?.token).toBe("tok-b");
  });

  test("reports no stored session for the requested deployment", async () => {
    const root = makeRoot();
    const io = capture(root, {});
    const result = await runLogout(io.context, ["--deployment", DEPLOYMENT_A]);
    expect(result.code).toBe(1);
    expect(io.joined()).toContain(`No stored session for ${DEPLOYMENT_A}.`);
  });

  test("--json emits the machine report", async () => {
    const root = makeRoot();
    seedSession(root, DEPLOYMENT_A, "tok-json-logout");
    const io = capture(root, {});
    expect((await runLogout(io.context, ["--json"])).code).toBe(0);
    expect(JSON.parse(io.out.join("\n"))).toEqual({
      ok: true,
      command: "logout",
      tokenRemoved: true,
      deployment: DEPLOYMENT_A,
    });
  });
});

// ---------------------------------------------------------------------------
// rank whoami
// ---------------------------------------------------------------------------

describe("rank whoami", () => {
  test("reports the single stored session and its validity", async () => {
    const root = makeRoot();
    seedSession(root, DEPLOYMENT_A, "tok-whoami-0123456789");
    const io = capture(root, {});
    okValidate();
    const result = await runWhoami(io.context, []);
    expect(result.code).toBe(0);
    expect(io.joined()).toContain(`Signed in to ${DEPLOYMENT_A} since ${isoNow}`);
    expect(io.joined()).toContain(maskSecret("tok-whoami-0123456789"));
    expect(io.joined()).toContain("valid at the deployment");
  });

  test("a rejected session exits non-zero with a refresh hint", async () => {
    const root = makeRoot();
    seedSession(root, DEPLOYMENT_A, "tok-stale");
    loginValidateDeps.validate = async () => ({
      ok: false,
      error: { kind: "auth", message: "Convex rejected the session token" },
    });
    const io = capture(root, {});
    const result = await runWhoami(io.context, []);
    expect(result.code).toBe(1);
    expect(io.joined()).toContain("stored session was rejected by the deployment");
    expect(io.joined()).toContain("rank login` to refresh");
  });

  test("not signed in and ambiguous setups are explained", async () => {
    const empty = capture(makeRoot(), {});
    expect((await runWhoami(empty.context, [])).code).toBe(1);
    expect(empty.joined()).toContain("Not signed in.");

    const root = makeRoot();
    seedSession(root, DEPLOYMENT_A, "tok-a");
    seedSession(root, DEPLOYMENT_B, "tok-b");
    const ambiguous = capture(root, {});
    okValidate();
    expect((await runWhoami(ambiguous.context, [])).code).toBe(1);
    expect(ambiguous.joined()).toContain("Pass --deployment");

    const picked = capture(root, {});
    expect((await runWhoami(picked.context, ["--deployment", DEPLOYMENT_B])).code).toBe(0);
    expect(picked.joined()).toContain(DEPLOYMENT_B);
  });

  test("--json includes the login timestamp", async () => {
    const root = makeRoot();
    seedSession(root, DEPLOYMENT_A, "tok-json-whoami");
    const io = capture(root, {});
    okValidate();
    expect((await runWhoami(io.context, ["--json"])).code).toBe(0);
    const report = JSON.parse(io.out.join("\n")) as Record<string, unknown>;
    expect(report).toMatchObject({ ok: true, command: "whoami", deployment: DEPLOYMENT_A, loggedInAt: isoNow, detail: "valid at the deployment" });
  });
});