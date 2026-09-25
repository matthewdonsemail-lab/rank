import { FindCustomersTools } from "@/components/ui/FindCustomersTools";
import TextScrambler from "@/components/ui/TextScrambler";
import './hero.css'

export function Hero() {
  return (
    <section id="hero" className="hero-shell relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8f8f8]">
      <div className="hero-layout relative z-10">
        <TextScrambler
          className="hero-main-text"
          text={'Build links and rank\non autopilot.'}
        />
        <div className="flex flex-col items-center gap-8">
          <FindCustomersTools />
          <p className="max-w-md text-center text-lg font-medium leading-relaxed text-[#1A1A19]/60">
            Enter your website and we'll make your website rank in no time.
          </p>
        </div>
      </div>
    </section>
  )
}
