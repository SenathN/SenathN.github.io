import { contours, type ContourOptions } from "@/lib/contours";

// Bathymetric chart rendered at build time. Every fourth line is an "index
// contour", drawn heavier, as on a real chart.
export default function Contours({
  className = "",
  draw = false,
  preserve = "xMidYMid slice",
  ...opts
}: ContourOptions & { className?: string; draw?: boolean; preserve?: string }) {
  const lines = contours(opts);
  return (
    <svg
      viewBox={`0 0 ${opts.width} ${opts.height}`}
      preserveAspectRatio={preserve}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        {lines.map((c, i) => (
          <path
            key={i}
            d={c.d}
            strokeOpacity={c.level % 4 === 0 ? 1 : 0.5}
            strokeWidth={c.level % 4 === 0 ? 1.1 : 0.8}
            vectorEffect="non-scaling-stroke"
            {...(draw ? { pathLength: 1, className: "draw-line", style: { "--i": i % 12 } as React.CSSProperties } : {})}
          />
        ))}
      </g>
    </svg>
  );
}
