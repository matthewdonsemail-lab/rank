/**
 * /cli — the browser half of `rank login`.
 *
 * The CLI opens this page with `?state=…&code_challenge=…&exchange=…`, where
 * exchange is the one-shot loopback URL it is listening on. When the viewer is
 * signed in via Clerk, the page posts a single-use random code plus the
 * session token back to the CLI. The CLI accepts the exchange only when the
 * state and code_challenge match the run it started, which binds the exchange
 * to that terminal and makes a replayed POST useless.
 *
 * The exchange params are mirrored into sessionStorage the moment they arrive,
 * because Clerk does not preserve the query string across the sign-in round
 * trip — without the mirror the page came back signed in but blind to which
 * `rank login` run it was serving, and could only report a dead end. The
 * routing is therefore:
 *
 *   no params, nothing stored  -> nothing is pending; ask for a fresh run
 *   params, not signed in      -> hand off to /sign-in, return here, exchange
 *   params, signed in          -> post the proof, report the outcome
 *
 * The token is never displayed, and the exchange response is rendered only as
 * ok/fail text.
 *
 * This screen mounts the shared two-panel auth layout rather than its own
 * shell, so it opens identically to sign-in and sign-up: same brand mark,
 * headline scale, max-w-xs form column, and pinned showcase. Only the form
 * column differs — instead of Clerk's card it renders our own controls, built
 * from the same recipes (`splitControl`) Clerk's appearance map uses.
 */
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { OnboardingAuthLoading } from "./onboarding/OnboardingAuth";
import { OnboardingSplit, SplitNotice, splitControl } from "./onboarding/OnboardingSplit";

type CliLoginResult =
  | { kind: "idle" | "posting" }
  | { kind: "ok" }
  | { kind: "error"; detail: string; terminal: boolean };

interface PendingExchange {
  state: string;
  codeChallenge: string;
  exchangeUrl: string;
}

const STORAGE_KEY = "rank.cli.exchange";
const EXCHANGE_RE = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/exchange$/;

function randomCode(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function isPending(value: unknown): value is PendingExchange {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<PendingExchange>;
  return (
    typeof candidate.state === "string" &&
    candidate.state !== "" &&
    typeof candidate.codeChallenge === "string" &&
    candidate.codeChallenge !== "" &&
    typeof candidate.exchangeUrl === "string" &&
    EXCHANGE_RE.test(candidate.exchangeUrl)
  );
}

function readExchangeFromUrl(): PendingExchange | null {
  const params = new URLSearchParams(window.location.search);
  const candidate = {
    state: params.get("state") ?? "",
    codeChallenge: params.get("code_challenge") ?? "",
    exchangeUrl: params.get("exchange") ?? "",
  };
  return isPending(candidate) ? candidate : null;
}

function readStoredExchange(): PendingExchange | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isPending(parsed)) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function storeExchange(exchange: PendingExchange): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(exchange));
  } catch {
    // Private-mode storage denial only costs us the post-sign-in recovery path.
  }
}

function clearStoredExchange(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do.
  }
}

