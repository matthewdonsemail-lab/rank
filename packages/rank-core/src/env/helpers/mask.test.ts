import { describe, expect, test } from "bun:test";
import { mask, maskCompact, maskSecret } from "./mask.ts";

describe("maskSecret", () => {
  test("never reveals the middle of a long secret", () => {
    const secret = "v1.CmMKHHN0YXRpY2tleS1lMDBnbnQzNWQyZ3E2bTJqMGES";
    const masked = maskSecret(secret);
    expect(masked).toContain("…");
    expect(masked).toContain(`(${secret.length} chars)`);
    expect(masked).not.toContain("YXRpY2tleS1lMDBnbnQz");
  });

  test("reports the length instead of padding a short secret", () => {
    expect(maskSecret("short")).toBe("***** (5 chars)");
  });

  test("keeps output bounded for a very long secret", () => {
    expect(maskSecret("x".repeat(500)).length).toBeLessThan(40);
  });
});

describe("mask", () => {
  test("leaves a non-secret readable", () => {
    expect(mask("https://api.telnyx.com/v2", false)).toBe("https://api.telnyx.com/v2");
  });

  test("masks a secret and leaves an absent value visible", () => {
    expect(mask("supersecretvalue", true)).toContain("…");
    expect(mask(undefined, true)).toBe("(unset)");
  });
});

describe("maskCompact", () => {
  test("keeps a short fixed width for columns", () => {
    expect(maskCompact("abcdefgh", true)).toBe("ab******");
    expect(maskCompact("ab", true)).toBe("**");
    expect(maskCompact(undefined, false)).toBe("(unset)");
  });
});
