import { SignIn, SignUp, useAuth } from "@clerk/react";
import type { ReactNode } from "react";
import { Link, Navigate } from "react-router-dom";

const appearance = {
  variables: {
    colorPrimary: "#2A8CFF",
    colorText: "#0F172A",
    colorTextSecondary: "#475569",
    fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card: "w-full bg-transparent p-0 shadow-none",
    header: "text-left",
    socialButtonsBlockButton: "hidden",
    dividerLine: "bg-slate-200",
    dividerText: "text-sm text-slate-500",
    formFieldLabel: "text-sm font-semibold text-slate-700",
    formFieldInput:
      "!h-12 rounded-xl border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#2A8CFF]",
    formButtonPrimary:
      "h-12 rounded-xl bg-[#2A8CFF] text-sm font-bold text-white shadow-none hover:bg-[#1F6FE6]",
    footer: "bg-transparent",
    footerAction: "bg-transparent",
    footerActionText: "text-sm text-slate-500",
    footerActionLink: "font-semibold text-[#2A8CFF] hover:text-[#1F6FE6]",
  },
};

function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f8f8] px-4 py-12 text-[#1a1a19]">
      <div className="w-full max-w-md rounded-[2rem] border border-black/5 bg-white p-8 shadow-[0_20px_60px_rgba(26,26,25,0.08)] sm:p-10">
        <Link to="/" aria-label="Rank home" className="mb-8 inline-block">
          <img src="/logo.svg" alt="Rank" className="size-12 rounded-xl object-contain" />
        </Link>
        <h1 className="mb-6 text-2xl font-black text-[#1a1a19]">{title}</h1>
        <div className="lk-clerk text-left">{children}</div>
        <Link
          to="/"
          className="mt-6 inline-block text-sm font-semibold text-slate-500 underline decoration-dashed underline-offset-4 hover:text-slate-800"
        >
          Back to Rank
        </Link>
      </div>
    </main>
  );
}

function AuthLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f8f8] px-4 text-sm text-slate-500">
      Loading sign-in…
    </main>
  );
}

/**
 * Post-sign-in destination. Same-origin `?redirectUrl=` wins (used by
 * /cli-login to return to its exchange URL); everything else lands on home.
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
  if (!isLoaded) return <AuthLoading />;
  if (isSignedIn) return <Navigate to="/" replace />;
  return null;
}

export function SignInRoute() {
  const gate = useSignedOutGate();
  if (gate) return gate;

  return (
    <AuthCard title="Sign in">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        forceRedirectUrl={signOutRedirectTarget()}
        appearance={appearance}
      />
      <Link
        to="/sign-in/forgot-password"
        className="mt-4 inline-block text-sm font-semibold text-[#2A8CFF] hover:text-[#1F6FE6]"
      >
        Forgot password?
      </Link>
    </AuthCard>
  );
}

export function SignUpRoute() {
  const gate = useSignedOutGate();
  if (gate) return gate;

  return (
    <AuthCard title="Create your account">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        forceRedirectUrl="/"
        appearance={appearance}
      />
    </AuthCard>
  );
}

