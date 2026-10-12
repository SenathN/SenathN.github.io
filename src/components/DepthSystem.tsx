"use client";

import { useEffect } from "react";

// One controller for all scroll- and pointer-driven behaviour, so the page
// stays server-rendered and nothing re-renders React on scroll:
// - reveals ([data-reveal] gains .is-in once, then is forgotten)
// - count-ups for [data-count], written straight to textContent
// - the depth readout, active nav link and progress hairline
// - --p (0..1 section progress) on [data-progress] sections
// - parallax for [data-parallax] and pointer drift for [data-pointer-layer]
// - closing the native <details> mobile menu after a jump or on Escape
// Work happens in one rAF per scroll/pointer burst; reads come before writes.
export default function DepthSystem() {
  useEffect(() => {
    const doc = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cleanups: (() => void)[] = [];

    // ---- count-ups
    const countUp = (el: HTMLElement) => {
      const target = Number(el.dataset.count);
      const decimals = Number(el.dataset.decimals ?? 0);
      if (reduced || !Number.isFinite(target)) return;
      const start = performance.now();
      const step = (t: number) => {
        const p = Math.min((t - start) / 1300, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = (target * eased).toFixed(decimals);
        if (p < 1) requestAnimationFrame(step);
      };
      el.textContent = (0).toFixed(decimals);
      requestAnimationFrame(step);
    };

    // ---- reveals
    const revealIO = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          el.classList.add("is-in");
          el.querySelectorAll<HTMLElement>("[data-count]").forEach(countUp);
          revealIO.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => revealIO.observe(el));
    cleanups.push(() => revealIO.disconnect());

    // ---- zones, readout, nav
    type Zone = { el: HTMLElement; id: string; name: string; from: number; to: number; top: number; height: number };
    const zones: Zone[] = Array.from(document.querySelectorAll<HTMLElement>("[data-zone]")).map((el) => ({
      el,
      id: el.id,
      name: el.dataset.zone ?? "",
      from: Number(el.dataset.from),
      to: Number(el.dataset.to),
      top: 0,
      height: 1,
    }));
    const depthOut = document.querySelector<HTMLElement>("[data-depth-readout]");
    const zoneOut = document.querySelector<HTMLElement>("[data-zone-readout]");
    const bar = document.querySelector<HTMLElement>("[data-progress-bar]");
    const nav = document.querySelector<HTMLElement>("[data-nav]");
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-nav] .nav-link, [data-nav] .menu-links a"));
    const progressEls = Array.from(document.querySelectorAll<HTMLElement>("[data-progress]"));
    const parallaxEls = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    const pointerEls = Array.from(document.querySelectorAll<HTMLElement>("[data-pointer-layer]"));

    let docH = 1;
    const measure = () => {
      const sy = window.scrollY;
      for (const z of zones) {
        const r = z.el.getBoundingClientRect();
        z.top = r.top + sy;
        z.height = Math.max(1, r.height);
      }
      docH = doc.scrollHeight;
    };

    let lastDepth = -1;
    let lastZone = "";
    let scrolled: boolean | null = null;
    let lastBar = -1;

    const update = () => {
      const sy = window.scrollY;
      const vh = window.innerHeight;
      const max = Math.max(1, docH - vh);
      const atBottom = sy >= max - 2;

      // the probe line sits a third of the way down the viewport
      const probe = sy + vh * 0.33;
      let zone = zones[0];
      for (const z of zones) if (probe >= z.top) zone = z;
      let depth = 0;
      if (zone) {
        const t = Math.min(1, Math.max(0, (probe - zone.top) / zone.height));
        depth = Math.round(zone.from + (zone.to - zone.from) * t);
        if (atBottom) {
          zone = zones[zones.length - 1];
          depth = zone.to;
        }
      }

      // reads first
      const progress = progressEls.map((el) => el.getBoundingClientRect());
      const parallax = parallaxEls.map((el) => (el.parentElement ?? el).getBoundingClientRect());

      // then writes
      if (depth !== lastDepth && depthOut) {
        depthOut.textContent = depth.toLocaleString("en-US");
        lastDepth = depth;
      }
      if (zone && zone.id !== lastZone) {
        lastZone = zone.id;
        if (zoneOut) zoneOut.textContent = zone.name;
        for (const a of links) {
          if (a.getAttribute("href") === `#${zone.id}`) a.setAttribute("aria-current", "location");
          else a.removeAttribute("aria-current");
        }
      }
      const isScrolled = sy > 24;
      if (isScrolled !== scrolled && nav) {
        nav.classList.toggle("is-scrolled", isScrolled);
        scrolled = isScrolled;
      }
      const b = Math.round((sy / max) * 1000) / 1000;
      if (b !== lastBar && bar) {
        bar.style.transform = `scaleX(${b})`;
        lastBar = b;
      }
      progressEls.forEach((el, i) => {
        const r = progress[i];
        if (r.bottom < 0 || r.top > vh) return;
        const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
        el.style.setProperty("--p", p.toFixed(3));
      });
      if (!reduced) {
        parallaxEls.forEach((el, i) => {
          const r = parallax[i];
          if (r.bottom < -200 || r.top > vh + 200) return;
          const factor = Number(el.dataset.parallax) || 0.1;
          const offset = (r.top + r.height / 2 - vh / 2) * -factor;
          el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
        });
      }
    };

    let raf = 0;
    const schedule = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          update();
        });
    };
    const remeasure = () => {
      measure();
      schedule();
    };
    measure();
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasure);
    const ro = new ResizeObserver(remeasure);
    ro.observe(document.body);
    document.fonts?.ready.then(remeasure).catch(() => {});
    cleanups.push(() => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasure);
      ro.disconnect();
    });

    // ---- pointer drift (fine pointers only, hero only)
    if (finePointer && !reduced && pointerEls.length) {
      const hero = document.getElementById("home");
      let tx = 0, ty = 0, cx = 0, cy = 0, praf = 0, heroVisible = true;
      const heroIO = new IntersectionObserver(([e]) => (heroVisible = e.isIntersecting));
      if (hero) heroIO.observe(hero);
      const loop = () => {
        praf = 0;
        cx += (tx - cx) * 0.06;
        cy += (ty - cy) * 0.06;
        for (const el of pointerEls) {
          const k = Number(el.dataset.pointerLayer) || 0;
          el.style.translate = `${(cx * k).toFixed(2)}px ${(cy * k * 0.6).toFixed(2)}px`;
        }
        if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) praf = requestAnimationFrame(loop);
      };
      const onMove = (e: PointerEvent) => {
        if (!heroVisible) return;
        tx = (e.clientX / window.innerWidth - 0.5) * 2;
        ty = (e.clientY / window.innerHeight - 0.5) * 2;
        if (!praf) praf = requestAnimationFrame(loop);
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      cleanups.push(() => {
        window.removeEventListener("pointermove", onMove);
        cancelAnimationFrame(praf);
        heroIO.disconnect();
      });
    }

    // ---- mobile menu
    const menu = document.querySelector<HTMLDetailsElement>("[data-menu]");
    if (menu) {
      const summary = menu.querySelector("summary");
      const onClick = (e: Event) => {
        if ((e.target as HTMLElement).closest("a")) menu.open = false;
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape" && menu.open) {
          menu.open = false;
          summary?.focus();
        }
      };
      const onToggle = () => doc.classList.toggle("menu-open", menu.open);
      menu.addEventListener("click", onClick);
      menu.addEventListener("toggle", onToggle);
      document.addEventListener("keydown", onKey);
      cleanups.push(() => {
        menu.removeEventListener("click", onClick);
        menu.removeEventListener("toggle", onToggle);
        document.removeEventListener("keydown", onKey);
        doc.classList.remove("menu-open");
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
