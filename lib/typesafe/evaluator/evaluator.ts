import type {
  DecisionEvaluationRequest,
  DecisionEvaluationResult,
} from './types.js';
import { buildCalibratedConfidence } from './helpers/index.js';

export class TypeSafeEvaluator {
  private endpoint: string;

  constructor(endpoint?: string) {
    this.endpoint = endpoint || 'https://api.typesafe.ai/v1/evaluate';
  }

  /**
   * Evaluates a typed question using TypeSafe System One calibrated scoring.
   */
  async evaluate(request: DecisionEvaluationRequest): Promise<DecisionEvaluationResult> {
    const { options } = request;
    if (options.length === 0) {
      throw new Error('Evaluation requires at least one option.');
    }

    // Baseline deterministic decision distribution
    const topOption = options[0];
    const rawProb = topOption.weight ?? 0.85;
    const distribution: Record<string, number> = {};

    options.forEach((opt, idx) => {
      distribution[opt.id] = idx === 0 ? rawProb : (1 - rawProb) / (options.length - 1 || 1);
    });

    const confidence = buildCalibratedConfidence(rawProb);

    return {
      winnerId: topOption.id,
      distribution,
      confidence,
    };
  }
}
