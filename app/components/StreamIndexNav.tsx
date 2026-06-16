"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type GardenIndex = "stream" | "seeds" | "winds" | "growth";

const STREAM_INDEX_ITEMS: GardenIndex[] = ["seeds", "winds", "growth"];

type StreamIndexNavProps = {
  index: GardenIndex;
  onChange: (value: GardenIndex) => void;
};

const indexTypeClass =
  "text-[17px] font-semibold lowercase leading-snug tracking-wide sm:text-[19px]";

export function StreamIndexNav({ index, onChange }: StreamIndexNavProps) {
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
      className={`stream-index group absolute right-3 top-3 z-10 sm:right-5 sm:top-5 md:right-6 md:top-6 ${
        open ? "is-open" : ""
      }`}
    >
      <button
        type="button"
        className={`stream-index-label block min-h-11 min-w-11 text-right ${indexTypeClass} text-garden-light transition-colors hover:text-garden-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-garden-light/50`}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Section index"
        onClick={() => setOpen((value) => !value)}
      >
        index
      </button>
      <nav
        className="stream-index-nav mt-2 flex flex-col items-end gap-0 sm:mt-3"
        aria-label="Section index"
      >
        {STREAM_INDEX_ITEMS.map((item, i) => {
          const active = index === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => {
                onChange(item);
                setOpen(false);
              }}
              style={{ "--stream-index-i": i } as CSSProperties}
              className={`stream-index-item inline-flex min-h-10 origin-right items-center gap-2 px-1 font-sans ${indexTypeClass} ${
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
