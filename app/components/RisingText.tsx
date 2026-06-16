"use client";

import { useEffect, useState } from "react";

type RisingTextProps = {
  text: string;
  className?: string;
  /** Delay before the first word starts rising (ms) */
  baseDelay?: number;
  /** Delay between each word (ms) */
  staggerMs?: number;
};

export function RisingText({
  text,
  className = "",
  baseDelay = 0,
  staggerMs = 28,
}: RisingTextProps) {
  const [active, setActive] = useState(false);
  const words = text.split(/\s+/).filter(Boolean);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setActive(true);
      return;
    }

    const activate = () => setActive(true);
    const startTimer = window.setTimeout(activate, 350);
    window.addEventListener("garden:intro-complete", activate, { once: true });

    return () => {
      window.removeEventListener("garden:intro-complete", activate);
      window.clearTimeout(startTimer);
    };
  }, []);

  return (
    <span className={`garden-rise ${active ? "garden-rise-active" : ""} ${className}`}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="garden-rise-mask">
          <span
            className="garden-rise-word"
            style={{ animationDelay: `${baseDelay + index * staggerMs}ms` }}
          >
            {word}
          </span>
          {index < words.length - 1 ? "\u00A0" : null}
        </span>
      ))}
    </span>
  );
}
