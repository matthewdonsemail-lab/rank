import { describe, expect, test } from "bun:test";
import { findRepoRoot, REPO_MARKER, type PathOps } from "./repo-root.ts";

const MARKER = REPO_MARKER.join("/");

/**
 * Fake path operations where the marker exists only under `rootWithMarker`.
 * `parentOf` returns the same string at the top so the walk terminates.
 */
function ops(rootWithMarker: string | null): PathOps {
  const markerPath = rootWithMarker === null ? null : `${rootWithMarker}/${MARKER}`;
  return {
    exists: (path) => path === markerPath,
    join: (...parts) => parts.join("/").replace(/\/+/g, "/"),
    parentOf: (dir) => {
      const index = dir.lastIndexOf("/");
      return index <= 0 ? dir : dir.slice(0, index);
    },
  };
}

describe("findRepoRoot", () => {
  test("finds the root from a nested directory", () => {
    expect(findRepoRoot("/repo/packages/rank-cli", ops("/repo"))).toBe("/repo");
  });

  test("returns the start directory when it is already the root", () => {
    expect(findRepoRoot("/repo", ops("/repo"))).toBe("/repo");
  });

  test("returns null when the marker is nowhere above the start", () => {
    expect(findRepoRoot("/repo/packages", ops(null))).toBeNull();
  });

  test("does not match a marker that only exists in a sibling branch", () => {
    expect(findRepoRoot("/elsewhere/packages", ops("/repo"))).toBeNull();
  });

  test("terminates at the filesystem root instead of looping", () => {
    expect(findRepoRoot("/somewhere/deep", ops(null))).toBeNull();
  });
});
