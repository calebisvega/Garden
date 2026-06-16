"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

export type GardenIndex = "stream" | "seeds" | "winds" | "growth";

const HEADER_INDEX_ITEMS: GardenIndex[] = ["stream", "seeds", "winds", "growth"];

type HeaderIndexNavProps = {
  timeLabel: string;
  index: GardenIndex;
  onChange: (value: GardenIndex) => void;
};

export function HeaderIndexNav({ timeLabel, index, onChange }: HeaderIndexNavProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <aside
      ref={rootRef}
      className={`header-index group pointer-events-auto relative flex min-w-0 flex-1 justify-end outline-none ${
        open ? "is-open" : ""
      }`}
    >
      <button
        type="button"
        className="flex min-h-11 min-w-11 items-center justify-end gap-1 rounded-sm text-garden-light transition-colors hover:text-garden-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-garden-light/50"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Section index"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="truncate text-right text-garden-meta">{timeLabel}</span>
        <span
          className={`inline-flex h-3 w-3 shrink-0 items-center justify-center text-garden-light/55 transition-transform duration-300 ease-out md:h-3.5 md:w-3.5 ${
            open ? "translate-y-0.5" : "group-hover:translate-y-0.5"
          }`}
          aria-hidden
        >
          <svg viewBox="0 0 12 12" className="h-full w-full fill-none stroke-current stroke-[1]">
            <path d="M2.5 4.5 6 8 9.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      <nav
        className="header-index-nav absolute right-0 top-full z-[110] flex flex-col items-end pt-1"
        aria-label="Section index"
      >
        {HEADER_INDEX_ITEMS.map((item, i) => {
          const active = index === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => {
                onChange(item);
                setOpen(false);
              }}
              style={{ "--header-index-i": i } as CSSProperties}
              className={`header-index-item inline-flex min-h-9 origin-right items-center gap-2 px-1 text-garden-index-item ${
                active ? "text-garden-light" : "text-garden-light/65"
              }`}
            >
              <span>{item}</span>
              <span
                className={`inline-flex h-1.5 w-1.5 rounded-full border border-garden-light/80 ${
                  active ? "bg-garden-light" : "bg-transparent"
                }`}
                aria-hidden
              />
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
