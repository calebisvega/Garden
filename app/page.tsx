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
import { usePreferences, type GrowthGoal } from "./hooks/usePreferences";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import { useIsNightTime } from "./hooks/useIsNightTime";
import { ShrinkingGardenTitle } from "./components/ShrinkingGardenTitle";
import { GardenWordmark } from "./components/GardenWordmark";
import { SeedsVisual } from "./components/SeedsVisual";
import { StreamIndexNav } from "./components/StreamIndexNav";
import { HeroGreeting } from "./components/HeroGreeting";
import { GardenDock } from "./components/GardenDock";
import { PageLaunchIntro } from "./components/PageLaunchIntro";

type GardenIndex = "stream" | "seeds" | "winds" | "growth";

const SEEDS_STORAGE_KEY = "garden:seeds-complete:v1" as const;

/* ─── Image URLs (local public/garden/ assets) ─── */
const IMG = {
  heroForest: "/garden/hero-forest.png",
  heroVideo: "/garden/slowgras.mp4",
  streamVideo: "/garden/stream.mp4",
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

function useSeedCompletion() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(SEEDS_STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as string[];
      setCompleted(new Set(parsed));
    } catch {
      // ignore
    }
  }, []);

  const toggle = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          SEEDS_STORAGE_KEY,
          JSON.stringify(Array.from(next))
        );
      }
      return next;
    });
  };

  return { completed, toggle };
}

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
  const { completed, toggle } = useSeedCompletion();
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
          className="snap-panel relative left-1/2 h-dvh min-h-dvh w-[100vw] -translate-x-1/2 overflow-hidden leading-[0]"
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
            <div className="absolute inset-0 z-10 flex flex-col p-4 sm:p-5 md:p-7">
                <p className="text-[17px] font-semibold lowercase tracking-wide text-garden-light sm:text-[19px]">
                  stream,{" "}
                  <span className="font-normal">from substack</span>
                  {articlesLoading && (
                    <span className="ml-2 text-[13px] text-garden-light/50 animate-pulse">
                      loading...
                    </span>
                  )}
                </p>

                <StreamIndexNav index={activeIndex} onChange={handleIndexClick} />

                <div className="stream-articles-grid mt-auto grid w-full items-end gap-x-6 gap-y-4 md:gap-x-8">
                  {streamArticles.length > 0
                    ? streamArticles.map((article) => (
                        <StreamColumn
                          key={article.id}
                          compact
                          title={article.title}
                          author={article.author}
                          duration={article.duration}
                          url={article.url}
                        />
                      ))
                    : articlesLoading
                      ? [1, 2, 3, 4].map((i) => (
                          <div key={i} className="min-w-0 space-y-2 animate-pulse">
                            <div className="h-[1.22em] w-full rounded bg-garden-light/15" />
                            <div className="h-3 w-1/2 rounded bg-garden-light/10" />
                          </div>
                        ))
                      : articlesError
                        ? <p className="col-span-2 text-[12px] text-garden-light/70 md:col-span-4 sm:text-[13px]">Unable to load articles. Check your connection and refresh.</p>
                        : <p className="col-span-2 text-[12px] text-garden-light/70 md:col-span-4 sm:text-[13px]">No articles available right now.</p>}
                </div>
              </div>
            </div>
        </div>

        <div className="mx-auto flex w-full max-w-[1512px] flex-col gap-6 px-5 pt-6 sm:gap-8 sm:pt-8 md:px-14">
          {/* Seeds */}
          <div
            id="seeds"
            ref={(el) => { sectionRefs.current.seeds = el; }}
            className="snap-panel relative h-dvh min-h-dvh scroll-mt-8 overflow-hidden"
          >
            <div className="absolute inset-0">
              <SeedsVisual />
              <div className="absolute inset-0 bg-black/35" aria-hidden />
            </div>

            <div className="relative z-10 flex h-full min-h-dvh flex-col">
              <div className="mx-auto flex w-full max-w-[1512px] items-start justify-between px-5 pt-6 md:px-14 md:pt-8">
                <span className="inline-flex h-9 w-9" aria-hidden />
                <p className="pt-1 font-display text-[22px] lowercase tracking-wide text-garden-light sm:text-[28px]">
                  seeds
                </p>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-black/55 text-garden-light/90 backdrop-blur-sm transition hover:bg-black/60"
                  aria-label="Seeds menu (template)"
                >
                  <span className="text-[18px] leading-none" aria-hidden>
                    ≡
                  </span>
                </button>
              </div>

              <div className="mx-auto flex w-full max-w-[1512px] flex-1 items-center px-5 pb-10 md:px-14">
                <div className="seeds-glass w-full max-w-[520px]">
                  <p className="font-display text-[18px] leading-snug text-garden-light sm:text-[20px]">
                    Today&apos;s positions, at a glance.
                    {stocksLoading && (
                      <span className="ml-2 font-sans text-[12px] font-normal text-garden-light/55 sm:text-[13px]">
                        loading...
                      </span>
                    )}
                  </p>

                  <ul className="mt-4 space-y-3">
                    {stocks.length > 0
                      ? stocks.slice(0, 7).map((seed) => {
                          const isDone = completed.has(seed.ticker.toLowerCase());
                          const displayPercent = seed.changePercent.replace(/^\+/, "");

                          return (
                            <li key={seed.ticker} className="flex items-center justify-between gap-4">
                              <p className="min-w-0 truncate font-sans text-[13px] lowercase text-garden-light sm:text-[14px]">
                                <span className="font-display text-[16px] tracking-wide sm:text-[18px]">
                                  {seed.ticker.toUpperCase()}
                                </span>
                                <span className="ml-2 text-garden-light/80">{displayPercent}</span>
                                <span className="ml-2 text-garden-light/45">{formatSeedSubtext(seed)}</span>
                              </p>
                              <button
                                type="button"
                                onClick={() => toggle(seed.ticker.toLowerCase())}
                                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/55 bg-white/5 transition hover:bg-white/10"
                                aria-label={isDone ? "Mark seed as unread" : "Mark seed as read"}
                              >
                                {isDone ? (
                                  <span className="h-2 w-2 rounded-full bg-white/65" aria-hidden />
                                ) : null}
                              </button>
                            </li>
                          );
                        })
                      : stocksLoading
                        ? preferences.tickers.slice(0, 6).map((t) => (
                            <li key={t} className="flex items-center justify-between gap-4 animate-pulse">
                              <div className="h-4 w-44 rounded bg-white/10 sm:w-52" />
                              <span className="h-7 w-7 rounded-full border border-white/20" />
                            </li>
                          ))
                        : stocksError
                          ? (
                            <li className="font-sans text-[13px] text-garden-light/60">
                              Unable to load stock data. Check your connection and refresh.
                            </li>
                          )
                          : (
                            <li className="font-sans text-[13px] text-garden-light/60">
                              No stock data available.
                            </li>
                          )}
                  </ul>
                </div>
              </div>

              <div className="seeds-scroll-indicator pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 sm:flex" aria-hidden>
                <span className="seeds-scroll-thumb" />
              </div>
            </div>
          </div>

          {/* Winds */}
          <WindsSection
            sectionRef={(el) => { sectionRefs.current.winds = el; }}
            news={news}
            isLoading={newsLoading}
            hasError={newsError}
          />

          {/* Growth */}
          <GrowthSection
            sectionRef={(el) => { sectionRefs.current.growth = el; }}
            goals={preferences.growthGoals}
          />
        </div>
      </section>

      {/* Outro */}
      <section id="outro" className="snap-section bg-[#ECECE8] py-12 sm:py-16">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-5 sm:gap-10 sm:px-6 md:px-10">
          <div className="grid gap-6 sm:gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)] md:items-center">
            <div className="space-y-4">
              <p className="font-display text-xl leading-snug text-garden-green sm:text-2xl md:text-[32px]">
                &ldquo;Knowing others is intelligence; knowing yourself is true
                wisdom.&rdquo;
              </p>
              <p className="font-display text-lg text-garden-green sm:text-xl md:text-[32px]">
                Lao Tzu
              </p>
            </div>
            <div className="overflow-hidden rounded-sm bg-black/20">
              <img
                src={IMG.waterfall}
                alt="Waterfall"
                className="h-full w-full object-cover transition duration-700 ease-out hover:scale-[1.02]"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 text-center">
            <p className="font-body text-[18px] lowercase text-neutral-800 sm:text-[25px]">
              that&apos;s all for today,
              <br />
              see you tomorrow in your
            </p>
            <h2 className="font-display text-[clamp(3rem,12vw,8rem)] leading-none tracking-tight text-black">
              <GardenWordmark />
            </h2>
            <div className="mt-4 flex flex-col items-center gap-3 font-body text-[11px] text-neutral-800 sm:flex-row sm:flex-wrap sm:justify-between sm:gap-4 sm:text-[13px]">
              <div className="flex flex-wrap gap-4">
                <Link href="/preferences" className="underline-offset-4 hover:underline">
                  preferences
                </Link>
                <button className="underline-offset-4 hover:underline">about us</button>
              </div>
              <p>have a question, or funny joke? talk@garden.info.com</p>
              <div className="flex flex-wrap gap-4">
                <span>commit to grow.</span>
                <span>www.garden.info.com</span>
              </div>
            </div>
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

