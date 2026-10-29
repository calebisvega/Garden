"use client";

import { useEffect, useRef, useState } from "react";

const FALLBACK_IMAGE = "/garden/hero-forest.png";

const videoClassName =
  "pointer-events-none absolute left-1/2 top-1/2 h-full w-full min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 scale-[1.15] object-cover object-center blur-[18px] saturate-[1.12] transition-opacity duration-700";

type GrowthStageBackgroundProps = {
  videoSrc: string;
};

export function GrowthStageBackground({ videoSrc }: GrowthStageBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const play = () => {
      void video.play().catch(() => {});
    };

    video.addEventListener("loadeddata", play);
    video.addEventListener("canplay", play);
    play();

    return () => {
      video.removeEventListener("loadeddata", play);
      video.removeEventListener("canplay", play);
    };
  }, [videoSrc]);

  return (
    <div className="growth-stage-bg absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${FALLBACK_IMAGE})` }}
        aria-hidden
      />
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className={`${videoClassName} ${videoReady ? "opacity-100" : "opacity-0"}`}
        onLoadedData={() => setVideoReady(true)}
        onError={() => setVideoReady(false)}
        aria-hidden
      >
        <source src={videoSrc} type="video/quicktime" />
        <source src={videoSrc} type="video/mp4" />
      </video>
    </div>
  );
}
