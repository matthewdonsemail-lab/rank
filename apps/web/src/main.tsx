import "@fontsource/schoolbell/400.css";
import { ClerkProvider, useAuth } from "@clerk/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { convexReactClient } from "./lib/convex";
import "./index.css";

function ClerkApp() {
  const { isSignedIn } = useAuth();
  return <App authEnabled isSignedIn={isSignedIn} />;
}

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim();
const app = publishableKey ? (
  <ClerkProvider
    publishableKey={publishableKey}
    signInUrl="/sign-in"
    signUpUrl="/sign-up"
    signInForceRedirectUrl="/"
    signUpForceRedirectUrl="/"
    afterSignOutUrl="/"
  >
    {convexReactClient ? (
      <ConvexProviderWithClerk client={convexReactClient} useAuth={useAuth}>
        <ClerkApp />
      </ConvexProviderWithClerk>
    ) : (
      <ClerkApp />
    )}
  </ClerkProvider>
) : (
  <App />
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>{app}</React.StrictMode>,
);
