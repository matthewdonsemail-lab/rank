import { describe, expect, test } from "bun:test";
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

const DEPLOYMENT = "https://my-deployment-abc123.convex.cloud";

function makeRecord(token = "tok-123"): { token: string; deployment: string; loggedInAt: string } {
  return { token, deployment: DEPLOYMENT, loggedInAt: "2026-09-26T12:00:00.000Z" };
}

describe("normalizeDeploymentUrl", () => {
  test("trims and strips trailing slashes", () => {
    expect(normalizeDeploymentUrl("  https://x.convex.cloud/  ")).toBe("https://x.convex.cloud");
  });
});

describe("parseRankConfig", () => {
  test("parses a minimal and a full config", () => {
    expect(parseRankConfig(`{"version":1,"convexUrl":"${DEPLOYMENT}","webUrl":"http://localhost:5173"}`).ok).toBe(true);
    expect(parseRankConfig(`{"version":1}`).ok).toBe(true);
  });

  test("rejects unknown keys, bad versions, and blank values", () => {
    expect(parseRankConfig(`{"version":1,"other":"x"}`).ok).toBe(false);
    expect(parseRankConfig(`{"version":2}`).ok).toBe(false);
    expect(parseRankConfig(`{"version":1,"convexUrl":" "}`).ok).toBe(false);
    expect(parseRankConfig(`{}`).ok).toBe(false);
    expect(parseRankConfig(`not json`).ok).toBe(false);
  });
});

describe("parseRankSessions", () => {
  test("parses a populated sessions file", () => {
    const raw = JSON.stringify({
      version: 1,
      sessions: { [DEPLOYMENT]: makeRecord() },
    });
    const parsed = parseRankSessions(raw);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.sessions[DEPLOYMENT]?.token).toBe("tok-123");
    }
  });

  test("rejects missing token, bad timestamp, bad version", () => {
    expect(
      parseRankSessions(`{"version":1,"sessions":{"${DEPLOYMENT}":{"deployment":"${DEPLOYMENT}","loggedInAt":"2026-01-01T00:00:00Z"}}}`).ok,
    ).toBe(false);
    expect(
      parseRankSessions(`{"version":1,"sessions":{"${DEPLOYMENT}":{"token":"t","deployment":"${DEPLOYMENT}","loggedInAt":"nope"}}}`).ok,
    ).toBe(false);
    expect(
      parseRankSessions(`{"version":1,"sessions":{"${DEPLOYMENT}":{}}}`).ok,
    ).toBe(false);
  });
});

describe("upsertSessionJson", () => {
  test("starts fresh from null and reports no replacement", () => {
    const { json, replaced } = upsertSessionJson(null, makeRecord());
    expect(replaced).toBe(false);
    const parsed = parseRankSessions(json);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(Object.keys(parsed.value.sessions)).toEqual([DEPLOYMENT]);
  });

  test("replaces an existing session for the same deployment", () => {
    const first = upsertSessionJson(null, makeRecord("old")).json;
    const { json, replaced } = upsertSessionJson(first, makeRecord("new"));
    expect(replaced).toBe(true);
    const parsed = parseRankSessions(json);
    if (parsed.ok) {
      expect(parsed.value.sessions[DEPLOYMENT]?.token).toBe("new");
    }
  });

  test("keeps unrelated sessions when adding a new deployment", () => {
    const withTwo = upsertSessionJson(
      upsertSessionJson(null, makeRecord()).json,
      { ...makeRecord("other"), deployment: "https://other.convex.cloud" },
    ).json;
    const parsed = parseRankSessions(withTwo);
    if (parsed.ok) {
      expect(Object.keys(parsed.value.sessions).length).toBe(2);
    }
  });

  test("starts fresh over a corrupt file (login is a reset)", () => {
    const { json, replaced } = upsertSessionJson("garbage", makeRecord());
    expect(replaced).toBe(false);
    expect(parseRankSessions(json).ok).toBe(true);
  });
});

