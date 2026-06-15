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

/**
 * Default tickers to fetch if none specified
 */
const DEFAULT_TICKERS = ["NVDA", "AVGO", "GOOGL", "RVI", "SPY"];

/**
 * GET /api/stocks?tickers=NVDA,AVGO,GOOGL,RVI,SPY
 *
 * Fetches live stock quotes from Yahoo Finance.
 * Returns an array of StockQuote objects.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tickersParam = searchParams.get("tickers");
  const tickers = tickersParam
    ? tickersParam.split(",").map((t) => t.trim().toUpperCase())
    : DEFAULT_TICKERS;

  // Dynamic import to avoid webpack bundling issues with yahoo-finance2
  const yahooFinanceModule = await import("yahoo-finance2");
  const yahooFinance = yahooFinanceModule.default;

  const results: StockQuote[] = [];

  for (const ticker of tickers.slice(0, 20)) {
    try {
      const quote = await (yahooFinance as any).quote(ticker);

      if (quote) {
        const price = quote.regularMarketPrice ?? 0;
        const change = quote.regularMarketChange ?? 0;
        const changePercent = quote.regularMarketChangePercent ?? 0;

        results.push({
          ticker: quote.symbol ?? ticker,
          title: quote.shortName ?? quote.longName ?? ticker,
          price,
          change,
          changePercent: `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%`,
          direction: change >= 0 ? "up" : "down",
          source: `${quote.fullExchangeName ?? "Market"} — ${quote.currency ?? "USD"}`,
        });
      }
    } catch (err) {
      console.warn(`[Stocks] Failed to fetch ${ticker}:`, err);
      // Return a fallback entry so the UI still renders
      results.push({
        ticker,
        title: ticker,
        price: 0,
        change: 0,
        changePercent: "N/A",
        direction: "up",
        source: "Unavailable",
      });
    }
  }

  return NextResponse.json(results);
}
