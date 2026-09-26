/**
 * `.rank/` local home: where Rank stores machine-managed local state.
 *
 * Two files, both gitignored with the directory:
 *
 *   config.json    non-secret connection config (Convex deployment URL, web
 *                  app origin) — safe to read aloud
 *   sessions.json  login sessions: one Clerk token per deployment, with the
 *                  login timestamp
 *
 * Humans and agents read these to review local state; `rank login` and
 * `rank logout` are the only writers.
 */

export const RANK_HOME_VERSION = 1;

export interface RankConfig {
  version: typeof RANK_HOME_VERSION;
  convexUrl?: string;
  webUrl?: string;
}

export interface SessionRecord {
  /** Clerk session token. The only secret in the home dir. */
  token: string;
  /** Deployment the token was validated against, normalized. */
  deployment: string;
  /** ISO timestamp the session was stored. */
  loggedInAt: string;
}

/** Keys are normalized deployment URLs. */
export interface RankSessions {
  version: typeof RANK_HOME_VERSION;
  sessions: Record<string, SessionRecord>;
}