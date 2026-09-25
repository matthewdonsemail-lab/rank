import type { CrawlStatus } from "../types.js";

export function isTerminalCrawlStatus(status: CrawlStatus): boolean {
  return status === "completed" || status === "failed" || status === "cancelled";
}
