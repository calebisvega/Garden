"use client";

import { useState } from "react";
import { FeedPreviewColumn, FeedPreviewPane } from "./FeedPreviewColumn";

type NewsHeadline = {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
};

type WindsSectionProps = {
  sectionRef: (el: HTMLElement | null) => void;
  news: NewsHeadline[];
  isLoading: boolean;
  hasError?: boolean;
  videoSrc?: string;
};

const windsVideoClassName =
  "pointer-events-none absolute left-1/2 top-1/2 h-full w-full min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 scale-[1.2] object-cover object-center";

export function WindsSection({
  sectionRef,
  news,
  isLoading,
  hasError,
  videoSrc = "/garden/clouds.mov",
}: WindsSectionProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const items = news.slice(0, 6);

  return (
    <section
      id="winds"
      ref={sectionRef}
      className="snap-panel flex h-dvh min-h-dvh scroll-mt-0 p-3 md:p-5"
    >
      <div className="stream-card relative h-[min(88dvh,900px)] w-full overflow-hidden bg-garden-green leading-[0]">
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className={windsVideoClassName}
          >
            <source src={videoSrc} type="video/quicktime" />
            <source src={videoSrc} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/42" />
          <div className="hero-video-noise absolute inset-0 opacity-[0.35] mix-blend-overlay" />
        </div>

        <div className="absolute inset-0 z-10 flex flex-col p-4 sm:p-5 md:p-7">
          <p className="shrink-0 text-[17px] font-semibold lowercase tracking-wide text-garden-light sm:text-[19px]">
            winds,{" "}
            <span className="font-normal">
              from the new york times, bloomberg, cnn, sherwood and wired
            </span>
            {isLoading && (
              <span className="ml-2 text-[13px] font-normal text-garden-light/50 animate-pulse">
                loading...
              </span>
            )}
          </p>

          <FeedPreviewPane preview={preview} />

          <div className="relative mt-auto w-full overflow-hidden pt-4">
            <div className="winds-scroll -mx-1 flex items-end gap-6 overflow-x-auto px-1 pb-1 sm:gap-8 md:gap-10">
              {items.length > 0
                ? items.map((item) => (
                    <FeedPreviewColumn
                      key={item.id}
                      className="w-[min(78vw,16.5rem)] shrink-0 snap-start sm:w-[min(42vw,18rem)] md:w-[min(28vw,20rem)]"
                      title={item.title}
                      meta={item.source}
                      summary={item.summary}
                      url={item.url}
                      onPreviewEnter={setPreview}
                      onPreviewLeave={() => setPreview(null)}
                    />
                  ))
                : isLoading
                  ? [1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-[min(78vw,16.5rem)] shrink-0 animate-pulse snap-start space-y-2 sm:w-[min(42vw,18rem)]"
                        aria-hidden
                      >
                        <div className="h-[1.22em] w-full rounded bg-garden-light/15" />
                        <div className="h-3 w-1/3 rounded bg-garden-light/10" />
                      </div>
                    ))
                  : (
                    <p className="font-sans text-[13px] text-garden-light/60 sm:text-[14px]">
                      {hasError
                        ? "unable to load news. check your connection and refresh."
                        : "no headlines available right now."}
                    </p>
                  )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
