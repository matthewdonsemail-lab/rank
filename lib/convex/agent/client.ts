import type {
  AgentRunResult,
  AgentSessionConfig,
  FormattedThreadMessage,
} from './types.js';
import { formatThreadMessage } from './helpers/index.js';

export class ConvexAgentClient {
  private agentName: string;
  private defaultModel: string;

  constructor(config: AgentSessionConfig = {}) {
    this.agentName = config.agentName || 'Rank Assistant';
    this.defaultModel = config.defaultModel || 'nebius:BAAI/bge-reranker-v2-m3';
  }

  /**
   * Transforms raw Convex component messages into normalized domain thread turns.
   */
  processThreadHistory(rawMessages: Array<Record<string, any>>): FormattedThreadMessage[] {
    return rawMessages.map(formatThreadMessage);
  }

  /**
   * Simulates or wraps an agent session execution with latency timing.
   */
  async executeSession(threadId: string, prompt: string): Promise<AgentRunResult> {
    const startTime = Date.now();
    // Deterministic simulation / local test wrapper for Convex action
    const latencyMs = Date.now() - startTime;

    return {
      threadId,
      text: `Processed prompt for ${this.agentName} using ${this.defaultModel}`,
      latencyMs,
    };
  }
}
