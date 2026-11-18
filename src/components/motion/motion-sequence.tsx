"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

export const sequenceVariants = (reduced: boolean | null): Variants => ({
  hidden: { opacity: reduced ? 1 : 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: reduced ? 0 : 0.2,
      when: "beforeChildren",
      delayChildren: reduced ? 0 : 0.06,
      staggerChildren: reduced ? 0 : 0.09,
    },
  },
});

export const sequenceItemVariants = (reduced: boolean | null): Variants => ({
  hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: reduced ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] },
  },
});

export function MotionSequence({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={sequenceVariants(reduced)}
      initial={reduced ? false : "hidden"}
      animate={reduced ? "visible" : undefined}
      whileInView="visible"
      viewport={{ once: true, amount: 0.08 }}
    >
      {children}
    </motion.div>
  );
}

export function MotionItem({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div className={className} variants={sequenceItemVariants(reduced)}>
      {children}
    </motion.div>
  );
}
