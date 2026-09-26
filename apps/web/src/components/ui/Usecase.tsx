import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Button, cn, useSquircleClip } from '@listeningkit/ui'
import { LazyVideo } from './LazyVideo'
import './Usecase.css'

export type UsecaseSlide = {
  title: string
  body: string
}

/** The four steps, shared with the auto-looping showcase on the auth pages. */
export const USECASE_SLIDES: UsecaseSlide[] = [
  {
    title: 'Spot the emergency the second it’s posted',
    body: 'Real posts stream in — “leak in my toilet”, “pipe burst”, “any good plumbers in Dallas?” — each one matched by keyword, each one answered with auto-reply to all brand mentions.',
  },
  {
    title: 'The AI bins the junk, keeps the jobs',
    body: 'It semantically analyses what’s actually being said — a joke about “kidney pie” is noise, while a genuine “leak in my toilet” signals intent. The noise is filtered out so only real customers reach you.',
  },
  {
    title: 'From first message to paid in one chat',
    body: 'The conversation runs itself — “we can get out in the next 1-2 hours”, a Stripe link takes the card payment, the address lands, “thank you, excellent”. Quote to cash without lifting a finger.',
  },
  {
    title: 'Let AI manage hundreds of conversations at once',
    body: 'Keep “every chat” moving without losing the human thread — let AI handle the “follow-ups”, surface the “deals that matter”, and help you close more of them.',
  },
]

export const USECASE_HIRE_NOTES = [
  'also if you want a high-converting website that captures emergency leads the second they post, you should hire us',
  'also if you want a really smooth CRM that bins the tire-kickers and sends only real jobs to your calendar, you should hire us',
  'also if you want a high-converting checkout flow and automated payment funnels for your business, you should hire us',
  'also if you want a really smooth CRM and automated pipeline that manages hundreds of deals without breaking a sweat, you should hire us',
]

export type EarSpec = {
  src: string
  className: string
  rotate: number
  filter?: string
  jitter?: boolean
}

export const USECASE_EAR_SETS: EarSpec[][] = [
  [
    { src: '/images/ears/ear1.webp', className: 'left-[-4%] top-[8%] size-64', rotate: -3, filter: 'hue-rotate(190deg) saturate(2.2) brightness(1.05)', jitter: true },
    { src: '/images/ears/ear4.webp', className: 'right-[-3%] top-[34%] size-80', rotate: 2, filter: 'hue-rotate(280deg) saturate(1.8) contrast(1.15)' },
    { src: '/images/ears/ear7.webp', className: 'left-[4%] bottom-[4%] size-72', rotate: -2, filter: 'hue-rotate(90deg) saturate(2) brightness(1.1)' },
  ],
  [
    { src: '/images/ears/ear2.webp', className: 'right-[-4%] top-[6%] size-72', rotate: 2, filter: 'hue-rotate(325deg) saturate(2.4) brightness(1.1)' },
    { src: '/images/ears/ear5.webp', className: 'left-[-4%] top-[40%] size-96', rotate: -3, filter: 'hue-rotate(175deg) saturate(2.1) contrast(1.1)', jitter: true },
    { src: '/images/ears/ear8.webp', className: 'right-[4%] bottom-[3%] size-64', rotate: 3, filter: 'hue-rotate(45deg) saturate(2.2) brightness(1.05)' },
  ],
  [
    { src: '/images/ears/ear3.webp', className: 'left-[-2%] top-[4%] size-80', rotate: -2, filter: 'hue-rotate(140deg) saturate(1.9) brightness(1.1)' },
    { src: '/images/ears/ear6.webp', className: 'right-[-5%] top-[38%] size-64', rotate: 3, filter: 'hue-rotate(215deg) saturate(2.5) contrast(1.2)', jitter: true },
    { src: '/images/ears/ear1.webp', className: 'left-[6%] bottom-[2%] size-96', rotate: -3, filter: 'hue-rotate(300deg) saturate(1.8) brightness(1.05)' },
  ],
  [
    { src: '/images/ears/ear4.webp', className: 'right-[-4%] top-[2%] size-96', rotate: 3, filter: 'hue-rotate(200deg) saturate(2.2) brightness(1.1)', jitter: true },
    { src: '/images/ears/ear7.webp', className: 'left-[-5%] top-[36%] size-72', rotate: -2, filter: 'hue-rotate(75deg) saturate(1.9) contrast(1.1)' },
    { src: '/images/ears/ear2.webp', className: 'right-[5%] bottom-[1%] size-80', rotate: 2, filter: 'hue-rotate(160deg) saturate(2.2) brightness(1.1)' },
  ],
]

