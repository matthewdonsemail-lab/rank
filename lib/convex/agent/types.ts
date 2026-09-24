export interface AgentSessionConfig {
  agentName?: string;
  defaultModel?: string;
  maxContextTurns?: number;
}

export interface FormattedThreadMessage {
  id: string;
  role: 'system' | 'user' | 'assistant' | 'tool';
  text: string;
  timestamp?: number;
  toolCalls?: Array<{
    name: string;
    args: Record<string, unknown>;
  }>;
}

export interface AgentRunResult {
  threadId: string;
  text: string;
  latencyMs: number;
}
