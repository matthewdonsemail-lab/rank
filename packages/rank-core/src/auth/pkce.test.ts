import { describe, expect, test } from "bun:test";
import {
  BASE64URL_RE,
  codeChallengeForVerifier,
  generateCode,
  generateCodeVerifier,
  generateState,
  verifyCodeChallenge,
} from "./pkce.ts";

describe("generateCodeVerifier", () => {
  test("is 43 base64url chars, within the RFC 7636 bound", () => {
    const verifier = generateCodeVerifier();
    expect(verifier.length).toBe(43);
    expect(verifier).toMatch(BASE64URL_RE);
  });

  test("is unique per call", () => {
    const seen = new Set(
      Array.from({ length: 50 }, () => generateCodeVerifier()),
    );
    expect(seen.size).toBe(50);
  });
});

describe("codeChallengeForVerifier", () => {
  test("reproduces the RFC 7636 appendix B vector", () => {
    const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
    expect(codeChallengeForVerifier(verifier)).toBe(
      "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    );
  });

  test("is deterministic for the same verifier", () => {
    const verifier = generateCodeVerifier();
    expect(codeChallengeForVerifier(verifier)).toBe(codeChallengeForVerifier(verifier));
  });
});

describe("verifyCodeChallenge", () => {
  test("accepts the honest pair", () => {
    const verifier = generateCodeVerifier();
    const challenge = codeChallengeForVerifier(verifier);
    expect(verifyCodeChallenge(verifier, challenge)).toBe(true);
  });

  test("rejects a different verifier", () => {
    const verifier = generateCodeVerifier();
    const challenge = codeChallengeForVerifier(verifier);
    expect(verifyCodeChallenge(generateCodeVerifier(), challenge)).toBe(false);
  });

  test("rejects a tampered or malformed challenge", () => {
    const verifier = generateCodeVerifier();
    const challenge = codeChallengeForVerifier(verifier);
    const flipped = challenge.endsWith("A") ? `${challenge.slice(0, -1)}B` : `${challenge}A`;
    expect(flipped).not.toBe(challenge);
    expect(verifyCodeChallenge(verifier, flipped)).toBe(false);
    expect(verifyCodeChallenge(verifier, "not base64url!")).toBe(false);
    expect(verifyCodeChallenge(verifier, "")).toBe(false);
  });
});

describe("generateState", () => {
  test("is 22 base64url chars, unique per call", () => {
    const states = Array.from({ length: 20 }, () => generateState());
    for (const state of states) {
      expect(state.length).toBe(22);
      expect(state).toMatch(BASE64URL_RE);
    }
    expect(new Set(states).size).toBe(20);
  });
});

describe("generateCode", () => {
  test("is 43 base64url chars, unique per call", () => {
    const codes = Array.from({ length: 20 }, () => generateCode());
    for (const code of codes) {
      expect(code.length).toBe(43);
      expect(code).toMatch(BASE64URL_RE);
    }
    expect(new Set(codes).size).toBe(20);
  });
});