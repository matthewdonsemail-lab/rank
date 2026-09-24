import type { TregToolCallOptions, TregCallRecord } from "./types.ts";
import { prepareToolCallOptions } from "./helpers/index.ts";

/**
 * Domain client for Treg developer tool execution and usage monitoring.
 */
export class TregDomainClient {
  private componentRef: unknown;

  constructor(componentRef: unknown) {
    this.componentRef = componentRef;
  }

  public prepareCall(
    owner: string,
    endpoint: string,
    params: Record<string, unknown>,
    maxCostUsd?: number
  ): TregToolCallOptions {
    return prepareToolCallOptions(owner, endpoint, params, maxCostUsd);
  }

  public summarizeSpend(records: TregCallRecord[]) {
    const totalCostMicro = records.reduce((acc, r) => acc + r.costMicro, 0);
    return {
      totalCalls: records.length,
      totalCostMicro,
      totalCostUsd: totalCostMicro / 1_000_000,
    };
  }
}
