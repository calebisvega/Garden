"use client";

import { useState } from "react";

type FeedPreviewColumnProps = {
  title: string;
  meta: string;
  summary?: string;
  url?: string;
  className?: string;
  /** When true, circle + arrow row only shows on hover/focus (Stream). */
  actionsOnHover?: boolean;
  onPreviewEnter?: (summary: string) => void;
  onPreviewLeave?: () => void;
};

function stripEmojis(text: string) {
  return text
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/\uFE0F/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function FeedPreviewColumn({
  title,
  meta,
  summary = "",
  url,
  className = "",
  actionsOnHover = false,
  onPreviewEnter,
  onPreviewLeave,
}: FeedPreviewColumnProps) {
  const [active, setActive] = useState(false);
  const cleanedTitle = stripEmojis(title);
  const hasLink = Boolean(url && url !== "#");

  return (
    <div
      className={`stream-column block w-full ${active ? "is-interactive" : ""} ${className}`.trim()}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => {
        setActive(false);
        onPreviewLeave?.();
      }}
      onFocusCapture={() => setActive(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setActive(false);
          onPreviewLeave?.();
        }
      }}
    >
      <article className="relative flex w-full flex-col justify-end space-y-1.5">
        <h3
          className="stream-column-title font-display text-[19px] leading-[1.18] text-garden-light sm:text-[22px] sm:leading-[1.16]"
          title={cleanedTitle}
        >
          {cleanedTitle}
        </h3>
        <div
          className={`stream-column-actions flex items-center gap-2 ${
            actionsOnHover ? "stream-column-actions--hover" : ""
          }`.trim()}
        >
          <button
            type="button"
            className="stream-column-action inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-garden-light/75 text-garden-light transition-colors hover:border-garden-light hover:bg-garden-light/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-garden-light/50 sm:h-[1.35rem] sm:w-[1.35rem]"
            aria-label={`Preview ${cleanedTitle}`}
            onMouseEnter={() => {
              if (summary) onPreviewEnter?.(summary);
            }}
            onMouseLeave={() => onPreviewLeave?.()}
            onFocus={() => {
              if (summary) onPreviewEnter?.(summary);
            }}
            onBlur={() => onPreviewLeave?.()}
          />
          {hasLink ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="stream-column-action inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-garden-light/75 text-garden-light transition-colors hover:border-garden-light hover:bg-garden-light/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-garden-light/50 sm:h-[1.35rem] sm:w-[1.35rem]"
              aria-label={`Open ${cleanedTitle}`}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
            >
              <svg
                viewBox="0 0 16 16"
                className="h-2.5 w-2.5 sm:h-[0.65rem] sm:w-[0.65rem]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M4 12 L12 4" />
                <path d="M6.5 4 H12 V9.5" />
              </svg>
            </a>
          ) : null}
        </div>
        <p className="font-sans text-[12px] leading-snug text-garden-light/55 sm:text-[13px]">
          {meta}
        </p>
      </article>
    </div>
  );
}

export function FeedPreviewPane({
  preview,
  className = "",
}: {
  preview: string | null;
  className?: string;
}) {
  return (
    <div
      className={`stream-preview pointer-events-none mx-auto flex min-h-0 flex-1 items-center justify-center px-2 py-6 transition-opacity duration-300 sm:px-6 md:px-10 ${
        preview ? "opacity-100" : "opacity-0"
      } ${className}`.trim()}
      aria-live="polite"
      aria-hidden={!preview}
    >
      <p className="max-w-[42rem] text-center font-display text-[clamp(1.35rem,3.2vw,2.35rem)] leading-[1.2] text-garden-light">
        {preview ?? "\u00a0"}
      </p>
    </div>
  );
}
