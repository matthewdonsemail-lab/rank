import { useEffect, useRef, useState } from "react";
import { SquircleFrame } from "@/components/ui/SquircleFrame";

/**
 * iMessage leads on blue and SMS on green, which is the inverse of the platform
 * mark colours. The card gradients are drawn from Rank's existing blue (#2A8CFF
 * family) and the iMessage green (#34DA50 family), and each card carries a light
 * inner vignette.
 */
const IMESSAGE_GRADIENT = "linear-gradient(145deg, #5AA9FF 0%, #2A8CFF 46%, #0B4FB0 100%)";
const SMS_GRADIENT = "linear-gradient(145deg, #5DE86F 0%, #34DA50 46%, #16A34A 100%)";
const VIGNETTE = "inset 0 0 60px rgba(255, 255, 255, 0.26)";
const PLATFORM_COUNT = 4;

function useCountUp(target: number, durationMs = 1400) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }

    let frame = 0;
    let startedAt: number | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();

        const step = (now: number) => {
          if (startedAt === null) startedAt = now;
          const progress = Math.min(1, (now - startedAt) / durationMs);
          const eased = 1 - Math.pow(1 - progress, 3);
          setValue(Math.round(target * eased));
          if (progress < 1) frame = requestAnimationFrame(step);
        };

        frame = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target, durationMs]);

  return { ref, value };
}

function PlatformCard({ label, gradient }: { label: string; gradient: string }) {
  return (
    <SquircleFrame
      cornerRadius={32}
      className="flex min-h-44 flex-col justify-center px-7 py-8 text-white transition-transform duration-300 hover:scale-[1.01] sm:min-h-48 md:px-11 md:py-10"
      style={{ backgroundImage: gradient, boxShadow: VIGNETTE }}
    >
      <p className="text-base font-bold text-white/85 sm:text-lg lg:text-xl">try Rank out on</p>
      <p className="mt-1 text-5xl font-black leading-[0.95] sm:text-6xl lg:text-7xl">{label}</p>
    </SquircleFrame>
  );
}

/**
 * Messaging platforms Rank can be tried on, shown beneath the hero.
 *
 * Two squircle cards lead, each on its own gradient, and a lighter third cell
 * counts up the integrations rather than repeating another card.
 */
export function MessagingPlatform() {
  const { ref, value } = useCountUp(PLATFORM_COUNT);

  return (
    <section
      id="platforms"
      aria-label="Messaging platforms"
      className="px-6 pb-16 pt-6 sm:px-10 sm:pb-24 sm:pt-8"
    >
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
        <PlatformCard label="imessage." gradient={IMESSAGE_GRADIENT} />
        <PlatformCard label="sms." gradient={SMS_GRADIENT} />

        <div className="flex min-h-32 items-center justify-center sm:min-h-40">
          <p
            className="max-w-sm text-left text-2xl leading-snug text-slate-600 sm:text-3xl"
            style={{ fontFamily: "'Schoolbell', 'Cabin Sketch', cursive" }}
          >
            check out our integrations with{" "}
            <span ref={ref} className="whitespace-nowrap text-slate-500">
              {value}+
            </span>{" "}
            different platforms
          </p>
        </div>
      </div>
    </section>
  );
}
