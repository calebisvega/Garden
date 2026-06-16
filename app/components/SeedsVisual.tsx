"use client";

import { useEffect, useState } from "react";

const FRAME_COUNT = 10;
const FRAMES = Array.from(
  { length: FRAME_COUNT },
  (_, i) => `/garden/seeds-frames/frame-${String(i + 1).padStart(2, "0")}.png`
);
const FRAME_MS = 5000;
const FADE_MS = 1400;

export function SeedsVisual() {
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setAnimate(false);
      return;
    }

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % FRAMES.length);
    }, FRAME_MS);
    return () => window.clearInterval(id);
  }, []);

  const activeIndex = animate ? index : 0;

  return (
    <div className="relative h-full min-h-[280px] w-full overflow-hidden bg-black sm:min-h-[360px] md:min-h-[620px]">
      {!ready && (
        <div className="absolute inset-0 animate-pulse bg-garden-green/40" aria-hidden />
      )}
      {FRAMES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={i === activeIndex ? "Stone seeds nestled in tree bark" : ""}
          aria-hidden={i !== activeIndex}
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity ease-in-out ${
            i === activeIndex ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDuration: `${FADE_MS}ms` }}
          onLoad={() => {
            if (i === 0) setReady(true);
          }}
        />
      ))}
    </div>
  );
}
