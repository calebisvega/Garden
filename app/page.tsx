"use client";

/**
 * GARDEN — Your Personal OS
 * Design: Botanical Minimalism
 * Warm cream canvas, deep forest greens, serif display type,
 * nature photography, quiet interactions.
 *
 * Features:
 * - Live stock data via Yahoo Finance API (/api/stocks)
 * - Live RSS feeds from Substack & news outlets (/api/feeds)
 * - Smooth scroll navigation via the Index Switcher
 * - Intersection observer for active section tracking
 * - User preferences (name, tickers, feeds, goals) via localStorage
 */

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePreferences } from "./hooks/usePreferences";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import { useIsNightTime } from "./hooks/useIsNightTime";
import { ShrinkingGardenTitle } from "./components/ShrinkingGardenTitle";
import { GardenWordmark } from "./components/GardenWordmark";
import { SeedsSection } from "./components/SeedsSection";
import { GrowthSection } from "./components/GrowthSection";
import { WindsSection } from "./components/WindsSection";
import { StreamIndexNav } from "./components/StreamIndexNav";
import { HeroGreeting } from "./components/HeroGreeting";
import { OutroClosing } from "./components/OutroClosing";
import { FeedPreviewColumn, FeedPreviewPane } from "./components/FeedPreviewColumn";
import { GardenDock } from "./components/GardenDock";
import { PageLaunchIntro } from "./components/PageLaunchIntro";

type GardenIndex = "stream" | "seeds" | "winds" | "growth";

/* ─── Image URLs (local public/garden/ assets) ─── */
const IMG = {
  heroForest: "/garden/hero-forest.png",
  heroVideo: "/garden/grasses.mov",
  streamVideo: "/garden/stream.mp4",
  windsVideo: "/garden/clouds.mov",
  growthVideo: "/garden/dew.mov",
  outroVideo: "/garden/fjord.mov",
  blurredForest: "/garden/MacBook_Pro_14__-_2-49c08472-1dc8-40dc-aa4b-09c571ae79a9.png",
  barkTexture: "/garden/MacBook_Pro_14__-_6-871f5f91-c0fc-4402-8256-c71a2bfd9649.png",
  windsTexture: "/garden/MacBook_Pro_14__-_8-197439cb-4ec7-4f53-acc3-2b3f40173f64.png",
  waterfall: "/garden/MacBook_Pro_14__-_9-a92a895e-fe19-4c9c-99f3-b786c3dfd981.png",
};

/* ─── Types ─── */
type StockQuote = {
  ticker: string;
  title: string;
  price: number;
  change: number;
  changePercent: string;
  direction: "up" | "down";
  source: string;
};

type Article = {
  id: string;
  title: string;
  author: string;
  duration: string;
  url: string;
  publishedAt: string;
  source: string;
  summary: string;
};

type NewsHeadline = {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
};

/* ─── Hooks ─── */

function formatGreeting() {
  const now = new Date();
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(now);
  const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(now);
  const day = now.getDate();
  const ordinal = (n: number) => {
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
    const mod10 = n % 10;
    if (mod10 === 1) return `${n}st`;
    if (mod10 === 2) return `${n}nd`;
    if (mod10 === 3) return `${n}rd`;
    return `${n}th`;
  };
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const isPm = hours >= 12;
  const h12 = ((hours + 11) % 12) + 1;
  const period = hours < 12 ? "morning" : hours < 17 ? "afternoon" : "evening";
  return {
    dateLabel: `${weekday.toLowerCase()}, ${month.toLowerCase()} ${ordinal(day)}`,
    timeLabel: `${h12}:${minutes} ${isPm ? "pm" : "am"}`,
    period,
  };
}

/**
 * Custom hook to fetch data from our Next.js API routes.
 * Accepts user preferences to customize which tickers/feeds to load.
 */
