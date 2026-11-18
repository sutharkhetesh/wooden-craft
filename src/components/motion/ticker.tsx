"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";

/** A custom ticker built with the open-source Motion engine. */
export function Ticker({
  items,
  label = "Studio notes",
  velocity = 28,
}: {
  items: string[];
  label?: string;
  velocity?: number;
}) {
  const region = useRef<HTMLElement>(null);
  const group = useRef<HTMLDivElement>(null);
  const groupWidth = useRef(0);
  const x = useMotionValue(0);
  const inView = useInView(region);
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const element = group.current;
    if (!element) return;
    const measure = () => {
      groupWidth.current = element.getBoundingClientRect().width;
      if (groupWidth.current) x.set(x.get() % groupWidth.current);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => observer.disconnect();
  }, [x]);

  useAnimationFrame((_time, delta) => {
    if (reduced || hovered || !inView || !groupWidth.current) return;
    const next = x.get() - (velocity * Math.min(delta, 64)) / 1000;
    x.set(next <= -groupWidth.current ? next + groupWidth.current : next);
  });

  return (
    <section
      ref={region}
      className="ticker"
      aria-label={label}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      data-ticker-paused={hovered}
    >
      <ul className="sr-only">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="ticker-window" aria-hidden="true">
        <motion.div className="ticker-track" style={{ x }}>
          {[0, 1, 2].map((copy) => (
            <div
              key={copy}
              ref={copy === 0 ? group : undefined}
              className="ticker-group"
              data-ticker-copy={copy}
            >
              {items.map((item) => (
                <span className="ticker-item" key={item}>
                  <span className="ticker-dot" />
                  {item}
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
