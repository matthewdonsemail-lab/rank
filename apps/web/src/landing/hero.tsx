import { useCallback, useRef } from "react";
import { ChainlinkBackground } from "@/components/ui/ChainlinkBackground";
import { FindCustomersTools } from "@/components/ui/FindCustomersTools";
import TextScrambler, { type TextScramblerHandle } from "@/components/ui/TextScrambler";
import './hero.css'

export function Hero() {
  const scramblerRef = useRef<TextScramblerHandle>(null);

  // Pulling the chain scrambles the headline in reading order: the further it is
  // stretched, the more of the leading letters flip. Letting go clears it.
  const handleChainPull = useCallback((progress: number) => {
    if (progress <= 0) {
      scramblerRef.current?.clearScramble();
    } else {
      scramblerRef.current?.scrambleProgress(progress);
    }
  }, []);

  return (
    // No overflow clipping here. The scrambling headline scales up past its own
    // box, and a section-level clip trimmed the enlarged letters and their
    // outlines. The chain canvas brings its own clipping — its wrapper is
    // absolute inset-0 overflow-hidden — so nothing else relied on this.
    <section id="hero" className="hero-shell relative flex min-h-screen items-center justify-center bg-[#f8f8f8]">
      <ChainlinkBackground onPull={handleChainPull} />
      <div className="hero-layout relative z-10">
        <TextScrambler
          ref={scramblerRef}
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
