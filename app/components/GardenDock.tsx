"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const DOCK_ITEMS = ["profile", "preferences"] as const;

const PLAYER_PLACEHOLDER = {
  title: "weightless",
  artist: "marconi union",
  elapsed: "00:11:53",
};

const BOTTOM_TRIGGER_PX = 44;
const HIDE_DELAY_MS = 380;

export function GardenDock() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const zoneRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<number | null>(null);
  const visibleRef = useRef(false);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const show = useCallback(() => {
    clearHideTimer();
    setVisible(true);
  }, [clearHideTimer]);

  const scheduleHide = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = window.setTimeout(() => {
      setVisible(false);
    }, HIDE_DELAY_MS);
  }, [clearHideTimer]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

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
        show();
        return;
      }

      if (visibleRef.current) {
        scheduleHide();
      }
    };

    const onPointerLeave = () => {
      if (visibleRef.current) {
        scheduleHide();
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      clearHideTimer();
    };
  }, [show, scheduleHide, clearHideTimer]);

  const dock = (
    <div
      ref={zoneRef}
      className={`garden-dock-zone${visible ? " is-visible" : ""}`}
      onPointerEnter={show}
      onPointerLeave={scheduleHide}
    >
      <nav className="garden-dock-bar font-sans w-full overflow-hidden" aria-label="Garden dock">
        <div className="garden-dock-sheen pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="garden-dock-texture hero-video-noise pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
          aria-hidden
        />

        <div className="garden-dock-inner relative z-[1] flex w-full items-center justify-center gap-3 sm:justify-between sm:gap-4">
          <div className="flex items-center gap-0">
            {DOCK_ITEMS.map((item, index) => (
              <span key={item} className="contents">
                {index > 0 ? (
                  <span className="garden-dock-divider shrink-0" aria-hidden />
                ) : null}
                <span className="garden-dock-item shrink-0">{item}</span>
              </span>
            ))}
          </div>

          <div className="garden-dock-player flex min-w-0 items-center gap-2 sm:gap-2.5">
            <span className="garden-dock-player-label shrink-0">player</span>
            <span className="garden-dock-divider shrink-0" aria-hidden />
            <button
              type="button"
              className="garden-dock-play shrink-0"
              aria-label="Play (template)"
              tabIndex={-1}
            >
              <svg
                viewBox="0 0 12 12"
                className="h-[0.42rem] w-[0.42rem] fill-current sm:h-[0.48rem] sm:w-[0.48rem]"
                aria-hidden
              >
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
        </div>
      </nav>
    </div>
  );

  if (!mounted) return null;
  return createPortal(dock, document.body);
}