/** Calm grass loop — single layer, no crossfade flicker */
const HERO_VIDEO_LOOP_START = 0.45;
const HERO_VIDEO_PLAYBACK_RATE = 0.36;

const heroVideoClassName =
  "pointer-events-none absolute left-1/2 top-1/2 h-full w-full min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 scale-[1.12] object-cover object-center blur-[0.65px] brightness-[0.98] contrast-[1.02]";

function HeroVideo() {
  const prepareVideo = (video: HTMLVideoElement) => {
    video.playbackRate = HERO_VIDEO_PLAYBACK_RATE;
    video.currentTime = HERO_VIDEO_LOOP_START;
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
        <source src={IMG.heroVideo} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/45" aria-hidden />
      <div className="hero-video-noise absolute inset-0 opacity-[0.42] mix-blend-overlay" aria-hidden />
      <div className="hero-video-noise hero-video-noise-alt absolute inset-0 opacity-[0.22] mix-blend-soft-light" aria-hidden />
    </div>
  );
}

type StreamProps = {
  title: string;
  author: string;
  duration: string;
  url?: string;
  compact?: boolean;
};

const STREAM_TITLE_MAX_WORDS = 24;

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

function formatSeedSubtext(seed: StockQuote) {
  if (seed.source === "Unavailable") return "Market data unavailable";
  return seed.source.replace(" — ", " - ");
}

