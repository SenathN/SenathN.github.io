import { createNoise2D, fbm } from "./noise";

// Bathymetric contours: isolines of the shared noise field, traced with
// marching squares, chained into polylines and smoothed into cubic Béziers.
// Runs at build time inside server components, so the browser only receives
// finished SVG paths.

export type ContourOptions = {
  seed: number;
  width: number;
  height: number;
  /** grid cell size in viewBox units */
  cell?: number;
  /** number of iso levels, spread evenly between the field's min and max */
  levels: number;
  /** noise frequency per 1000 viewBox units */
  scale?: number;
  octaves?: number;
  /** shapes the field: added to the noise value at (x, y) */
  bias?: (x: number, y: number) => number;
  /** drop contours shorter than this (viewBox units) */
  minLength?: number;
};

export type Contour = { level: number; d: string; length: number; closed: boolean };

type Pt = { x: number; y: number };

const r1 = (v: number) => Math.round(v * 10) / 10;

export function smoothPath(pts: Pt[], closed: boolean): string {
  const n = pts.length;
  if (n < 2) return "";
  const get = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${r1(pts[0].x)} ${r1(pts[0].y)}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    d += `C${r1(p1.x + (p2.x - p0.x) / 6)} ${r1(p1.y + (p2.y - p0.y) / 6)} ${r1(p2.x - (p3.x - p1.x) / 6)} ${r1(
      p2.y - (p3.y - p1.y) / 6
    )} ${r1(p2.x)} ${r1(p2.y)}`;
  }
  return closed ? d + "Z" : d;
}

export function contours(o: ContourOptions): Contour[] {
  const cell = o.cell ?? 20;
  const cols = Math.ceil(o.width / cell);
  const rows = Math.ceil(o.height / cell);
  const C1 = cols + 1;
  const noise = createNoise2D(o.seed);
  const s = (o.scale ?? 2.2) / 1000;
  const octaves = o.octaves ?? 3;

  const v = new Float32Array(C1 * (rows + 1));
  let min = Infinity;
  let max = -Infinity;
  for (let j = 0; j <= rows; j++) {
    for (let i = 0; i <= cols; i++) {
      const x = i * cell;
      const y = j * cell;
      const val = fbm(noise, x * s, y * s, octaves) + (o.bias ? o.bias(x, y) : 0);
      v[j * C1 + i] = val;
      if (val < min) min = val;
      if (val > max) max = val;
    }
  }

  const out: Contour[] = [];
  const minLength = o.minLength ?? cell * 4;

  for (let k = 1; k <= o.levels; k++) {
    const L = min + ((max - min) * k) / (o.levels + 1);

    // edge keys: horizontal edge (i,j)-(i+1,j) = idx*2, vertical (i,j)-(i,j+1) = idx*2+1
    const point = (key: number): Pt => {
      const idx = key >> 1;
      const i = idx % C1;
      const j = (idx - i) / C1;
      if ((key & 1) === 0) {
        const t = (L - v[idx]) / (v[idx + 1] - v[idx]);
        return { x: (i + t) * cell, y: j * cell };
      }
      const t = (L - v[idx]) / (v[idx + C1] - v[idx]);
      return { x: i * cell, y: (j + t) * cell };
    };

    const segs: number[] = [];
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const ia = j * C1 + i;
        const a = v[ia];
        const b = v[ia + 1];
        const c = v[ia + C1 + 1];
        const d = v[ia + C1];
        const code = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (c > L ? 2 : 0) | (d > L ? 1 : 0);
        if (code === 0 || code === 15) continue;
        const top = ia * 2;
        const bottom = (ia + C1) * 2;
        const left = ia * 2 + 1;
        const right = (ia + 1) * 2 + 1;
        const center = (a + b + c + d) / 4;
        switch (code) {
          case 1: case 14: segs.push(left, bottom); break;
          case 2: case 13: segs.push(bottom, right); break;
          case 3: case 12: segs.push(left, right); break;
          case 4: case 11: segs.push(top, right); break;
          case 6: case 9: segs.push(top, bottom); break;
          case 7: case 8: segs.push(left, top); break;
          case 5:
            if (center > L) segs.push(left, top, bottom, right);
            else segs.push(top, right, left, bottom);
            break;
          case 10:
            if (center > L) segs.push(top, right, left, bottom);
            else segs.push(left, top, bottom, right);
            break;
        }
      }
    }

    const count = segs.length / 2;
    const adj = new Map<number, number[]>();
    for (let n = 0; n < count; n++) {
      for (const key of [segs[n * 2], segs[n * 2 + 1]]) {
        const list = adj.get(key);
        if (list) list.push(n);
        else adj.set(key, [n]);
      }
    }
    const used = new Uint8Array(count);

    const walk = (startSeg: number, startKey: number) => {
      const keys = [startKey];
      let seg = startSeg;
      let key = startKey;
      for (;;) {
        used[seg] = 1;
        const p = segs[seg * 2];
        const q = segs[seg * 2 + 1];
        const next = p === key ? q : p;
        keys.push(next);
        const list = adj.get(next) ?? [];
        let found = -1;
        for (const s2 of list) if (!used[s2]) { found = s2; break; }
        if (found < 0) break;
        seg = found;
        key = next;
      }
      return keys;
    };

    const chains: number[][] = [];
    adj.forEach((list, key) => {
      if (list.length === 1 && !used[list[0]]) chains.push(walk(list[0], key));
    });
    for (let n = 0; n < count; n++) if (!used[n]) chains.push(walk(n, segs[n * 2]));

    for (const keys of chains) {
      const closed = keys.length > 3 && keys[0] === keys[keys.length - 1];
      if (closed) keys.pop();
      const pts: Pt[] = [];
      let length = 0;
      for (const key of keys) {
        const p = point(key);
        const last = pts[pts.length - 1];
        if (last) {
          const dist = Math.hypot(p.x - last.x, p.y - last.y);
          if (dist < cell * 0.55) continue;
          length += dist;
        }
        pts.push(p);
      }
      if (length < minLength || pts.length < 3) continue;
      out.push({ level: k, d: smoothPath(pts, closed), length, closed });
    }
  }
  return out;
}

// A single seabed profile line across the width: used for stratum edges.
export function profilePath(seed: number, width: number, baseY: number, amp: number, steps = 24, freq = 3) {
  const noise = createNoise2D(seed);
  const pts: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const y = baseY + fbm(noise, (i / steps) * freq, seed * 0.17, 3) * amp;
    pts.push({ x, y });
  }
  return smoothPath(pts, false);
}