export function CliLoginPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [result, setResult] = useState<CliLoginResult>({ kind: "idle" });
  // Bumped by "Try again" to re-arm the effect. A ref guard alone cannot
  // retry: the effect's dependencies are unchanged by a retry, so React would
  // never call it a second time.
  const [attempt, setAttempt] = useState(0);

  // Read once, on the first render: the query string is authoritative, and the
  // session mirror only fills in when a redirect ate it.
  const [pending] = useState<PendingExchange | null>(() => {
    const fromUrl = readExchangeFromUrl();
    if (fromUrl) {
      storeExchange(fromUrl);
      return fromUrl;
    }
    return readStoredExchange();
  });

  /** Resolves true once the CLI's one-shot listener is spent. */
  const postExchange = useCallback(
    async (exchange: PendingExchange, token: string): Promise<boolean> => {
      setResult({ kind: "posting" });
      try {
        const response = await fetch(exchange.exchangeUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: randomCode(),
            state: exchange.state,
            code_challenge: exchange.codeChallenge,
            token,
          }),
        });
        const body = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
        if (response.ok && body.ok) {
          setResult({ kind: "ok" });
          return true;
        }
        // 401 is the CLI refusing the session while keeping the listener open,
        // so it stays retryable — re-signing in and trying again is the fix.
        const retryable = response.status === 401;
        setResult({
          kind: "error",
          detail: body.error ?? `The CLI rejected the exchange (HTTP ${response.status}).`,
          terminal: !retryable,
        });
        return !retryable;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setResult({
          kind: "error",
          detail: `Could not reach the CLI at ${exchange.exchangeUrl}. It may have finished or timed out — run \`rank login\` again. (${message})`,
          terminal: true,
        });
        return true;
      }
    },
    [],
  );

  // Authentication is resolved before the exchange is even looked at, and the
  // sign-in hand-off does not depend on the exchange params surviving: a
  // truncated or redirected-away query used to dead-end on "no login is
  // waiting" and never offer a way to sign in at all.
  //
  // The return trip carries the full authorize query rather than a bare "/cli",
  // so the exchange survives on the URL alone as well as in the session
  // mirror. None of these three values is a secret — the session token is what
  // must never appear here, and it never does.
  const returnTarget = `${window.location.pathname}${window.location.search}`;
  const goToSignIn = useCallback(() => {
    window.location.assign(`/sign-in?redirectUrl=${encodeURIComponent(returnTarget)}`);
  }, [returnTarget]);

  useEffect(() => {
    if (!isLoaded || isSignedIn) return;
    goToSignIn();
  }, [isLoaded, isSignedIn, goToSignIn]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !pending) return;

    setResult({ kind: "idle" });
    // getToken is deliberately not a dependency: useAuth hands back a fresh
    // reference each render, and depending on it re-ran this effect forever.
    // Reading it at call time always yields the current session.
    let cancelled = false;
    void getToken().then((token) => {
      if (cancelled) return;
      if (!token) {
        setResult({
          kind: "error",
          detail: "Clerk reported a session but returned no token. Sign out and back in, then try again.",
          terminal: false,
        });
        return;
      }
      void postExchange(pending, token).then((spent) => {
        // Only forget the pending run once the listener is actually spent. A
        // 401 keeps it alive, so the session mirror must survive for the retry.
        if (spent) clearStoredExchange();
      });
    });
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, pending, postExchange, attempt]);

  const handleSignIn = useCallback(() => {
    goToSignIn();
  }, [goToSignIn]);

  if (!isLoaded) return <OnboardingAuthLoading>Loading sign-in…</OnboardingAuthLoading>;

  return (
    <OnboardingSplit title="Authorize rank CLI">
      <p className={splitControl.note}>
        Sign in to connect the <code className={splitControl.code}>rank</code> command on this device. Your session
        token is sent only to the local loopback listener started by{" "}
        <code className={splitControl.code}>rank login</code> — never to a web server.
      </p>

      <div className="mt-4">
        {!isSignedIn ? (
          <button type="button" onClick={handleSignIn} className={splitControl.primary}>
            Sign in to continue
          </button>
        ) : !pending ? (
          <SplitNotice tone="info" title="Nothing to authorize">
            You are signed in, but this page has no pending{" "}
            <code className={splitControl.code}>rank login</code> request. Run{" "}
            <code className={splitControl.code}>rank login</code> in your terminal and open the full URL it prints.
          </SplitNotice>
        ) : (
          <div role="status" aria-live="polite">
            {result.kind === "idle" && <SplitNotice tone="info">Preparing the local exchange…</SplitNotice>}
            {result.kind === "posting" && (
              <SplitNotice tone="info">Sending the session proof to the CLI (127.0.0.1)…</SplitNotice>
            )}
            {result.kind === "ok" && (
              <SplitNotice tone="success" title="Authorized">
                You can close this window and return to your terminal.
              </SplitNotice>
            )}
            {result.kind === "error" && (
              <div>
                <SplitNotice tone="error" title="Could not authorize the CLI">
                  {result.detail}
                </SplitNotice>
                {!result.terminal && (
                  <button type="button" onClick={() => setAttempt((n) => n + 1)} className={`mt-4 ${splitControl.secondary}`}>
                    Try again
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </OnboardingSplit>
  );
}

export default CliLoginPage;
