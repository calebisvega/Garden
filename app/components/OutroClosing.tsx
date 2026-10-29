"use client";

import { useEffect, useState } from "react";
import { RisingText } from "./RisingText";

const HOLD_MS = 2400;
const FADE_MS = 1200;

export function OutroClosing() {
  const [firstVisible, setFirstVisible] = useState(true);
  const [secondVisible, setSecondVisible] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setFirstVisible(false);
      setSecondVisible(true);
      return;
    }

    const fadeOut = window.setTimeout(() => setFirstVisible(false), HOLD_MS);
    const fadeIn = window.setTimeout(() => setSecondVisible(true), HOLD_MS + FADE_MS * 0.35);

    return () => {
      window.clearTimeout(fadeOut);
      window.clearTimeout(fadeIn);
    };
  }, []);

  return (
    <div className="relative mx-auto flex min-h-[1.35em] max-w-[28rem] items-center justify-center font-sans lowercase md:max-w-none">
      <p
        className={`absolute text-[13px] font-semibold leading-tight transition-opacity ease-in-out md:text-[16px] ${
          firstVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ transitionDuration: `${FADE_MS}ms` }}
        aria-hidden={!firstVisible}
      >
        <RisingText text="that's all for today," baseDelay={0} staggerMs={24} />
      </p>
      <p
        className={`text-[13px] font-semibold leading-tight transition-opacity ease-in-out md:text-[16px] ${
          secondVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ transitionDuration: `${FADE_MS}ms` }}
        aria-hidden={!secondVisible}
      >
        see you tomorrow in your
      </p>
    </div>
  );
}
