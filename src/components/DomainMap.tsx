import { createNoise2D } from "@/lib/noise";
import { contours } from "@/lib/contours";
import type { DomainMap as MapData } from "../../content/site";

// A figure plate for a project: the concepts named in its description,
// joined by current-like curves over a faint chart. Labels are HTML so they
// stay legible at any size; the whole plate is one image to assistive tech.
const W = 640;
const H = 420;
const PAD = 64;
const r1 = (v: number) => Math.round(v * 10) / 10;

export default function DomainMap({ map, seed, label }: { map: MapData; seed: number; label: string }) {
  const noise = createNoise2D(seed);
  const pos = new Map(
    map.nodes.map((n) => [n.id, { x: PAD + (n.x / 100) * (W - 2 * PAD), y: PAD + (n.y / 100) * (H - 2 * PAD) }])
  );

  const edges = map.edges.flatMap(([a, b], i) => {
    const p = pos.get(a);
    const q = pos.get(b);
    if (!p || !q) return [];
    const dx = q.x - p.x;
    const dy = q.y - p.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const bend = noise(i * 0.83, seed * 0.29) * len * 0.26;
    const c = (t: number, k: number, o = 0) => `${r1(p.x + dx * t + nx * (bend * k + o))} ${r1(p.y + dy * t + ny * (bend * k + o))}`;
    return [
      {
        d: `M${r1(p.x)} ${r1(p.y)}C${c(0.3, 1)} ${c(0.7, 0.55)} ${r1(q.x)} ${r1(q.y)}`,
        echo: `M${c(0, 0, 6)}C${c(0.3, 1, 10)} ${c(0.7, 0.55, 10)} ${c(1, 0, 6)}`,
      },
    ];
  });

  const chart = contours({ seed: seed + 100, width: W, height: H, cell: 26, levels: 6, scale: 2.4, minLength: 90 });
  const id = `map-${seed}`;

  return (
    <div className="map" role="img" aria-label={label}>
      <svg viewBox={`0 0 ${W} ${H}`} className="map-svg" aria-hidden="true" focusable="false">
        <defs>
          <pattern id={`${id}-dots`} width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="16" cy="16" r="0.9" fill="#b4e7d8" fillOpacity="0.22" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill={`url(#${id}-dots)`} />
        <g className="map-chart" fill="none" stroke="#43c6c9">
          {chart.map((c, i) => (
            <path key={i} d={c.d} strokeOpacity={c.level % 4 === 0 ? 0.22 : 0.11} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
        <g fill="none" strokeLinecap="round">
          {edges.map((e, i) => (
            <g key={i}>
              <path d={e.echo} className="map-echo" stroke="#43c6c9" vectorEffect="non-scaling-stroke" />
              <path d={e.d} className="map-edge draw-line" pathLength={1} stroke="#b4e7d8" style={{ "--i": i } as React.CSSProperties} />
            </g>
          ))}
        </g>
        <g>
          {map.nodes.map((n, i) => {
            const p = pos.get(n.id)!;
            return (
              <g key={n.id} transform={`translate(${r1(p.x)} ${r1(p.y)})`} className="map-node" style={{ "--i": i } as React.CSSProperties}>
                <circle r="17" className="map-ring map-ring-2" />
                <circle r="9" className="map-ring map-ring-1" />
                <circle r="3.2" className="map-core" />
              </g>
            );
          })}
        </g>
      </svg>
      <div className="map-labels" aria-hidden="true">
        {map.nodes.map((n) => {
          const p = pos.get(n.id)!;
          return (
            <span
              key={n.id}
              className={`map-label ${n.x > 62 ? "is-left" : ""}`}
              style={{ left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%` }}
            >
              {n.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