/**
 * Steps render wordmark SVGs inline: emergency.svg in step 1, jobs.svg in
 * step 2, paid.svg where the title says "paid", hoondreds.svg where it says
 * "hundreds".
 */
export function SlideTitle({ index, title, className }: { index: number; title: string; className: string }) {
  if (index === 0)
    return (
      <h2 className={className}>
        Spot the{' '}
        <img src="/logos/emergency.svg" alt="emergency" className="inline h-[0.9em] w-auto" />{' '}
        the second it’s posted
      </h2>
    )
  if (index === 1)
    return (
      <h2 className={className}>
        The AI bins the junk, keeps the{' '}
        <img src="/logos/jobs.svg" alt="jobs" className="inline h-[0.9em] w-auto" />
      </h2>
    )
  if (index === 2)
    return (
      <h2 className={className}>
        From first message to{' '}
        <img src="/logos/paid.svg" alt="paid" className="inline h-[0.9em] w-auto" />{' '}
        in one chat
      </h2>
    )
  if (index === 3)
    return (
      <h2 className={className}>
        Let AI manage{' '}
        <img src="/logos/hoondreds.svg" alt="hundreds" className="inline h-[0.9em] w-auto" />{' '}
        of conversations at once
      </h2>
    )
  return <h2 className={className}>{title}</h2>
}

/**
 * Video slide marker shown above the copy on each left-side slide.
 * Plays `/video/usecase/<n>.webm` inside the blue squircle with a faint
 * white vignette; falls back to the number badge until that clip lands.
 */
export function SlideMarker({ index }: { index: number }) {
  const clip = useSquircleClip<HTMLDivElement>(18)
  const [missing, setMissing] = useState(false)
  if (missing) {
    return (
      <div
        ref={clip.ref}
        style={clip.style}
        aria-hidden
        className="mx-auto mb-6 flex size-14 items-center justify-center bg-[#2A8CFF] text-xl font-black text-white"
      >
        {index + 1}
      </div>
    )
  }
  return (
    <div
      ref={clip.ref}
      style={clip.style}
      aria-hidden
      className="relative mx-auto mb-6 size-14 overflow-hidden bg-[#2A8CFF]"
    >
      <LazyVideo
        src={`/video/usecase/${index + 1}.webm`}
        autoPlay
        muted
        loop
        playsInline
        onError={() => setMissing(true)}
        className="size-full object-cover"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(255,255,255,0.55) 100%)' }}
      />
    </div>
  )
}

export function renderUsecaseBody(body: string) {
  return body.split(/(“[^”]*”)/g).map((part, index) =>
    /^“[^”]*”$/.test(part) ? (
      <span key={index} className="font-black text-[#2A8CFF] underline decoration-dashed underline-offset-4">
        {part}
      </span>
    ) : (
      <span key={index}>{part}</span>
    ),
  )
}

