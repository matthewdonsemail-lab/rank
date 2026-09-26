import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import { loadRankHome, rankHomeEnvSources, rankHomePaths, removeSession, saveSession } from "./io.ts";

const DEPLOYMENT = "https://my-deployment-abc123.convex.cloud";

function tempRoot(): string {
  return mkdtempSync(join(tmpdir(), "rank-home-"));
}

describe("loadRankHome", () => {
  test("reports an empty home with no problems", () => {
    const root = tempRoot();
    try {
      const home = loadRankHome(root);
      expect(home).toEqual({
        paths: rankHomePaths(root),
        config: null,
        sessions: null,
        configExists: false,
        sessionsExists: false,
        problems: [],
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("reports corrupt files as problems instead of throwing", () => {
    const root = tempRoot();
    try {
      const paths = rankHomePaths(root);
      mkdirSync(paths.dir, { recursive: true });
      writeFileSync(paths.configPath, "garbage", "utf8");
      writeFileSync(paths.sessionsPath, "also garbage", "utf8");
      const home = loadRankHome(root);
      expect(home.configExists).toBe(true);
      expect(home.sessionsExists).toBe(true);
      expect(home.config).toBeNull();
      expect(home.sessions).toBeNull();
      expect(home.problems.length).toBe(2);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("saveSession / removeSession", () => {
  test("stores a session and config, both readable again", () => {
    const root = tempRoot();
    try {
      const record = saveSession(root, {
        token: "tok-abc",
        deployment: `${DEPLOYMENT}/`,
        loggedInAt: "2026-09-26T12:00:00.000Z",
      }, { convexUrl: DEPLOYMENT });
      expect(record.record.deployment).toBe(DEPLOYMENT);
      expect(record.configCreated).toBe(true);

      const home = loadRankHome(root);
      expect(home.problems).toEqual([]);
      expect(home.sessions?.sessions[DEPLOYMENT]?.token).toBe("tok-abc");
      expect(home.config?.convexUrl).toBe(DEPLOYMENT);

      const sources = rankHomeEnvSources(home);
      expect(sources.rank).toEqual({ CONVEX_URL: DEPLOYMENT });
      expect(sources.session).toEqual({ RANK_AUTH_TOKEN: "tok-abc" });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("re-logging in replaces the session", () => {
    const root = tempRoot();
    try {
      saveSession(root, { token: "old", deployment: DEPLOYMENT, loggedInAt: "2026-01-01T00:00:00Z" });
      saveSession(root, { token: "new", deployment: DEPLOYMENT, loggedInAt: "2026-02-01T00:00:00Z" });
      const home = loadRankHome(root);
      expect(home.sessions?.sessions[DEPLOYMENT]?.token).toBe("new");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("refuses to clobber a corrupt sessions file", () => {
    const root = tempRoot();
    try {
      const paths = rankHomePaths(root);
      mkdirSync(paths.dir, { recursive: true });
      writeFileSync(paths.sessionsPath, "garbage", "utf8");
      expect(() =>
        saveSession(root, { token: "tok", deployment: DEPLOYMENT, loggedInAt: "2026-01-01T00:00:00Z" }),
      ).toThrow(/sessions.json/);
      expect(readFileSync(paths.sessionsPath, "utf8")).toBe("garbage");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("removing the last session deletes the file", () => {
    const root = tempRoot();
    try {
      saveSession(root, { token: "tok", deployment: DEPLOYMENT, loggedInAt: "2026-01-01T00:00:00Z" });
      const paths = rankHomePaths(root);
      expect(existsSync(paths.sessionsPath)).toBe(true);
      expect(removeSession(root, DEPLOYMENT)).toBe(true);
      expect(existsSync(paths.sessionsPath)).toBe(false);
      expect(removeSession(root, DEPLOYMENT)).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("keeping the config when only the session is removed", () => {
    const root = tempRoot();
    try {
      saveSession(
        root,
        { token: "tok", deployment: DEPLOYMENT, loggedInAt: "2026-01-01T00:00:00Z" },
        { convexUrl: DEPLOYMENT },
      );
      expect(removeSession(root, DEPLOYMENT)).toBe(true);
      const home = loadRankHome(root);
      expect(home.sessionsExists).toBe(false);
      expect(home.config?.convexUrl).toBe(DEPLOYMENT);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});