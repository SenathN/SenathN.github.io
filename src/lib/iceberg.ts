import { mulberry32 } from "./rng";

// A low-poly ice mass built as stacked irregular rings, then flat-shaded
// with a tiny software renderer. The same mesh feeds the hero (static SVG,
// rendered at build time) and the field-notes specimen (rotating canvas).

export type Vec3 = [number, number, number];
export type Mesh = { vertices: Vec3[]; faces: [number, number, number][] };

const RINGS = [
  { y: 0.62, r: 1.0, jy: 0.05 },
  { y: 0.38, r: 1.16, jy: 0.04 },
  { y: 0, r: 1.3, jy: 0 }, // the waterline ring sits exactly on y = 0
  { y: -0.52, r: 1.62, jy: 0.16 },
  { y: -1.16, r: 1.8, jy: 0.2 },
  { y: -1.86, r: 1.56, jy: 0.2 },
  { y: -2.5, r: 1.06, jy: 0.18 },
  { y: -3.0, r: 0.5, jy: 0.12 },
];

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a: Vec3): Vec3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

export function icebergMesh(seed = 7, segments = 11): Mesh {
  const rand = mulberry32(seed);
  const vertices: Vec3[] = [];
  const starts: number[] = [];
  const centroids: Vec3[] = [];

  let cx = 0;
  let cz = 0;
  RINGS.forEach((ring, k) => {
    starts.push(vertices.length);
    // below the waterline the mass wanders off-centre as it sinks
    if (k > 2) {
      cx += (rand() - 0.62) * 0.36;
      cz += (rand() - 0.5) * 0.16;
    } else {
      cx = Math.sin(k * 1.7 + seed) * 0.06;
      cz = Math.cos(k * 1.3 + seed) * 0.05;
    }
    const phase = rand() * 0.6;
    for (let m = 0; m < segments; m++) {
      const a = ((m + phase + (rand() - 0.5) * 0.4) / segments) * Math.PI * 2;
      const jitter = k === 2 ? 0.9 + rand() * 0.16 : k < 2 ? 0.82 + rand() * 0.34 : 0.7 + rand() * 0.52;
      const r = ring.r * jitter;
      vertices.push([cx + Math.cos(a) * r * 1.5, ring.y + (rand() - 0.5) * 2 * ring.jy, cz + Math.sin(a) * r * 0.82]);
    }
    centroids.push([cx, ring.y, cz]);
  });

  // two pressure ridges on the tabular top
  const m1 = Math.floor(rand() * segments);
  const m2 = (m1 + 3 + Math.floor(rand() * 3)) % segments;
  vertices[starts[0] + m1][1] += 0.26;
  vertices[starts[0] + m2][1] += 0.13;

  const top = vertices.length;
  vertices.push([centroids[0][0] - 0.1, 0.68, centroids[0][2]]);
  const last = RINGS.length - 1;
  const apex = vertices.length;
  vertices.push([centroids[last][0] - 0.3, -3.38, centroids[last][2] + 0.05]);

  const faces: [number, number, number][] = [];
  const ref: Vec3[] = [];
  const at = (k: number, m: number) => starts[k] + ((m + segments) % segments);

  for (let m = 0; m < segments; m++) {
    faces.push([top, at(0, m + 1), at(0, m)]);
    ref.push([centroids[0][0], centroids[0][1] - 0.4, centroids[0][2]]);
  }
  for (let k = 0; k < last; k++) {
    const o: Vec3 = [
      (centroids[k][0] + centroids[k + 1][0]) / 2,
      (centroids[k][1] + centroids[k + 1][1]) / 2,
      (centroids[k][2] + centroids[k + 1][2]) / 2,
    ];
    for (let m = 0; m < segments; m++) {
      const a = at(k, m), b = at(k, m + 1), c = at(k + 1, m + 1), d = at(k + 1, m);
      if ((m + k) % 2 === 0) faces.push([a, b, c], [a, c, d]);
      else faces.push([a, b, d], [b, c, d]);
      ref.push(o, o);
    }
  }
  for (let m = 0; m < segments; m++) {
    faces.push([apex, at(last, m), at(last, m + 1)]);
    ref.push([centroids[last][0], centroids[last][1] + 0.4, centroids[last][2]]);
  }

  // wind every face outward
  faces.forEach((f, i) => {
    const [a, b, c] = f.map((n) => vertices[n]);
    const n = cross(sub(b, a), sub(c, a));
    const centre: Vec3 = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3];
    if (dot(n, sub(centre, ref[i])) < 0) faces[i] = [f[0], f[2], f[1]];
  });

  return { vertices, faces };
}

