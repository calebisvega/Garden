"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

type IntroPhase = "solid" | "mark" | "reveal" | "complete";

type PageLaunchIntroProps = {
  children: ReactNode;
};

/** Green hold → brief mark → pause → slow circular wipe with long end settle */
const MARK_DELAY_MS = 500;
const REVEAL_DELAY_MS = 1700;
const CIRCLE_WIPE_MS = 15000;
const COMPLETE_BUFFER_MS = 500;

export function PageLaunchIntro({ children }: PageLaunchIntroProps) {
  const [phase, setPhase] = useState<IntroPhase>("solid");
  const [showCurtain, setShowCurtain] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setPhase("complete");
      setShowCurtain(false);
      return;
    }

    document.documentElement.classList.add("garden-intro-active");
    document.body.style.overflow = "hidden";

    const markTimer = window.setTimeout(() => setPhase("mark"), MARK_DELAY_MS);
    const revealTimer = window.setTimeout(() => setPhase("reveal"), REVEAL_DELAY_MS);
    const completeTimer = window.setTimeout(() => {
      setPhase("complete");
      setShowCurtain(false);
      document.documentElement.classList.remove("garden-intro-active");
      document.body.style.overflow = "";
      window.dispatchEvent(new Event("garden:intro-complete"));
    }, REVEAL_DELAY_MS + CIRCLE_WIPE_MS + COMPLETE_BUFFER_MS);

    return () => {
      window.clearTimeout(markTimer);
      window.clearTimeout(revealTimer);
      window.clearTimeout(completeTimer);
      document.documentElement.classList.remove("garden-intro-active");
      document.body.style.overflow = "";
    };
  }, []);

  const curtainStyle = {
    "--garden-circle-wipe-ms": `${CIRCLE_WIPE_MS}ms`,
  } as CSSProperties;

  const curtainClass = [
    "garden-launch-curtain",
    phase === "reveal" && "garden-launch-curtain--reveal",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div className="garden-launch-content">{children}</div>
      {showCurtain && (
        <div className={curtainClass} style={curtainStyle} aria-hidden>
          {(phase === "solid" || phase === "mark") && (
            <span className="garden-launch-mark" />
          )}
        </div>
      )}
    </>
  );
}
