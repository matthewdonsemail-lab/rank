import type { CalibratedConfidence } from '../types.js';

/**
 * Calculates a Wilson score confidence interval for a given success probability and sample count.
 */
export function calculateConfidenceInterval(
  probability: number,
  n: number = 100,
  z: number = 1.96
): [number, number] {
  const p = Math.max(0, Math.min(1, probability));
  const denominator = 1 + (z * z) / n;
  const centreAdjustedProbability = p + (z * z) / (2 * n);
  const adjustedStandardDeviation = Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));

  const lowerBound = (centreAdjustedProbability - z * adjustedStandardDeviation) / denominator;
  const upperBound = (centreAdjustedProbability + z * adjustedStandardDeviation) / denominator;

  return [Math.max(0, lowerBound), Math.min(1, upperBound)];
}

/**
 * Formats a calibrated confidence object from raw model probability.
 */
export function buildCalibratedConfidence(probability: number): CalibratedConfidence {
  const interval = calculateConfidenceInterval(probability);
  return {
    probability,
    confidenceInterval: interval,
    calibrationScore: Math.round(probability * 100) / 100,
  };
}
