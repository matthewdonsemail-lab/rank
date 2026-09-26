/**
 * Pure shaping for `.rank/` files: parse, upsert, remove, env projection.
 *
 * Everything here is a function of its string input so the CLI and MCP
 * surfaces stay testable without a filesystem. File I/O lives in io.ts.
 */
import type { RankConfig, RankSessions, SessionRecord } from "./types.ts";
import { RANK_HOME_VERSION } from "./types.ts";

const INDENT = 2;

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

/** Canonical form for deployment keys: trimmed, no trailing slash. */
export function normalizeDeploymentUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseJson(raw: string): ParseResult<unknown> {
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch (error) {
    return { ok: false, error: `invalid JSON: ${error instanceof Error ? error.message : String(error)}` };
  }
}

/**
 * Parse and strictly validate config.json.
 *
 * Strict on purpose: the file is machine-owned, so a surprise shape means
 * corruption or a hand-edit, and failing loudly beats guessing.
 */
export function parseRankConfig(raw: string): ParseResult<RankConfig> {
  const parsed = parseJson(raw);
  if (!parsed.ok) return parsed;
  const value = parsed.value;
  if (!isRecord(value)) return { ok: false, error: "config must be a JSON object" };
  if (value["version"] !== RANK_HOME_VERSION) {
    return { ok: false, error: `unsupported config version ${String(value["version"])} (expected ${RANK_HOME_VERSION})` };
  }
  const config: RankConfig = { version: RANK_HOME_VERSION };
  const known = ["version", "convexUrl", "webUrl"];
  for (const [key, entry] of Object.entries(value)) {
    if (key === "version") continue;
    if (key === "convexUrl" || key === "webUrl") {
      if (typeof entry !== "string" || entry.trim() === "") {
        return { ok: false, error: `"${key}" must be a non-empty string` };
      }
      config[key] = entry.trim();
    } else if (!known.includes(key)) {
      return { ok: false, error: `unknown config key "${key}"` };
    }
  }
  return { ok: true, value: config };
}

/** Parse and strictly validate sessions.json. */
export function parseRankSessions(raw: string): ParseResult<RankSessions> {
  const parsed = parseJson(raw);
  if (!parsed.ok) return parsed;
  const value = parsed.value;
  if (!isRecord(value)) return { ok: false, error: "sessions must be a JSON object" };
  if (value["version"] !== RANK_HOME_VERSION) {
    return { ok: false, error: `unsupported sessions version ${String(value["version"])} (expected ${RANK_HOME_VERSION})` };
  }
  const map = value["sessions"];
  if (!isRecord(map)) return { ok: false, error: `"sessions" must be a JSON object` };
  const sessions: RankSessions = { version: RANK_HOME_VERSION, sessions: {} };
  for (const [deployment, entry] of Object.entries(map)) {
    if (deployment.trim() === "") return { ok: false, error: "session keys must be non-empty deployment URLs" };
    if (!isRecord(entry)) return { ok: false, error: `session for "${deployment}" must be an object` };
    if (typeof entry["token"] !== "string" || entry["token"].trim() === "") {
      return { ok: false, error: `session for "${deployment}" has no token` };
    }
    const storedDeployment = entry["deployment"];
    if (typeof storedDeployment !== "string" || storedDeployment.trim() === "") {
      return { ok: false, error: `session for "${deployment}" has no deployment` };
    }
    const loggedInAt = entry["loggedInAt"];
    if (typeof loggedInAt !== "string" || Number.isNaN(Date.parse(loggedInAt))) {
      return { ok: false, error: `session for "${deployment}" has no valid loggedInAt` };
    }
    sessions.sessions[deployment] = {
      token: entry["token"],
      deployment: normalizeDeploymentUrl(storedDeployment),
      loggedInAt,
    } as SessionRecord;
  }
  return { ok: true, value: sessions };
}

function serialize(value: unknown): string {
  return `${JSON.stringify(value, null, INDENT)}\n`;
}

/**
 * Store a session in the sessions file, replacing any existing one for the
 * same deployment. A missing or corrupt file starts fresh from that session
 * (login is a reset, not a merge against untrusted content).
 */
export function upsertSessionJson(existing: string | null, record: SessionRecord): { json: string; replaced: boolean } {
  const key = normalizeDeploymentUrl(record.deployment);
  let existingSessions: Record<string, SessionRecord> | undefined;
  let replaced = false;
  if (existing !== null) {
    const parsed = parseRankSessions(existing);
    if (parsed.ok) {
      existingSessions = parsed.value.sessions;
      replaced = Object.prototype.hasOwnProperty.call(existingSessions, key);
    }
  }
  const sessions: Record<string, SessionRecord> = existingSessions ? { ...existingSessions } : {};
  sessions[key] = { ...record, deployment: key };
  const json = serialize({ version: RANK_HOME_VERSION, sessions });
  return { json, replaced };
}

/**
 * Remove a deployment's session. Returns `json: null` when the file became
 * empty (the I/O layer then deletes it), `removed: false` when nothing
 * matched.
 */
export function removeSessionJson(existing: string | null, deployment: string): { json: string | null; removed: boolean } {
  if (existing === null) return { json: null, removed: false };
  const parsed = parseRankSessions(existing);
  if (!parsed.ok) return { json: null, removed: false };
  const key = normalizeDeploymentUrl(deployment);
  const sessions = parsed.value.sessions;
  if (!Object.prototype.hasOwnProperty.call(sessions, key)) return { json: existing, removed: false };
  const remaining = { ...sessions };
  delete remaining[key];
  if (Object.keys(remaining).length === 0) return { json: null, removed: true };
  return { json: serialize({ version: RANK_HOME_VERSION, sessions: remaining }), removed: true };
}

/**
 * Merge values into config.json, preserving entries this call does not touch.
 * A corrupt file is an error: config is machine-owned and small, so loud
 * beats silent.
 */
export function mergeConfigJson(
  existing: string | null,
  values: Partial<Pick<RankConfig, "convexUrl" | "webUrl">>,
): { json: string; created: boolean } | { error: string } {
  let config: RankConfig;
  let created: boolean;
  if (existing === null) {
    config = { version: RANK_HOME_VERSION };
    created = true;
  } else {
    const parsed = parseRankConfig(existing);
    if (!parsed.ok) return { error: parsed.error };
    config = parsed.value;
    created = false;
  }
  if (values.convexUrl !== undefined) config.convexUrl = normalizeDeploymentUrl(values.convexUrl);
  if (values.webUrl !== undefined) config.webUrl = values.webUrl.trim();
  return { json: serialize(config), created };
}

/** Deployment-projection of config: what resolveEnv should see as rank-config. */
export function configToEnv(config: RankConfig | null): Record<string, string> {
  if (!config) return {};
  const env: Record<string, string> = {};
  if (config.convexUrl) env["CONVEX_URL"] = config.convexUrl;
  if (config.webUrl) env["RANK_WEB_URL"] = config.webUrl;
  return env;
}

/**
 * Token projection for resolveEnv. Matches the requested deployment exactly
 * (normalized); with no request, a single stored session is used; multiple
 * sessions and no request is ambiguous, so nothing is returned.
 */
export function sessionTokenFor(sessions: RankSessions | null, deployment?: string): string | null {
  if (!sessions || Object.keys(sessions.sessions).length === 0) return null;
  if (deployment) {
    const record = sessions.sessions[normalizeDeploymentUrl(deployment)];
    return record ? record.token : null;
  }
  const entries = Object.values(sessions.sessions);
  return entries.length === 1 ? entries[0].token : null;
}