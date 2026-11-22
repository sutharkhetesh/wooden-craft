"use client";

import { motion, useReducedMotion } from "framer-motion";

export type HeadingWord = { text: string; em?: boolean };

/**
 * Headline that rises word by word out of a mask. Each inner array is a line.
 * The visible words are hidden from assistive tech and replaced by one label.
 */
export function SplitHeading({
  lines,
  className = "",
  delay = 0.15,
}: {
  lines: HeadingWord[][];
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const label = lines.map((line) => line.map((w) => w.text).join(" ")).join(" ");
  let index = 0;
  return (
    <h1 className={className} aria-label={label}>
      {lines.map((line, l) => (
        <span className="split-line" key={l} aria-hidden="true">
          {line.map((word) => {
            const i = index++;
            const Tag = word.em ? "em" : "span";
            return (
              <span className="split-mask" key={i}>
                <motion.span
                  className="split-word"
                  initial={reduced ? false : { y: "115%", rotate: 3 }}
                  animate={{ y: "0%", rotate: 0 }}
                  transition={{
                    duration: reduced ? 0 : 1,
                    delay: reduced ? 0 : delay + i * 0.09,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Tag>{word.text}</Tag>
                </motion.span>
              </span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}
