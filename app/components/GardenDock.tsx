"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const PLAYER_PLACEHOLDER = {
  title: "weightless",
  artist: "marconi union",
  elapsed: "00:11:53",
};

const BOTTOM_TRIGGER_PX = 52;
const HIDE_DELAY_MS = 420;

export function GardenDock() {
  const [arrowVisible, setArrowVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const zoneRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<number | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHideArrow = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = window.setTimeout(() => {
      setArrowVisible(false);
      setExpanded(false);
    }, HIDE_DELAY_MS);
  }, [clearHideTimer]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const pointerNearBottom = (clientY: number) =>
      clientY >= window.innerHeight - BOTTOM_TRIGGER_PX;

    const pointerOverDock = (clientX: number, clientY: number) => {
      const zone = zoneRef.current;
      if (!zone) return false;
      const rect = zone.getBoundingClientRect();
      return (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      );
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;

      const { clientX, clientY } = event;
      if (pointerNearBottom(clientY) || pointerOverDock(clientX, clientY)) {
        clearHideTimer();
        setArrowVisible(true);
        return;
      }

      scheduleHideArrow();
    };

    const onPointerLeave = () => {
      scheduleHideArrow();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      clearHideTimer();
    };
  }, [clearHideTimer, scheduleHideArrow]);

  const zoneClass = [
    "garden-dock-zone",
    expanded ? "is-expanded" : "",
    !expanded && arrowVisible ? "is-arrow-visible" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const dock = (
    <div
      ref={zoneRef}
      className={zoneClass}
      onPointerEnter={clearHideTimer}
      onPointerLeave={scheduleHideArrow}
    >
      <button
        type="button"
        className="garden-dock-toggle seeds-glass-panel"
        aria-expanded={expanded}
        aria-label={expanded ? "Hide dock" : "Show dock"}
        onClick={() => setExpanded((value) => !value)}
      >
        <svg
          viewBox="0 0 16 16"
          className={`garden-dock-toggle-icon ${expanded ? "is-expanded" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M4 10 L8 6 L12 10" />
        </svg>
      </button>

      <nav className="garden-dock-bar seeds-glass-panel font-sans w-full" aria-label="Garden dock">
        <div className="garden-dock-inner flex w-full items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-0 overflow-x-auto">
            <Link href="/preferences" className="garden-dock-link shrink-0">
              preferences
            </Link>
            <span className="garden-dock-divider shrink-0" aria-hidden />
            <span className="garden-dock-label shrink-0">player</span>
            <span className="garden-dock-divider shrink-0" aria-hidden />
            <button
              type="button"
              className="garden-dock-play shrink-0"
              aria-label="Play (template)"
              tabIndex={expanded ? 0 : -1}
            >
              <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 fill-current" aria-hidden>
                <path d="M2.5 1.8 9.8 6 2.5 10.2Z" />
              </svg>
            </button>
            <p className="garden-dock-track min-w-0 truncate">
              <span className="garden-dock-track-title">{PLAYER_PLACEHOLDER.title}</span>
              <span className="garden-dock-track-artist hidden sm:inline">
                {" "}
                — {PLAYER_PLACEHOLDER.artist}
              </span>
            </p>
            <time className="garden-dock-time shrink-0 tabular-nums" dateTime="PT11M53S">
              {PLAYER_PLACEHOLDER.elapsed}
            </time>
          </div>

          <div className="flex shrink-0 items-center gap-0">
            <span className="garden-dock-divider shrink-0" aria-hidden />
            <button
              type="button"
              className="garden-dock-icon-btn"
              aria-label="Profile"
              tabIndex={expanded ? 0 : -1}
            >
              <svg
                viewBox="0 0 16 16"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.35"
                aria-hidden
              >
                <circle cx="8" cy="5.5" r="2.25" />
                <path d="M3.5 13.5c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );

  if (!mounted) return null;
  return createPortal(dock, document.body);
}