describe("removeSessionJson", () => {
  test("removes one session and keeps the rest", () => {
    const two = upsertSessionJson(
      upsertSessionJson(null, makeRecord()).json,
      { ...makeRecord("other"), deployment: "https://other.convex.cloud" },
    ).json;
    const result = removeSessionJson(two, DEPLOYMENT);
    expect(result.removed).toBe(true);
    expect(result.json).not.toBeNull();
    const parsed = parseRankSessions(result.json ?? "");
    if (parsed.ok) {
      expect(Object.keys(parsed.value.sessions)).toEqual(["https://other.convex.cloud"]);
    }
  });

  test("returns null json when the last session goes", () => {
    const one = upsertSessionJson(null, makeRecord()).json;
    const result = removeSessionJson(one, DEPLOYMENT);
    expect(result.removed).toBe(true);
    expect(result.json).toBeNull();
  });

  test("reports no-op when the deployment is not present", () => {
    expect(removeSessionJson(null, DEPLOYMENT)).toEqual({ json: null, removed: false });
    const one = upsertSessionJson(null, makeRecord()).json;
    const result = removeSessionJson(one, "https://absent.convex.cloud");
    expect(result.removed).toBe(false);
    expect(result.json).toBe(one);
  });
});

describe("mergeConfigJson", () => {
  test("creates a config from null", () => {
    const result = mergeConfigJson(null, { convexUrl: DEPLOYMENT });
    expect("created" in result && result.created).toBe(true);
  });

  test("preserves keys not touched by the merge", () => {
    const seeded = mergeConfigJson(null, { convexUrl: DEPLOYMENT, webUrl: "http://localhost:5173" });
    const updated = mergeConfigJson("created" in seeded ? seeded.json : null, { convexUrl: "https://new.convex.cloud" });
    expect("error" in updated).toBe(false);
    if (!("error" in updated)) {
      const parsed = parseRankConfig(updated.json);
      if (parsed.ok) {
        expect(parsed.value.convexUrl).toBe("https://new.convex.cloud");
        expect(parsed.value.webUrl).toBe("http://localhost:5173");
      }
    }
  });

  test("fails on a corrupt file instead of clobbering it", () => {
    const result = mergeConfigJson("garbage", { convexUrl: DEPLOYMENT });
    expect("error" in result).toBe(true);
  });
});

describe("configToEnv", () => {
  test("projects convexUrl and webUrl", () => {
    const env = configToEnv({ version: 1, convexUrl: DEPLOYMENT, webUrl: "http://localhost:5173" });
    expect(env).toEqual({ CONVEX_URL: DEPLOYMENT, RANK_WEB_URL: "http://localhost:5173" });
  });

  test("is empty for a null config", () => {
    expect(configToEnv(null)).toEqual({});
  });
});

describe("sessionTokenFor", () => {
  const one = upsertSessionJson(null, makeRecord("solo")).json;
  const two = upsertSessionJson(one, { ...makeRecord("peer"), deployment: "https://other.convex.cloud" }).json;
  const single = parseRankSessions(one);
  const both = parseRankSessions(two);
  const sessionsOne = single.ok ? single.value : null;
  const sessionsTwo = both.ok ? both.value : null;

  test("matches the exact deployment", () => {
    expect(sessionTokenFor(sessionsTwo, DEPLOYMENT)).toBe("solo");
    expect(sessionTokenFor(sessionsTwo, "https://other.convex.cloud/")).toBe("peer");
    expect(sessionTokenFor(sessionsTwo, "https://absent.convex.cloud")).toBeNull();
  });

  test("uses the single session when no deployment is given", () => {
    expect(sessionTokenFor(sessionsOne, undefined)).toBe("solo");
  });

  test("refuses a single-session guess with several stored", () => {
    expect(sessionTokenFor(sessionsTwo, undefined)).toBeNull();
  });

  test("is null with no sessions", () => {
    expect(sessionTokenFor(null)).toBeNull();
  });
});