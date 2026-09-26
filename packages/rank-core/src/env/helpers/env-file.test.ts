import { describe, expect, test } from "bun:test";
import { isBlank, parseEnvFile } from "./env-file.ts";

describe("parseEnvFile", () => {
  test("parses plain, quoted, exported, and commented values", () => {
    const parsed = parseEnvFile(
      [
        "# a comment",
        "",
        "PLAIN=value",
        'QUOTED="quoted value"',
        "SINGLE='single value'",
        "export EXPORTED=exported",
        "WITH_COMMENT=value # trailing note",
        "EMPTY=",
        "SPACED  =  padded  ",
        "not a pair",
        "=missing-name",
      ].join("\n"),
    );
    expect(parsed).toEqual({
      PLAIN: "value",
      QUOTED: "quoted value",
      SINGLE: "single value",
      EXPORTED: "exported",
      WITH_COMMENT: "value",
      EMPTY: "",
      SPACED: "padded",
    });
  });

  test("keeps a hash inside a quoted value", () => {
    expect(parseEnvFile('TOKEN="abc # def"').TOKEN).toBe("abc # def");
  });

  test("keeps a hash inside an unquoted value when it is not a trailing comment", () => {
    expect(parseEnvFile("TOKEN=abc#def").TOKEN).toBe("abc#def");
  });

  test("tolerates CRLF and a leading byte order mark", () => {
    expect(parseEnvFile("\uFEFFA=1\r\nB=2\r\n")).toEqual({ A: "1", B: "2" });
  });

  test("returns an empty record for empty input", () => {
    expect(parseEnvFile("")).toEqual({});
    expect(parseEnvFile("\n\n# only comments\n")).toEqual({});
  });
});

describe("isBlank", () => {
  test("treats undefined and whitespace-only as blank", () => {
    expect(isBlank(undefined)).toBe(true);
    expect(isBlank("")).toBe(true);
    expect(isBlank("   ")).toBe(true);
    expect(isBlank("x")).toBe(false);
  });
});
