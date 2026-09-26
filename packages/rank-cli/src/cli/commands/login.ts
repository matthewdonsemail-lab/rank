/**
 * `rank login` / `rank logout` — manage the local `.rank/` session.
 *
 * Local state is a gitignored `.rank/` directory at the repo root:
 *
 *   .rank/config.json    non-secret connection config (deployment URL,
 *                        web-app origin) — safe to read aloud
 *   .rank/sessions.json  one stored Clerk token per deployment, with the
 *                        login timestamp
 *
 * Both are written here and only here. Everything else (doctor, evaluate,
 * env, whoami) reads `.rank/` through the rank-home domain, so a session
 * `rank login` stored is the one those commands resolve — no token ever
 * lands in `.env.local` or the process environment.
 *
 * Two sign-in paths, same credential boundary:
 *
 * 1. PKCE browser flow (default): the CLI generates a code verifier and
 *    challenge, opens `<webUrl>/cli?state=…&code_challenge=…`, and runs
 *    a one-shot loopback exchange server on 127.0.0.1. The web app signs the
 *    user in via Clerk and posts back `{ code, state, code_challenge, token }`.
 *    The CLI accepts the exchange only when the state and S256 challenge
 *    match, binding the exchange to this run and making an intercepted
 *    exchange unusable without the verifier.
 *
 * 2. Paste path (`--token <tok>`): the same validation and storage for agents
 *    or terminals without a browser.
 *
 * Either way the token is validated against the linked deployment before
 * anything is written, and never printed in full.
 */
import { spawn } from "node:child_process";
import http from "node:http";
import {
  BASE64URL_RE,
  codeChallengeForVerifier,
  generateCodeVerifier,
  generateState,
  validateSessionToken,
} from "../../../../rank-core/src/auth/index.ts";
import { maskSecret } from "../../../../rank-core/src/env/index.ts";
import { loadRankHome, normalizeDeploymentUrl, removeSession, saveSession } from "../../../../rank-core/src/rank-home/index.ts";
import type { SessionRecord } from "../../../../rank-core/src/rank-home/index.ts";
import { loadWorkspace } from "../../../../rank-core/src/workspace/index.ts";
import type { Command, CommandContext } from "../types.ts";

export const LOGIN_USAGE =
  "Usage: rank login [--web-url <url>] [--deployment <url>] [--token <tok>] [--json]";
export const LOGOUT_USAGE = "Usage: rank logout [--deployment <url>] [--json]";
export const WHOAMI_USAGE = "Usage: rank whoami [--deployment <url>] [--json]";

const ENV_VAR_NAME = "RANK_AUTH_TOKEN";
const DEFAULT_WEB_URL = "https://rank-web-gray.vercel.app";
const EXCHANGE_TIMEOUT_MS = 120_000;
const MAX_BODY_BYTES = 64 * 1024;
const MAX_TOKEN_LENGTH = 8192;

// ---------------------------------------------------------------------------
// Arg parsing (pure)
// ---------------------------------------------------------------------------

export type ParseLoginArgsResult =
  | { ok: true; webUrl?: string; deployment?: string; token?: string; json: boolean }
  | { ok: false; error: string };

export function parseLoginArgs(argv: string[]): ParseLoginArgsResult {
  let webUrl: string | undefined;
  let deployment: string | undefined;
  let token: string | undefined;
  let json = false;

  const takeValue = (i: number): [string, number] | null => {
    if (i + 1 >= argv.length) return null;
    return [argv[i + 1], i + 2];
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--json") {
      json = true;
      continue;
    }
    if (arg === "--web-url" || arg === "--deployment" || arg === "--token") {
      const pair = takeValue(i);
      if (!pair) return { ok: false, error: `option "${arg}" needs a value` };
      if (arg === "--web-url") webUrl = pair[0];
      else if (arg === "--deployment") deployment = pair[0];
      else token = pair[0];
      i = pair[1] - 1;
      continue;
    }
    if (arg.startsWith("--")) return { ok: false, error: `unknown option "${arg}"` };
    return { ok: false, error: `unexpected argument "${arg}"` };
  }
  return { ok: true, webUrl, deployment, token, json };
}

export type ParseSimpleArgsResult =
  | { ok: true; deployment?: string; json: boolean }
  | { ok: false; error: string };

