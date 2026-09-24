import type {
  FormattedLatencyMetric,
  TelemetryLogEntry,
} from './types.js';
import { formatLatencyMetric } from './helpers/index.js';

export class ConvexTelemetryLogger {
  private deploymentUrl: string;

  constructor(deploymentUrl?: string) {
    this.deploymentUrl = deploymentUrl || process.env.CONVEX_URL || 'https://rank.listeningkit.convex.cloud';
  }

  /**
   * Records a latency metric and formats it for telemetry auditing.
   */
  recordLatency(domain: string, action: string, durationMs: number): FormattedLatencyMetric {
    const formatted = formatLatencyMetric(durationMs);

    const entry: TelemetryLogEntry = {
      timestamp: Date.now(),
      domain,
      action,
      durationMs,
      status: formatted.isHighLatency ? 'warn' : 'success',
      metadata: { formattedDuration: formatted.formatted },
    };

    // Ready for Convex mutation submission
    return formatted;
  }
}
