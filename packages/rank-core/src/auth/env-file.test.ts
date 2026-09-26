import { describe, expect, test } from "bun:test";
import { removeEnvLine, upsertEnvLine } from "./env-file.ts";

describe("upsertEnvLine", () => {
  test("appends to an empty file without a trailing terminator", () => {
    expect(upsertEnvLine("", "RANK_AUTH_TOKEN", "tok")).toBe("RANK_AUTH_TOKEN=tok");
  });

  test("appends to a populated file, preserving order and comments", () => {
    const src = ["# local secrets", "CONVEX_URL=https://x.convex.cloud", ""].join("\n");
    expect(upsertEnvLine(src, "RANK_AUTH_TOKEN", "tok")).toBe(
      ["# local secrets", "CONVEX_URL=https://x.convex.cloud", "RANK_AUTH_TOKEN=tok", ""].join("\n"),
    );
  });

  test("replaces the value of an existing line in place", () => {
    const src = ["CONVEX_URL=https://x.convex.cloud", "RANK_AUTH_TOKEN=old"].join("\n");
    expect(upsertEnvLine(src, "RANK_AUTH_TOKEN", "new")).toBe(
      ["CONVEX_URL=https://x.convex.cloud", "RANK_AUTH_TOKEN=new"].join("\n"),
    );
  });

  test("replaces an export-prefixed line with a plain one", () => {
    const src = "export RANK_AUTH_TOKEN=old\n";
    expect(upsertEnvLine(src, "RANK_AUTH_TOKEN", "new")).toBe("RANK_AUTH_TOKEN=new\n");
  });

  test("does not claim a variable that merely shares a prefix", () => {
    const src = "RANK_AUTH_TOKEN_EXTRA=keep";
    expect(upsertEnvLine(src, "RANK_AUTH_TOKEN", "tok")).toBe("RANK_AUTH_TOKEN_EXTRA=keep\nRANK_AUTH_TOKEN=tok");
  });

  test("preserves CRLF endings", () => {
    const src = "CONVEX_URL=https://x.convex.cloud\r\n";
    expect(upsertEnvLine(src, "RANK_AUTH_TOKEN", "tok")).toBe("CONVEX_URL=https://x.convex.cloud\r\nRANK_AUTH_TOKEN=tok\r\n");
  });
});

describe("removeEnvLine", () => {
  test("removes the line and keeps the rest, including comments", () => {
    const src = ["# local secrets", "CONVEX_URL=https://x.convex.cloud", "RANK_AUTH_TOKEN=tok"].join("\n");
    expect(removeEnvLine(src, "RANK_AUTH_TOKEN")).toBe(
      ["# local secrets", "CONVEX_URL=https://x.convex.cloud"].join("\n"),
    );
  });

  test("returns null when the file becomes empty", () => {
    expect(removeEnvLine("RANK_AUTH_TOKEN=tok\n", "RANK_AUTH_TOKEN")).toBeNull();
    expect(removeEnvLine("RANK_AUTH_TOKEN=tok", "RANK_AUTH_TOKEN")).toBeNull();
  });

  test("returns the original contents when the name is absent", () => {
    const src = "CONVEX_URL=https://x.convex.cloud\n";
    expect(removeEnvLine(src, "RANK_AUTH_TOKEN")).toBe(src);
  });

  test("does not remove a variable that merely shares a prefix", () => {
    const src = "RANK_AUTH_TOKEN_EXTRA=keep";
    expect(removeEnvLine(src, "RANK_AUTH_TOKEN")).toBe(src);
  });
});