export function meshEdges(mesh: Mesh): [number, number][] {
  const seen = new Set<number>();
  const edges: [number, number][] = [];
  const n = mesh.vertices.length;
  for (const f of mesh.faces) {
    for (let i = 0; i < 3; i++) {
      const a = Math.min(f[i], f[(i + 1) % 3]);
      const b = Math.max(f[i], f[(i + 1) % 3]);
      if (seen.has(a * n + b)) continue;
      seen.add(a * n + b);
      edges.push([a, b]);
    }
  }
  return edges;
}

export function rotate(v: Vec3, yaw: number, pitch = 0): Vec3 {
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const x = v[0] * cy - v[2] * sy;
  const z = v[0] * sy + v[2] * cy;
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  return [x, v[1] * cp - z * sp, v[1] * sp + z * cp];
}

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const A = hex(a), B = hex(b);
  return `#${A.map((v, i) => Math.round(v + (B[i] - v) * Math.max(0, Math.min(1, t))).toString(16).padStart(2, "0")).join("")}`;
};

export type Facet = {
  points: string;
  under: boolean;
  fill: string;
  fillOpacity: number;
  stroke: string;
  strokeOpacity: number;
};

const LIGHT_AIR = norm([-0.5, 0.75, 0.6]);
const LIGHT_WATER = norm([0.15, 1, 0.35]);

// Orthographic camera at the waterline looking down -z. y = 0 maps to oy.
export function shadeIceberg(mesh: Mesh, opts: { yaw: number; scale: number; ox: number; oy: number }) {
  const rv = mesh.vertices.map((v) => rotate(v, opts.yaw));
  const facets: (Facet & { z: number })[] = [];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const r = (v: number) => Math.round(v * 10) / 10;

  for (const f of mesh.faces) {
    const [a, b, c] = f.map((n) => rv[n]);
    const n = norm(cross(sub(b, a), sub(c, a)));
    const front = n[2] > 0;
    const yc = (a[1] + b[1] + c[1]) / 3;
    const under = Math.max(a[1], b[1], c[1]) <= 1e-6;
    const rim = 1 - Math.abs(n[2]);
    let fill: string, fillOpacity: number, stroke: string, strokeOpacity: number;

    if (!under) {
      if (!front) continue; // solid ice: back faces are always hidden
      const lam = 0.16 + 0.84 * Math.max(0, dot(n, LIGHT_AIR));
      fill = lam < 0.55 ? mix("#1b5560", "#b4e7d8", lam / 0.55) : mix("#b4e7d8", "#eaf3ee", (lam - 0.55) / 0.45);
      fillOpacity = 0.96;
      stroke = "#eaf3ee";
      strokeOpacity = 0.14 + 0.3 * rim;
    } else {
      const att = Math.exp(yc * 0.42);
      const lam = Math.max(0, dot(n, LIGHT_WATER));
      if (front) {
        fill = "#43c6c9";
        fillOpacity = (0.02 + 0.1 * lam + 0.05 * rim) * att;
        stroke = "#b4e7d8";
        strokeOpacity = (0.07 + 0.38 * rim + 0.1 * lam) * att;
      } else {
        fill = "#43c6c9";
        fillOpacity = 0.01 * att;
        stroke = "#43c6c9";
        strokeOpacity = 0.05 * att;
      }
    }

    const pts = [a, b, c].map((p) => {
      const x = r(opts.ox + p[0] * opts.scale);
      const y = r(opts.oy - p[1] * opts.scale);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      return `${x},${y}`;
    });
    facets.push({
      points: pts.join(" "),
      under,
      fill,
      fillOpacity: +fillOpacity.toFixed(3),
      stroke,
      strokeOpacity: +strokeOpacity.toFixed(3),
      z: (a[2] + b[2] + c[2]) / 3,
    });
  }

  facets.sort((p, q) => p.z - q.z);
  return {
    facets: facets.map((f): Facet => ({
      points: f.points,
      under: f.under,
      fill: f.fill,
      fillOpacity: f.fillOpacity,
      stroke: f.stroke,
      strokeOpacity: f.strokeOpacity,
    })),
    bounds: { minX, minY, maxX, maxY },
  };
}

// Wireframe projection for the field-notes specimen: slight downward pitch
// and a gentle perspective, shared by the static SVG and the live canvas.
export const SPECIMEN_SEED = 23;
export const SPECIMEN_PITCH = -0.34;

export function projectWire(mesh: Mesh, yaw: number, w: number, h: number) {
  const scale = Math.min(w / 5.6, h / 5.2);
  const cx = w / 2;
  const cy = h * 0.36;
  return mesh.vertices.map((v) => {
    const p = rotate(v, yaw, SPECIMEN_PITCH);
    const k = 7 / (7 - p[2]);
    return { x: cx + p[0] * scale * k, y: cy - p[1] * scale * k, z: p[2], under: v[1] < -0.01 };
  });
}
