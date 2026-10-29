"use client";

import { useEffect, useRef, useState } from "react";

export type SeedsChartPeriod = "day" | "week" | "month" | "year" | "five-year";

export const PERIOD_ORDER: SeedsChartPeriod[] = ["day", "week", "month", "year", "five-year"];

export const PERIOD_META: Record<
  SeedsChartPeriod,
  { heading: string; menuLabel: string }
> = {
  day: { heading: "Today", menuLabel: "today" },
  week: { heading: "This week", menuLabel: "this week" },
  month: { heading: "This month", menuLabel: "this month" },
  year: { heading: "This year", menuLabel: "this year" },
  "five-year": {
    heading: "The last five years",
    menuLabel: "the last five years",
  },
};

function possessiveSuffix(period: SeedsChartPeriod) {
  return period === "five-year" ? "'" : "'s";
}

type SeedsPeriodHeadingProps = {
  period: SeedsChartPeriod;
  previewPeriod: SeedsChartPeriod | null;
  onPreview: (period: SeedsChartPeriod | null) => void;
  onChange: (period: SeedsChartPeriod) => void;
  variant?: "default" | "glass";
};

export function SeedsPeriodHeading({
  period,
  previewPeriod,
  onPreview,
  onChange,
  variant = "default",
}: SeedsPeriodHeadingProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const displayPeriod = previewPeriod ?? period;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        onPreview(null);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, onPreview]);

  const menuOptions = PERIOD_ORDER.filter((value) => value !== period);

  const isGlass = variant === "glass";

  return (
    <div ref={rootRef} className="relative shrink-0 overflow-visible pr-2">
      <p
        className={`max-w-[min(100%,52rem)] font-display leading-[1.02] transition-opacity duration-200 ${
          isGlass
            ? "text-[clamp(1.85rem,4.2vw,2.75rem)] text-white"
            : "text-[clamp(2.65rem,6.5vw,4.35rem)] text-garden-light"
        } ${
          previewPeriod && previewPeriod !== period ? "opacity-[0.88]" : "opacity-100"
        }`}
      >
        <span
          className={`seeds-period-trigger group relative inline outline-none ${
            open ? "is-open" : ""
          }`}
          onMouseLeave={() => {
            if (!open) onPreview(null);
          }}
        >
          <button
            type="button"
            className={`inline cursor-pointer border-0 bg-transparent p-0 font-inherit text-inherit underline decoration-[0.07em] underline-offset-[0.14em] transition-[text-decoration-color] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${
              isGlass
                ? "decoration-white/45 hover:decoration-white/80 focus-visible:outline-white/45"
                : "decoration-garden-light/50 hover:decoration-garden-light/85 focus-visible:outline-garden-light/45"
            }`}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-label={`Change time period, currently ${PERIOD_META[period].menuLabel}`}
            onClick={() => setOpen((value) => !value)}
            onMouseEnter={() => setOpen(true)}
          >
            {PERIOD_META[displayPeriod].heading}
          </button>

          <span
            role="listbox"
            aria-label="Time period"
            className={`seeds-period-menu pointer-events-none absolute left-0 top-[calc(100%+0.65rem)] z-[60] flex w-[min(100vw-2.5rem,13.5rem)] flex-col gap-0.5 rounded-[1.1rem] border p-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md sm:left-[calc(100%+0.85rem)] sm:top-1/2 sm:w-[13.5rem] sm:-translate-y-1/2 sm:p-3 ${
              isGlass
                ? "border-white/15 bg-[#1a3328]/96"
                : "border-garden-light/12 bg-[#1a3328]/96"
            }`}
          >
            {menuOptions.map((value) => {
              const active = value === period;
              const previewing = value === previewPeriod;
              return (
                <button
                  key={value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`seeds-period-option inline-flex min-h-[2.15rem] w-full items-center justify-between rounded-lg px-2.5 font-sans text-[13px] lowercase tracking-wide transition-colors sm:text-[14px] ${
                    previewing
                      ? "bg-garden-light/14 text-garden-light"
                      : active
                        ? "bg-garden-light/10 text-garden-light"
                        : "text-garden-light/62 hover:bg-garden-light/[0.06] hover:text-garden-light/88"
                  }`}
                  onMouseEnter={() => {
                    onPreview(value);
                    setOpen(true);
                  }}
                  onFocus={() => onPreview(value)}
                  onClick={() => {
                    onChange(value);
                    onPreview(null);
                    setOpen(false);
                  }}
                >
                  <span>{PERIOD_META[value].menuLabel}</span>
                  <span
                    className={`inline-flex h-1.5 w-1.5 shrink-0 rounded-full border border-garden-light/70 ${
                      active || previewing ? "bg-garden-light" : "bg-transparent"
                    }`}
                    aria-hidden
                  />
                </button>
              );
            })}
          </span>
        </span>
        {possessiveSuffix(displayPeriod)} performance at a glance.
      </p>
    </div>
  );
}