export function parseLogoutArgs(argv: string[]): ParseSimpleArgsResult {
  let deployment: string | undefined;
  let json = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--json") {
      json = true;
      continue;
    }
    if (arg === "--deployment") {
      if (i + 1 >= argv.length) return { ok: false, error: `option "${arg}" needs a value` };
      deployment = argv[i + 1];
      i++;
      continue;
    }
    if (arg.startsWith("--")) return { ok: false, error: `unknown option "${arg}"` };
    return { ok: false, error: `unexpected argument "${arg}"` };
  }
  return { ok: true, deployment, json };
}

/** Accept http(s) origins only. Pure. */
export function validateHttpUrl(value: string | undefined): string | undefined {
  const trimmed = (value ?? "").trim();
  if (trimmed === "") return "URL is required";
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "URL must use http or https";
    }
  } catch {
    return "URL must be an absolute URL";
  }
  return undefined;
}

/**
 * Build the web app URL the CLI opens: /cli carrying this run's PKCE
 * params and the loopback exchange URL the browser will POST back to.
 */
export function buildAuthorizeUrl(webUrl: string, state: string, challenge: string, exchangeUrl: string): string {
  const url = new URL("/cli", webUrl);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("exchange", exchangeUrl);
  return url.toString();
}

// ---------------------------------------------------------------------------
// Loopback exchange server
// ---------------------------------------------------------------------------

export interface ExchangeRequest {
  code: string;
  state: string;
  code_challenge: string;
  token: string;
}

export type ExchangeResult =
  | { ok: true; code: string; token: string }
  | { ok: false; error: "timed out" | "invalid exchange" };

/**
 * One-shot loopback exchange server. Accepts a single valid POST to
 * /exchange and then stops serving; a timeout resolves the pending result as
 * `timed out`. Binds 127.0.0.1 only.
 */
export function runExchangeServer(options: {
  state: string;
  challenge: string;
  timeoutMs?: number;
}): {
  url: Promise<string>;
  result: Promise<ExchangeResult>;
  close: () => void;
} {
  const timeoutMs = options.timeoutMs ?? EXCHANGE_TIMEOUT_MS;
  let server: http.Server | undefined;
  let finished = false;
  let rejectPending: ((error: Error) => void) | undefined;
  let resolveResult: ((result: ExchangeResult) => void) | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const finish = (result: ExchangeResult) => {
    if (finished) return;
    finished = true;
    if (timer) clearTimeout(timer);
    resolveResult?.(result);
    const s = server;
    if (s) {
      s.removeAllListeners("request");
      s.closeAllConnections?.();
      s.close();
    }
  };

  const url = new Promise<string>((resolve, reject) => {
    rejectPending = reject;
    server = http.createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server?.address();
      const port = typeof address === "object" && address ? address.port : 0;
      resolve(`http://127.0.0.1:${port}`);
    });
    server.on("error", (error) => {
      reject(error);
    });
  });

  const result = new Promise<ExchangeResult>((resolve) => {
    resolveResult = resolve;
    timer = setTimeout(() => finish({ ok: false, error: "timed out" }), timeoutMs);
    (timer as { unref?: () => void }).unref?.();

    const validate = (payload: ExchangeRequest): string | undefined => {
      for (const key of ["code", "state", "code_challenge", "token"] as const) {
        const value = payload[key];
        if (typeof value !== "string" || value === "") return "invalid exchange";
      }
      if (payload.state !== options.state) return "invalid exchange";
      if (payload.code_challenge !== options.challenge) return "invalid exchange";
      if (payload.code.length > 128 || !BASE64URL_RE.test(payload.code)) return "invalid exchange";
      if (payload.token.length > MAX_TOKEN_LENGTH) return "invalid exchange";
      return undefined;
    };

    server?.on("request", (req, res) => {
const send = (status: number, body: string, type: string) => {
      if (res.writableEnded) return;
      res.writeHead(status, {
        "Content-Type": type,
        "Content-Length": Buffer.byteLength(body),
        // The web app posts cross-origin (its origin to 127.0.0.1); without
        // these headers the browser blocks the response and the user sees a
        // generic failure.
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });
      res.end(body);
    };

    if (req.method === "OPTIONS" && req.url === "/exchange") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });
      res.end();
      return;
    }

      if (finished) {
        send(409, JSON.stringify({ ok: false, error: "login already complete" }), "application/json");
        return;
      }
      if (req.method !== "POST" || req.url !== "/exchange") {
        send(404, JSON.stringify({ ok: false, error: "not found" }), "application/json");
        return;
      }

      let size = 0;
      const chunks: Buffer[] = [];
      req.on("data", (chunk: Buffer) => {
        size += chunk.length;
        if (size > MAX_BODY_BYTES) {
          send(413, JSON.stringify({ ok: false, error: "payload too large" }), "application/json");
          req.destroy();
          return;
        }
        chunks.push(chunk);
      });
      req.on("end", () => {
        if (finished) return;
        let payload: unknown;
        try {
          payload = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
        } catch {
          send(400, JSON.stringify({ ok: false, error: "invalid exchange" }), "application/json");
          return;
        }
        const problem = validate(payload as ExchangeRequest);
        if (problem) {
          send(400, JSON.stringify({ ok: false, error: problem }), "application/json");
          return;
        }
        const { code, token } = payload as ExchangeRequest;
        send(200, JSON.stringify({ ok: true }), "application/json");
        finish({ ok: true, code, token });
      });
      req.on("error", () => undefined);
    });
  });

  return {
    url,
    result,
    close: () => finish({ ok: false, error: "timed out" }),
  };
}

