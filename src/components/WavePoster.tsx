// Server-rendered stand-in for the WebGL dot field (no-JS, no-WebGL, saveData).
export default function WavePoster() {
  const rings = Array.from({ length: 22 }, (_, i) => i + 1);
  return (
    <svg
      aria-hidden="true"
      className="text-[var(--ink)] absolute right-[-12%] top-[8%] w-[85%] md:w-[68%] h-auto opacity-60"
      viewBox="-320 -220 640 440"
      fill="none"
    >
      <g transform="rotate(-14)">
        {rings.map((i) => (
          <ellipse
            key={i}
            cx={i * 1.5}
            cy={-i * 0.8}
            rx={i * 13}
            ry={i * 8.5}
            stroke="currentColor"
            strokeOpacity={0.55 - i * 0.02}
            strokeWidth="1.1"
            strokeDasharray="0.1 4"
            strokeLinecap="round"
          />
        ))}
      </g>
    </svg>
  );
}
