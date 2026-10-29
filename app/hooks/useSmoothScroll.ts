"use client";

import { useCallback, useEffect, useRef } from "react";
import Lenis from "lenis";

type ScrollTarget = string | number | HTMLElement;

const SNAP_TARGETS = [
  "#hero",
  "#hero-psalm",
  "#stream",
  "#seeds",
  "#winds",
  "#growth",
  "#outro",
] as const;

type SnapTarget = (typeof SNAP_TARGETS)[number];

function isSnapHash(hash: string): hash is SnapTarget {
  return (SNAP_TARGETS as readonly string[]).includes(hash);
}

const SNAP_OFFSET = 0;
const SNAP_SETTLE_MS = 100;
const SNAP_DURATION = 2.6;
const SCROLL_DURATION = 2.4;

const gardenEase = (t: number) => 1 - Math.pow(1 - t, 4);

function getSnapPoints() {
  return SNAP_TARGETS.map((selector) => {
    const el = document.querySelector(selector);
    if (!(el instanceof HTMLElement)) return null;
    return {
      el,
      top: el.getBoundingClientRect().top + window.scrollY + SNAP_OFFSET,
    };
  })
    .filter((point): point is { el: HTMLElement; top: number } => point !== null)
    .sort((a, b) => a.top - b.top);
}

function findNearestSnapIndex(scrollY: number) {
  const points = getSnapPoints();
  if (!points.length) return 0;

  let nearest = 0;
  let minDist = Infinity;
  for (let i = 0; i < points.length; i++) {
    const dist = Math.abs(points[i].top - scrollY);
    if (dist < minDist) {
      minDist = dist;
      nearest = i;
    }
  }
  return nearest;
}

function resolveSnapTarget(direction: 1 | -1, scrollY: number) {
  const points = getSnapPoints();
  if (!points.length) return null;

  if (direction > 0 && scrollY < 120) {
    const psalm = document.querySelector("#hero-psalm");
    if (psalm instanceof HTMLElement) return psalm;
  }

  const psalmEl = document.querySelector("#hero-psalm");
  if (direction > 0 && psalmEl instanceof HTMLElement) {
    const psalmTop = psalmEl.getBoundingClientRect().top + window.scrollY;
    if (Math.abs(scrollY - psalmTop) < 48) {
      const stream = document.querySelector("#stream");
      if (stream instanceof HTMLElement) return stream;
    }
  }

  const currentIndex = findNearestSnapIndex(scrollY);
  const targetIndex =
    direction >= 0
      ? Math.min(currentIndex + 1, points.length - 1)
      : Math.max(currentIndex - 1, 0);

  return points[targetIndex].el;
}

export function useSmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const isSnappingRef = useRef(false);
  const wheelDirectionRef = useRef<1 | -1>(1);
  const settleTimerRef = useRef<number | null>(null);
  const userHasScrolledRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    const initialHash = window.location.hash;
    const hasInitialHash = isSnapHash(initialHash);

    if (!hasInitialHash) {
      window.scrollTo(0, 0);
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (hasInitialHash) {
        document.querySelector(initialHash)?.scrollIntoView({ block: "start" });
      }
      return;
    }

    const lenis = new Lenis({
      lerp: 0.05,
      smoothWheel: true,
      wheelMultiplier: 0.5,
      touchMultiplier: 0.75,
      syncTouch: true,
      syncTouchLerp: 0.075,
      autoRaf: true,
    });

    lenisRef.current = lenis;

    const scrollToHash = (hash: string, immediate = false) => {
      if (!isSnapHash(hash)) return;
      const el = document.querySelector(hash);
      if (!(el instanceof HTMLElement)) return;

      userHasScrolledRef.current = true;
      isSnappingRef.current = true;
      lenis.scrollTo(el, {
        offset: SNAP_OFFSET,
        immediate,
        duration: immediate ? 0 : SCROLL_DURATION,
        easing: gardenEase,
        onComplete: () => {
          isSnappingRef.current = false;
        },
      });
    };

    if (!hasInitialHash) {
      lenis.scrollTo(0, { immediate: true });
    }

    const runInitialHashScroll = () => {
      if (hasInitialHash) scrollToHash(initialHash);
    };

    window.addEventListener("garden:intro-complete", runInitialHashScroll, { once: true });
    window.setTimeout(runInitialHashScroll, 180);

    const onHashChange = () => {
      const hash = window.location.hash;
      if (isSnapHash(hash)) scrollToHash(hash);
    };
    window.addEventListener("hashchange", onHashChange);

    const scheduleSnap = () => {
      if (isSnappingRef.current || !userHasScrolledRef.current) return;

      if (settleTimerRef.current) {
        window.clearTimeout(settleTimerRef.current);
      }

      settleTimerRef.current = window.setTimeout(() => {
        if (isSnappingRef.current || Math.abs(lenis.velocity) > 0.12) return;

        const target = resolveSnapTarget(wheelDirectionRef.current, lenis.animatedScroll);
        if (!target) return;

        const targetTop =
          target.getBoundingClientRect().top + window.scrollY + SNAP_OFFSET;

        if (Math.abs(targetTop - lenis.animatedScroll) < 12) return;

        isSnappingRef.current = true;
        lenis.scrollTo(target, {
          offset: SNAP_OFFSET,
          duration: SNAP_DURATION,
          easing: gardenEase,
          onComplete: () => {
            isSnappingRef.current = false;
          },
        });
      }, SNAP_SETTLE_MS);
    };

    const onWheel = (event: WheelEvent) => {
      if (isSnappingRef.current) return;
      userHasScrolledRef.current = true;
      wheelDirectionRef.current = event.deltaY > 0 ? 1 : -1;
      scheduleSnap();
    };

    const unsubscribeScroll = lenis.on("scroll", () => {
      window.dispatchEvent(
        new CustomEvent("garden:scroll", { detail: { scrollY: lenis.animatedScroll } })
      );

      if (!isSnappingRef.current && Math.abs(lenis.velocity) < 0.04) {
        scheduleSnap();
      }
    });

    window.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      unsubscribeScroll();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("garden:intro-complete", runInitialHashScroll);
      if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollTo = useCallback((target: ScrollTarget, offset = SNAP_OFFSET) => {
    const lenis = lenisRef.current;
    if (lenis) {
      userHasScrolledRef.current = true;
      isSnappingRef.current = true;
      lenis.scrollTo(target, {
        offset,
        duration: SCROLL_DURATION,
        easing: gardenEase,
        onComplete: () => {
          isSnappingRef.current = false;
        },
      });

      if (typeof target === "string" && isSnapHash(target)) {
        window.history.replaceState(null, "", target);
      } else if (target instanceof HTMLElement && target.id) {
        window.history.replaceState(null, "", `#${target.id}`);
      }
      return;
    }

    if (typeof target === "string") {
      document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return { scrollTo };
}
