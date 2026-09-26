import { describe, expect, test } from "bun:test";
import { validateDiscoveryRunId, validateProspectInput } from "./validate.ts";

describe("validateProspectInput", () => {
  test("accepts a minimal valid prospect", () => {
    const result = validateProspectInput({ url: "https://example.com/page" });
    expect(result.ok).toBe(true);
    expect(result.input?.url).toBe("https://example.com/page");
    expect(result.issues).toEqual([]);
  });

  test("accepts optional fields and nulls", () => {
    const result = validateProspectInput({
      url: "https://example.com",
      title: "Example",
      description: null,
      metrics: { anything: "goes" },
    });
    expect(result.ok).toBe(true);
  });

  test("rejects non-objects", () => {
    for (const value of [null, "https://example.com", 42, [{ url: "https://example.com" }]]) {
      const result = validateProspectInput(value);
      expect(result.ok).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    }
  });

  test("rejects missing, blank, and non-absolute urls", () => {
    expect(validateProspectInput({}).ok).toBe(false);
    expect(validateProspectInput({ url: "   " }).ok).toBe(false);
    expect(validateProspectInput({ url: "not a url" }).ok).toBe(false);
    expect(validateProspectInput({ url: "ftp://example.com/x" }).ok).toBe(false);
    expect(validateProspectInput({ url: "https://example.com/x" }).ok).toBe(true);
  });

  test("rejects unknown fields instead of stripping them", () => {
    const result = validateProspectInput({ url: "https://example.com", urll: "typo" });
    expect(result.ok).toBe(false);
    expect(result.issues.join(" ")).toContain("urll");
  });

  test("rejects mistyped optional fields", () => {
    expect(validateProspectInput({ url: "https://example.com", title: 42 }).ok).toBe(false);
  });
});

describe("validateDiscoveryRunId", () => {
  test("undefined means absent", () => {
    expect(validateDiscoveryRunId(undefined)).toBeNull();
  });

  test("blank and non-string ids are rejected", () => {
    expect(validateDiscoveryRunId("")).not.toBeNull();
    expect(validateDiscoveryRunId("   ")).not.toBeNull();
    expect(validateDiscoveryRunId(42)).not.toBeNull();
  });

  test("a non-empty string passes", () => {
    expect(validateDiscoveryRunId("abc123")).toBeNull();
  });
});
