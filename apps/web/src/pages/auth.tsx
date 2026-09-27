import { useAuth } from "@clerk/react";
import { Navigate } from "react-router-dom";
import { OnboardingAuth, OnboardingAuthLoading } from "./onboarding/OnboardingAuth";

/**
 * Post-sign-in destination. Same-origin `?redirectUrl=` wins (used by
 * /cli to return to its exchange URL); everything else lands on home.
 */
function signOutRedirectTarget(): string {
  const params = new URLSearchParams(window.location.search);
  const redirectUrl = params.get("redirectUrl");
  if (redirectUrl) {
    try {
      const target = new URL(redirectUrl, window.location.origin);
      if (target.origin === window.location.origin) {
        return target.pathname + target.search;
      }
    } catch {
      // Not a parsable URL: fall through to home.
    }
  }
  return "/";
}

function useSignedOutGate() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <OnboardingAuthLoading>Loading sign-in…</OnboardingAuthLoading>;
  // A freshly signed-in visitor belongs at the page that sent them here. The
  // /cli exchange dies on the base page because its access code is not there,
  // so hardcoding "/" breaks rank login. Direct visits have no redirectUrl
  // and still land on home.
  if (isSignedIn) return <Navigate to={signOutRedirectTarget()} replace />;
  return null;
}

/** Auth screens continue the onboarding shell — the two-column layout with
 *  the UsecaseLoop showcase on the right. */
export function SignInRoute() {
  const gate = useSignedOutGate();
  if (gate) return gate;
  return <OnboardingAuth mode="sign-in" redirectTo={signOutRedirectTarget()} />;
}

export function SignUpRoute() {
  const gate = useSignedOutGate();
  if (gate) return gate;
  return <OnboardingAuth mode="sign-up" />;
}