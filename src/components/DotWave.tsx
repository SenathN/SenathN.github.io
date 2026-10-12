"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// Dotted terrain: concentric rings of points displaced into a slow, rolling
// swell. uTime is a CPU-accumulated phase (never coupled to scroll), uPointer
// gently tilts the whole field toward the cursor.
const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform vec2 uPointer;
  attribute float aRing;   // 0 inner .. 1 outer
  varying float vAlpha;
  varying float vCrest;

  void main() {
    vec3 p = position;
    float r = length(p.xz);
    float a = atan(p.z, p.x);

    float h = sin(r * 3.2 - uTime * 1.2) * 0.22
            + sin(a * 3.0 + uTime * 0.6 + r * 1.5) * 0.18 * aRing
            + cos(p.x * 1.4 + uTime * 0.8) * sin(p.z * 1.1 - uTime * 0.5) * 0.25;
    p.y += h;

    // pointer tilt
    p.y += (p.x * uPointer.x + p.z * uPointer.y) * 0.18;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (1.0 + h * 0.8) * (6.0 / -mv.z);

    // crests read brighter, outer rings fade into the background
    vAlpha = (0.35 + h * 1.4) * (1.0 - aRing * 0.55);
    // blue only where the swell peaks, so the accent traces the curves
    vCrest = smoothstep(0.12, 0.45, h);
  }
`;

const fragmentShader = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  uniform vec3 uAccent;
  uniform float uGain;
  varying float vAlpha;
  varying float vCrest;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    if (dot(c, c) > 0.25) discard;
    gl_FragColor = vec4(mix(uColor, uAccent, vCrest), clamp(vAlpha * uGain, 0.06 * uGain, 0.95));
  }
`;

function buildRings(rings: number, density: number) {
  const pos: number[] = [];
  const ring: number[] = [];
  for (let i = 1; i <= rings; i++) {
    const t = i / rings;
    const radius = t * 3.2;
    const count = Math.floor(density * t) + 24;
    for (let j = 0; j < count; j++) {
      const a = (j / count) * Math.PI * 2;
      // slight ellipse + wobble so rings feel organic, not lathe-perfect
      const wob = 1 + Math.sin(a * 3 + i * 0.3) * 0.06;
      pos.push(Math.cos(a) * radius * wob * 1.15, 0, Math.sin(a) * radius * wob);
      ring.push(t);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("aRing", new THREE.Float32BufferAttribute(ring, 1));
  return g;
}

export default function DotWave() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const el: HTMLDivElement = host;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    } catch {
      return;
    }
    const lowPower = (navigator.hardwareConcurrency ?? 8) <= 4;
    let dpr = Math.min(window.devicePixelRatio, lowPower ? 1.5 : 2);
    renderer.setPixelRatio(dpr);
    el.appendChild(renderer.domElement);
    renderer.domElement.style.opacity = "0";
    renderer.domElement.style.transition = "opacity 1.6s ease";

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    camera.position.set(0, 3.4, 6.2);
    camera.lookAt(0, -0.3, 0);

    const geometry = buildRings(lowPower ? 46 : 70, lowPower ? 260 : 420);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 2.4 * dpr },
        uPointer: { value: new THREE.Vector2() },
        uColor: { value: new THREE.Color() },
        uAccent: { value: new THREE.Color() },
        uGain: { value: 1 },
      },
      transparent: true,
      depthWrite: false,
    });
    // dots take the ink colour with accent crests, so they flip with the theme. Dark dots on white
    // read far fainter than white on black at the same alpha, so light mode
    // gets a stronger gain and slightly larger points.
    const root = document.documentElement;
    let light = false;
    const setColor = () => {
      const css = getComputedStyle(root);
      const ink = css.getPropertyValue("--ink").trim() || "#f8fafc";
      const accent = css.getPropertyValue("--accent").trim() || "#3282f6";
      (material.uniforms.uColor.value as THREE.Color).set(ink);
      (material.uniforms.uAccent.value as THREE.Color).set(accent);
      light = root.dataset.theme === "light";
      material.uniforms.uGain.value = light ? 1.5 : 1;
      material.uniforms.uSize.value = (light ? 2.7 : 2.4) * dpr;
    };
    setColor();
    const themeObserver = new MutationObserver(() => {
      setColor();
      // reduced motion stops the loop after one frame, so redraw by hand
      if (reduced) renderer.render(scene, camera);
    });
    themeObserver.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    const points = new THREE.Points(geometry, material);
    points.position.set(1.6, 0, 0);
    points.rotation.z = -0.12;
    scene.add(points);

    function resize() {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // keep the field to the right on wide screens, centred on narrow ones
      points.position.x = w > 900 ? 1.6 : 0.4;
      camera.updateProjectionMatrix();
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const target = new THREE.Vector2();
    const onMove = (e: PointerEvent) => {
      target.set((e.clientX / window.innerWidth - 0.5) * 2, (e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    let lost = false;
    const onLost = (e: Event) => { e.preventDefault(); lost = true; };
    const onRestored = () => { lost = false; };
    renderer.domElement.addEventListener("webglcontextlost", onLost);
    renderer.domElement.addEventListener("webglcontextrestored", onRestored);

    let raf = 0, last = performance.now(), phase = 0, frames = 0, sum = 0, shown = false;

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(t - last, 50);
      last = t;
      if (!visible || document.hidden || lost) return;

      if (frames < 60) {
        sum += dt;
        if (++frames === 60 && sum / 60 > 24 && dpr > 1) {
          dpr = 1;
          renderer.setPixelRatio(dpr);
          material.uniforms.uSize.value = light ? 2.7 : 2.4;
          resize();
        }
      }

      if (!reduced) phase += dt * 0.00035;
      const p = material.uniforms.uPointer.value as THREE.Vector2;
      p.lerp(target, 0.03);
      points.rotation.y = phase * 0.25;

      material.uniforms.uTime.value = phase;
      renderer.render(scene, camera);
      if (!shown) { renderer.domElement.style.opacity = "1"; shown = true; }
      if (reduced) cancelAnimationFrame(raf);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("pointermove", onMove);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={ref} className="absolute inset-0" aria-hidden="true" />;
}
