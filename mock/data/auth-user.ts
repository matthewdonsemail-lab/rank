import type { AuthUser } from "../schema.ts";

/**
 * Route: GET /api/auth/user
 * Description: Retrieves authenticated Clerk user profile.
 */
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
