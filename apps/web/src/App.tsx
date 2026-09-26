import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Header, type HeaderItem } from "./landing/Header";
import { Hero } from "./landing/hero";
import { MessagingPlatform } from "./landing/MessagingPlatform";
import { SignInRoute, SignUpRoute } from "./pages/auth";
import { CliLoginPage } from "./pages/cli-login";

type AppProps = {
  authEnabled?: boolean;
  isSignedIn?: boolean;
};

function Landing({ authEnabled, isSignedIn }: Required<Pick<AppProps, "authEnabled" | "isSignedIn">>) {
  const accountItems: HeaderItem[] = !authEnabled
    ? [{ href: "#hero", label: "Get started", variant: "cta" }]
    : isSignedIn
      ? [{ href: "#hero", label: "Get started", variant: "cta" }]
      : [
          { href: "/sign-in", label: "Sign in", variant: "ghost" },
          { href: "#hero", label: "Get started", variant: "cta" },
        ];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Header
        tone="light"
        homeHref="/"
        logoLabel="ListeningKit"
        navItems={[]}
        isLoggedIn={isSignedIn}
        accountItems={accountItems}
      />
      <Hero />
      <div className="rounded-sm bg-[#f8f8f8] p-8">
        <div className="rounded-sm bg-yellow-200 p-6">
          <MessagingPlatform />
        </div>
      </div>
    </div>
  );
}

export function App({ authEnabled = false, isSignedIn = false }: AppProps) {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing authEnabled={authEnabled} isSignedIn={isSignedIn} />} />
        <Route
          path="/sign-in/*"
          element={authEnabled ? <SignInRoute /> : <Navigate to="/" replace />}
        />
        <Route
          path="/sign-up/*"
          element={authEnabled ? <SignUpRoute /> : <Navigate to="/" replace />}
        />
        <Route
          path="/cli-login"
          element={authEnabled ? <CliLoginPage /> : <Navigate to="/" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
