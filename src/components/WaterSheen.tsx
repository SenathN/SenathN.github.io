import { profilePath } from "@/lib/contours";

// The water surface seen edge-on: a handful of faint, nearly parallel ripple
// lines just under the waterline.
const LINES = [
  { y: 3, amp: 1.4, o: 0.34 },
  { y: 7, amp: 2.2, o: 0.22 },
  { y: 12, amp: 2.8, o: 0.15 },
  { y: 18, amp: 3.4, o: 0.1 },
  { y: 26, amp: 4, o: 0.06 },
];

export default function WaterSheen({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1600 34" preserveAspectRatio="none" className={className} aria-hidden="true" focusable="false">
      <g fill="none" stroke="#b4e7d8">
        {LINES.map((l, i) => (
          <path key={i} d={profilePath(91 + i * 13, 1600, l.y, l.amp, 40, 9)} strokeOpacity={l.o} strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
      </g>
    </svg>
  );
}
