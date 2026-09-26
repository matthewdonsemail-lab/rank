import type { AuthConfig } from "convex/server";

const domain = process.env.CLERK_JWT_ISSUER;
const applicationID = process.env.CLERK_JWT_AUDIENCE;

export default {
  providers: domain && applicationID ? [{ domain, applicationID }] : [],
} satisfies AuthConfig;
