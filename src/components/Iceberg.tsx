import { icebergMesh, shadeIceberg } from "@/lib/iceberg";

// Static, build-time render of the glacial mass. The tip is solid and lit
// from the sky; the submerged body is translucent, rim-lit and fades with
// depth. The wrapper is shifted up by the tip's share of the height so its
// waterline lands exactly on the page's waterline. The submerged body is
// nudged sideways a few units: refraction, as seen through the surface.
export default function Iceberg({ seed = 7, yaw = 2.6, className = "" }: { seed?: number; yaw?: number; className?: string }) {
  const mesh = icebergMesh(seed);
  const { facets, bounds } = shadeIceberg(mesh, { yaw, scale: 100, ox: 0, oy: 0 });
  const pad = 6;
  const x = bounds.minX - pad;
  const y = bounds.minY - pad;
  const w = bounds.maxX - bounds.minX + pad * 2;
  const h = bounds.maxY - bounds.minY + pad * 2;
  const tip = (-y / h) * 100;
  const above = facets.filter((f) => !f.under);
  const below = facets.filter((f) => f.under);
  const id = `ice-${seed}`;

  return (
    <div className={className} style={{ "--tip": `-${tip.toFixed(3)}%` } as React.CSSProperties} aria-hidden="true">
      <svg viewBox={`${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`} className="block w-full h-auto" focusable="false">
        <defs>
          <linearGradient id={`${id}-fade`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={bounds.maxY}>
            <stop offset="0" stopColor="#fff" />
            <stop offset="0.55" stopColor="#fff" stopOpacity="0.7" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x={x} y={0} width={w} height={h}>
            <rect x={x} y={0} width={w} height={h} fill={`url(#${id}-fade)`} />
          </mask>
          <radialGradient id={`${id}-glow`} cx="0.5" cy="0.3" r="0.6">
            <stop offset="0" stopColor="#43c6c9" stopOpacity="0.16" />
            <stop offset="1" stopColor="#43c6c9" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx={(bounds.minX + bounds.maxX) / 2} cy={bounds.maxY * 0.36} rx={w * 0.46} ry={bounds.maxY * 0.5} fill={`url(#${id}-glow)`} />
        <g className="ice-under" mask={`url(#${id}-mask)`} transform="translate(5 0)" strokeWidth="0.8" strokeLinejoin="round">
          {below.map((f, i) => (
            <polygon key={i} points={f.points} fill={f.fill} fillOpacity={f.fillOpacity} stroke={f.stroke} strokeOpacity={f.strokeOpacity} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
        <g className="ice-above" strokeWidth="0.6" strokeLinejoin="round">
          {above.map((f, i) => (
            <polygon key={i} points={f.points} fill={f.fill} fillOpacity={f.fillOpacity} stroke={f.stroke} strokeOpacity={f.strokeOpacity} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
      </svg>
    </div>
  );
}
