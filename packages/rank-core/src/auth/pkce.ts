/**
 * PKCE primitives for the `rank login` browser flow (RFC 7636).
 *
 * Pure: the CLI holds the verifier and challenge, the browser web app echoes
 * the challenge back in the exchange. Nothing here touches sockets or disk.
 */
import { createHash, randomBytes } from "node:crypto";

export const BASE64URL_RE = /^[A-Za-z0-9_-]+$/;

/** 32 random bytes, base64url: 43 chars, within the RFC 7636 43–128 bound. */
export function generateCodeVerifier(): string {
  return randomBytes(32).toString("base64url");
}

/** S256 challenge: base64url(SHA256(verifier)). */
export function codeChallengeForVerifier(verifier: string): string {
  return createHash("sha256").update(verifier, "utf8").digest("base64url");
}

/** S256 check used to accept a challenge carried back by the web app. */
export function verifyCodeChallenge(verifier: string, challenge: string): boolean {
  if (!BASE64URL_RE.test(challenge)) return false;
  return codeChallengeForVerifier(verifier) === challenge;
}

/** 16 random bytes, base64url: the per-flow state nonce. */
export function generateState(): string {
  return randomBytes(16).toString("base64url");
}

/** 32 random bytes, base64url: the short-lived proof-of-possession code. */
export function generateCode(): string {
  return randomBytes(32).toString("base64url");
}