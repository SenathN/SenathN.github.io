"use client";

import { useEffect, useRef, useState } from "react";

// Adds .is-in once the element enters the viewport. Hidden state only applies
// under html.js (see globals.css), so content stays visible without JS.
export function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li" | "section" | "article";
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const decimals = Number.isInteger(value) ? 0 : 1;
  const [display, setDisplay] = useState(value.toFixed(decimals));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min((t - start) / 1400, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        setDisplay((value * eased).toFixed(decimals));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      setDisplay((0).toFixed(decimals));
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, decimals]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}

// Card with a soft accent glow that follows the pointer.
export function Spotlight({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      className={`spotlight ${className}`}
    >
      {children}
    </div>
  );
}

// Line-art cube built from CSS 3D faces: slow idle spin, tilts toward pointer.
export function WireCube() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let visible = false;
    let spin = 0;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    let last = performance.now();

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(t - last, 50);
      last = t;
      if (!visible) return;
      if (!reduced) spin += dt * 0.012;
      cx += (Math.max(-1, Math.min(1, tx)) - cx) * 0.05;
      cy += (Math.max(-1, Math.min(1, ty)) - cy) * 0.05;
      el.style.setProperty("--ry", `${spin + cx * 25}deg`);
      el.style.setProperty("--rx", `${-18 - cy * 20}deg`);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const faces = ["front", "back", "left", "right", "top", "bottom"];
  return (
    <div className="cube-stage" aria-hidden="true">
      <div ref={ref} className="cube">
        {faces.map((f) => (
          <div key={f} className={`cube-face cube-${f}`} />
        ))}
        <div className="cube-core" />
      </div>
      <div className="cube-shadow" />
    </div>
  );
}

// Highlights the nav link of the section currently in view.
export function ActiveNav({ items }: { items: readonly { label: string; href: string }[] }) {
  const [active, setActive] = useState<string>("");
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(`#${e.target.id}`));
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    items.forEach((i) => {
      const el = document.querySelector(i.href);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [items]);

  return (
    <ul className="hidden md:flex items-center gap-8 mono text-[11px] tracking-wider uppercase">
      {items.map((item, i) => (
        <li key={item.href}>
          <a
            href={item.href}
            aria-current={active === item.href ? "true" : undefined}
            className={`nav-link ${active === item.href ? "is-active" : ""}`}
          >
            <span className="text-[var(--dim)]">{String(i + 1).padStart(2, "0")}/</span>
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

// Flips between light and dark. Picking the mode the OS already prefers clears
// the stored choice, so the site goes back to following the system setting.
// Both icons are rendered; CSS shows the right one, so SSR markup never differs.
export function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    const system = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    try {
      if (next === system) localStorage.removeItem("theme");
      else localStorage.setItem("theme", next);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      className="theme-toggle grid place-items-center w-8 h-8 border border-[var(--line-strong)] text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
    >
      <svg viewBox="0 0 24 24" className="icon-sun w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
      </svg>
      <svg viewBox="0 0 24 24" className="icon-moon w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
      </svg>
    </button>
  );
}
