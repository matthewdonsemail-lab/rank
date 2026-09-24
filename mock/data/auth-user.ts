import type { AuthUser, DocBackingMetadata } from "../schema.ts";

/**
 * Route: GET /api/auth/user
 * Description: Retrieves authenticated Clerk user profile.
 * Backed by authoritative documentation in docs/clerk/getting-started/core-concepts.md.
 */
export const docBacking: DocBackingMetadata = {
  docPath: "docs/clerk/getting-started/core-concepts.md",
  specSection: "User Object",
  specUrl: "https://clerk.com/docs/users/overview",
  requiredFields: ["id", "email", "firstName", "lastName", "role"],
  lastVerified: "2026-09-25",
};
export const mockAuthUserData: AuthUser = {
  id: "usr_rank_01",
  email: "developer@listeningkit.com",
  firstName: "Matthew",
  lastName: "Dons",
  role: "admin",
  createdAt: 1727222400000,
};

export function handleGetAuthUser(): AuthUser {
  return mockAuthUserData;
}
