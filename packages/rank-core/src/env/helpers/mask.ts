/**
 * Display helpers for values.
 *
 * Pure. Secrets are never printed in full, and an unset value is never masked:
 * masking the string "(unset)" would hide the very thing the operator needs to
 * see, so callers pass the fallback through unchanged.
 */

/** Shorten a secret to a prefix, a suffix, and its length. */
export function maskSecret(value: string): string {
  if (value.length <= 12) return `${"*".repeat(value.length)} (${value.length} chars)`;
  return `${value.slice(0, 6)}…${value.slice(-4)} (${value.length} chars)`;
}

/** Render a resolved value for display, honouring its secret flag. */
export function mask(value: string | undefined, secret: boolean): string {
  if (value === undefined) return "(unset)";
  return secret ? maskSecret(value) : value;
}

/**
 * Mask a value while keeping it bounded, for a fixed-width column.
 * Used where a secret's length is not interesting.
 */
export function maskCompact(value: string | undefined, secret: boolean): string {
  if (value === undefined) return "(unset)";
  if (!secret) return value;
  return value.length <= 4 ? "*".repeat(value.length) : `${value.slice(0, 2)}${"*".repeat(6)}`;
}
