"use client";
import { motion, useReducedMotion } from "framer-motion";
export function Reveal({
  children,
  className = "",
  delay = 0,
  interactive = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  interactive?: boolean;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 24 }}
      animate={reduced ? { opacity: 1, y: 0 } : undefined}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      whileHover={interactive && !reduced ? { y: -5 } : undefined}
      transition={{
        duration: reduced ? 0 : 0.65,
        delay: reduced ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
