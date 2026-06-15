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

type GardenIndex = "stream" | "seeds" | "winds" | "growth";

const SEEDS_STORAGE_KEY = "garden:seeds-complete:v1" as const;

/* ─── Image URLs (local public/garden/ assets) ─── */
const IMG = {
  forestPsalm: "/garden/MacBook_Pro_14__-_5-10c12365-4cf6-40a9-9fe8-a3eeec7b2307.png",
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
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const isPm = hours >= 12;
  const h12 = ((hours + 11) % 12) + 1;
  const period = hours < 12 ? "morning" : hours < 17 ? "afternoon" : "evening";
  return {
    dateLabel: `${weekday.toLowerCase()}, ${month.toLowerCase()} ${day}`,
    timeLabel: `${h12}:${minutes} ${isPm ? "pm" : "am"}`,
    period,
  };
}

/**
 * Custom hook to fetch data from our Next.js API routes.
 * Accepts user preferences to customize which tickers/feeds to load.
 */
function useGardenData(prefs: { tickers: string[]; substackFeeds: { url: string; name: string }[]; newsFeeds: { url: string; name: string }[] }) {
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
  const tickersKey = prefs.tickers.join(",");
  const feedsKey = prefs.substackFeeds.map((f) => f.url).join(",");
  const newsKey = prefs.newsFeeds.map((f) => f.url).join(",");

  useEffect(() => {
    // Fetch stocks using user's tickers
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
  }, [tickersKey]);

  useEffect(() => {
    // Fetch articles using user's substack feeds
    fetch("/api/feeds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "articles", limit: 8, feeds: prefs.substackFeeds }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setArticles(data))
      .catch((err) => {
        console.warn("[Garden] Articles fetch failed:", err);
        setArticlesError(true);
      })
      .finally(() => setArticlesLoading(false));
  }, [feedsKey]);

  useEffect(() => {
    // Fetch news using user's news feeds
    fetch("/api/feeds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "news", limit: 6, feeds: prefs.newsFeeds }),
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
  }, [newsKey]);

  return { stocks, articles, news, stocksLoading, articlesLoading, newsLoading, stocksError, articlesError, newsError };
}

/* ─── Smooth scroll helper ─── */
function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/* ─── Main Page ─── */

export default function Home() {
  const [activeIndex, setActiveIndex] = useState<GardenIndex>("stream");
  const { completed, toggle } = useSeedCompletion();
  const greeting = useMemo(() => formatGreeting(), []);
  const { preferences, loaded: prefsLoaded } = usePreferences();

  const { stocks, articles, news, stocksLoading, articlesLoading, newsLoading, stocksError, articlesError, newsError } =
    useGardenData({
      tickers: preferences.tickers,
      substackFeeds: preferences.substackFeeds,
      newsFeeds: preferences.newsFeeds,
    });

  // Section refs for intersection observer
  const sectionRefs = useRef<Record<GardenIndex, HTMLElement | null>>({
    stream: null,
    seeds: null,
    winds: null,
    growth: null,
  });

  // Intersection observer to update active index as user scrolls
  useEffect(() => {
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

    return () => observer.disconnect();
  }, []);

  const handleIndexClick = (id: GardenIndex) => {
    setActiveIndex(id);
    scrollToSection(id);
  };

  const handleNourishmentClick = () => {
    scrollToSection("stream");
  };

  return (
    <main className="min-h-dvh bg-[#ECECE8] text-neutral-900">
      {/* Hero */}
      <section className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-5 pb-12 pt-8 sm:gap-16 sm:px-6 sm:pb-16 sm:pt-10 md:px-10">
        <header className="flex items-start justify-between font-body text-[11px] text-neutral-700">
          <span className="lowercase tracking-wide">{greeting.dateLabel}</span>
          <span className="lowercase tracking-wide">{greeting.timeLabel}</span>
        </header>

        <div className="space-y-6 text-center sm:space-y-8">
          <p className="font-body text-[14px] lowercase leading-snug tracking-wide text-neutral-800 sm:text-[15px]">
            good {greeting.period} {preferences.displayName},
            <br />
            welcome to your
          </p>
          <h1 className="font-display text-[clamp(3.5rem,16vw,12rem)] font-normal leading-[0.92] tracking-[-0.03em] text-black">
            GARDEN
          </h1>
          <button
            type="button"
            onClick={handleNourishmentClick}
            className="mx-auto inline-flex items-center justify-center font-body text-[13px] lowercase text-neutral-900 underline decoration-neutral-900/70 underline-offset-[10px] transition hover:translate-y-[1px] hover:decoration-neutral-900 sm:text-[14px]"
          >
            nourishment awaits
          </button>
        </div>
      </section>

      {/* Main content strip */}
      <section className="bg-[#2B4937] pb-12 pt-6 text-[#ECECE8] sm:pb-16 sm:pt-7">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 sm:gap-8 sm:px-6 md:px-10">
          {/* Top inset image */}
          <div className="overflow-hidden rounded-[2px] border border-white/10 bg-black/20">
            <img
              src={IMG.forestPsalm}
              alt="Forest Psalm image"
              className="h-[200px] w-full object-cover object-top transition duration-700 ease-out hover:scale-[1.01] sm:h-[260px] md:h-[340px]"
            />
          </div>

          {/* Stream + index */}
          <div
            id="stream"
            ref={(el) => { sectionRefs.current.stream = el; }}
            className="grid gap-6 sm:gap-8 md:grid-cols-[minmax(0,1.7fr)_minmax(0,0.8fr)] md:items-end scroll-mt-8"
          >
            <div className="space-y-5">
              <p className="text-[13px] font-semibold lowercase tracking-wide text-[#ECECE8]/90 sm:text-[14px]">
                stream,{" "}
                <span className="font-normal">from substack</span>
                {articlesLoading && (
                  <span className="ml-2 text-[11px] text-[#ECECE8]/50 animate-pulse">
                    loading...
                  </span>
                )}
              </p>
              <div className="grid gap-x-8 gap-y-5 sm:gap-x-10 sm:gap-y-6 sm:grid-cols-2">
                {articles.length > 0
                  ? articles.slice(0, 4).map((article) => (
                      <StreamColumn
                        key={article.id}
                        title={article.title}
                        author={article.author}
                        duration={article.duration}
                        url={article.url}
                      />
                    ))
                  : articlesLoading
                    ? [1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-1.5 animate-pulse">
                          <div className="h-5 w-3/4 rounded bg-[#ECECE8]/10" />
                          <div className="h-3 w-1/2 rounded bg-[#ECECE8]/10" />
                        </div>
                      ))
                    : articlesError
                      ? <p className="text-[13px] text-[#ECECE8]/60 col-span-2">Unable to load articles. Check your connection and refresh.</p>
                      : <p className="text-[13px] text-[#ECECE8]/60 col-span-2">No articles available right now.</p>}
              </div>
            </div>

            <aside className="flex flex-col items-center gap-3 sm:items-end">
              <span className="text-[13px] font-semibold lowercase tracking-wide text-[#ECECE8]/90 sm:text-[14px]">
                index
              </span>
              <IndexSwitcher index={activeIndex} onChange={handleIndexClick} />
            </aside>
          </div>

          {/* Seeds */}
          <div
            id="seeds"
            ref={(el) => { sectionRefs.current.seeds = el; }}
            className="grid gap-0 border-t border-white/10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] scroll-mt-8"
          >
            <div className="hidden overflow-hidden md:block">
              <img
                src={IMG.blurredForest}
                alt="Blurred forest motion"
                className="h-full min-h-[420px] w-full object-cover"
              />
            </div>
            <div className="space-y-3 bg-[#244231] p-4 sm:space-y-4 sm:p-6">
              <p className="text-[12px] lowercase text-[#ECECE8]/90">
                seeds, from robinhood
                {stocksLoading && (
                  <span className="ml-2 animate-pulse">loading...</span>
                )}
              </p>
              <ul className="space-y-2 sm:space-y-3">
                {stocks.length > 0
                  ? stocks.map((seed) => {
                      const isDone = completed.has(seed.ticker.toLowerCase());
                      return (
                        <li key={seed.ticker} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <span
                              className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[2px] text-[14px] sm:h-9 sm:w-9 sm:text-[18px] ${
                                seed.direction === "up" ? "bg-[#5C7C65]" : "bg-[#9B7B80]"
                              }`}
                              aria-hidden
                            >
                              {seed.direction === "up" ? "↗" : "↘"}
                            </span>
                            <div className="leading-tight">
                              <p className="font-display text-[15px] text-[#ECECE8] sm:text-[19px]">
                                {seed.title},
                                <span className="ml-1 font-display text-[14px] sm:ml-2 sm:text-[18px]">
                                  {seed.changePercent}
                                </span>
                              </p>
                              <p className="text-[11px] text-[#ECECE8]/90 sm:text-[12px]">
                                {seed.source}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggle(seed.ticker.toLowerCase())}
                            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#0D2E1D] bg-transparent transition-colors duration-200"
                            aria-label={isDone ? "Mark seed as unread" : "Mark seed as read"}
                          >
                            {isDone ? "•" : ""}
                          </button>
                        </li>
                      );
                    })
                  : stocksLoading
                    ? preferences.tickers.map((t) => (
                        <li key={t} className="flex items-center justify-between animate-pulse">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-[2px] text-[14px] bg-[#5C7C65]/50 sm:h-9 sm:w-9 sm:text-[18px]">↗</span>
                            <div className="leading-tight">
                              <p className="font-display text-[15px] text-[#ECECE8]/50 sm:text-[19px]">{t}</p>
                              <p className="text-[11px] text-[#ECECE8]/40 sm:text-[12px]">Loading...</p>
                            </div>
                          </div>
                        </li>
                      ))
                    : stocksError
                      ? <li className="text-[13px] text-[#ECECE8]/60">Unable to load stock data. Check your connection and refresh.</li>
                      : <li className="text-[13px] text-[#ECECE8]/60">No stock data available.</li>}
              </ul>
              <p className="max-w-xl text-[13px] leading-snug text-[#ECECE8]/90 sm:text-[14px]">
                {stocks.length > 0
                  ? (() => {
                      const up = stocks.filter((s) => s.direction === "up").length;
                      const down = stocks.length - up;
                      return `${up} of ${stocks.length} tickers are up today. ${down > 0 ? `${down} showing decline.` : "All green across the board."} Data refreshed from Yahoo Finance.`;
                    })()
                  : "Mixed performance seen this week. Data loading from Yahoo Finance..."}
              </p>
              <button className="text-[12px] underline underline-offset-4">
                for more depth
              </button>
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
      <section className="bg-[#ECECE8] py-12 sm:py-16">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-5 sm:gap-10 sm:px-6 md:px-10">
          <div className="grid gap-6 sm:gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)] md:items-center">
            <div className="space-y-4">
              <p className="font-display text-xl leading-snug text-[#2B4937] sm:text-2xl md:text-3xl">
                &ldquo;Knowing others is intelligence; knowing yourself is true
                wisdom.&rdquo;
              </p>
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-700">
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
            <p className="text-sm lowercase text-neutral-700">
              that&apos;s all for today,
              <br />
              see you tomorrow in your
            </p>
            <h2 className="font-display text-[2.8rem] leading-none tracking-tight text-black sm:text-[3.4rem] md:text-[4.6rem]">
              GARDEN
            </h2>
            <div className="mt-4 flex flex-col items-center gap-3 text-[11px] font-body text-neutral-700 sm:flex-row sm:flex-wrap sm:justify-between sm:gap-4">
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
  );
}

/* ─── Sub-components ─── */

type StreamProps = {
  title: string;
  author: string;
  duration: string;
  url?: string;
};

function StreamColumn({ title, author, duration, url }: StreamProps) {
  const content = (
    <article className="space-y-1.5">
      <div className="flex items-start gap-2">
        <span className="mt-[6px] inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 border-[#ECECE8]/80 text-[7px]">
          •
        </span>
        <h3 className="font-display text-[16px] leading-[1.05] text-[#ECECE8] sm:text-[19px]">
          {title}
        </h3>
      </div>
      <p className="text-[11px] leading-none text-[#ECECE8]/75 sm:text-[12px]">
        {author} – {duration}
      </p>
    </article>
  );

  if (url && url !== "#") {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block transition-opacity hover:opacity-80">
        {content}
      </a>
    );
  }
  return content;
}

type IndexProps = {
  index: GardenIndex;
  onChange: (value: GardenIndex) => void;
};

function IndexSwitcher({ index, onChange }: IndexProps) {
  return (
    <div className="relative h-[140px] w-[140px] sm:h-[190px] sm:w-[190px]">
      <div className="absolute inset-0 rounded-full bg-[#0E3522]" />
      <IndexItem active={index === "stream"} label="stream" className="left-1/2 top-[36px] -translate-x-1/2 sm:top-[52px]" onClick={() => onChange("stream")} />
      <IndexItem active={index === "seeds"} label="seeds" className="left-[32px] top-1/2 -translate-y-1/2 sm:left-[54px]" onClick={() => onChange("seeds")} />
      <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#ECECE8]/80" aria-hidden />
      <IndexItem active={index === "winds"} label="winds" className="right-[24px] top-1/2 -translate-y-1/2 sm:right-[42px]" onClick={() => onChange("winds")} />
      <IndexItem active={index === "growth"} label="growth" className="left-1/2 bottom-[30px] -translate-x-1/2 sm:bottom-[46px]" onClick={() => onChange("growth")} />
    </div>
  );
}

function IndexItem({ active, label, className, onClick }: { active: boolean; label: string; className: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute inline-flex items-center gap-1.5 text-[14px] lowercase leading-none transition-colors sm:gap-2 sm:text-[18px] ${active ? "text-white" : "text-[#ECECE8]/80 hover:text-white"} ${className}`}
    >
      <span>{label}</span>
      <span className={`inline-flex h-2 w-2 rounded-full border border-[#ECECE8]/80 transition sm:h-2.5 sm:w-2.5 ${active ? "bg-white" : "bg-transparent"}`} aria-hidden />
    </button>
  );
}

function GrowthSection({ sectionRef, goals }: { sectionRef: (el: HTMLElement | null) => void; goals: GrowthGoal[] }) {
  return (
    <section id="growth" ref={sectionRef} className="space-y-4 scroll-mt-8">
      <p className="font-display text-[36px] leading-none text-[#F7F5F0] sm:text-[52px] md:text-[68px]">
        Growth
        <span className="text-[12px] text-[#F7F5F0]/90 sm:text-[14px] md:text-[16px]"> your financial goals</span>
      </p>
      <div className="grid gap-4 md:grid-cols-[210px_minmax(0,1fr)] md:items-stretch">
        <div className="hidden overflow-hidden rounded-sm bg-black/20 md:block">
          <img src={IMG.barkTexture} alt="Bark texture" className="h-full w-full object-cover transition duration-700 ease-out hover:scale-[1.02]" />
        </div>
        <div className="space-y-3 text-xs">
          {goals.length > 0 ? (
            goals.map((goal) => {
              const percent = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
              return (
                <div key={goal.id} className="flex flex-col gap-2 rounded-sm bg-[#123825] p-2 ring-1 ring-white/5 sm:flex-row sm:items-stretch sm:gap-3">
                  <div className="flex-1 space-y-1 bg-[#F5F5EE] px-2 py-1.5 sm:py-1">
                    <p className="font-display text-[16px] leading-none text-[#0D2E1D] sm:text-[18px]">
                      ${goal.currentAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <div className="h-2 w-full bg-[#1D3F2D]">
                      <div
                        className="h-2 rounded-full bg-[#4FAF6F] transition-[width] duration-500"
                        style={{ width: `${Math.min(100, percent)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 bg-[#133A26] px-3 py-2 sm:w-44 sm:justify-center sm:py-0">
                    <p className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#0D2E1D] bg-[#3C8A64] font-display text-[28px] text-[#F7F5F0] sm:h-20 sm:w-20 sm:text-[44px]">
                      {percent}%
                    </p>
                    <div>
                      <p className="text-[10px] text-[#F7F5F0]/90">of your</p>
                      <p className="text-[16px] text-[#F7F5F0] sm:text-[20px]">
                        ${goal.targetAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} goal
                      </p>
                    </div>
                  </div>
                  <p className="hidden w-28 text-right font-display text-[36px] leading-[0.9] text-[#F7F5F0] lg:block lg:text-[47px]">{goal.name}</p>
                </div>
              );
            })
          ) : (
            <div className="rounded-sm bg-[#123825] p-4 ring-1 ring-white/5 text-center">
              <p className="text-[14px] text-[#F7F5F0]/70">No goals set yet.</p>
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
    <section id="winds" ref={sectionRef} className="space-y-4 scroll-mt-8">
      <p className="font-display text-[36px] leading-none text-[#F7F5F0] sm:text-[52px] md:text-[68px]">
        winds
        <span className="text-[12px] text-[#F7F5F0]/90 sm:text-[14px] md:text-[16px]"> from the New York Times, Bloomberg, CNN, Sherwood and Wired</span>
        {isLoading && <span className="ml-2 text-[12px] text-[#F7F5F0]/50 animate-pulse">loading...</span>}
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
                  <p className="text-[13px] leading-snug text-[#ECECE8]/90 sm:text-[14px]">{col1[0].summary}</p>
                  <p className="text-[10px] uppercase tracking-wider text-[#ECECE8]/50">{col1[0].source}</p>
                  {col1[1] && (
                    <>
                      <a href={col1[1].url} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition-opacity">
                        <h4 className="text-[15px] font-semibold sm:text-[16px]">{col1[1].title}</h4>
                      </a>
                      <p className="text-[13px] leading-snug text-[#ECECE8]/90 sm:text-[14px]">{col1[1].summary}</p>
                      <p className="text-[10px] uppercase tracking-wider text-[#ECECE8]/50">{col1[1].source}</p>
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
                  <p className="text-[14px] leading-snug text-[#ECECE8]/50">{hasError ? "Check your connection and refresh." : "Fetching the latest news from around the world..."}</p>
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
                <p className="text-[13px] leading-snug text-[#ECECE8]/90 sm:text-[14px]">{item.summary}</p>
                <p className="text-[10px] uppercase tracking-wider text-[#ECECE8]/50">{item.source}</p>
              </div>
            ))
          ) : (
            <div className="space-y-2 animate-pulse">
              <h3 className="text-[16px] font-semibold text-[#ECECE8]/50">Loading more headlines...</h3>
              <p className="text-[14px] leading-snug text-[#ECECE8]/40">News from trusted sources is on its way.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
