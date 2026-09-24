export type DecisionType = 'Choice' | 'Score' | 'Noul';

export interface DecisionOption {
  id: string;
  label: string;
  weight?: number;
}

export interface DecisionEvaluationRequest {
  type: DecisionType;
  question: string;
  options: DecisionOption[];
  context?: string;
}

export interface CalibratedConfidence {
  probability: number;
  confidenceInterval: [number, number];
  calibrationScore: number;
}

export interface DecisionEvaluationResult {
  winnerId: string;
  distribution: Record<string, number>;
  confidence: CalibratedConfidence;
}
