"use client";

import { useEffect, useState } from "react";
import * as motion from "framer-motion/client";
import { AnimatePresence } from "framer-motion";

const lines = [
  "Knocking on GitHub's door",
  "Pulling your repos (gently)",
  "Checking who you are",
  "Counting your pull requests",
  "Peeking at your favourite languages",
];

const LINE_INTERVAL_MS = 1500;

export function LoadingStatements() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % lines.length);
    }, LINE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="inline-flex items-end" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {lines[index]}
        </motion.span>
      </AnimatePresence>
      <span className="flex item-center gap-0.5" aria-hidden>
        {[0, 1, 2].map((d) => (
          <motion.span
            key={d}
            className="size-1 rounded-full bg-primary"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ repeat: Infinity, duration: 1, delay: d * 0.2 }}
          />
        ))}
      </span>
    </span>
  );
}
