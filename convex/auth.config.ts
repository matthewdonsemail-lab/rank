import type { AuthConfig } from "convex/server";

// Sign-in for the landing page uses Clerk. Set these on the Convex deployment (npx convex env set):
//   AUTH_ISSUER    the Clerk Frontend API URL, e.g. https://your-app.clerk.accounts.dev
//   AUTH_AUDIENCE  the applicationID of the Clerk JWT template for Convex (the template is named "convex", and its
//                  audience is "convex" unless changed)
// Without both, no provider is configured and every action that calls requireOwner refuses, so nothing is exposed.
const domain = process.env.AUTH_ISSUER;
const applicationID = process.env.AUTH_AUDIENCE;

export default {
  providers: domain && applicationID ? [{ domain, applicationID }] : [],
} satisfies AuthConfig;
