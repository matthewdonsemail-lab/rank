/**
 * ConvexError detection that survives module-copy boundaries.
 *
 * Every workspace package installs its own `convex`, so an `instanceof`
 * check cannot see errors thrown by a different physical copy (the e2e
 * harness and package internals each import `convex/values` from their own
 * node_modules). Convex stamps every ConvexError with the global symbol
 * `Symbol.for("ConvexError")`; identifying on that marker works across
 * copies.
 */
import type { ConvexError, Value } from "convex/values";

const CONVEX_ERROR_MARKER = Symbol.for("ConvexError");

export function isConvexError(error: unknown): error is ConvexError<Value> {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as Record<symbol, unknown>)[CONVEX_ERROR_MARKER] === true
  );
}

/** Message text for a Convex-thrown error, with a printable fallback. */
export function convexErrorMessage(error: unknown): string {
  if (isConvexError(error)) return String(error.data ?? error.message);
  if (typeof error === "object" && error !== null && error instanceof Error) return error.message;
  return String(error);
}