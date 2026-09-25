import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SquircleFrame } from "@/components/ui/SquircleFrame";

export interface AnimatedTooltipItem {
  id: number;
  name: string;
  designation: string;
}

export interface AnimatedTooltipProps {
  items: AnimatedTooltipItem[];
  className?: string;
  open?: boolean;
  align?: "center" | "left" | "right";
}

export function AnimatedTooltip({
  items,
  className = "",
  open,
  align = "center",
}: AnimatedTooltipProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const isVisible = (id: number) => open ?? hoveredIndex === id;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {items.map((item) => (
        <div
          className="relative"
          key={item.id}
          onMouseEnter={() => setHoveredIndex(item.id)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence mode="popLayout">
            {isVisible(item.id) ? (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { type: "spring", stiffness: 260, damping: 10 },
                }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                className={`absolute -top-16 z-50 whitespace-nowrap ${
                  align === "right" ? "right-0" : align === "left" ? "left-0" : "left-1/2 -translate-x-1/2"
                }`}
              >
                <SquircleFrame
                  cornerRadius={12}
                  className="relative flex flex-col items-center justify-center bg-[#4093FF] px-4 py-2 text-xs text-[#032550] shadow-xl"
                >
                  <div className="absolute inset-x-10 -bottom-px z-30 h-px bg-gradient-to-r from-transparent via-[#032550] to-transparent" />
                  <div className="relative z-30 text-2xl font-bold text-[#032550]">{item.name}</div>
                </SquircleFrame>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
