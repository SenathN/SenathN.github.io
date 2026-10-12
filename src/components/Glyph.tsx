import { createNoise2D } from "@/lib/noise";
import type { Principle } from "../../content/site";

// Small technical diagrams for the engineering principles. Every stroke has
// pathLength=1 so the reveal can draw it in; motion is limited to one quiet
// element per glyph.
const r1 = (v: number) => Math.round(v * 10) / 10;

function ring(cx: number, cy: number, r: number, seed: number, wobble: number) {
  const noise = createNoise2D(seed);
  const pts = Array.from({ length: 28 }, (_, i) => {
    const a = (i / 28) * Math.PI * 2;
    const rr = r + noise(Math.cos(a) * 0.9, Math.sin(a) * 0.9) * wobble;
    return [cx + Math.cos(a) * rr * 1.15, cy + Math.sin(a) * rr];
  });
  return `M${pts.map((p) => `${r1(p[0])} ${r1(p[1])}`).join("L")}Z`;
}

function wander(seed: number, y: number, amp: number) {
  const noise = createNoise2D(seed);
  const pts = Array.from({ length: 16 }, (_, i) => {
    const x = 10 + i * 6;
    const settle = i / 15;
    return [x, y + noise(i * 0.42, seed) * amp * (1 - settle * 0.85) + (60 - y) * (1 - settle) * 0.9];
  });
  return `M${pts.map((p) => `${r1(p[0])} ${r1(p[1])}`).join("L")}L192 ${y}`;
}

function Shapes({ kind }: { kind: Principle["glyph"] }) {
  switch (kind) {
    case "converge":
      return (
        <>
          {[14, 30, 46, 62, 78, 94, 108].map((y, i) => (
            <path key={y} d={`M8 ${y}C70 ${y} 96 60 148 60`} className="g-line draw-line" pathLength={1} style={{ "--i": i } as React.CSSProperties} />
          ))}
          <path d="M148 60H194" className="g-strong draw-line" pathLength={1} style={{ "--i": 8 } as React.CSSProperties} />
          <circle cx="148" cy="60" r="3" className="g-dot" />
          <circle cx="148" cy="60" r="9" className="g-pulse" />
        </>
      );
    case "boundary":
      return (
        <>
          {[0, 1, 2].map((k) => (
            <path key={`l${k}`} d={ring(52, 60, 14 + k * 11, 31 + k, 3 + k)} className="g-line draw-line" pathLength={1} style={{ "--i": k } as React.CSSProperties} />
          ))}
          {[0, 1, 2].map((k) => (
            <path key={`r${k}`} d={ring(150, 60, 12 + k * 11, 41 + k, 3 + k)} className="g-line draw-line" pathLength={1} style={{ "--i": k + 3 } as React.CSSProperties} />
          ))}
          <path d="M101 6V114" className="g-dash" />
          <path d="M70 60H132" className="g-strong draw-line" pathLength={1} style={{ "--i": 7 } as React.CSSProperties} />
          <path d="M97 54V66M105 54V66" className="g-strong" />
        </>
      );
    case "failover":
      return (
        <>
          <path d="M8 60H86" className="g-strong draw-line" pathLength={1} />
          <path d="M116 60H194" className="g-strong draw-line" pathLength={1} style={{ "--i": 2 } as React.CSSProperties} />
          <path d="M95 53l12 14M107 53 95 67" className="g-mark" />
          <path d="M62 60C70 18 132 18 140 60" className="g-flow" />
          <path d="M136 52l4 8 5-7" className="g-line" />
        </>
      );
    case "balance":
      return (
        <>
          <path d="M100 12L24 106H176Z" className="g-line draw-line" pathLength={1} />
          <g className="g-drift">
            <path d="M100 12L92 72M24 106L92 72M176 106L92 72" className="g-faint" />
            <circle cx="92" cy="72" r="3.4" className="g-dot" />
            <circle cx="92" cy="72" r="9" className="g-ring" />
          </g>
          {[
            [100, 12],
            [24, 106],
            [176, 106],
          ].map(([x, y]) => (
            <circle key={`${x}`} cx={x} cy={y} r="3" className="g-node" />
          ))}
        </>
      );
    case "untangle":
      return (
        <>
          {[36, 52, 68, 84].map((y, i) => (
            <path key={y} d={wander(70 + i * 9, y, 26)} className="g-line draw-line" pathLength={1} style={{ "--i": i } as React.CSSProperties} />
          ))}
          <path d="M112 24V96" className="g-dash" />
        </>
      );
  }
}

const LABELS: Partial<Record<Principle["glyph"], string[]>> = {
  balance: ["Maintainability", "Performance", "Delivery"],
};

export default function Glyph({ kind }: { kind: Principle["glyph"] }) {
  const labels = LABELS[kind];
  return (
    <div className="glyph">
      <svg viewBox="0 0 200 120" aria-hidden="true" focusable="false" className="glyph-svg">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <Shapes kind={kind} />
        </g>
      </svg>
      {labels && (
        <div className="glyph-labels" aria-hidden="true">
          <span className="is-top" style={{ left: "50%", top: "10%" }}>
            {labels[0]}
          </span>
          <span className="is-bottom" style={{ left: "12%", top: "88%" }}>
            {labels[1]}
          </span>
          <span className="is-bottom" style={{ left: "88%", top: "88%" }}>
            {labels[2]}
          </span>
        </div>
      )}
    </div>
  );
}
