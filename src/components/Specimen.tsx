"use client";

import { useEffect, useRef } from "react";
import { icebergMesh, meshEdges, projectWire, SPECIMEN_PITCH, SPECIMEN_SEED } from "@/lib/iceberg";

// The hero's ice mass, turned slowly on a canvas as a wireframe specimen.
// Runs only while on screen, stops when the tab is hidden, and draws a single
// still frame for reduced motion. The server-rendered SVG underneath is the
// no-JavaScript fallback.
export default function Specimen({ children }: { children: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = wrap.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!host || !canvas || !ctx) return;

    const mesh = icebergMesh(SPECIMEN_SEED);
    const edges = meshEdges(mesh);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let yaw = 0.6;
    let raf = 0;
    let last = 0;
    let visible = false;

    const resize = () => {
      const r = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const pts = projectWire(mesh, yaw, w, h);

      // waterline plane
      const scale = Math.min(w / 5.6, h / 5.2);
      ctx.save();
      ctx.setLineDash([2, 5]);
      ctx.strokeStyle = "rgba(67,198,201,0.45)";
      ctx.beginPath();
      ctx.ellipse(w / 2, h * 0.36, scale * 2.7, scale * 2.7 * Math.abs(Math.sin(SPECIMEN_PITCH)), 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.lineWidth = 1;
      for (const [a, b] of edges) {
        const p = pts[a];
        const q = pts[b];
        const depth = ((p.z + q.z) / 2 + 2.4) / 4.8; // 0 back .. 1 front
        const under = p.under || q.under;
        const alpha = (under ? 0.1 : 0.2) + Math.max(0, Math.min(1, depth)) * (under ? 0.42 : 0.6);
        ctx.strokeStyle = under ? `rgba(67,198,201,${alpha.toFixed(3)})` : `rgba(234,243,238,${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(180,231,216,0.85)";
      for (const p of pts) {
        if (p.z > 0.4) ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
      }
    };

    const tick = (t: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      const dt = last ? Math.min(t - last, 50) : 16;
      last = t;
      yaw += dt * 0.00012;
      draw();
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (reduced || raf || !visible || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
    });
    io.observe(host);
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    const onVis = () => start();
    document.addEventListener("visibilitychange", onVis);
    resize();
    host.classList.add("is-live");

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div ref={wrap} className="specimen-stage">
      <div className="specimen-fallback">{children}</div>
      <canvas ref={canvasRef} className="specimen-canvas" aria-hidden="true" />
    </div>
  );
}
