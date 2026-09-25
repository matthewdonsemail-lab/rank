import type { CSSProperties, ReactNode } from "react";
import { useSquircleClip } from "@listeningkit/ui";

export interface SquircleFrameProps {
  children: ReactNode;
  className?: string;
  cornerRadius?: number;
  style?: CSSProperties;
}

export function SquircleFrame({
  children,
  className = "",
  cornerRadius = 24,
  style,
}: SquircleFrameProps) {
  const clip = useSquircleClip<HTMLDivElement>(cornerRadius);

  return (
    <div ref={clip.ref} style={{ ...clip.style, ...style }} className={className}>
      {children}
    </div>
  );
}
