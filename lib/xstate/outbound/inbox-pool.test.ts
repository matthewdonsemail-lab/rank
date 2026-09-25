import { describe, expect, it } from "vitest";
import {
  buildPrefixedInboxAddress,
  normalizeInboxPrefix,
  selectSharedInbox,
} from "./inbox-pool.ts";

describe("outbound inbox pool", () => {
  it("builds a user-prefixed address", () => {
    expect(normalizeInboxPrefix("Avery Stone")).toBe("avery-stone");
    expect(buildPrefixedInboxAddress("Avery Stone", "Outreach.Rank.dev")).toBe(
      "avery-stone@outreach.rank.dev",
    );
  });

  it("selects a healthy inbox without exceeding its daily limit", () => {
    const selected = selectSharedInbox({
      domains: [
        { domain: "outreach.rank.dev", status: "verified", warmupScore: 0.8 },
        { domain: "studio.rank.dev", status: "verified", warmupScore: 0.9 },
      ],
      inboxes: [
        {
          id: "inbox_busy",
          domain: "outreach.rank.dev",
          localPart: "avery",
          address: "avery@outreach.rank.dev",
          status: "active",
          dailyLimit: 10,
          sentToday: 10,
        },
        {
          id: "inbox_healthy",
          domain: "studio.rank.dev",
          localPart: "avery",
          address: "avery@studio.rank.dev",
          status: "warming",
          dailyLimit: 20,
          sentToday: 2,
          warmupScore: 0.7,
        },
      ],
    });
    expect(selected?.id).toBe("inbox_healthy");
  });
});