function useGardenData(
  prefs: { tickers: string[]; substackFeeds: { url: string; name: string }[]; newsFeeds: { url: string; name: string }[] },
  prefsLoaded: boolean
) {
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [news, setNews] = useState<NewsHeadline[]>([]);
  const [stocksLoading, setStocksLoading] = useState(true);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [stocksError, setStocksError] = useState(false);
  const [articlesError, setArticlesError] = useState(false);
  const [newsError, setNewsError] = useState(false);

  // Stabilize the dependency arrays
  const tickersKey = (prefs.tickers ?? []).join(",");
  const feedsKey = (prefs.substackFeeds ?? []).map((f) => f.url).join(",");
  const newsKey = (prefs.newsFeeds ?? []).map((f) => f.url).join(",");

  useEffect(() => {
    if (!prefsLoaded) return;

    // Fetch stocks using user's tickers
    setStocksLoading(true);
    setStocksError(false);
    fetch(`/api/stocks?tickers=${tickersKey}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setStocks(data))
      .catch((err) => {
        console.warn("[Garden] Stock fetch failed:", err);
        setStocksError(true);
      })
      .finally(() => setStocksLoading(false));
  }, [tickersKey, prefsLoaded]);

  useEffect(() => {
    if (!prefsLoaded) return;

    // Fetch articles using user's substack feeds
    setArticlesLoading(true);
    setArticlesError(false);
    fetch("/api/feeds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "articles", limit: 8, feeds: prefs.substackFeeds ?? [] }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setArticles(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.warn("[Garden] Articles fetch failed:", err);
        setArticlesError(true);
      })
      .finally(() => setArticlesLoading(false));
  }, [feedsKey, prefsLoaded, prefs.substackFeeds]);

  useEffect(() => {
    if (!prefsLoaded) return;

    // Fetch news using user's news feeds
    setNewsLoading(true);
    setNewsError(false);
    fetch("/api/feeds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "news", limit: 6, feeds: prefs.newsFeeds ?? [] }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setNews(data))
      .catch((err) => {
        console.warn("[Garden] News fetch failed:", err);
        setNewsError(true);
      })
      .finally(() => setNewsLoading(false));
  }, [newsKey, prefsLoaded, prefs.newsFeeds]);

  return { stocks, articles, news, stocksLoading, articlesLoading, newsLoading, stocksError, articlesError, newsError };
}

/* ─── Main Page ─── */

export default function Home() {
  const [activeIndex, setActiveIndex] = useState<GardenIndex>("stream");
  const [flourishingHidden, setFlourishingHidden] = useState(false);
  const { scrollTo } = useSmoothScroll();
  const isNight = useIsNightTime();
  const greeting = useMemo(() => formatGreeting(), []);
  const { preferences, loaded: prefsLoaded } = usePreferences();

  const { stocks, articles, news, stocksLoading, articlesLoading, newsLoading, stocksError, articlesError, newsError } =
    useGardenData(
      {
        tickers: preferences.tickers,
        substackFeeds: preferences.substackFeeds,
        newsFeeds: preferences.newsFeeds,
      },
      prefsLoaded
    );

  const streamArticles = useMemo(
    () => orderStreamArticlesForDisplay(articles, 4),
    [articles]
  );

  // Section refs for intersection observer
  const sectionRefs = useRef<Record<GardenIndex, HTMLElement | null>>({
    stream: null,
    seeds: null,
    winds: null,
    growth: null,
  });

  // Intersection observer to update active index as user scrolls
  useEffect(() => {
    const psalmEl = document.getElementById("hero-psalm");
    if (!psalmEl) return;

    const psalmObserver = new IntersectionObserver(
      ([entry]) => {
        setFlourishingHidden(entry.isIntersecting && entry.intersectionRatio > 0.82);
      },
      { threshold: [0, 0.4, 0.65, 0.82, 0.95, 1] }
    );
    psalmObserver.observe(psalmEl);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id as GardenIndex;
            if (id) setActiveIndex(id);
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );

    const refs = sectionRefs.current;
    Object.values(refs).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      psalmObserver.disconnect();
      observer.disconnect();
    };
  }, []);

  const handleIndexClick = (id: GardenIndex) => {
    setActiveIndex(id);
    scrollTo(`#${id}`);
  };

  const handleNourishmentClick = () => {
    scrollTo("#stream");
  };

  return (
    <PageLaunchIntro>
    <main className="min-h-dvh overflow-x-hidden bg-[#ECECE8] text-neutral-900">
      {/* Hero — solid cream header, grass video below */}
      <section id="hero" className="snap-section bg-[#ECECE8] text-black">
        <div
          className={`w-full transition-colors duration-500 ${
            isNight ? "bg-garden-green text-garden-light" : ""
          }`}
        >
          <div className="mx-auto w-full max-w-[1512px] px-5 md:px-14">
            <HeroGreeting
              period={greeting.period}
              displayName={preferences.displayName}
            />

            <div className="pb-8 pt-5 md:pb-10 md:pt-6">
              <ShrinkingGardenTitle
                isNight={isNight}
                dateLabel={greeting.dateLabel}
                timeLabel={greeting.timeLabel}
                activeIndex={activeIndex}
                onIndexChange={handleIndexClick}
                className="w-full text-center text-[clamp(5.25rem,20.5vw,300px)]"
              />
            </div>
          </div>
        </div>

        <div
          id="hero-psalm"
          className="snap-panel relative left-1/2 h-[144dvh] min-h-[144dvh] w-[100vw] -translate-x-1/2 overflow-hidden leading-[0]"
        >
          <HeroVideo />
          <div className="absolute inset-x-0 top-0 z-10 flex justify-center px-5 pt-6 md:px-14 md:pt-8">
            <button
              type="button"
              onClick={handleNourishmentClick}
              className={`inline-flex flex-col items-center transition-all duration-[1.4s] ease-out hover:translate-y-px ${
                flourishingHidden
                  ? "pointer-events-none translate-y-2 opacity-0"
                  : "translate-y-0 opacity-100"
              }`}
            >
              <span className="block text-[13px] font-semibold lowercase leading-tight text-garden-light md:text-[16px]">
                flourishing awaits
              </span>
              <span
                className="mt-[0.35em] block h-[1px] w-full bg-garden-light"
                aria-hidden
              />
            </button>
          </div>
          <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-6 pt-5 sm:px-8 sm:pb-8 md:px-14">
            <div className="mx-auto grid w-full max-w-[1400px] gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-x-10">
              <div className="font-sans text-[15px] leading-snug text-garden-light sm:text-[22px] md:text-[32px]">
                <p>For as high as the heavens are above the earth,</p>
                <p>so great is His steadfast toward those who fear Him.</p>
              </div>
              <p className="font-sans text-[18px] leading-snug text-garden-light sm:text-[24px] md:text-[32px] md:pb-[0.05em]">
                Psalm 103:11
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stream + rest of dashboard */}
      <section className="bg-garden-green pb-12 text-garden-light sm:pb-16">
        {/* Stream — self-contained card */}
        <div
          id="stream"
          ref={(el) => { sectionRefs.current.stream = el; }}
          className="snap-panel flex h-dvh min-h-dvh items-center scroll-mt-0 p-3 md:p-5"
        >
          <div className="stream-card relative h-[min(88dvh,900px)] w-full overflow-hidden bg-garden-green leading-[0]">
            <StreamVideo />
            <StreamArticles
              articles={streamArticles}
              loading={articlesLoading}
              hasError={articlesError}
              activeIndex={activeIndex}
              onIndexChange={handleIndexClick}
            />
            </div>
        </div>

        <SeedsSection
          sectionRef={(el) => { sectionRefs.current.seeds = el; }}
          stocks={stocks}
          tickers={preferences.tickers}
          loading={stocksLoading}
          hasError={stocksError}
        />

        <WindsSection
          sectionRef={(el) => { sectionRefs.current.winds = el; }}
          news={news}
          isLoading={newsLoading}
          hasError={newsError}
          videoSrc={IMG.windsVideo}
        />

        <GrowthSection
          sectionRef={(el) => { sectionRefs.current.growth = el; }}
          goals={preferences.growthGoals}
          displayName={preferences.displayName}
          videoSrc={IMG.growthVideo}
        />
      </section>

      {/* Outro */}
      <section id="outro" className="snap-section bg-[#ECECE8]">
        <div className="relative min-h-[52vh] overflow-hidden sm:min-h-[58vh]">
          <OutroVideo />
          <div className="absolute inset-0 z-10 flex items-end bg-gradient-to-t from-black/55 via-black/20 to-transparent px-5 pb-8 pt-16 sm:px-8 sm:pb-10 md:px-14">
            <div className="max-w-xl space-y-3">
              <p className="font-sans text-[clamp(1.05rem,2.4vw,1.75rem)] leading-snug text-garden-light sm:text-[22px] md:text-[32px]">
                &ldquo;Knowing others is intelligence; knowing yourself is true wisdom.&rdquo;
              </p>
              <p className="font-sans text-[13px] lowercase tracking-wide text-garden-light/75 sm:text-[14px]">
                Lao Tzu
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-10 text-center sm:px-8 sm:py-12 md:px-14">
          <OutroClosing />
          <h2 className="mt-6 font-display text-[clamp(5.25rem,20.5vw,300px)] leading-none tracking-tight text-black">
            <GardenWordmark />
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-sans text-[11px] lowercase text-neutral-600 sm:text-[12px]">
            <Link href="/preferences" className="underline-offset-4 hover:underline">
              preferences
            </Link>
            <span className="text-neutral-400" aria-hidden>·</span>
            <button type="button" className="underline-offset-4 hover:underline">
              about us
            </button>
            <span className="text-neutral-400" aria-hidden>·</span>
            <span>commit to grow.</span>
            <span className="text-neutral-400" aria-hidden>·</span>
            <span>have a question, or funny joke? talk@garden.info.com</span>
          </div>
        </div>
      </section>
    </main>
    <GardenDock />
    </PageLaunchIntro>
  );
}

/* ─── Sub-components ─── */

function StreamVideo() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="pointer-events-none absolute left-1/2 top-1/2 h-full w-full min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 scale-[1.18] object-cover object-center blur-[0.65px] brightness-[0.98] contrast-[1.02]"
      >
        <source src={IMG.streamVideo} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/45" />
      <div className="hero-video-noise absolute inset-0 opacity-[0.42] mix-blend-overlay" />
      <div className="hero-video-noise hero-video-noise-alt absolute inset-0 opacity-[0.22] mix-blend-soft-light" />
    </div>
  );
}

