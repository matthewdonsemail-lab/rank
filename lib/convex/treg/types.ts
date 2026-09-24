/**
 * Type definitions for the Treg domain library.
 */

export interface TregToolCallOptions {
  owner: string;
  endpoint: string;
  params: Record<string, unknown>;
  maxCostUsd?: number;
}

export interface TregCallRecord {
  callId: string;
  ownerHash: string;
  endpoint: string;
  costMicro: number;
  servedVia: string;
  at: number;
}

export interface FailoverRule {
  primaryEndpoint: string;
  fallbackEndpoints: string[];
  maxCostUsd?: number;
}

export interface TregToolDescriptor {
  endpoint: string;
  name: string;
  provider: string;
  category: string;
  approxCostUsd: number;
  description: string;
}
