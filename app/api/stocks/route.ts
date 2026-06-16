import { NextResponse } from "next/server";

/**
 * Stock quote shape returned to the frontend
 */
export type StockQuote = {
  ticker: string;
  title: string;
  price: number;
  change: number;
  changePercent: string;
  direction: "up" | "down";
  source: string;
};

const DEFAULT_TICKERS = ["NVDA", "AVGO", "GOOGL", "RVI", "SPY"];
const CACHE_TTL_MS = 90_000;

type QuoteResult = {
  fetchedAt: number;
  quotes: StockQuote[];
};

const quoteCache = new Map<string, QuoteResult>();

function cacheKey(tickers: string[]) {
  return tickers.join(",");
}

function mapQuote(ticker: string, quote: Record<string, unknown> | undefined): StockQuote {
  if (!quote) {
    return {
      ticker,
      title: ticker,
      price: 0,
      change: 0,
      changePercent: "N/A",
      direction: "up",
      source: "Unavailable",
    };
  }

  const price = Number(quote.regularMarketPrice ?? 0);
  const change = Number(quote.regularMarketChange ?? 0);
  const changePercent = Number(quote.regularMarketChangePercent ?? 0);

  return {
    ticker: String(quote.symbol ?? ticker),
    title: String(quote.shortName ?? quote.longName ?? ticker),
    price,
    change,
    changePercent: `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%`,
    direction: change >= 0 ? "up" : "down",
    source: `${String(quote.fullExchangeName ?? "Market")} — ${String(quote.currency ?? "USD")}`,
  };
}

/**
 * GET /api/stocks?tickers=NVDA,AVGO,GOOGL,RVI,SPY
 *
 * Live quotes via Yahoo Finance (batch request + short cache).
 * For personal Robinhood holdings, see /api/robinhood (future OAuth).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tickersParam = searchParams.get("tickers");
  const tickers = (tickersParam
    ? tickersParam.split(",").map((t) => t.trim().toUpperCase())
    : DEFAULT_TICKERS
  ).filter(Boolean).slice(0, 20);

  if (tickers.length === 0) {
    return NextResponse.json([]);
  }

  const key = cacheKey(tickers);
  const cached = quoteCache.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json(cached.quotes, {
      headers: { "Cache-Control": "private, max-age=60" },
    });
  }

  const { default: YahooFinance } = await import("yahoo-finance2");
  const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

  try {
    const raw = await yahooFinance.quote(tickers);
    const rows = Array.isArray(raw) ? raw : [raw];
    const bySymbol = new Map(
      rows.map((row) => [String(row.symbol ?? "").toUpperCase(), row as Record<string, unknown>])
    );

    const quotes = tickers.map((ticker) => mapQuote(ticker, bySymbol.get(ticker)));
    quoteCache.set(key, { fetchedAt: Date.now(), quotes });

    return NextResponse.json(quotes, {
      headers: { "Cache-Control": "private, max-age=60" },
    });
  } catch (err) {
    console.warn("[Stocks] Batch quote failed:", err);

    if (cached) {
      return NextResponse.json(cached.quotes, {
        headers: { "Cache-Control": "private, max-age=30" },
      });
    }

    return NextResponse.json(
      tickers.map((ticker) => mapQuote(ticker, undefined)),
      { status: 503 }
    );
  }
}
