"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GardenWordmark } from "./GardenWordmark";
import { HeaderIndexNav, type GardenIndex } from "./HeaderIndexNav";

const ANCHOR_TOP = 22;
const FINAL_FONT_PX = 26;
const SHRINK_TRIGGER_TOP = 40;
/** More viewport travel = slower shrink */
const SHRINK_TRAVEL = 780;
const SCROLL_START = 8;
const SCALE_LERP = 0.048;
const SCALE_LERP_FINE = 0.072;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function getScrollY() {
  return window.scrollY || document.documentElement.scrollTop || 0;
}

type ShrinkingGardenTitleProps = {
  className?: string;
  isNight?: boolean;
  dateLabel?: string;
  timeLabel?: string;
  activeIndex?: GardenIndex;
  onIndexChange?: (value: GardenIndex) => void;
};

type OverlayState = {
  top: number;
  scale: number;
  endScale: number;
  fontSize: string;
  visible: boolean;
  floating: boolean;
  pinned: boolean;
  showScrollHeader: boolean;
  hidePlaceholder: boolean;
};

export function ShrinkingGardenTitle({
  className = "",
  isNight = false,
  dateLabel = "",
  timeLabel = "",
  activeIndex = "stream",
  onIndexChange,
}: ShrinkingGardenTitleProps) {
  const placeholderRef = useRef<HTMLHeadingElement>(null);
  const scaleRef = useRef(1);
  const overlayRef = useRef<OverlayState>({
    top: 0,
    scale: 1,
    endScale: 0.1,
    fontSize: "261px",
    visible: true,
    floating: false,
    pinned: false,
    showScrollHeader: false,
    hidePlaceholder: false,
  });
  const [mounted, setMounted] = useState(false);
  const [overlay, setOverlay] = useState<OverlayState>(overlayRef.current);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let rafId = 0;

    const commitOverlay = (next: OverlayState) => {
      const prev = overlayRef.current;
      const changed =
        Math.abs(prev.top - next.top) > 0.25 ||
        Math.abs(prev.scale - next.scale) > 0.001 ||
        prev.fontSize !== next.fontSize ||
        prev.visible !== next.visible ||
        prev.floating !== next.floating ||
        prev.pinned !== next.pinned ||
        prev.showScrollHeader !== next.showScrollHeader ||
        prev.hidePlaceholder !== next.hidePlaceholder;

      if (!changed) return;
      overlayRef.current = next;
      setOverlay(next);
    };

    const tick = () => {
      const el = placeholderRef.current;
      if (!el) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      const scrollY = getScrollY();
      const rect = el.getBoundingClientRect();
      const fontSizePx = parseFloat(getComputedStyle(el).fontSize);
      const endScale = FINAL_FONT_PX / fontSizePx;
      const hasScrolled = scrollY > SCROLL_START;
      const inShrinkZone = rect.top <= SHRINK_TRIGGER_TOP;

      const shrinkProgress = inShrinkZone
        ? Math.min(1, Math.max(0, (SHRINK_TRIGGER_TOP - rect.top) / SHRINK_TRAVEL))
        : 0;
      const targetScale = 1 - easeOutCubic(shrinkProgress) * (1 - endScale);

      const lerp =
        Math.abs(targetScale - scaleRef.current) < 0.03 ? SCALE_LERP_FINE : SCALE_LERP;
      scaleRef.current += (targetScale - scaleRef.current) * lerp;

      if (Math.abs(targetScale - scaleRef.current) < 0.001) {
        scaleRef.current = targetScale;
      }

      const showScrollHeader = inShrinkZone && hasScrolled;
      const pinned = showScrollHeader && scaleRef.current <= endScale * 1.04;
      const floating = showScrollHeader && !pinned;
      const visible = showScrollHeader || rect.bottom > 0;
      const hidePlaceholder = showScrollHeader && scaleRef.current < 0.98;

      commitOverlay({
        top: pinned ? ANCHOR_TOP : Math.max(ANCHOR_TOP, rect.top),
        scale: scaleRef.current,
        endScale,
        fontSize: `${fontSizePx}px`,
        visible,
        floating,
        pinned,
        showScrollHeader,
        hidePlaceholder,
      });

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    window.addEventListener("resize", tick);
    window.addEventListener("garden:scroll", tick);
    window.addEventListener("scroll", tick, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", tick);
      window.removeEventListener("garden:scroll", tick);
      window.removeEventListener("scroll", tick);
    };
  }, []);

  const heroTextColor = isNight
    ? "var(--garden-text-light)"
    : "#000000";

  const scrollHeader =
    mounted && overlay.showScrollHeader && overlay.visible ? (
      <header
        className="pointer-events-none fixed inset-x-0 top-0 z-[100] mx-auto flex w-full max-w-[1512px] items-center justify-between px-5 pt-[22px] md:px-14"
        aria-label="Garden header"
      >
        <p className="min-w-0 flex-1 truncate text-left text-garden-meta text-garden-light">
          {dateLabel}
        </p>
        <span
          className={`shrink-0 whitespace-nowrap px-4 font-display uppercase leading-none text-garden-light transition-opacity duration-200 ${
            overlay.pinned ? "text-[26px] opacity-100" : "pointer-events-none text-[26px] opacity-0"
          }`}
          aria-hidden={!overlay.pinned}
        >
          <GardenWordmark />
        </span>
        <HeaderIndexNav
          timeLabel={timeLabel}
          index={activeIndex}
          onChange={(id) => onIndexChange?.(id)}
        />
      </header>
    ) : null;

  const floatingTitle =
    mounted && overlay.visible && overlay.floating ? (
      <div
        className="pointer-events-none fixed left-1/2 z-[101] whitespace-nowrap font-display font-normal uppercase leading-[0.92] tracking-[-0.03em] text-garden-light"
        style={{
          top: overlay.top,
          fontSize: overlay.fontSize,
          transform: `translateX(-50%) scale(${overlay.scale})`,
          transformOrigin: "top center",
          willChange: "transform, top",
        }}
        aria-hidden
      >
        <GardenWordmark />
      </div>
    ) : null;

  return (
    <>
      <h1
        ref={placeholderRef}
        className={`whitespace-nowrap font-display font-normal uppercase leading-[0.92] tracking-[-0.03em] text-inherit ${className} ${
          overlay.hidePlaceholder ? "invisible" : ""
        }`}
        style={{ color: heroTextColor }}
      >
        <GardenWordmark />
      </h1>

      {mounted && typeof document !== "undefined"
        ? createPortal(
            <>
              {scrollHeader}
              {floatingTitle}
            </>,
            document.body
          )
        : null}
    </>
  );
}
