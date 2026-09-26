/** Pure input validation for prospect.evaluate. No network, no env. */
import type { ProspectInput } from "../types.ts";

const ALLOWED_KEYS = new Set([
  "url",
  "title",
  "description",
  "sourceDomain",
  "anchorText",
  "targetDomain",
  "fitRationale",
  "brandSummary",
  "metrics",
  "content",
]);

const OPTIONAL_STRING_KEYS = [
  "title",
  "description",
  "sourceDomain",
  "anchorText",
  "targetDomain",
  "fitRationale",
  "brandSummary",
  "content",
] as const;

export interface ValidateProspectInputResult {
  ok: boolean;
  input?: ProspectInput;
  issues: string[];
}

/**
 * Validate an untrusted prospect value against the contract.
 *
 * Unknown fields are rejected rather than stripped, so a caller typo fails
 * loudly instead of silently evaluating the wrong thing. URL validity here is
 * a well-formedness pre-check only; the backend normalizer has the final say.
 */
export function validateProspectInput(value: unknown): ValidateProspectInputResult {
  const issues: string[] = [];
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { ok: false, issues: ["prospect must be an object"] };
  }
  const record = value as Record<string, unknown>;

  for (const key of Object.keys(record)) {
    if (!ALLOWED_KEYS.has(key)) issues.push(`unknown field "${key}"`);
  }

  const url = record["url"];
  if (typeof url !== "string" || url.trim() === "") {
    issues.push("prospect.url must be a non-empty string");
  } else {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        issues.push("prospect.url must use http or https");
      }
    } catch {
      issues.push("prospect.url must be an absolute URL");
    }
  }

  for (const key of OPTIONAL_STRING_KEYS) {
    const field = record[key];
    if (field !== undefined && field !== null && typeof field !== "string") {
      issues.push(`prospect.${key} must be a string or null`);
    }
  }

  if (issues.length > 0) return { ok: false, issues };
  const input: ProspectInput = { url: (record["url"] as string).trim() };
  for (const key of OPTIONAL_STRING_KEYS) {
    const field = record[key];
    if (typeof field === "string") input[key] = field;
    else if (field === null) input[key] = null;
  }
  if (record["metrics"] !== undefined) input.metrics = record["metrics"];
  return { ok: true, input, issues: [] };
}

/** A discovery run id, when given, must be a non-empty string. */
export function validateDiscoveryRunId(value: unknown): string | null {
  if (value === undefined) return null;
  if (typeof value !== "string" || value.trim() === "") {
    return "sourceDiscoveryRunId must be a non-empty string";
  }
  return null;
}
