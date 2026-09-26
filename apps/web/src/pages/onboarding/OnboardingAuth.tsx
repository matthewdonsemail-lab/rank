import { SignIn, SignUp, useSignIn, useSignUp } from '@clerk/react'
import { useState } from 'react'
import { ToastProvider, useToast } from '@listeningkit/ui'
import { OnboardingShell } from './OnboardingShell'
import { OnboardingSplit } from './OnboardingSplit'
import { OnboardingLoading } from './OnboardingLoading'

/**
 * Auth is a continuation of onboarding, not a second app shell: one white
 * panel on the brand backdrop, same recipe as the step-2 token card
 * (white, large radius, slate-900 ink). Clerk's own header is hidden — the
 * page headline already says what this screen is — and Clerk's card chrome
 * is dissolved so fields and buttons read as native onboarding controls
 * (h-12, rounded-xl, brand-blue primary).
 * The control recipes live in `splitControl` (OnboardingSplit.tsx) and are
 * kept in sync by hand: Tailwind's scanner only sees whole class strings, so
 * Clerk's `!`-prefixed overrides are written out literally here rather than
 * interpolated from the shared map.
 */
const appearance = {
  variables: {
    colorPrimary: '#2A8CFF',
    colorText: '#0F172A',
    colorTextSecondary: '#475569',
    fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif",
  },
  elements: {
    rootBox: 'w-full',
    cardBox: 'w-full shadow-none',
    card: 'w-full bg-transparent p-0 shadow-none',
    header: 'hidden',
    // Provider choice lives in our own platform cards below — never two pickers.
    socialButtonsBlockButton: 'hidden',
    dividerLine: 'bg-slate-200',
    dividerText: 'text-sm text-slate-500',
    formFieldLabel: 'text-sm font-semibold text-slate-700',
    formFieldInput:
      '!h-12 rounded-xl border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#2A8CFF]',
    formButtonPrimary:
      'h-12 rounded-xl bg-[#2A8CFF] text-sm font-bold text-white hover:bg-[#1f7bef] shadow-none',
    footer: 'bg-transparent',
    footerAction: 'bg-transparent',
    footerPages: 'bg-transparent',
    footerActionText: 'text-sm text-slate-500',
    footerActionLink: 'font-semibold text-[#2A8CFF] hover:text-[#1f7bef]',
  },
}

const COPY = {
  'sign-in': {
    title: 'Sign In',
    subtitle: '',
  },
  'sign-up': {
    title: 'Sign Up',
    subtitle: '',
  },
} as const

/** Brand mark path data (simple-icons v16, 24×24 grid), inlined to avoid a dependency. */
const SI_GITHUB_PATH =
  'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'
const SI_GOOGLE_PATH =
  'M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z'

type OAuthProvider = {
  id: string
  label: string
  strategy: 'oauth_google' | 'oauth_github'
  icon: { path: string }
}

const OAUTH_PROVIDERS: OAuthProvider[] = [
  { id: 'google', label: 'Google', strategy: 'oauth_google', icon: { path: SI_GOOGLE_PATH } },
  { id: 'github', label: 'GitHub', strategy: 'oauth_github', icon: { path: SI_GITHUB_PATH } },
]

/**
 * The Rank-owned OAuth callback surface. Clerk's path-routed components
 * finalize at `{path}/sso-callback`, so the dashboard's allowed redirect
 * URIs are:
 *   https://<origin>/oauth/sso-callback          (sign-in flow, <SignIn path="/oauth">)
 *   https://<origin>/oauth/sign-up/sso-callback   (sign-up flow, <SignUp path="/oauth/sign-up">)
 */
export const OAUTH_BASE_PATH = '/oauth'
export const OAUTH_CALLBACK = `${OAUTH_BASE_PATH}/sso-callback`
export const OAUTH_SIGNUP_CALLBACK = `${OAUTH_BASE_PATH}/sign-up/sso-callback`

/**
 * Starts the OAuth handoff for either mode. Prefers the classic redirect flow
 * (the one Clerk's path-routed <SignIn>/<SignUp> knows how to finalize at
 * the /oauth callback) and falls back to the newer `sso()` API only when the
 * classic entry point is absent at runtime.
 */
async function startOAuth(
  resource: unknown,
  provider: OAuthProvider,
  callback: string,
  redirectTo = '/',
): Promise<void> {
  const target = resource as unknown as {
    authenticateWithRedirect?: (params: {
      strategy: OAuthProvider['strategy']
      redirectUrl: string
      redirectUrlComplete: string
    }) => Promise<unknown>
    sso?: (params: {
      strategy: OAuthProvider['strategy']
      redirectUrl: string
      redirectCallbackUrl: string
    }) => Promise<unknown>
  }
  if (typeof target.authenticateWithRedirect === 'function') {
    await target.authenticateWithRedirect({
      strategy: provider.strategy,
      redirectUrl: callback,
      redirectUrlComplete: redirectTo,
    })
    return
  }
  if (typeof target.sso === 'function') {
    await target.sso({ strategy: provider.strategy, redirectUrl: redirectTo, redirectCallbackUrl: callback })
    return
  }
  throw new Error('OAuth is not available right now — try email sign-in instead.')
}

