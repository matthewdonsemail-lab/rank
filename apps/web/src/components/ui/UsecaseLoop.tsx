import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { motion } from 'motion/react'
import { cn } from '@listeningkit/ui'
import { USECASE_EAR_SETS, USECASE_SLIDES, UsecasePhoneFilm } from './Usecase'
import './Usecase.css'

/** Fallback step length until a clip's own duration loads. */
const FALLBACK_S = 6
const TICK_MS = 250
/** How long the duplicate first slide shows before the invisible snap back. */
const WRAP_HOLD_MS = 650

/**
 * Auto-looping visual twin of the landing use-case panel for the auth
 * pages. Ears, grid and the phone film only — no copy column. Each
 * step lasts exactly as long as its own webm (the visible clip restarts on
 * activation, the rest stay paused). Wrapping 4 → 1 scrolls forward into a
 * duplicate first slide and snap-cuts to the real one on the identical
 * frame, so the loop never rewinds. The top bars fill over the same
 * per-clip duration, staying in time with the video. Pauses on hover/focus,
 * stays static under prefers-reduced-motion.
 */
export function UsecaseLoop() {
  // position 0..3 = steps 1..4, position 4 = duplicate of step 1.
  const [position, setPosition] = useState(0)
  const [snap, setSnap] = useState(false)
  const [cycle, setCycle] = useState(0)
  const [paused, setPaused] = useState(false)
  const [durations, setDurations] = useState<Record<number, number>>({})
  const [reduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const pausedRef = useRef(false)
  const clipsRef = useRef<(HTMLVideoElement | null)[]>([])
  const startRef = useRef(0)
  const durationsRef = useRef<Record<number, number>>({})

  const step = position % USECASE_SLIDES.length

  function handleClipDuration(index: number, seconds: number) {
    if (!Number.isFinite(seconds) || seconds <= 0) return
    durationsRef.current[index] = seconds
    setDurations((prev) => (prev[index] === seconds ? prev : { ...prev, [index]: seconds }))
  }

  // Re-arm smooth transitions right after a snap cut commits.
  useEffect(() => {
    if (!snap) return
    const t = window.setTimeout(() => setSnap(false), 60)
    return () => window.clearTimeout(t)
  }, [snap])

  useEffect(() => {
    const clips = clipsRef.current
    if (reduced) {
      clips.forEach((clip) => clip?.pause())
      return
    }
    clips.forEach((clip, index) => {
      if (!clip) return
      if (index === position) {
        clip.currentTime = 0
        clip.play().catch(() => {})
      } else {
        clip.pause()
      }
    })
    const waitMs =
      position === USECASE_SLIDES.length ? WRAP_HOLD_MS : (durationsRef.current[position] ?? FALLBACK_S) * 1000
    startRef.current = Date.now()
    const id = window.setInterval(() => {
      const el = clipsRef.current[position]
      if (pausedRef.current) {
        el?.pause()
        startRef.current += TICK_MS
        return
      }
      if (!el) return
      if ((position !== USECASE_SLIDES.length && el.ended) || Date.now() - startRef.current >= waitMs) {
        if (position === USECASE_SLIDES.length) {
          // Landed on the duplicate: cut invisibly to the real first slide.
          setSnap(true)
          setPosition(0)
          setCycle((prev) => prev + 1)
        } else {
          setPosition(position + 1)
          // 3 → 4 mounts bar 0 fresh on its own; every other advance
          // remounts the newly visible bar so its fill restarts.
          if (position !== USECASE_SLIDES.length - 1) setCycle((prev) => prev + 1)
        }
        return
      }
      if (el.paused) el.play().catch(() => {})
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [position, reduced])

  function setHoverPause(next: boolean) {
    pausedRef.current = next
    setPaused(next)
  }

  const activeMs = (durations[step] ?? FALLBACK_S) * 1000

  return (
    <section
      aria-label="How Rank works"
      onMouseEnter={() => setHoverPause(true)}
      onMouseLeave={() => setHoverPause(false)}
      onFocus={() => setHoverPause(true)}
      onBlur={() => setHoverPause(false)}
      className={cn(
        'relative mx-auto flex min-h-[32rem] w-full flex-1 flex-col items-center justify-center rounded-[2rem] border-2 border-[#2A8CFF] bg-white',
        paused && 'lk-loop-paused',
      )}
      style={{ backgroundColor: 'rgba(42, 140, 255, 0.09)' }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[2rem]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            // Centre lines only (thirds) — nothing on the edges, so the grid
            // never doubles up with the panel's outer border.
            backgroundImage: [
              'linear-gradient(to right, transparent calc(100% / 3 - 1px), rgba(42,140,255,1) calc(100% / 3 - 1px), rgba(42,140,255,1) calc(100% / 3 + 1px), transparent calc(100% / 3 + 1px))',
              'linear-gradient(to right, transparent calc(100% * 2 / 3 - 1px), rgba(42,140,255,1) calc(100% * 2 / 3 - 1px), rgba(42,140,255,1) calc(100% * 2 / 3 + 1px), transparent calc(100% * 2 / 3 + 1px))',
              'linear-gradient(to bottom, transparent calc(100% / 3 - 1px), rgba(42,140,255,1) calc(100% / 3 - 1px), rgba(42,140,255,1) calc(100% / 3 + 1px), transparent calc(100% / 3 + 1px))',
              'linear-gradient(to bottom, transparent calc(100% * 2 / 3 - 1px), rgba(42,140,255,1) calc(100% * 2 / 3 - 1px), rgba(42,140,255,1) calc(100% * 2 / 3 + 1px), transparent calc(100% * 2 / 3 + 1px))',
            ].join(', '),
          }}
        />
      </div>
      <div className="absolute left-1/2 top-6 z-[4] flex -translate-x-1/2 items-center gap-2">
          {USECASE_SLIDES.map((slide, i) => (
            <span key={slide.title} className="h-2 w-10 overflow-hidden rounded-full bg-ink/15">
              {i < step || (reduced && i === step) ? (
              <span className="block h-full w-full rounded-full bg-[#2A8CFF]" />
              ) : i === step ? (
              <span
                key={cycle}
                className="lk-loop-fill block h-full rounded-full bg-[#2A8CFF]"
                style={{ '--lk-loop-ms': `${activeMs}ms` } as CSSProperties}
              />
            ) : (
              <span className="block h-full w-0 rounded-full bg-[#2A8CFF]" />
            )}
          </span>
        ))}
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[3] hidden md:block">
        {USECASE_EAR_SETS[step].map((ear, index) => (
          <motion.img
            key={`${step}-${ear.src}`}
            src={ear.src}
            alt=""
            className={`absolute object-contain ${ear.className}`}
            style={{
              y: -step * (8 + index * 4),
              filter: ear.filter,
            }}
            initial={{ scale: 0 }}
            whileInView={{ scale: [0, 1.12, 0.97, 1] }}
            viewport={{ once: true, amount: 0.2 }}
            animate={
              ear.jitter
                ? {
                    x: [0, -5, 4, -4, 5, -2, 4, -3, 0],
                    y: [0, 4, -5, 3, -4, 5, -2, 3, 0],
                    rotate: [ear.rotate, ear.rotate - 7, ear.rotate + 8, ear.rotate - 6, ear.rotate + 5, ear.rotate],
                  }
                : { rotate: [ear.rotate, -ear.rotate, ear.rotate] }
            }
            transition={
              ear.jitter
                ? {
                    x: { duration: 0.24, repeat: Infinity, ease: 'easeInOut' },
                    y: { duration: 0.21, repeat: Infinity, ease: 'easeInOut' },
                    rotate: { duration: 0.26, repeat: Infinity, ease: 'easeInOut' },
                    scale: { duration: 0.65, delay: index * 0.12, ease: [0.34, 1.56, 0.64, 1] },
                  }
                : {
                    rotate: { duration: 4 + index, repeat: Infinity, ease: 'easeInOut' },
                    scale: { duration: 0.65, delay: index * 0.12, ease: [0.34, 1.56, 0.64, 1] },
                  }
            }
          />
        ))}
      </div>
      <div className="relative z-[2] min-h-[24rem] w-full flex-1 overflow-hidden">
        <UsecasePhoneFilm
          active={position}
          seamless
          snap={snap}
          frameClassName="flex w-full shrink-0 items-center justify-center"
          mediaClassName="mx-auto aspect-[9/16] h-full max-h-[70%] w-auto max-w-full object-cover"
          loopClips={false}
          clipRef={(index, el) => {
            clipsRef.current[index] = el
          }}
          onClipDuration={handleClipDuration}
        />
      </div>
    </section>
  )
}