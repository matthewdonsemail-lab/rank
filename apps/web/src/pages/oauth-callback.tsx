import { useAuth } from '@clerk/react'
import { Navigate } from 'react-router-dom'
import { OAUTH_BASE_PATH, OnboardingAuth, OnboardingAuthLoading } from './onboarding/OnboardingAuth'

/**
 * The Rank-owned OAuth callback route. After the Google/GitHub consent
 * screen, the browser lands on `{origin}/oauth/sso-callback?code=…&state=…`;
 * the <SignIn> component mounted inside this subtree (path="/oauth") picks
 * up the code, finishes the exchange, and forwards to forceRedirectUrl.
 * Visiting the base path directly (no code) just shows the sign-in screen.
 */
export function OAuthCallbackRoute() {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded) return <OnboardingAuthLoading>Loading sign-in…</OnboardingAuthLoading>
  if (isSignedIn) return <Navigate to="/" replace />
  return <OnboardingAuth mode="sign-in" cbasePath={OAUTH_BASE_PATH} />
}

/**
 * Pre-sign-up variant: `signUp.authenticateWithRedirect` callbacks only
 * finalize under a <SignUp> component, so this route mounts
 * <SignUp path="/oauth/sign-up"> to serve `/oauth/sign-up/sso-callback`.
 */
export function OAuthCallbackSignUpRoute() {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded) return <OnboardingAuthLoading>Loading sign-up…</OnboardingAuthLoading>
  if (isSignedIn) return <Navigate to="/" replace />
  return <OnboardingAuth mode="sign-up" cbasePath={`${OAUTH_BASE_PATH}/sign-up`} />
}