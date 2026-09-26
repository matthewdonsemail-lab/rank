/**
 * Locate the repository root by walking up for a marker file.
 *
 * Pure: filesystem access is injected, so this is unit-testable with a fake
 * probe and no real paths. The CLI works from any subdirectory because the walk
 * climbs until the marker appears.
 */

export type ExistsProbe = (path: string) => boolean;
export type Join = (...parts: string[]) => string;
export type ParentOf = (dir: string) => string;

/** Relative path that identifies the repository root. */
export const REPO_MARKER: readonly string[] = ["config", "env-vars.json"];

export interface PathOps {
  exists: ExistsProbe;
  join: Join;
  parentOf: ParentOf;
}

/**
 * Walk up from `start` until the marker exists.
 * Returns null when the marker is not found anywhere above `start`.
 */
export function findRepoRoot(start: string, ops: PathOps): string | null {
  let dir = start;
  for (;;) {
    if (ops.exists(ops.join(dir, ...REPO_MARKER))) return dir;
    const parent = ops.parentOf(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}
