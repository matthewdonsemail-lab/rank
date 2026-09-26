import type { ReactNode } from 'react'
import { UsecaseLoop } from '@/components/ui/UsecaseLoop'
import { OnboardingShell } from './OnboardingShell'

/**
 * The two-panel auth surface every credential screen opens on: brand mark,
 * headline, form column, and the pinned UsecaseLoop showcase. Sign-in,
 * sign-up, and the CLI authorization screen all mount this, so they cannot
 * drift apart — the CLI screen swaps Clerk's card for our own controls but
 * inherits the identical chrome, column width, and control recipes.
 */

/**
 * Control recipes, shared so native controls and Clerk's `appearance` object
 * resolve to the same class strings. Clerk styles its own markup, so its
 * entries below are the appearance-map values verbatim; the native entries
 * add only the flex centering a real <button> needs to match Clerk's label
 * placement.
 */
export const splitControl = {
  label: 'text-sm font-semibold text-slate-700',
  input:
    'h-12 w-full rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#2A8CFF]',
  primary:
    'flex h-12 w-full items-center justify-center rounded-xl bg-[#2A8CFF] text-sm font-bold text-white shadow-none transition hover:bg-[#1f7bef]',
  secondary:
    'flex h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 text-base font-bold text-slate-900 transition hover:border-[#2A8CFF] hover:bg-[#EFF6FF] disabled:opacity-60',
  note: 'text-sm leading-relaxed text-slate-500',
  code: 'font-semibold text-slate-700',
  dividerLine: 'bg-slate-200',
  dividerText: 'text-sm text-slate-500',
  actionText: 'text-sm text-slate-500',
  actionLink: 'font-semibold text-[#2A8CFF] hover:text-[#1f7bef]',
  backLink:
    'mt-6 inline-block text-sm font-semibold text-slate-500 underline decoration-dashed underline-offset-4 hover:text-slate-800',
} as const

/** Status/notice box, shared by the CLI screen's progress and failure copy. */
export function SplitNotice({
  tone,
  title,
  children,
}: {
  tone: 'info' | 'success' | 'error'
  title?: string
  children: ReactNode
}) {
  const tones = {
    info: 'border-slate-200 bg-slate-50 text-slate-600',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    error: 'border-amber-200 bg-amber-50 text-amber-900',
  } as const
  return (
    <div className={`w-full rounded-2xl border p-4 text-left text-sm ${tones[tone]}`} role="note">
      {title ? <p className="font-bold">{title}</p> : null}
      {children}
    </div>
  )
}

export function OnboardingSplit({
  title,
  subtitle = '',
  riskNotice = false,
  formClassName = '',
  children,
}: {
  title: string
  subtitle?: string
  riskNotice?: boolean
  /** Extra classes for the form column — Clerk's screens pass "lk-clerk". */
  formClassName?: string
  children: ReactNode
}) {
  return (
    <OnboardingShell hero={false} tone="white">
      <main className="relative flex w-full flex-1 flex-col">
        <div className="grid w-full flex-1 items-stretch text-left lg:grid-cols-2">
          <div className="bg-white p-8 lg:p-32">
            <div className="mx-auto w-full max-w-xs text-center">
              <a href="/" aria-label="Rank home" className="mb-6 inline-block">
                <img src="/logo.svg" alt="Rank" className="size-14 rounded-[14px] object-contain" />
              </a>
              <h1 className="text-xl font-bold leading-tight text-slate-900 sm:text-2xl">{title}</h1>
              {subtitle ? <p className="mt-4 text-lg text-slate-600">{subtitle}</p> : null}
              {riskNotice && (
                <div className="mt-6 w-full rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-900" role="note">
                  <p className="font-bold">You are connecting your account</p>
                  <p className="mt-1 text-amber-800">
                    Rank will use your account to connect the services you choose. Only continue on a computer you trust.
                    If your computer is compromised, saved sessions and connected accounts may be at risk.
                  </p>
                </div>
              )}
              <div className={`mt-6 text-left ${formClassName}`}>{children}</div>
              <a href="/" className={splitControl.backLink}>
                Back to Rank
              </a>
            </div>
          </div>
          {/* Pinned to the viewport on desktop: the showcase is always
              exactly full height, never stretched by the form's height and
              never collapsed. The form half scrolls beside it. */}
          <div className="flex flex-col justify-center bg-white p-8 lg:sticky lg:top-0 lg:h-screen">
            <div className="flex min-h-0 flex-1 flex-col">
              <UsecaseLoop />
            </div>
          </div>
        </div>
      </main>
    </OnboardingShell>
  )
}
