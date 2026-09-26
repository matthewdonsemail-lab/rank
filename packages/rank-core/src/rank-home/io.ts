/**
 * Filesystem access for `.rank/`.
 *
 * The only place in the CLI that touches this directory. Reads never throw:
 * a missing or corrupt home degrades to an empty home plus a `problems` list
 * so `rank doctor` and friends can still run and report what is wrong.
 * Writes are synchronous-style best effort: a failure to write surfaces as a
 * thrown Error the command layer reports as a config failure.
 */
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  configToEnv,
  mergeConfigJson,
  normalizeDeploymentUrl,
  parseRankConfig,
  parseRankSessions,
  removeSessionJson,
  sessionTokenFor,
  upsertSessionJson,
} from "./home.ts";
import type { RankConfig, RankSessions, SessionRecord } from "./types.ts";

export const RANK_DIR_NAME = ".rank";
export const CONFIG_FILE_NAME = "config.json";
export const SESSIONS_FILE_NAME = "sessions.json";

export interface RankHomePaths {
  dir: string;
  configPath: string;
  sessionsPath: string;
}

export interface RankHome {
  paths: RankHomePaths;
  config: RankConfig | null;
  sessions: RankSessions | null;
  configExists: boolean;
  sessionsExists: boolean;
  /** Human-readable problems (corrupt files, unknown versions). Never throws. */
  problems: string[];
}

export function rankHomePaths(root: string): RankHomePaths {
  const dir = join(root, RANK_DIR_NAME);
  return { dir, configPath: join(dir, CONFIG_FILE_NAME), sessionsPath: join(dir, SESSIONS_FILE_NAME) };
}

function readIfPresent(path: string): string | null {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return null;
  }
}

/** Load the local home. Missing files are fine; corrupt ones are reported. */
export function loadRankHome(root: string): RankHome {
  const paths = rankHomePaths(root);
  const problems: string[] = [];
  let config: RankConfig | null = null;
  let sessions: RankSessions | null = null;
  const configRaw = readIfPresent(paths.configPath);
  const sessionsRaw = readIfPresent(paths.sessionsPath);

  if (configRaw !== null) {
    const parsed = parseRankConfig(configRaw);
    if (parsed.ok) config = parsed.value;
    else problems.push(`.rank/config.json: ${parsed.error}`);
  }
  if (sessionsRaw !== null) {
    const parsed = parseRankSessions(sessionsRaw);
    if (parsed.ok) sessions = parsed.value;
    else problems.push(`.rank/sessions.json: ${parsed.error}`);
  }

  return {
    paths,
    config,
    sessions,
    configExists: configRaw !== null,
    sessionsExists: sessionsRaw !== null,
    problems,
  };
}

function writeJsonFile(path: string, json: string): void {
  if (!existsSync(join(path, ".."))) mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, json, "utf8");
}

/**
 * Store a session (and, when given, connection config) in the home dir.
 * Returns the masked-free record that was stored, for reporting.
 */
export function saveSession(
  root: string,
  record: SessionRecord,
  config?: Partial<Pick<RankConfig, "convexUrl" | "webUrl">>,
): { record: SessionRecord; configCreated: boolean | null } {
  const paths = rankHomePaths(root);
  const sessionsRaw = readIfPresent(paths.sessionsPath);
  const upserted = upsertSessionJson(sessionsRaw, record);

  if (!upserted.replaced && sessionsRaw !== null) {
    // sessions.json present but unparseable: keep the operator's file intact
    // instead of clobbering it with a single session.
    const parsed = parseRankSessions(sessionsRaw);
    if (!parsed.ok) throw new Error(`.rank/sessions.json: ${parsed.error}`);
  }
  writeJsonFile(paths.sessionsPath, upserted.json);

  let configCreated: boolean | null = null;
  if (config && (config.convexUrl || config.webUrl)) {
    const configRaw = readIfPresent(paths.configPath);
    const merged = mergeConfigJson(configRaw, config);
    if ("error" in merged) throw new Error(`.rank/config.json: ${merged.error}`);
    configCreated = merged.created;
    writeJsonFile(paths.configPath, merged.json);
  }

  return { record: { ...record, deployment: normalizeDeploymentUrl(record.deployment) }, configCreated };
}

/** Remove a session. Returns true when a session was actually removed. */
export function removeSession(root: string, deployment: string): boolean {
  const paths = rankHomePaths(root);
  const raw = readIfPresent(paths.sessionsPath);
  const { json, removed } = removeSessionJson(raw, deployment);
  if (!removed) return false;
  if (json === null) {
    try {
      unlinkSync(paths.sessionsPath);
    } catch {
      /* already gone */
    }
  } else {
    writeJsonFile(paths.sessionsPath, json);
  }
  return true;
}

/**
 * Resolve what env sources should carry, without touching process or file env.
 * Pass the deployment (from config or env) so a stored session only surfaces
 * when it belongs to it.
 */
export function rankHomeEnvSources(home: RankHome, deployment?: string): {
  rank?: Record<string, string>;
  session?: Record<string, string>;
} {
  const rank = configToEnv(home.config);
  const sessionValue = sessionTokenFor(home.sessions, deployment);
  const session: Record<string, string> = sessionValue ? { RANK_AUTH_TOKEN: sessionValue } : {};
  return {
    rank: Object.keys(rank).length > 0 ? rank : undefined,
    session: Object.keys(session).length > 0 ? session : undefined,
  };
}

/**
 * Flat process-env a command can read directly: `.rank` values under
 * `base`.
 *
 * `base` wins on every collision. When several sessions are stored, the one
 * matching `CONVEX_URL` (from `base` or the stored config) is used; with no
 * deployment match, several sessions resolve to no token rather than a
 * guess.
 */
export function effectiveProcessEnv(
  root: string,
  base: Record<string, string | undefined>,
): Record<string, string | undefined> {
  const home = loadRankHome(root);
  const flat: Record<string, string> = {};
  const rank = configToEnv(home.config);
  Object.assign(flat, rank);
  const token =
    home.sessions !== null
      ? sessionTokenFor(home.sessions, base["CONVEX_URL"] ?? rank["CONVEX_URL"])
      : null;
  if (token) flat["RANK_AUTH_TOKEN"] = token;
  return { ...flat, ...base };
}