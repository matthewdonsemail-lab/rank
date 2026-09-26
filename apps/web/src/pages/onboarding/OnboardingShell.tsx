import type { ReactNode } from 'react'

/**
 * Shared onboarding shell: the Rank mark centered on the brand backdrop,
 * above every screen's content, so the sign-in, sign-up, OAuth callback and
 * loading states all open identically — no per-screen header copies.
 */
export function OnboardingHero() {
  return (
    <div className="w-full shrink-0">
      <div
        className="flex flex-col items-center px-6 py-10 text-center sm:py-12"
        style={{ background: 'radial-gradient(ellipse at center, #2a8cff 45%, transparent 78%)' }}
      >
        <img src="/logo.svg" alt="Rank logo" className="size-16 shrink-0 rounded-[18px] object-contain sm:size-20" />
        <p className="mt-4 text-2xl font-black leading-tight sm:text-3xl">Rank</p>
        <p className="mt-1 text-base leading-snug text-white/80 sm:text-lg">Live social listening</p>
      </div>
    </div>
  )
}

export function OnboardingShell({
  children,
  hero = true,
  tone = 'blue',
}: {
  children: ReactNode
  hero?: boolean
  tone?: 'blue' | 'white'
}) {
  const white = tone === 'white'
  return (
    <div
      className={`relative flex min-h-screen flex-col overflow-x-clip ${white ? 'text-slate-900' : 'text-white'}`}
      style={{ backgroundColor: white ? '#ffffff' : '#2a8cff', fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" }}
    >
      <div className="relative z-10 flex min-h-screen flex-1 flex-col">
        {hero ? <OnboardingHero /> : null}
        {children}
      </div>
    </div>
  )
}