export function UsecaseHireLink({ index, className }: { index: number; className?: string }) {
  const note = USECASE_HIRE_NOTES[index]
  if (!note) return null
  return (
    <div className={cn('mt-7 flex items-end justify-center gap-3 sm:gap-4', className)}>
      <img
        src="/images/mattlistening.webp"
        alt="Matthew"
        className="size-12 shrink-0 rounded-xl border-2 border-[#2A8CFF] object-cover shadow-sm sm:size-14 md:size-16"
      />
      <a
        href="https://x.com/matthewsoldit"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative max-w-lg rounded-2xl rounded-bl-sm bg-[#f2f1f3] px-4 py-2.5 text-left text-sm text-slate-600 shadow-sm transition-all hover:scale-[1.02] hover:bg-[#eae8eb] hover:text-[#2A8CFF] sm:px-5 sm:py-3.5 sm:text-base"
        style={{ fontFamily: "'Schoolbell', 'Cabin Sketch', cursive" }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-2 bottom-3 h-0 w-0 border-y-[6px] border-r-[8px] border-y-transparent border-r-[#f2f1f3] transition-colors group-hover:border-r-[#eae8eb]"
        />
        ({note}{' '}
        <span className="font-bold text-[#2A8CFF] underline decoration-wavy underline-offset-4">
          message matthew on X
        </span>
        )
      </a>
    </div>
  )
}

/** One phone clip per step, in slide order. */
export const USECASE_PHONE_CLIPS = [
  '/video/Facebook1.webm',
  '/video/Facebook2.webm',
  '/video/Facebook3.webm',
  '/video/Facebook4.webm',
]

/**
 * Vertical phone filmstrip shared by the scroll-driven landing section and
 * the auto-looping auth showcase. The strip translates so the active step's
 * clip is framed; frame sizing besides height comes from the caller.
 * The loop showcase additionally opts out of clip looping, collects each
 * webm's duration (via clipRef / onClipDuration) so a step lasts exactly as
 * long as its own clip, and passes seamless so the strip carries a
 * duplicate first slide at the end — the loop scrolls forward into it and
 * snap-cuts back to the real first slide on the identical frame instead of
 * rewinding through the whole strip.
 */
export function UsecasePhoneFilm({
  active,
  frameClassName,
  mediaClassName,
  loopClips = true,
  seamless = false,
  snap = false,
  clipRef,
  onClipDuration,
}: {
  active: number
  frameClassName: string
  mediaClassName: string
  loopClips?: boolean
  seamless?: boolean
  snap?: boolean
  clipRef?: (index: number, el: HTMLVideoElement | null) => void
  onClipDuration?: (index: number, durationSeconds: number) => void
}) {
  const clips = seamless ? [...USECASE_PHONE_CLIPS, USECASE_PHONE_CLIPS[0]] : USECASE_PHONE_CLIPS
  return (
    <motion.div
      animate={{ y: `${-active * (seamless ? 20 : 25)}%` }}
      transition={{ duration: snap ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`flex w-full flex-col ${seamless ? 'h-[500%]' : 'h-[400%]'}`}
    >
      {clips.map((src, index) => (
        <div key={`${src}-${index}`} className={cn(frameClassName, seamless ? 'h-1/5' : 'h-1/4')}>
          <LazyVideo
            videoRef={(el) => clipRef?.(index, el)}
            src={src}
            autoPlay
            muted
            loop={loopClips}
            playsInline
            // "metadata" gives the slider each clip's length without downloading all four clips (about 5.7 MB) up front,
            // for every visitor, including the many who never scroll this far. The clip plays and streams when it is shown.
            preload="metadata"
            onLoadedMetadata={(event) => onClipDuration?.(index, event.currentTarget.duration)}
            className={mediaClassName}
          />
        </div>
      ))}
    </motion.div>
  )
}

/**
 * Scroll-driven use-case section. A tall track pins a full-viewport
 * two-column grid while the page scrolls: copy crossfades on the left,
 * visuals crossfade on the right, one slide per quarter of the track.
 */
export function Usecase() {
  const trackRef = useRef<HTMLElement | null>(null)
  const [active, setActive] = useState(0)
  const [fill, setFill] = useState(0)
  const [enter, setEnter] = useState(0)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const el = trackRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const total = Math.max(1, rect.height - window.innerHeight)
      const progress = Math.min(1, Math.max(0, -rect.top / total))
      // 0 as the track first enters the viewport, 1 once pinned.
      const entered = Math.min(1, Math.max(0, 1 - rect.top / window.innerHeight))
      setEnter((prev) => (Math.abs(prev - entered) < 0.001 ? prev : entered))
      setActive((prev) => {
        // Keep a full quarter of the scroll track for each visual card.
        // Rounding at the midpoint makes each card take over predictably.
        const next = Math.min(USECASE_SLIDES.length - 1, Math.floor(progress * USECASE_SLIDES.length + 0.5))
        return prev === next ? prev : next
      })
      setFill((prev) => {
        const next = progress * USECASE_SLIDES.length
        return Math.abs(prev - next) < 0.001 ? prev : next
      })
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <>
      <section ref={trackRef} id="use-cases" className="relative hidden overflow-x-clip bg-white md:block" style={{ height: 'calc(100vh + 4800px)' }}>
        <div className="h-full w-full">
          <div className="sticky left-0 top-0 grid h-screen w-full grid-cols-2">
            <div className="flex h-screen w-full justify-center">
              <div className="relative mx-6 flex h-full w-full max-w-3xl justify-center text-center">
                <div className="absolute left-1/2 top-[9.8rem] flex -translate-x-1/2 items-center gap-2">
                  {USECASE_SLIDES.map((slide, i) => {
                    const barFill = Math.min(1, Math.max(0, fill - i))
                    return (
                      <span key={slide.title} className="h-2 w-10 overflow-hidden rounded-full bg-ink/15">
                        <motion.span
                          className="block h-full rounded-full bg-[#2A8CFF]"
                          animate={{ width: `${Math.round(barFill * 100)}%` }}
                          transition={{ ease: 'linear', duration: 0.1 }}
                        />
                      </span>
                    )
                  })}
                </div>
                {USECASE_SLIDES.map((slide, i) => (
                  <div
                    key={`${slide.title}-${i === active ? 'on' : 'off'}`}
                    aria-hidden={i !== active}
                    className={cn(
                      'lk-usecase-stage absolute inset-0 flex items-center justify-center transition-opacity duration-700',
                      i === active ? 'opacity-100' : 'pointer-events-none opacity-0',
                    )}
                  >
                    <div className={cn('w-full text-center text-balance', i === active && 'lk-flip-in')}>
                      <SlideMarker index={i} />
                      <SlideTitle index={i} title={slide.title} className="text-5xl font-black leading-tight text-ink" />
                      <p className="mx-auto mt-6 max-w-xl text-xl leading-snug text-ink/70">{renderUsecaseBody(slide.body)}</p>
                      <UsecaseHireLink index={i} className="mx-auto mt-5 max-w-xl text-center" />
                    </div>
                  </div>
                ))}
                <div className="absolute inset-x-0 bottom-8 z-[1]">
                  <Button
                    variant="blue"
                    asChild
                    className="w-full whitespace-nowrap rounded-xl px-8 py-5 text-xl font-bold uppercase"
                  >
                    <Link to="/onboarding" className="inline-block w-full text-center">
                      Get started
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            <div
              className="relative flex h-screen w-full items-center justify-center bg-white px-10"
              style={{ backgroundColor: `rgba(42, 140, 255, ${(enter * 0.09).toFixed(3)})` }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-[1]"
                style={{
                  backgroundImage: `linear-gradient(to right, rgba(42,140,255,${enter.toFixed(3)}) 2px, transparent 2px), linear-gradient(to bottom, rgba(42,140,255,${enter.toFixed(3)}) 2px, transparent 2px)`,
                  backgroundSize: 'calc(100% / 3) calc(100% / 3)',
                  maskImage: `linear-gradient(to top, black ${(enter * 100).toFixed(1)}%, transparent ${Math.min(100, enter * 100 + 15).toFixed(1)}%)`,
                  WebkitMaskImage: `linear-gradient(to top, black ${(enter * 100).toFixed(1)}%, transparent ${Math.min(100, enter * 100 + 15).toFixed(1)}%)`,
                }}
              />
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[3] hidden md:block">
                {USECASE_EAR_SETS[active].map((ear, index) => (
                  <motion.img
                    key={`${active}-${ear.src}`}
                    src={ear.src}
                    alt=""
                    className={`absolute object-contain ${ear.className}`}
                    style={{
                      y: -fill * (8 + index * 4),
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
              <div className="relative z-[2] h-screen w-full overflow-hidden">
                <UsecasePhoneFilm
                  active={active}
                  frameClassName="flex w-full shrink-0 items-center justify-center pt-[9.2rem]"
                  mediaClassName="mx-auto aspect-[9/16] h-[80vh] max-h-[80vh] w-auto max-w-[80%] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full bg-white md:hidden">
        <div className="mx-auto flex w-full max-w-7xl flex-col px-6 py-16">
          {USECASE_SLIDES.map((slide, i) => (
            <div key={slide.title} className="border-t border-black/10 py-10 first:border-t-0 first:pt-0">
              <SlideTitle index={i} title={slide.title} className="text-3xl font-black leading-tight text-ink" />
              <p className="mt-3 text-base leading-snug text-ink/70">{renderUsecaseBody(slide.body)}</p>
              <UsecaseHireLink index={i} className="mt-4 text-left" />
            </div>
          ))}
          <Button
            variant="blue"
            asChild
            className="mt-4 w-full rounded-full px-8 py-4 text-sm font-bold uppercase"
          >
            <Link to="/onboarding" className="inline-block w-full text-center">
              Get started
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}