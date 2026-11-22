"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

let instance: Lenis | null = null;

/** Pause or resume smooth scrolling, e.g. while a full-screen menu is open. */
export function setSmoothScrollPaused(paused: boolean) {
  if (!instance) return;
  if (paused) instance.stop();
  else instance.start();
}

/** Inertial scrolling for wheel input. Touch keeps native momentum. */
export function SmoothScroll() {
  const path = usePathname();

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const stop = () => {
      cancelAnimationFrame(frame);
      instance?.destroy();
      instance = null;
      document.documentElement.classList.remove("lenis");
    };
    const start = () => {
      if (instance) return;
      const lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        anchors: { offset: -96 },
      });
      instance = lenis;
      const raf = (time: number) => {
        lenis.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
    };
    const sync = () => (query.matches ? stop() : start());

    sync();
    query.addEventListener("change", sync);
    return () => {
      query.removeEventListener("change", sync);
      stop();
    };
  }, []);

  // Each navigation starts at the top, without animating across the page.
  useEffect(() => {
    if (window.location.hash) return;
    instance?.scrollTo(0, { immediate: true, force: true });
  }, [path]);

  return null;
}