// ---------------------------------------------------------------------------
// Browser + deployment helpers
// ---------------------------------------------------------------------------

export const loginDeps: {
  openBrowser: (url: string) => { ok: boolean; error?: string };
  timeoutMs: number;
} = {
  openBrowser: openBrowserDefault,
  timeoutMs: EXCHANGE_TIMEOUT_MS,
};

/** Transport seam for tests: replace with a stub to skip the network. */
export const loginValidateDeps: {
  validate: typeof validateSessionToken;
} = {
  validate: validateSessionToken,
};

function openBrowserDefault(url: string): { ok: boolean; error?: string } {
  try {
    const platform = process.platform;
    let command: string;
    let args: string[];
    if (platform === "win32") {
      // NOT `cmd /c start`: cmd re-parses the joined command line and `&` is
      // its statement separator, so the authorize URL was truncated at the
      // first `&` and the browser opened a query carrying only `state` — the
      // CLI then sat waiting for an exchange the page could never make.
      // rundll32 takes the URL as a discrete argv entry, so nothing
      // re-interprets it.
      command = "rundll32.exe";
      args = ["url.dll,FileProtocolHandler", url];
    } else if (platform === "darwin") {
      command = "open";
      args = [url];
    } else {
      command = "xdg-open";
      args = [url];
    }
    const child = spawn(command, args, { stdio: "ignore", detached: true });
    child.unref();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/** Deployment the command is acting against: flag, then `.rank` config, then process env, then `.env.local`. */
function resolveDeployment(context: CommandContext, flag: string | undefined): string | undefined {
  if (flag) return normalizeDeploymentUrl(flag);
  const home = loadRankHome(context.root);
  const fromConfig = home.config?.convexUrl;
  if (fromConfig) return normalizeDeploymentUrl(fromConfig);
  const fromEnv = context.processEnv["CONVEX_URL"];
  if (fromEnv) return normalizeDeploymentUrl(fromEnv);
  const fromFile = loadWorkspace(context.root).envFile["CONVEX_URL"];
  return fromFile ? normalizeDeploymentUrl(fromFile) : undefined;
}

// ---------------------------------------------------------------------------
// `rank login`
// ---------------------------------------------------------------------------

interface JsonReport {
  ok: boolean;
  command: "login" | "logout" | "whoami";
  tokenStored?: boolean;
  tokenRemoved?: boolean;
  source?: "browser" | "paste";
  masked?: string;
  deployment?: string;
  error?: string;
}

type LoginOutcome = { code: number; json: JsonReport };

function fail(context: CommandContext, json: boolean, command: string, error: string): LoginOutcome {
  const report: JsonReport = { ok: false, command: command as JsonReport["command"], error };
  if (json) context.out(JSON.stringify(report, null, 2));
  else context.err(`rank ${command}: ${error}`);
  return { code: 1, json: report };
}

export async function runLogin(context: CommandContext, argv: string[]): Promise<{ code: number; stderr?: string }> {
  const parsed = parseLoginArgs(argv);
  if (!parsed.ok) return { code: 1, stderr: `rank login: ${parsed.error}\n${LOGIN_USAGE}` };
  const { webUrl: webUrlArg, deployment: deploymentArg, token, json } = parsed;

  const webUrlIssue = webUrlArg !== undefined ? validateHttpUrl(webUrlArg) : undefined;
  if (webUrlIssue) return { code: 1, stderr: `rank login: ${webUrlIssue}\n${LOGIN_USAGE}` };

  const deployment = resolveDeployment(context, deploymentArg);
  if (!deployment) {
    return fail(
      context,
      json,
      "login",
      "No Convex deployment URL. Pass --deployment, set CONVEX_URL (process or .env.local), or store one with a prior login.",
    );
  }

  let authToken: string;
  let source: "browser" | "paste";

  if (token) {
    authToken = token;
    source = "paste";
  } else {
    const home = loadRankHome(context.root);
    const webUrl = webUrlArg ?? context.processEnv["RANK_WEB_URL"] ?? home.config?.webUrl ?? DEFAULT_WEB_URL;
    const verifier = generateCodeVerifier();
    const challenge = codeChallengeForVerifier(verifier);
    const state = generateState();

    const exchange = runExchangeServer({ state, challenge, timeoutMs: loginDeps.timeoutMs });
    let exchangeUrl: string;
    try {
      exchangeUrl = `${await exchange.url}/exchange`;
    } catch (error) {
      exchange.close();
      const message = error instanceof Error ? error.message : String(error);
      return fail(context, json, "login", `Could not start the local exchange server: ${message}`);
    }
    const authorize = buildAuthorizeUrl(webUrl, state, challenge, exchangeUrl);
    try {
      context.out(`Opening browser: ${authorize}`);
      const opened = loginDeps.openBrowser(authorize);
      if (json) context.out(JSON.stringify({ step: "browser", ok: opened.ok, url: authorize }, null, 2));
      if (!opened.ok) {
        context.out(`Could not open a browser automatically${opened.error ? ` (${opened.error})` : ""}. Open this URL manually: ${authorize}`);
      }
      context.out("Waiting for sign-in to complete…");

      const outcome = await exchange.result;
      if (!outcome.ok) {
        if (json) context.out(JSON.stringify({ step: "exchange", ok: false, error: outcome.error }, null, 2));
        return fail(
          context,
          json,
          "login",
          outcome.error === "timed out"
            ? "Sign-in timed out before the browser completed the exchange."
            : "The browser could not complete the exchange.",
        );
      }
      authToken = outcome.token;
      source = "browser";
    } finally {
      exchange.close();
    }
  }

  const validation = await loginValidateDeps.validate({ deploymentUrl: deployment, authToken });
  if (!validation.ok) {
    const message =
      validation.error.kind === "auth"
        ? "The deployment rejected the session token. Sign in again and re-run rank login."
        : validation.error.message;
    if (json) context.out(JSON.stringify({ step: "validate", ok: false, kind: validation.error.kind }, null, 2));
    return fail(context, json, "login", message);
  }

  let stored: SessionRecord;
  try {
    const result = saveSession(
      context.root,
      { token: authToken, deployment, loggedInAt: new Date().toISOString() },
      { convexUrl: deployment },
    );
    stored = result.record;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return fail(context, json, "login", `Could not store the session in .rank/: ${message}`);
  }

  const report: JsonReport = {
    ok: true,
    command: "login",
    tokenStored: true,
    source,
    masked: maskSecret(stored.token),
    deployment,
  };
  if (json) {
    context.out(JSON.stringify(report, null, 2));
  } else {
    context.out(`Signed in. Stored ${ENV_VAR_NAME} for ${deployment} (.rank/sessions.json, ${maskSecret(stored.token)}).`);
  }
  return { code: 0 };
}

// ---------------------------------------------------------------------------
// `rank logout`
// ---------------------------------------------------------------------------

export async function runLogout(context: CommandContext, argv: string[]): Promise<{ code: number; stderr?: string }> {
  const parsed = parseLogoutArgs(argv);
  if (!parsed.ok) return { code: 1, stderr: `rank logout: ${parsed.error}\n${LOGOUT_USAGE}` };
  const { deployment: deploymentFlag, json } = parsed;

  const home = loadRankHome(context.root);
  if (home.problems.length > 0) {
    return fail(context, json, "logout", home.problems.join(" "));
  }

  const stored = home.sessions ? Object.values(home.sessions.sessions) : [];
  let target: string | undefined = deploymentFlag ? normalizeDeploymentUrl(deploymentFlag) : undefined;
  if (!target && stored.length === 1) target = stored[0].deployment;

  if (!target) {
    return fail(
      context,
      json,
      "logout",
      stored.length === 0
        ? "Not signed in to any deployment."
        : `Signed in to ${stored.map((s) => s.deployment).join(", ")}. Pass --deployment <url> to pick one.`,
    );
  }

  const record = home.sessions?.sessions[target];
  if (!record) {
    return fail(context, json, "logout", `No stored session for ${target}.`);
  }

  try {
    removeSession(context.root, target);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return fail(context, json, "logout", `Could not update .rank/: ${message}`);
  }

  const report: JsonReport = { ok: true, command: "logout", tokenRemoved: true, deployment: target };
  if (json) {
    context.out(JSON.stringify(report, null, 2));
  } else {
    const remaining = stored.length - 1;
    context.out(
      `Signed out of ${target}.` + (remaining === 0 ? " No sessions remain in .rank/." : ` ${remaining} session(s) remain.`),
    );
  }
  return { code: 0 };
}

// ---------------------------------------------------------------------------
// `rank whoami`
// ---------------------------------------------------------------------------

export async function runWhoami(context: CommandContext, argv: string[]): Promise<{ code: number; stderr?: string }> {
  const parsed = parseLogoutArgs(argv);
  if (!parsed.ok) return { code: 1, stderr: `rank whoami: ${parsed.error}\n${WHOAMI_USAGE}` };
  const { deployment: deploymentFlag, json } = parsed;

  const home = loadRankHome(context.root);
  if (home.problems.length > 0) {
    return fail(context, json, "whoami", home.problems.join(" "));
  }

  const stored = home.sessions ? Object.values(home.sessions.sessions) : [];
  let target = deploymentFlag ? normalizeDeploymentUrl(deploymentFlag) : undefined;
  let record = target ? home.sessions?.sessions[target] : undefined;
  if (!record && !target && stored.length === 1) {
    record = stored[0];
    target = stored[0].deployment;
  }

  if (!record || !target) {
    return fail(
      context,
      json,
      "whoami",
      stored.length === 0
        ? "Not signed in. Run `rank login` to sign in."
        : `Signed in to ${stored.map((s) => s.deployment).join(", ")}. Pass --deployment <url> to pick one.`,
    );
  }

  const validation = await loginValidateDeps.validate({ deploymentUrl: target, authToken: record.token });
  const ok = validation.ok;

  const report: JsonReport = {
    ok,
    command: "whoami",
    deployment: target,
    masked: maskSecret(record.token),
    ...(ok ? {} : { error: validation.error.kind === "auth" ? "stored session was rejected by the deployment" : validation.error.message }),
  };
  const detail = ok ? "valid at the deployment" : `session problem: ${report.error}`;
  if (json) {
    context.out(JSON.stringify({ ...report, loggedInAt: record.loggedInAt, detail }, null, 2));
  } else {
    context.out(`Signed in to ${target} since ${record.loggedInAt} (${maskSecret(record.token)}).`);
    context.out(ok ? `Session is ${detail}.` : `Session is not usable — ${detail}. Run \`rank login\` to refresh.`);
  }
  return ok ? { code: 0 } : { code: 1 };
}

// ---------------------------------------------------------------------------
// Command registrations
// ---------------------------------------------------------------------------

export const loginCommand: Command = {
  name: "login",
  summary: "Sign in via the web app (PKCE browser flow) or --token, store the session in .rank/",
  args: "[--web-url <url>] [--deployment <url>] [--token <tok>] [--json]",
  run: (context, argv) => runLogin(context, argv),
};

export const logoutCommand: Command = {
  name: "logout",
  summary: "Remove the stored .rank/ session for a deployment",
  args: "[--deployment <url>] [--json]",
  run: (context, argv) => runLogout(context, argv),
};

export const whoamiCommand: Command = {
  name: "whoami",
  summary: "Show the stored .rank/ session and verify it still works at the deployment",
  args: "[--deployment <url>] [--json]",
  run: (context, argv) => runWhoami(context, argv),
};