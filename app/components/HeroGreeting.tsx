"use client";

import { useEffect, useState } from "react";
import { RisingText } from "./RisingText";

type HeroGreetingProps = {
  period: string;
  displayName: string;
};

const GREETING_HOLD_MS = 2400;
const FADE_MS = 1200;

export function HeroGreeting({ period, displayName }: HeroGreetingProps) {
  const [greetingVisible, setGreetingVisible] = useState(true);
  const [welcomeVisible, setWelcomeVisible] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setGreetingVisible(false);
      setWelcomeVisible(true);
      return;
    }

    const runSequence = () => {
      const fadeOutTimer = window.setTimeout(() => {
        setGreetingVisible(false);
      }, GREETING_HOLD_MS);

      const welcomeTimer = window.setTimeout(() => {
        setWelcomeVisible(true);
      }, GREETING_HOLD_MS + FADE_MS * 0.35);

      return () => {
        window.clearTimeout(fadeOutTimer);
        window.clearTimeout(welcomeTimer);
      };
    };

    let cleanup = () => {};
    const onIntroComplete = () => {
      cleanup = runSequence();
    };

    window.addEventListener("garden:intro-complete", onIntroComplete, { once: true });
    const fallback = window.setTimeout(onIntroComplete, 1800);

    return () => {
      window.removeEventListener("garden:intro-complete", onIntroComplete);
      window.clearTimeout(fallback);
      cleanup();
    };
  }, []);

  const greetingText = `good ${period}, ${displayName}`;

  return (
    <div className="relative flex min-h-[1.35em] items-center justify-center pt-10 font-sans lowercase md:pt-10">
      <p
        className={`absolute text-[13px] font-semibold leading-tight transition-opacity ease-in-out md:text-[16px] ${
          greetingVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ transitionDuration: `${FADE_MS}ms` }}
        aria-hidden={!greetingVisible}
      >
        <RisingText text={greetingText} baseDelay={0} staggerMs={28} />
      </p>
      <p
        className={`text-[13px] font-semibold leading-tight transition-opacity ease-in-out md:text-[16px] ${
          welcomeVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ transitionDuration: `${FADE_MS}ms` }}
        aria-hidden={!welcomeVisible}
      >
        welcome to your
      </p>
    </div>
  );
}