/** Calm video loop helpers */
const HERO_VIDEO_LOOP_START = 0;
const HERO_VIDEO_PLAYBACK_RATE = 0.36;
const OUTRO_VIDEO_LOOP_START = 0.2;
const OUTRO_VIDEO_PLAYBACK_RATE = 0.42;
const OUTRO_LOOP_END_OFFSET = 0.35;

const heroVideoClassName =
  "pointer-events-none absolute left-1/2 top-1/2 h-full w-full min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 scale-[1.12] object-cover object-center blur-[0.65px] brightness-[0.98] contrast-[1.02]";

function prepareCalmVideo(
  video: HTMLVideoElement,
  {
    playbackRate,
    loopStart,
    loopEndOffset = 0.15,
  }: { playbackRate: number; loopStart: number; loopEndOffset?: number }
) {
  video.playbackRate = playbackRate;
  video.currentTime = loopStart;

  const onTimeUpdate = () => {
    const loopEnd = Math.max(loopStart + 0.5, video.duration - loopEndOffset);
    if (video.currentTime >= loopEnd) {
      video.currentTime = loopStart;
    }
  };

  video.addEventListener("timeupdate", onTimeUpdate);
  return () => video.removeEventListener("timeupdate", onTimeUpdate);
}

function HeroVideo() {
  const prepareVideo = (video: HTMLVideoElement) => {
    prepareCalmVideo(video, {
      playbackRate: HERO_VIDEO_PLAYBACK_RATE,
      loopStart: HERO_VIDEO_LOOP_START,
    });
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-garden-green leading-none">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-label="Slow grass landscape"
        onLoadedMetadata={(e) => prepareVideo(e.currentTarget)}
        className={heroVideoClassName}
      >
        <source src={IMG.heroVideo} type="video/quicktime" />
        <source src={IMG.heroVideo} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/45" aria-hidden />
      <div className="hero-video-noise absolute inset-0 opacity-[0.42] mix-blend-overlay" aria-hidden />
      <div className="hero-video-noise hero-video-noise-alt absolute inset-0 opacity-[0.22] mix-blend-soft-light" aria-hidden />
    </div>
  );
}