function formatStreamTitle(title: string, maxWords = STREAM_TITLE_MAX_WORDS) {
  const cleaned = stripEmojis(title);
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  return `${words.slice(0, maxWords).join(" ")}…`;
}

function StreamColumn({ title, author, duration, url, compact = false }: StreamProps) {
  const cleanedTitle = stripEmojis(title);
  const displayTitle = compact ? cleanedTitle : formatStreamTitle(cleanedTitle);

  const content = compact ? (
    <article className="flex w-full flex-col justify-end space-y-2">
      <h3
        className="stream-column-title font-display text-[19px] leading-[1.18] text-garden-light sm:text-[22px] sm:leading-[1.16]"
        title={cleanedTitle}
      >
        {displayTitle}
      </h3>
      <p className="font-sans text-[12px] leading-snug text-garden-light/55 sm:text-[13px]">
        {author} – {duration}
      </p>
    </article>
  ) : (
    <article className="space-y-1.5">
      <div className="flex items-start gap-3">
        <span className="mt-2 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-garden-light/80" aria-hidden />
        <h3 className="font-display text-[22px] leading-[1.05] text-garden-light sm:text-[30px]" title={cleanedTitle}>
          {displayTitle}
        </h3>
      </div>
      <p className="pl-10 font-sans text-[16px] leading-none text-garden-light/75 sm:pl-10 sm:text-[24px]">
        {author} – {duration}
      </p>
    </article>
  );

  if (url && url !== "#") {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="stream-column block w-full outline-none"
      >
        {content}
      </a>
    );
  }
  return <div className="stream-column block w-full">{content}</div>;
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

