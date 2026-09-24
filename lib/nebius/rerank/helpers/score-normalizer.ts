/**
 * Normalizes an array of raw logit scores into [0, 1] range using min-max scaling.
 */
export function normalizeScores(scores: number[]): number[] {
  if (scores.length === 0) return [];
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  if (max === min) return scores.map(() => 1.0);
  return scores.map((s) => (s - min) / (max - min));
}

/**
 * Applies sigmoid transformation to a logit score.
 */
export function sigmoid(logit: number): number {
  return 1 / (1 + Math.exp(-logit));
}
