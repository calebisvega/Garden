"use client";

import { useEffect, useMemo, useState } from "react";
import { SeedsFeaturedVisual } from "./SeedsFeaturedVisual";
import { SeedsGlassTicker } from "./SeedsGlassTicker";
import { SeedsVisual } from "./SeedsVisual";
import {
  SeedsPeriodHeading,
  type SeedsChartPeriod,
  PERIOD_ORDER,
  PERIOD_META,
} from "./SeedsPeriodHeading";

export type StockQuote = {
  ticker: string;
  title: string;
  price: number;
  change: number;
  changePercent: string;
  direction: "up" | "down";
  source: string;
};

type ChartPeriod = SeedsChartPeriod;

type StockNewsItem = {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
};

type SeedsSectionProps = {
  sectionRef: (el: HTMLElement | null) => void;
  stocks: StockQuote[];
  tickers: string[];
  loading: boolean;
  hasError?: boolean;
};

const PREFETCH_PERIODS = PERIOD_ORDER.filter((p) => p !== "five-year");

function pickFeaturedTicker(stocks: StockQuote[]) {
  if (!stocks.length) return null;
  return stocks.reduce((best, stock) =>
    Math.abs(stock.change) > Math.abs(best.change) ? stock : best
  ).ticker;
}

function formatStatPercent(changePercent: string) {
  return changePercent.replace(/^\+/, "");
}

