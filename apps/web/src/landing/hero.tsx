import { FindCustomersTools } from "@/components/ui/FindCustomersTools";
import { FloatingCard } from "@/components/ui/FloatingCard";
import TextScrambler from "@/components/ui/TextScrambler";
import './hero.css'

export function Hero() {
  return (
    <section id="hero" className="hero-shell relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8f8f8]">
      <FloatingCard
        className="left-[1rem] top-[12%] hidden -rotate-8 md:block"
        floatDistance={12}
        hoverX={64}
        baseScale={0.45}
        hoverScale={0.75}
        duration={7}
      />
      <FloatingCard
        className="right-[-8rem] top-[18%] hidden rotate-8 md:block"
        floatDistance={9}
        hoverX={-64}
        hoverRotate={5}
        baseScale={0.5}
        hoverScale={0.8}
        duration={8}
        delay={0.8}
        badge="Customer signal quality"
        title="Qualified conversations"
        description="Turn the language your customers use into a focused outbound motion and keep every follow-up grounded in what they actually said."
      />
      <FloatingCard
        className="left-[2rem] bottom-[2%] hidden rotate-5 md:block"
        floatDistance={8}
        hoverX={48}
        hoverRotate={-4}
        baseScale={0.4}
        hoverScale={0.7}
        duration={6.5}
        delay={0.3}
        badge="Real-world intent"
        title="Signals with context"
        description="See what people are asking for before you decide where to go next."
      />
      <FloatingCard
        className="right-[-8rem] bottom-[-2%] hidden -rotate-6 md:block"
        floatDistance={11}
        hoverX={-48}
        hoverRotate={4}
        baseScale={0.4}
        hoverScale={0.7}
        duration={7.5}
        delay={1.1}
        badge="Outbound momentum"
        title="From insight to action"
        description="Carry every useful signal into the conversations that move your business forward."
      />
      <div className="hero-layout relative z-10">
        <TextScrambler
          className="hero-main-text"
          text={'Build links and rank\non autopilot.'}
        />
        <p className="hero-subtext-copy" data-cursor="text">
          <img
            className="hero-agent-icon"
            src="/image/inline/rank-agent.svg"
            alt=""
            aria-hidden="true"
          />
          <span>
            by ListeningKit scans the{' '}
            <img className="hero-keywords-icon" src="/image/inline/keywords.svg" alt="keywords" />{' '}
            of{' '}
            <span className="hero-handwritten-emphasis">
              you, your competitors, and what your customers (ACTUALLY) look for,
            </span>{' '}
            then tracks down the who’s who of blog shops and directories and runs outbound until you
            get a reply.
          </span>
        </p>
        <FindCustomersTools />
      </div>
    </section>
  )
}
