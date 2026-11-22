"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Scroll-linked parallax for an image. The layer is scaled up slightly so the
 * travel never exposes the edges of the frame.
 */
export function ParallaxLayer({
  children,
  travel = 5,
  scale = 1.12,
  fromTop = false,
}: {
  children: React.ReactNode;
  /** Percentage of the frame the image travels in each direction. */
  travel?: number;
  scale?: number;
  /** Use for above-the-fold images: progress starts when the page is at top. */
  fromTop?: boolean;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: frame,
    offset: fromTop ? ["start start", "end start"] : ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    fromTop ? ["0%", `${travel * 2}%`] : [`-${travel}%`, `${travel}%`],
  );
  return (
    <div ref={frame} className="parallax-frame">
      <motion.div
        className="parallax-layer"
        style={reduced ? undefined : { y, scale }}
      >
        {children}
      </motion.div>
    </div>
  );
}
