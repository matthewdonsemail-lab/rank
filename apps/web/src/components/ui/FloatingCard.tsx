import { useState } from "react";
import { motion } from "motion/react";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { SquircleFrame } from "@/components/ui/SquircleFrame";

const PAPER_ARTWORK =
  "https://app.paper.design/file-assets/01M38V5GRE309DJR5CGSREWGFT/2RVNXDE5794SSJ1SA2ZXE93BNV.webp";

export interface FloatingCardProps {
  className?: string;
  badge?: string;
  title?: string;
  description?: string;
  floatDistance?: number;
  idleRotation?: number;
  hoverX?: number;
  hoverRotate?: number;
  hoverScale?: number;
  baseScale?: number;
  duration?: number;
  delay?: number;
}

export function FloatingCard({
  className = "",
  badge = "Over $5M in partner revenue",
  title = "Institutions",
  description = "Join Jupiter, Bybit, Drift, and others to launch your own staking solution and earn when others stake with you.",
  floatDistance = 10,
  idleRotation = 2,
  hoverX = 0,
  hoverRotate = -5,
  hoverScale = 0.9,
  baseScale = 0.5,
  duration = 7,
  delay = 0,
}: FloatingCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      aria-hidden="true"
      data-floating-card="true"
      className={`pointer-events-auto absolute z-20 ${className}`}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      animate={{ x: hovered ? hoverX : 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 22 }}
    >
      <motion.div
        animate={{ y: [0, -floatDistance, 0], rotate: [0, idleRotation, 0] }}
        transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          data-floating-card-shell="true"
          className="relative origin-top-left overflow-visible"
          initial={false}
          animate={{ scale: hovered ? hoverScale : baseScale, rotate: hovered ? hoverRotate : 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 22 }}
        >
          <motion.div
            className="pointer-events-none absolute -inset-2 z-0 rounded-[2.5rem] border-2 border-[#1A1A19]"
            initial={false}
            animate={{ scale: hovered ? 1.08 : 1, opacity: hovered ? 1 : 0.72 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
          />
          <SquircleFrame
            cornerRadius={32}
            className="relative z-10 overflow-hidden p-2"
            style={{ backgroundColor: "#1A1A19" }}
          >
            <SquircleFrame
              cornerRadius={24}
              className="overflow-hidden p-2"
              style={{ backgroundColor: "#F8F8F8" }}
            >
              <SquircleFrame
                cornerRadius={14}
                className="flex h-[25.25rem] w-[30rem] flex-col gap-4 overflow-hidden p-2 pb-8 [font-synthesis:none] [overflow-wrap:anywhere]"
                style={{ backgroundColor: "#ECECE9" }}
              >
                <div className="relative h-[16.25rem] shrink-0 overflow-hidden rounded-lg border border-solid border-[#E4E7ED] bg-[#FDFDFD]">
                  <div
                    className="absolute inset-0 size-full bg-contain bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${PAPER_ARTWORK})` }}
                  />
                  <div className="absolute right-4 top-4 flex max-w-[calc(100%-32px)] items-center gap-2 rounded-lg border border-solid border-[#E4E7ED] bg-[#FDFDFDCC] px-3 py-1.5 shadow-[#00000003_0px_14px_8px,#00000003_0px_6px_6px,#00000003_0px_2px_3px]">
                    <div className="h-1.5 w-3 shrink-0 rounded-full bg-[#FFAF00]" />
                    <div className="line-clamp-1 font-['Satoshi',ui-sans-serif,system-ui,sans-serif] text-base font-medium leading-[22.4px] text-[#111112]">
                      {badge}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 px-3">
                  <div className="font-['Satoshi',ui-sans-serif,system-ui,sans-serif] text-xl font-medium leading-7 text-[#111112]">
                    {title}
                  </div>
                  <div className="font-['Satoshi',ui-sans-serif,system-ui,sans-serif] text-base font-medium leading-[22.4px] text-[#646871]">
                    {description}
                  </div>
                </div>
              </SquircleFrame>
            </SquircleFrame>
          </SquircleFrame>
          <AnimatedTooltip
            items={[{ id: 1, name: title, designation: badge }]}
            open={hovered}
            align="right"
            className="absolute right-5 top-5 z-50"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
