import { useState } from 'react'
import { FindCustomersTools } from '@/components/ui/FindCustomersTools'
import TextScrambler from '@/components/ui/TextScrambler'
import { useRun } from '@/run/RunProvider'
import './hero.css'

export function Hero() {
  const run = useRun()
  const [notice, setNotice] = useState<string | null>(null)
  const busy = run.state.phase === 'running'

  return (
    <section id="hero" className="hero-shell relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8f8f8]">
      <div className="hero-layout relative z-10">
        <TextScrambler
          className="hero-main-text"
          text={'Find the sites that\nshould link to you.'}
        />
        <div className="flex flex-col items-center gap-8">
          <FindCustomersTools
            busy={busy}
            onSubmit={(value) => {
              setNotice(run.configured ? null : 'Live runs are not switched on for this deployment yet.')
              if (run.configured) run.start(value)
            }}
          />
          <p className="max-w-md text-center text-lg font-medium leading-relaxed text-[#1A1A19]/60">
            Type your website. We read it, find your competitors, rank the sites around them, and show which are worth pitching.
          </p>
          {notice ? (
            <p role="status" className="max-w-md text-center text-base font-bold text-[#1A1A19]">
              {notice}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
