import { NextResponse } from "next/server";

export type StockNewsItem = {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
};

const CACHE_TTL_MS = 300_000;
const cache = new Map<string, { fetchedAt: number; news: Record<string, StockNewsItem | null> }>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tickersParam = searchParams.get("tickers");

  const tickers = (tickersParam
    ? tickersParam.split(",").map((t) => t.trim().toUpperCase())
    : []
  ).filter(Boolean).slice(0, 20);

  if (tickers.length === 0) {
    return NextResponse.json({ news: {} });
  }

  const key = tickers.join(",");
  const cached = cache.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json({ news: cached.news });
  }

  const { default: YahooFinance } = await import("yahoo-finance2");
  const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });
  const news: Record<string, StockNewsItem | null> = {};

  await Promise.all(
    tickers.map(async (ticker) => {
      try {
        const result = await yahooFinance.search(ticker, {
          quotesCount: 0,
          newsCount: 1,
        });
        const article = result.news?.[0];
        if (!article?.link || !article.title) {
          news[ticker] = null;
          return;
        }
        news[ticker] = {
          title: article.title,
          url: article.link,
          source: article.publisher ?? "Yahoo Finance",
          publishedAt: article.providerPublishTime
            ? new Date(article.providerPublishTime).toISOString()
            : new Date().toISOString(),
        };
      } catch (err) {
        console.warn(`[Stocks/news] ${ticker} failed:`, err);
        news[ticker] = null;
      }
    })
  );

  cache.set(key, { fetchedAt: Date.now(), news });
  return NextResponse.json({ news });
}
