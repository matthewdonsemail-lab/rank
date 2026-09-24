export interface TelemetryLogEntry {
  id?: string;
  timestamp: number;
  domain: string;
  action: string;
  durationMs: number;
  metadata?: Record<string, unknown>;
  status: 'success' | 'failure' | 'warn';
}

export interface FormattedLatencyMetric {
  rawMs: number;
  formatted: string;
  isHighLatency: boolean;
}
