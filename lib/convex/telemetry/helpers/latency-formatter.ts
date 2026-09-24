import type { FormattedLatencyMetric } from '../types.js';

export const HIGH_LATENCY_THRESHOLD_MS = 250;

/**
 * Formats a duration in milliseconds into a human-readable metric string.
 */
export function formatLatencyMetric(
  durationMs: number,
  thresholdMs: number = HIGH_LATENCY_THRESHOLD_MS
): FormattedLatencyMetric {
  const rounded = Math.round(durationMs * 100) / 100;
  const formatted = rounded >= 1000
    ? `${(rounded / 1000).toFixed(2)}s`
    : `${rounded.toFixed(1)}ms`;

  return {
    rawMs: durationMs,
    formatted,
    isHighLatency: durationMs > thresholdMs,
  };
}