function OutroVideo() {
  const prepareVideo = (video: HTMLVideoElement) => {
    prepareCalmVideo(video, {
      playbackRate: OUTRO_VIDEO_PLAYBACK_RATE,
      loopStart: OUTRO_VIDEO_LOOP_START,
      loopEndOffset: OUTRO_LOOP_END_OFFSET,
    });
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-garden-green">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-label="Closing meditation"
        onLoadedMetadata={(e) => prepareVideo(e.currentTarget)}
        className={heroVideoClassName}
      >
        <source src={IMG.outroVideo} type="video/quicktime" />
        <source src={IMG.outroVideo} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/35" aria-hidden />
      <div className="hero-video-noise absolute inset-0 opacity-[0.35] mix-blend-overlay" aria-hidden />
    </div>
  );
}

function stripEmojis(text: string) {
  return text
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/\uFE0F/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Keep feed order, but move the shortest title to the last column. */
function orderStreamArticlesForDisplay<T extends { title: string }>(items: T[], limit = 4): T[] {
  const selected = items.slice(0, limit);
  if (selected.length <= 1) return selected;

  let shortestIndex = 0;
  let shortestLength = stripEmojis(selected[0].title).length;

  for (let i = 1; i < selected.length; i++) {
    const length = stripEmojis(selected[i].title).length;
    if (length < shortestLength) {
      shortestLength = length;
      shortestIndex = i;
    }
  }

  const shortest = selected[shortestIndex];
  const rest = selected.filter((_, index) => index !== shortestIndex);
  return [...rest, shortest];
}

function StreamArticles({
  articles,
  loading,
  hasError,
  activeIndex,
  onIndexChange,
}: {
  articles: Article[];
  loading: boolean;
  hasError: boolean;
  activeIndex: GardenIndex;
  onIndexChange: (value: GardenIndex) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <div className="absolute inset-0 z-10 flex flex-col p-4 sm:p-5 md:p-7">
      <p className="text-[17px] font-semibold lowercase tracking-wide text-garden-light sm:text-[19px]">
        stream,{" "}
        <span className="font-normal">from substack</span>
        {loading && (
          <span className="ml-2 animate-pulse text-[13px] text-garden-light/50">
            loading...
          </span>
        )}
      </p>

      <StreamIndexNav index={activeIndex} onChange={onIndexChange} />

      <FeedPreviewPane preview={preview} />

      <div className="stream-articles-grid mt-auto grid w-full items-end gap-x-6 gap-y-4 md:gap-x-8">
        {articles.length > 0
          ? articles.map((article) => (
              <FeedPreviewColumn
                key={article.id}
                title={article.title}
                meta={`${article.author} – ${article.duration}`}
                summary={article.summary}
                url={article.url}
                actionsOnHover
                onPreviewEnter={setPreview}
                onPreviewLeave={() => setPreview(null)}
              />
            ))
          : loading
            ? [1, 2, 3, 4].map((i) => (
                <div key={i} className="min-w-0 animate-pulse space-y-2">
                  <div className="h-[1.22em] w-full rounded bg-garden-light/15" />
                  <div className="h-3 w-1/2 rounded bg-garden-light/10" />
                </div>
              ))
            : hasError
              ? (
                <p className="col-span-2 text-[12px] text-garden-light/70 sm:text-[13px] md:col-span-4">
                  Unable to load articles. Check your connection and refresh.
                </p>
              )
              : (
                <p className="col-span-2 text-[12px] text-garden-light/70 sm:text-[13px] md:col-span-4">
                  No articles available right now.
                </p>
              )}
      </div>
    </div>
  );
}

type IndexProps = {
  index: GardenIndex;
  onChange: (value: GardenIndex) => void;
  compact?: boolean;
};

function IndexSwitcher({ index, onChange, compact = false }: IndexProps) {
  if (compact) {
    return (
      <div className="relative h-[72px] w-[72px] sm:h-[84px] sm:w-[84px]">
        <div className="absolute inset-0 rounded-full bg-garden-green/90" />
        <IndexItem compact active={index === "stream"} label="stream" className="left-1/2 top-[10px] -translate-x-1/2 sm:top-[12px]" onClick={() => onChange("stream")} />
        <IndexItem compact active={index === "seeds"} label="seeds" className="left-[10px] top-1/2 -translate-y-1/2 sm:left-[12px]" onClick={() => onChange("seeds")} />
        <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full border border-garden-light/80" aria-hidden />
        <IndexItem compact active={index === "winds"} label="winds" className="right-[8px] top-1/2 -translate-y-1/2 sm:right-[10px]" onClick={() => onChange("winds")} />
        <IndexItem compact active={index === "growth"} label="growth" className="left-1/2 bottom-[8px] -translate-x-1/2 sm:bottom-[10px]" onClick={() => onChange("growth")} />
      </div>
    );
  }

  return (
    <div className="relative h-[160px] w-[160px] sm:h-[220px] sm:w-[220px] md:h-[290px] md:w-[290px]">
      <div className="absolute inset-0 rounded-full bg-garden-green" />
      <IndexItem active={index === "stream"} label="stream" className="left-1/2 top-[28px] -translate-x-1/2 sm:top-[40px] md:top-[52px]" onClick={() => onChange("stream")} />
      <IndexItem active={index === "seeds"} label="seeds" className="left-[24px] top-1/2 -translate-y-1/2 sm:left-[36px] md:left-[54px]" onClick={() => onChange("seeds")} />
      <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-garden-light/80 md:h-2.5 md:w-2.5" aria-hidden />
      <IndexItem active={index === "winds"} label="winds" className="right-[18px] top-1/2 -translate-y-1/2 sm:right-[28px] md:right-[42px]" onClick={() => onChange("winds")} />
      <IndexItem active={index === "growth"} label="growth" className="left-1/2 bottom-[22px] -translate-x-1/2 sm:bottom-[32px] md:bottom-[46px]" onClick={() => onChange("growth")} />
    </div>
  );
}

function IndexItem({
  active,
  label,
  className,
  onClick,
  compact = false,
}: {
  active: boolean;
  label: string;
  className: string;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute inline-flex items-center gap-1 font-body lowercase leading-none transition-colors ${
        compact
          ? "text-[12px] sm:text-[13px]"
          : "gap-2 text-[18px] leading-[1.4] sm:text-[24px] md:text-[30px] md:leading-[53px]"
      } ${active ? "text-garden-light" : "text-garden-light/70 hover:text-garden-light"} ${className}`}
    >
      <span>{label}</span>
      <span
        className={`inline-flex rounded-full border border-garden-light/80 transition ${
          compact ? "h-1 w-1" : "h-2 w-2 md:h-2.5 md:w-2.5"
        } ${active ? "bg-garden-light" : "bg-transparent"}`}
        aria-hidden
      />
    </button>
  );
}