export function SeedsSection({
  sectionRef,
  stocks,
  tickers,
  loading,
  hasError,
}: SeedsSectionProps) {
  const [period, setPeriod] = useState<ChartPeriod>("day");
  const [previewPeriod, setPreviewPeriod] = useState<ChartPeriod | null>(null);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [chartsByPeriod, setChartsByPeriod] = useState<
    Partial<Record<ChartPeriod, Record<string, number[]>>>
  >({});
  const [chartsLoading, setChartsLoading] = useState(false);
  const [newsByTicker, setNewsByTicker] = useState<Record<string, StockNewsItem | null>>({});

  const tickersKey = useMemo(() => tickers.join(","), [tickers]);
  const displayPeriod = previewPeriod ?? period;
  const charts = chartsByPeriod[displayPeriod] ?? {};

  const featuredStock = useMemo(() => {
    if (!stocks.length) return null;
    const match = selectedTicker
      ? stocks.find(
          (stock) =>
            stock.ticker.toUpperCase() === selectedTicker.toUpperCase() ||
            stock.ticker === selectedTicker
        )
      : null;
    return match ?? stocks[0];
  }, [stocks, selectedTicker]);

  const leaderStock = useMemo(() => {
    if (!stocks.length) return null;
    return stocks.reduce((best, stock) =>
      Math.abs(stock.change) > Math.abs(best.change) ? stock : best
    );
  }, [stocks]);

  useEffect(() => {
    if (!stocks.length) return;
    setSelectedTicker((current) => current ?? pickFeaturedTicker(stocks));
  }, [stocks]);

  useEffect(() => {
    if (!tickersKey) return;
    let cancelled = false;
    setChartsLoading(true);

    Promise.all(
      PREFETCH_PERIODS.map(async (value) => {
        const res = await fetch(
          `/api/stocks/charts?tickers=${encodeURIComponent(tickersKey)}&period=${value}`
        );
        if (!res.ok) throw new Error(`charts ${value}`);
        const data: { charts?: Record<string, number[]> } = await res.json();
        return { value, charts: data.charts ?? {} };
      })
    )
      .then((results) => {
        if (cancelled) return;
        setChartsByPeriod((prev) => {
          const next = { ...prev };
          for (const { value, charts: nextCharts } of results) {
            next[value] = nextCharts;
          }
          return next;
        });
      })
      .catch((err) => {
        console.warn("[Seeds] chart prefetch failed:", err);
      })
      .finally(() => {
        if (!cancelled) setChartsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tickersKey]);

  useEffect(() => {
    if (!tickersKey) return;
    fetch(`/api/stocks/charts?tickers=${encodeURIComponent(tickersKey)}&period=five-year`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: { charts?: Record<string, number[]> }) => {
        setChartsByPeriod((prev) => ({ ...prev, "five-year": data.charts ?? {} }));
      })
      .catch(() => {});
  }, [tickersKey]);

  useEffect(() => {
    if (!tickersKey) return;
    fetch(`/api/stocks/news?tickers=${encodeURIComponent(tickersKey)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: { news?: Record<string, StockNewsItem | null> }) => {
        setNewsByTicker(data.news ?? {});
      })
      .catch((err) => {
        console.warn("[Seeds] news fetch failed:", err);
        setNewsByTicker({});
      });
  }, [tickersKey]);

  const featuredTicker = featuredStock?.ticker.toUpperCase() ?? "";
  const featuredNews = featuredStock
    ? newsByTicker[featuredTicker] ?? newsByTicker[featuredStock.ticker] ?? null
    : null;
  const featuredCharts =
    featuredStock
      ? charts[featuredTicker] ?? charts[featuredStock.ticker] ?? []
      : [];

  return (
    <div
      id="seeds"
      ref={sectionRef}
      className="snap-panel flex h-dvh min-h-dvh scroll-mt-0 p-3 md:p-5"
    >
      <div className="stream-card relative h-[min(88dvh,900px)] w-full overflow-hidden">
        <div className="seeds-stage-bg absolute inset-0">
          <SeedsVisual panel blurred />
        </div>
        <div className="absolute inset-0 bg-[#1a3328]/25" aria-hidden />

        <div className="absolute inset-0 z-10 flex items-center justify-center p-4 sm:p-5 md:p-7">
          <div className="seeds-glass-panel flex h-full max-h-[min(760px,92%)] w-full max-w-[1120px] flex-col overflow-hidden">
            <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto p-5 sm:p-6 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:gap-8 md:p-8 lg:p-10">
              {/* Right column — featured visual first on mobile */}
              <div className="order-1 flex min-h-[240px] items-center md:order-2 md:min-h-0">
                <SeedsFeaturedVisual
                  stock={featuredStock}
                  chartValues={featuredCharts}
                  period={displayPeriod}
                  news={featuredNews}
                  chartsLoading={chartsLoading && !chartsByPeriod[displayPeriod]}
                />
              </div>

              {/* Left column */}
              <div className="order-2 flex min-h-0 flex-col md:order-1">
                <p className="flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-white/72 sm:text-[12px]">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/85" aria-hidden />
                  seeds · yahoo finance
                  {loading ? (
                    <span className="ml-1 animate-pulse font-normal normal-case tracking-normal text-white/45">
                      loading...
                    </span>
                  ) : null}
                </p>

                <div className="mt-4 shrink-0 md:mt-5">
                  <SeedsPeriodHeading
                    period={period}
                    previewPeriod={previewPeriod}
                    onPreview={setPreviewPeriod}
                    onChange={setPeriod}
                    variant="glass"
                  />
                </div>

                {leaderStock ? (
                  <div className="seeds-stat-box mt-5 shrink-0 rounded-[1.15rem] border border-white/30 px-4 py-3.5 sm:mt-6 sm:px-5 sm:py-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="max-w-[14rem] font-sans text-[13px] leading-snug text-white/88 sm:text-[14px]">
                        <span className="font-display uppercase tracking-[0.03em]">
                          {leaderStock.ticker}
                        </span>{" "}
                        leads {PERIOD_META[displayPeriod].menuLabel}
                        {displayPeriod === "five-year" ? "'" : "'s"}{" "}
                        {leaderStock.direction === "up" ? "gains" : "moves"}
                        <span className="text-white/55">°</span>
                      </p>
                      <div className="flex shrink-0 items-center gap-2.5">
                        <span
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-full border ${
                            leaderStock.direction === "up"
                              ? "border-[#b8e0c0]/50 bg-[#4a7356]/30 text-[#dff3e4]"
                              : "border-[#e0b8bc]/50 bg-[#805d5d]/30 text-[#f3dfe1]"
                          }`}
                          aria-hidden
                        >
                          {leaderStock.direction === "up" ? "↗" : "↘"}
                        </span>
                        <p className="font-display text-[clamp(1.65rem,4vw,2.35rem)] leading-none text-white">
                          {formatStatPercent(leaderStock.changePercent)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                <p className="mt-3 shrink-0 font-sans text-[10px] text-white/45">
                  ° live quote · {displayPeriod.replace("-", " ")}
                </p>

                <ul className="mt-4 min-h-0 flex-1 space-y-1 overflow-y-auto pb-2 pr-0.5 sm:mt-5">
                  {stocks.length > 0
                    ? stocks.map((seed) => {
                        const ticker = seed.ticker.toUpperCase();
                        return (
                          <SeedsGlassTicker
                            key={seed.ticker}
                            seed={seed}
                            active={ticker === featuredTicker}
                            chartValues={charts[ticker] ?? charts[seed.ticker] ?? []}
                            chartsLoading={chartsLoading && !chartsByPeriod[displayPeriod]}
                            onSelect={() => setSelectedTicker(seed.ticker)}
                          />
                        );
                      })
                    : loading
                      ? tickers.slice(0, 5).map((t) => (
                          <li
                            key={t}
                            className="h-12 animate-pulse rounded-xl bg-white/10"
                            aria-hidden
                          />
                        ))
                      : hasError
                        ? (
                          <li className="font-sans text-[13px] text-white/60">
                            unable to load stock data. check your connection and refresh.
                          </li>
                        )
                        : (
                          <li className="font-sans text-[13px] text-white/60">
                            no stock data available.
                          </li>
                        )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