/**
 * Provider choice as onboarding platform cards — same visual language as the
 * "Where should we listen?" step. Clicking a card starts the OAuth handoff
 * immediately (the redirect IS the action, not a form step). The email form
 * below stays rendered by Clerk, so password/username flows keep working.
 */
function OAuthCards({
  mode,
  cbasePath,
  redirectTo = '/',
}: {
  mode: 'sign-in' | 'sign-up'
  cbasePath: string
  redirectTo?: string
}) {
  const signInState = useSignIn()
  const signUpState = useSignUp()
  const toast = useToast()
  const [pending, setPending] = useState<string | null>(null)

  async function start(provider: OAuthProvider) {
    if (pending) return
    setPending(provider.id)
    try {
      // Pre-sign-up state only finalizes under the <SignUp> component that
      // owns the callback path, so the two flows use distinct callback URLs
      // (the route underneath /oauth mounts the matching component).
      const callback =
        mode === 'sign-up'
          ? cbasePath === OAUTH_BASE_PATH
            ? OAUTH_SIGNUP_CALLBACK
            : `${cbasePath}/sso-callback`
          : cbasePath === OAUTH_BASE_PATH
            ? OAUTH_CALLBACK
            : `${cbasePath}/sso-callback`
      if (mode === 'sign-in') {
        if (signInState.fetchStatus === 'fetching' || !signInState.signIn) throw new Error('Sign-in is still loading — try again in a moment.')
        await startOAuth(signInState.signIn, provider, callback, redirectTo)
      } else {
        if (signUpState.fetchStatus === 'fetching' || !signUpState.signUp) throw new Error('Sign-up is still loading — try again in a moment.')
        await startOAuth(signUpState.signUp, provider, callback, redirectTo)
      }
    } catch (err) {
      setPending(null)
      toast.error('Could not start sign-in', err instanceof Error ? err.message : 'Try again in a moment.')
    }
  }

  return (
    <div>
      <div className="mt-3 grid w-full grid-cols-1 gap-3">
        {OAUTH_PROVIDERS.map((provider) => {
          const isPending = pending === provider.id
          return (
            <button
              key={provider.id}
              type="button"
              onClick={() => start(provider)}
              disabled={pending !== null}
              className="flex min-h-12 flex-row items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 hover:border-[#2A8CFF] hover:bg-[#EFF6FF] disabled:opacity-60"
            >
              <svg viewBox="0 0 24 24" role="img" aria-label={provider.label} className="size-6 shrink-0" fill="currentColor">
                <path d={provider.icon.path} />
              </svg>
              <span className="whitespace-nowrap text-base font-bold">
                {isPending ? 'Redirecting…' : `Continue with ${provider.label}`}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * cbasePath: the Clerk path-routing base for the mounted <SignIn>/<SignUp>.
 * The entry points use their own routes ("/sign-in", "/sign-up"); the
 * callback route mounts the same component with cbasePath="/oauth" so the
 * code exchange finalizes on our own route.
 */
export function OnboardingAuth({
  mode,
  riskNotice = false,
  redirectTo = '/',
  cbasePath,
}: {
  mode: 'sign-in' | 'sign-up'
  riskNotice?: boolean
  redirectTo?: string
  cbasePath?: string
}) {
  const effectiveCbasePath = cbasePath ?? (mode === 'sign-in' ? '/sign-in' : '/sign-up')
  const copy = COPY[mode]
  return (
    <ToastProvider>
      <OnboardingSplit title={copy.title} riskNotice={riskNotice} formClassName="lk-clerk">
        <OAuthCards mode={mode} cbasePath={effectiveCbasePath} redirectTo={redirectTo} />
        {mode === 'sign-in' ? (
          <SignIn routing="path" path={effectiveCbasePath} signUpUrl="/sign-up" forceRedirectUrl={redirectTo} appearance={appearance} />
        ) : (
          <SignUp routing="path" path={effectiveCbasePath} signInUrl="/sign-in" forceRedirectUrl={redirectTo} appearance={appearance} />
        )}
      </OnboardingSplit>
    </ToastProvider>
  )
}

export function OnboardingAuthLoading({ children }: { children: string }) {
  return (
    <OnboardingShell hero={false} tone="white">
      <main className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-6 pb-16 text-center sm:px-10">
        <OnboardingLoading message={children} />
      </main>
    </OnboardingShell>
  )
}