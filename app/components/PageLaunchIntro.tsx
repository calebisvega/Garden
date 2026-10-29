"use client";

import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from "react";

type IntroPhase = "solid" | "mark" | "reveal" | "complete";

type PageLaunchIntroProps = {
  children: ReactNode;
};

const INTRO_SEEN_KEY = "garden:intro-seen:v1";
const MARK_DELAY_MS = 400;
const REVEAL_DELAY_MS = 900;
const CIRCLE_WIPE_MS = 4200;
const COMPLETE_BUFFER_MS = 350;

export function PageLaunchIntro({ children }: PageLaunchIntroProps) {
  const [phase, setPhase] = useState<IntroPhase>("solid");
  const [showCurtain, setShowCurtain] = useState(true);

  const finishIntro = useCallback(() => {
    setPhase("complete");
    setShowCurtain(false);
    document.documentElement.classList.remove("garden-intro-active");
    document.body.style.overflow = "";
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(INTRO_SEEN_KEY, "1");
      window.dispatchEvent(new Event("garden:intro-complete"));
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = window.sessionStorage.getItem(INTRO_SEEN_KEY) === "1";

    if (reducedMotion || seen) {
      finishIntro();
      return;
    }

    document.documentElement.classList.add("garden-intro-active");
    document.body.style.overflow = "hidden";

    const markTimer = window.setTimeout(() => setPhase("mark"), MARK_DELAY_MS);
    const revealTimer = window.setTimeout(() => setPhase("reveal"), REVEAL_DELAY_MS);
    const completeTimer = window.setTimeout(finishIntro, REVEAL_DELAY_MS + CIRCLE_WIPE_MS + COMPLETE_BUFFER_MS);

    return () => {
      window.clearTimeout(markTimer);
      window.clearTimeout(revealTimer);
      window.clearTimeout(completeTimer);
      document.documentElement.classList.remove("garden-intro-active");
      document.body.style.overflow = "";
    };
  }, [finishIntro]);

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
        <button
          type="button"
          className={curtainClass}
          style={curtainStyle}
          aria-label="Skip intro"
          onClick={finishIntro}
        >
          {(phase === "solid" || phase === "mark") && (
            <span className="garden-launch-mark" />
          )}
        </button>
      )}
    </>
  );
}
