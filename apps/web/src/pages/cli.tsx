/**
 * /cli — the browser half of `rank login`.
 *
 * The CLI opens this page with `?state=...&code_challenge=...&exchange=...`,
 * where exchange is the one-shot loopback URL it is listening on. When the
 * viewer is signed in via Clerk, the page posts a single-use random code plus
 * the session token back to the CLI. The CLI accepts the exchange only when
 * the state and code_challenge match the run it started, which binds the
 * exchange to that terminal and makes a replayed POST useless.
 *
 * The token is never displayed, and the exchange response is rendered only as
 * ok/fail text. An unsigned visitor is offered Clerk sign-in and returns here
 * (Clerk persists the redirect target across the sign-in round-trip).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@clerk/react";
import { Link } from "react-router-dom";

interface CliLoginResult {
  kind: "idle" | "posting" | "ok" | "error";
  detail?: string;
}

function randomCode(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

const EXCHANGE_RE = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/exchange$/;

function CliLoginLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f8f8] px-4 text-sm text-slate-500">
      Loading…
    </main>
  );
}

export function CliLoginPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [result, setResult] = useState<CliLoginResult>({ kind: "idle" });
  const startedRef = useRef(false);

  const { state, codeChallenge, exchangeUrl } = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const exchange = params.get("exchange") ?? "";
    return {
      state: params.get("state") ?? "",
      codeChallenge: params.get("code_challenge") ?? "",
      exchangeUrl: EXCHANGE_RE.test(exchange) ? exchange : "",
    };
  }, []);

  // Signed in but the URL lost its params (e.g. a hard refresh): surface that
  // rather than silently posting nothing, so the operator re-runs rank login.
  const exchangeConfigured = state !== "" && codeChallenge !== "" && exchangeUrl !== "";

  const attemptExchange = useCallback(
    async (token: string) => {
      setResult({ kind: "posting" });
      try {
        const response = await fetch(exchangeUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: randomCode(), state, code_challenge: codeChallenge, token }),
        });
        const body = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
        if (response.ok && body.ok) {
          setResult({ kind: "ok" });
        } else {
          setResult({ kind: "error", detail: body.error ?? `The CLI rejected the exchange (HTTP ${response.status}).` });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setResult({
          kind: "error",
          detail: `Could not reach the CLI at ${exchangeUrl}. Is \`rank login\` still running? (${message})`,
        });
      }
    },
    [exchangeUrl, state, codeChallenge],
  );

  useEffect(() => {
    if (!isLoaded || !isSignedIn || startedRef.current) return;
    if (!exchangeConfigured) {
      setResult({
        kind: "error",
        detail: "You are signed in, but this page lost its exchange parameters. Run `rank login` again and open the new URL it prints.",
      });
      return;
    }
    startedRef.current = true;
    void getToken().then((token) => {
      if (token) void attemptExchange(token);
      else setResult({ kind: "error", detail: "Clerk reported a session but returned no token. Try signing out and back in." });
    });
  }, [isLoaded, isSignedIn, getToken, attemptExchange, exchangeConfigured]);

  if (!isLoaded) return <CliLoginLoading />;

  // The in-app SignIn honors the same-origin ?redirectUrl= we carry, which is
  // what gets this exchange URL revisited after the Clerk round-trip.
  const handleSignIn = useCallback(() => {
    const target = window.location.pathname + window.location.search;
    window.location.assign(`/sign-in?redirectUrl=${encodeURIComponent(target)}`);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f8f8] px-4 py-12 text-[#1a1a19]">
      <div className="w-full max-w-md rounded-[2rem] border border-black/5 bg-white p-8 shadow-[0_20px_60px_rgba(26,26,25,0.08)] sm:p-10">
        <Link to="/" aria-label="Rank home" className="mb-8 inline-block">
          <img src="/logo.svg" alt="Rank" className="size-12 rounded-xl object-contain" />
        </Link>
        <h1 className="mb-2 text-2xl font-black text-[#1a1a19]">Authorize rank CLI</h1>
        <p className="mb-6 text-sm leading-relaxed text-slate-500">
          Sign in to connect the <code className="font-semibold">rank</code> command on this device. Your session
          token is sent only to the local loopback listener started by{" "}
          <code className="font-semibold">rank login</code> — never to a web server.
        </p>

        {!isSignedIn ? (
          <div>
            <button
              type="button"
              onClick={() => void handleSignIn()}
              className="h-12 w-full rounded-xl bg-[#2A8CFF] text-sm font-bold text-white shadow-none transition hover:bg-[#1F6FE6]"
            >
              Sign in to continue
            </button>
            <p className="mt-3 text-xs text-slate-400">
              {exchangeConfigured ? "You will return to this page after signing in." : ""}
            </p>
          </div>
        ) : (
          <div role="status" aria-live="polite">
            {result.kind === "idle" && <p className="text-sm text-slate-500">Preparing the local exchange…</p>}
            {result.kind === "posting" && (
              <p className="text-sm text-slate-500">Sending the session proof to the CLI (127.0.0.1)…</p>
            )}
            {result.kind === "ok" && (
              <p className="text-sm font-semibold text-emerald-600">
                Authorized. You can close this window and return to your terminal.
              </p>
            )}
            {result.kind === "error" && (
              <div>
                <p className="text-sm font-semibold text-red-600">{result.detail}</p>
                <button
                  type="button"
                  onClick={() => {
                    void getToken().then((token) => {
                      if (token) void attemptExchange(token);
                      else setResult({ kind: "error", detail: "No session token available to retry with." });
                    });
                  }}
                  className="mt-4 h-10 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        )}

        <Link
          to="/"
          className="mt-8 inline-block text-sm font-semibold text-slate-500 underline decoration-dashed underline-offset-4 hover:text-slate-800"
        >
          Back to Rank
        </Link>
      </div>
    </main>
  );
}

export default CliLoginPage;