function GrowthSection({ sectionRef, goals }: { sectionRef: (el: HTMLElement | null) => void; goals: GrowthGoal[] }) {
  return (
    <section id="growth" ref={sectionRef} className="snap-section space-y-4 scroll-mt-8">
      <div className="space-y-1">
        <p className="font-display text-[36px] leading-none text-garden-light sm:text-[52px] md:text-[68px]">
          Growth
        </p>
        <p className="font-sans text-[18px] lowercase text-garden-light/90 sm:text-[28px] md:text-[32px]">
          from TD BANK, Zillow, Redfin
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-[210px_minmax(0,1fr)] md:items-stretch">
        <div className="hidden overflow-hidden rounded-sm bg-black/20 md:block">
          <img src={IMG.barkTexture} alt="Bark texture" className="h-full w-full object-cover transition duration-700 ease-out hover:scale-[1.02]" />
        </div>
        <div className="space-y-3 text-xs">
          {goals.length > 0 ? (
            goals.map((goal) => {
              const percent = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
              return (
                <div key={goal.id} className="flex flex-col gap-2 rounded-sm bg-garden-green p-2 ring-1 ring-white/5 sm:flex-row sm:items-stretch sm:gap-3">
                  <div className="flex-1 space-y-2 bg-[#F5F5EE] px-3 py-2 sm:py-3">
                    <p className="font-display text-[20px] leading-none text-[#0D2E1D] sm:text-[28px] md:text-[32px]">
                      ${goal.currentAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <div className="h-[10px] w-full bg-garden-green/80 sm:h-[25px]">
                      <div
                        className="h-full rounded-full bg-[#4FAF6F] transition-[width] duration-500"
                        style={{ width: `${Math.min(100, percent)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 bg-garden-green/90 px-3 py-2 sm:w-52 sm:justify-center sm:py-0 md:w-72">
                    <p className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#0D2E1D] bg-[#3C8A64] font-display text-[24px] text-garden-light sm:h-20 sm:w-20 sm:text-[36px] md:h-[156px] md:w-[156px] md:text-[44px]">
                      {percent}%
                    </p>
                    <div>
                      <p className="font-sans text-[12px] text-garden-light/90 sm:text-[14px]">of your</p>
                      <p className="font-sans text-[16px] text-garden-light sm:text-[20px]">
                        ${goal.targetAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} goal
                      </p>
                    </div>
                  </div>
                  <p className="hidden w-28 text-right font-display text-[36px] leading-[0.9] text-garden-light md:block md:w-32 md:text-[47px]">{goal.name}</p>
                </div>
              );
            })
          ) : (
            <div className="rounded-sm bg-garden-green p-4 text-center ring-1 ring-white/5">
              <p className="text-[14px] text-garden-light/70">No goals set yet.</p>
              <Link href="/preferences" className="text-[12px] text-[#4FAF6F] underline underline-offset-4 mt-2 inline-block">
                Add goals in preferences
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function WindsSection({ sectionRef, news, isLoading, hasError }: { sectionRef: (el: HTMLElement | null) => void; news: NewsHeadline[]; isLoading: boolean; hasError?: boolean }) {
  const col1 = news.slice(0, 2);
  const col3 = news.slice(2, 4);

  return (
    <section id="winds" ref={sectionRef} className="snap-section space-y-4 scroll-mt-8">
      <p className="font-display text-[36px] leading-none text-garden-light sm:text-[52px] md:text-[68px]">
        winds
        <span className="font-sans text-[14px] font-normal text-garden-light/90 sm:text-[20px] md:text-[32px]">
          {" "}
          from the New York Times, Bloomberg, CNN, Sherwood and Wired
        </span>
        {isLoading && <span className="ml-2 text-[12px] text-garden-light/50 animate-pulse">loading...</span>}
      </p>
      <div className="grid gap-6 md:grid-cols-[1.2fr_0.9fr_1fr]">
        <div className="space-y-3">
          {col1.length > 0 ? (
            <>
              <a href={col1[0].url} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition-opacity">
                <h3 className="text-[15px] font-semibold sm:text-[16px]">{col1[0].title}</h3>
              </a>
              <div className="grid grid-cols-[80px_1fr] gap-3 sm:grid-cols-[120px_1fr]">
                <img src={IMG.windsTexture} alt="Winds texture" className="h-full min-h-[200px] w-full object-cover sm:min-h-[260px]" />
                <div className="space-y-2">
                  <p className="text-[13px] leading-snug text-garden-light/90 sm:text-[14px]">{col1[0].summary}</p>
                  <p className="text-[10px] uppercase tracking-wider text-garden-light/50">{col1[0].source}</p>
                  {col1[1] && (
                    <>
                      <a href={col1[1].url} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition-opacity">
                        <h4 className="text-[15px] font-semibold sm:text-[16px]">{col1[1].title}</h4>
                      </a>
                      <p className="text-[13px] leading-snug text-garden-light/90 sm:text-[14px]">{col1[1].summary}</p>
                      <p className="text-[10px] uppercase tracking-wider text-garden-light/50">{col1[1].source}</p>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-[16px] font-semibold">{hasError ? "Unable to load news" : "Loading headlines..."}</h3>
              <div className="grid grid-cols-[80px_1fr] gap-3 sm:grid-cols-[120px_1fr]">
                <img src={IMG.windsTexture} alt="Winds texture" className="h-full min-h-[200px] w-full object-cover sm:min-h-[260px]" />
                <div className={`space-y-2 ${isLoading ? "animate-pulse" : ""}`}>
                  <p className="text-[14px] leading-snug text-garden-light/50">{hasError ? "Check your connection and refresh." : "Fetching the latest news from around the world..."}</p>
                </div>
              </div>
            </>
          )}
        </div>
        <img src={IMG.waterfall} alt="Winds portrait" className="hidden h-full min-h-[300px] w-full object-cover md:block" />
        <div className="space-y-5">
          {col3.length > 0 ? (
            col3.map((item) => (
              <div key={item.id} className="space-y-2">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition-opacity">
                  <h3 className="text-[15px] font-semibold sm:text-[16px]">{item.title}</h3>
                </a>
                <p className="text-[13px] leading-snug text-garden-light/90 sm:text-[14px]">{item.summary}</p>
                <p className="text-[10px] uppercase tracking-wider text-garden-light/50">{item.source}</p>
              </div>
            ))
          ) : (
            <div className="space-y-2 animate-pulse">
              <h3 className="text-[16px] font-semibold text-garden-light/50">Loading more headlines...</h3>
              <p className="text-[14px] leading-snug text-garden-light/40">News from trusted sources is on its way.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
