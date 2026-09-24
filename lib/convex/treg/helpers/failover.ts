import type { FailoverRule, TregToolCallOptions } from "../types.ts";

/**
 * Helper to determine fallback endpoints if an upstream tool invocation fails.
 */
export function resolveFailoverSequence(rule: FailoverRule): string[] {
  return [rule.primaryEndpoint, ...rule.fallbackEndpoints];
}

/**
 * Checks whether an error code qualifies for failover (rate limits or service outage).
 * Client errors (400, 422) should never trigger failover to avoid budget depletion.
 */
export function isEligibleForFailover(status: number): boolean {
  return status === 429 || status === 503 || status === 504 || status === 408;
}

/**
 * Builds standard execution parameters with enforced max cost reservation.
 */
export function prepareToolCallOptions(
  owner: string,
  endpoint: string,
  params: Record<string, unknown>,
  maxCostUsd: number = 0.05
): TregToolCallOptions {
  return {
    owner,
    endpoint,
    params,
    maxCostUsd,
  };
}
