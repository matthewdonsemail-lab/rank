import { LoaderCircle } from 'lucide-react'

const TONES = {
  /** White pages (auth screens, dashboard sheets): blue spinner, slate message. */
  light: { spin: 'text-[#2A8CFF]', text: 'text-slate-600' },
  /** Brand-blue pages (onboarding steps): all white. */
  dark: { spin: 'text-white', text: 'text-white' },
} as const

export type OnboardingLoadingTone = keyof typeof TONES

/**
 * The one loading state for X → Y transitions app-wide — one component, two
 * tones. Route boots, step changes and full-area form waits render this;
 * inline micro-states (table cells, dashed boxes, skeletons, in-button
 * spinners) keep their small primitives.
 * Single role=status node so screen readers announce the message once.
 */
export function OnboardingLoading({
  message,
  tone = 'light',
}: {
  message: string
  tone?: OnboardingLoadingTone
}) {
  const t = TONES[tone]
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center"
    >
      <LoaderCircle size={32} strokeWidth={2.25} aria-hidden="true" className={`animate-spin ${t.spin}`} />
      <p className={t.text}>{message}</p>
    </div>
  )
}