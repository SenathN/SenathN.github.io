"use client";

import { useEffect, useRef } from "react";
import { createNoise2D } from "@/lib/noise";
import { mulberry32 } from "@/lib/rng";

// The ambient layer: suspended particles in three depth bands, plus a few
// tracer particles whose trails draw the current lines. Everything moves
// along one slowly evolving flow field. Scrolling shifts the bands at
// different rates, so going down the page reads as a descent.
//
// Cost control: one canvas and one rAF loop for the whole page; particle
// count scales with viewport area and device class; the loop sleeps while the
// tab is hidden or an opaque section covers the screen; a frame-time probe
// halves the work on slow devices; reduced motion gets one still frame.

const BANDS = [
  { share: 0.52, size: [0.6, 1.0], alpha: [0.16, 0.3], speed: 0.0042, parallax: 0.05 },
  { share: 0.33, size: [1.0, 1.5], alpha: [0.26, 0.42], speed: 0.0075, parallax: 0.14 },
  { share: 0.15, size: [1.5, 2.3], alpha: [0.38, 0.6], speed: 0.012, parallax: 0.28 },
];
const TRAIL = 56;

function sprite(rgb: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, `rgba(${rgb},1)`);
  grad.addColorStop(0.22, `rgba(${rgb},0.9)`);
  grad.addColorStop(0.5, `rgba(${rgb},0.18)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 32, 32);
  return c;
}

// Seamless caustic tile: edges of a domain-warped Voronoi diagram.
function causticTile(size = 256, cells = 5, seed = 9) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const img = g.createImageData(size, size);
  const rand = mulberry32(seed);
  const ox = Array.from({ length: cells * cells }, () => 0.15 + rand() * 0.7);
  const oy = Array.from({ length: cells * cells }, () => 0.15 + rand() * 0.7);
  const TAU = Math.PI * 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let u = x / size;
      let v = y / size;
      // periodic warp keeps the tile seamless
      u += 0.022 * Math.sin(TAU * (v * 2 + u)) + 0.012 * Math.sin(TAU * v * 3);
      v += 0.022 * Math.sin(TAU * (u * 2 - v)) + 0.012 * Math.cos(TAU * u * 3);
      const fu = u * cells;
      const fv = v * cells;
      const ci = Math.floor(fu);
      const cj = Math.floor(fv);
      let f1 = 9;
      let f2 = 9;
      for (let dj = -1; dj <= 1; dj++) {
        for (let di = -1; di <= 1; di++) {
          const i = ci + di;
          const j = cj + dj;
          const k = (((j % cells) + cells) % cells) * cells + (((i % cells) + cells) % cells);
          const d = Math.hypot(i + ox[k] - fu, j + oy[k] - fv);
          if (d < f1) {
            f2 = f1;
            f1 = d;
          } else if (d < f2) f2 = d;
        }
      }
      const edge = f2 - f1;
      const t = Math.max(0, 1 - edge / 0.16);
      const a = Math.pow(t, 2.6);
      const o = (y * size + x) * 4;
      img.data[o] = 180;
      img.data[o + 1] = 231;
      img.data[o + 2] = 216;
      img.data[o + 3] = Math.round(a * 235);
    }
  }
  g.putImageData(img, 0, 0);
  return c.toDataURL("image/png");
}

export default function CurrentField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const lowPower = coarse || (navigator.hardwareConcurrency ?? 8) <= 4;
    const noise = createNoise2D(41);
    const sprites = [sprite("180,231,216"), sprite("67,198,201")];

    let w = 0;
    let h = 0;
    let dpr = 1;
    let n = 0;
    let px = new Float32Array(0);
    let py = new Float32Array(0);
    let pb = new Uint8Array(0);
    let ps = new Float32Array(0);
    let pa = new Float32Array(0);
    let pc = new Uint8Array(0);
    let pp = new Float32Array(0);

    type Tracer = { x: number; y: number; hist: Float32Array; len: number; age: number; span: number; tick: number };
    let tracers: Tracer[] = [];
    const rand = mulberry32(77);

    const seed = () => {
      const r = mulberry32(2024);
      const area = w * h;
      n = Math.round(Math.min(lowPower ? 90 : 230, Math.max(lowPower ? 36 : 70, area / (lowPower ? 9500 : 7200))));
      px = new Float32Array(n);
      py = new Float32Array(n);
      pb = new Uint8Array(n);
      ps = new Float32Array(n);
      pa = new Float32Array(n);
      pc = new Uint8Array(n);
      pp = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const q = r();
        const b = q < BANDS[0].share ? 0 : q < BANDS[0].share + BANDS[1].share ? 1 : 2;
        const band = BANDS[b];
        px[i] = r() * w;
        py[i] = r() * h;
        pb[i] = b;
        ps[i] = band.size[0] + r() * (band.size[1] - band.size[0]);
        pa[i] = band.alpha[0] + r() * (band.alpha[1] - band.alpha[0]);
        pc[i] = r() < 0.3 ? 1 : 0;
        pp[i] = r() * Math.PI * 2;
      }
      tracers = Array.from({ length: lowPower ? 3 : 6 }, (_, i) => spawn(-i * 2600));
    };

    function spawn(age = 0): Tracer {
      return {
        x: rand() * w,
        y: rand() * h,
        hist: new Float32Array(TRAIL * 2),
        len: 0,
        age,
        span: 9000 + rand() * 7000,
        tick: 0,
      };
    }

    const angle = (x: number, y: number, t: number) => -0.14 + noise(x * 0.0011, y * 0.0011 + t * 0.00002) * 0.95;

    // cached geometry for the "is an opaque section covering the screen" test
    let opaque: { top: number; bottom: number }[] = [];
    let docMax = 1;
    const measure = () => {
      const sy = window.scrollY;
      opaque = Array.from(document.querySelectorAll<HTMLElement>("[data-opaque]")).map((el) => {
        const r = el.getBoundingClientRect();
        return { top: r.top + sy, bottom: r.bottom + sy };
      });
      docMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const widthChanged = Math.round(r.width) !== Math.round(w);
      w = r.width;
      h = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 1.75);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (widthChanged || !n) seed();
      measure();
      if (reduced) still();
    };

    let lastScroll = window.scrollY;
    let pendingScroll = 0;
    const onScroll = () => {
      const y = window.scrollY;
      pendingScroll += y - lastScroll;
      lastScroll = y;
    };

    const draw = (time: number, fade: number) => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < n; i++) {
        const a = pa[i] * (0.76 + 0.24 * Math.sin(time * 0.0011 + pp[i])) * fade;
        const s = ps[i] * 4.2;
        ctx.globalAlpha = a;
        ctx.drawImage(sprites[pc[i]], px[i] - s / 2, py[i] - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      for (const tr of tracers) {
        if (tr.len < 3) continue;
        const env = Math.sin(Math.PI * Math.min(1, Math.max(0, tr.age / tr.span)));
        const base = 0.2 * env * fade;
        // tail to head in four passes of rising opacity
        const chunk = Math.ceil(tr.len / 4);
        for (let c = 0; c < 4; c++) {
          const from = c * chunk;
          const to = Math.min(tr.len - 1, from + chunk);
          if (to <= from) continue;
          ctx.strokeStyle = `rgba(67,198,201,${(base * (0.25 + c * 0.25)).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(tr.hist[from * 2], tr.hist[from * 2 + 1]);
          for (let k = from + 1; k <= to; k++) ctx.lineTo(tr.hist[k * 2], tr.hist[k * 2 + 1]);
          ctx.stroke();
        }
      }
    };

    // Reduced motion: a composed still frame, with current lines integrated
    // ahead of time instead of drawn over time.
    const still = () => {
      for (const tr of tracers) {
        tr.age = tr.span / 2;
        tr.len = 0;
        let x = tr.x;
        let y = tr.y;
        for (let k = 0; k < TRAIL; k++) {
          const a = angle(x, y, 0);
          x += Math.cos(a) * 3;
          y += Math.sin(a) * 3;
          tr.hist[k * 2] = x;
          tr.hist[k * 2 + 1] = y;
          tr.len++;
        }
      }
      draw(0, 1);
    };

    let raf = 0;
    let last = 0;
    let frames = 0;
    let slow = 0;
    let degraded = false;

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min(t - last, 48) : 16;
      last = t;

      const sy = window.scrollY;
      const vh = window.innerHeight;
      const covered = opaque.some((o) => o.top - sy <= 0 && o.bottom - sy >= vh);
      const shift = pendingScroll;
      pendingScroll = 0;
      if (covered) return;

      if (!degraded && frames < 120) {
        frames++;
        if (dt > 26) slow++;
        if (frames === 120 && slow > 45) {
          degraded = true;
          n = Math.floor(n / 2);
          tracers = tracers.slice(0, 2);
        }
      }

      for (let i = 0; i < n; i++) {
        const band = BANDS[pb[i]];
        const a = angle(px[i], py[i], t);
        px[i] += Math.cos(a) * band.speed * dt;
        py[i] += Math.sin(a) * band.speed * dt - shift * band.parallax;
        if (px[i] > w + 12) px[i] = -12;
        else if (px[i] < -12) px[i] = w + 12;
        if (py[i] > h + 12) py[i] -= h + 24;
        else if (py[i] < -12) py[i] += h + 24;
      }

      for (let k = 0; k < tracers.length; k++) {
        let tr = tracers[k];
        tr.age += dt;
        if (tr.age > tr.span) tr = tracers[k] = spawn();
        if (tr.age < 0) continue;
        if (shift) for (let m = 0; m < tr.len; m++) tr.hist[m * 2 + 1] -= shift * 0.14;
        tr.y -= shift * 0.14;
        const a = angle(tr.x, tr.y, t);
        tr.x += Math.cos(a) * 0.035 * dt;
        tr.y += Math.sin(a) * 0.035 * dt;
        if (++tr.tick % 2 === 0) {
          if (tr.len < TRAIL) tr.len++;
          else tr.hist.copyWithin(0, 2);
          tr.hist[(tr.len - 1) * 2] = tr.x;
          tr.hist[(tr.len - 1) * 2 + 1] = tr.y;
        }
      }

      draw(t, 1 - 0.32 * Math.min(1, sy / docMax));
    };

    const start = () => {
      if (reduced || raf || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    let idle = 0;
    let fallbackTimer = 0;
    let causticTimer = 0;
    const init = () => {
      resize();
      canvas.classList.add("is-live");
      start();
      // the caustic tile is a one-off ~10ms job; do it after the first frames
      causticTimer = window.setTimeout(() => {
        const url = causticTile();
        document.querySelectorAll<HTMLElement>(".water-light").forEach((el) => el.style.setProperty("--caustic", `url(${url})`));
      }, 600);
    };

    const ro = new ResizeObserver(() => {
      if (n) resize();
    });
    ro.observe(canvas);
    const bodyRO = new ResizeObserver(() => measure());
    bodyRO.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    const hasIdle = typeof window.requestIdleCallback === "function";
    if (hasIdle) idle = window.requestIdleCallback(init, { timeout: 1500 });
    else fallbackTimer = window.setTimeout(init, 300);

    return () => {
      stop();
      if (hasIdle) window.cancelIdleCallback(idle);
      window.clearTimeout(fallbackTimer);
      window.clearTimeout(causticTimer);
      ro.disconnect();
      bodyRO.disconnect();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} className="current-field" aria-hidden="true" />;
}
