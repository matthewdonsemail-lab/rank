import type { AuthConfig } from "convex/server";

/**
 * A Clerk token is only valid for the Clerk instance that minted it, and
 * Convex matches on issuer. Development and production web builds have been
 * pointed at different Clerk instances, so a single configured issuer rejects
 * perfectly good sessions with `NoAuthProvider` depending on which build
 * signed them.
 *
 * `CLERK_JWT_ISSUER` therefore accepts a comma-separated list — one entry per
 * Clerk instance we actually deploy against. `CLERK_JWT_AUDIENCE` stays a
 * single value: every Clerk instance exposes the Convex integration under the
 * same `convex` application ID.
 */
const applicationID = process.env.CLERK_JWT_AUDIENCE?.trim() || "convex";

const domains = (process.env.CLERK_JWT_ISSUER ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter((value) => value !== "" && !value.startsWith("$"));

export default {
  providers: domains.map((domain) => ({ domain, applicationID })),
} satisfies AuthConfig;
