import "./canted-grid.css";

const horizontalLines = [0, 200, 400, 600];
const verticalLines = [0, 200, 400, 600];

export interface CantedGridProps {
  className?: string;
}

export function CantedGrid({ className = "" }: CantedGridProps) {
  return (
    <div className={`canted-grid ${className}`} aria-hidden="true">
      <div className="canted-grid__plane">
        <svg viewBox="0 0 600 600" preserveAspectRatio="none">
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray="14 14"
            strokeLinecap="butt"
            vectorEffect="non-scaling-stroke"
          >
            {horizontalLines.map((y) => (
              <line key={`horizontal-${y}`} x1="0" y1={y} x2="600" y2={y} />
            ))}
            {verticalLines.map((x) => (
              <line key={`vertical-${x}`} x1={x} y1="0" x2={x} y2="600" />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
