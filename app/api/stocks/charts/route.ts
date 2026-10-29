import { NextResponse } from "next/server";

export type ChartPeriod = "day" | "week" | "month" | "year" | "five-year";

const PERIOD_CONFIG: Record<
  ChartPeriod,
  { lookbackMs: number; interval: "15m" | "1h" | "1d" | "1wk" }
> = {
  day: { lookbackMs: 24 * 60 * 60 * 1000, interval: "15m" },
  week: { lookbackMs: 7 * 24 * 60 * 60 * 1000, interval: "1h" },
  month: { lookbackMs: 30 * 24 * 60 * 60 * 1000, interval: "1d" },
  year: { lookbackMs: 365 * 24 * 60 * 60 * 1000, interval: "1d" },
  "five-year": { lookbackMs: 5 * 365 * 24 * 60 * 60 * 1000, interval: "1wk" },
};

const CACHE_TTL_MS = 120_000;
const cache = new Map<string, { fetchedAt: number; charts: Record<string, number[]> }>();

function downsample(values: number[], target = 48): number[] {
  if (values.length <= target) return values;
  const step = values.length / target;
  const out: number[] = [];
  for (let i = 0; i < target; i++) {
    const idx = Math.min(values.length - 1, Math.floor(i * step));
    out.push(values[idx]);
  }
  return out;
}

function normalizeSeries(values: number[]): number[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return downsample(values.map((v) => (v - min) / range));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tickersParam = searchParams.get("tickers");
  const period = (searchParams.get("period") ?? "day") as ChartPeriod;

  if (!PERIOD_CONFIG[period]) {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  }

  const tickers = (tickersParam
    ? tickersParam.split(",").map((t) => t.trim().toUpperCase())
    : []
  ).filter(Boolean).slice(0, 20);

  if (tickers.length === 0) {
    return NextResponse.json({ period, charts: {} });
  }

  const key = `${period}:${tickers.join(",")}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json({ period, charts: cached.charts });
  }

  const { default: YahooFinance } = await import("yahoo-finance2");
  const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });
  const { lookbackMs, interval } = PERIOD_CONFIG[period];
  const period1 = new Date(Date.now() - lookbackMs);

  const charts: Record<string, number[]> = {};

  await Promise.all(
    tickers.map(async (ticker) => {
      try {
        const result = await yahooFinance.chart(ticker, {
          period1,
          interval,
        });
        const closes = (result.quotes ?? [])
          .map((row) => Number(row.close))
          .filter((value) => Number.isFinite(value));
        charts[ticker] = normalizeSeries(closes);
      } catch (err) {
        console.warn(`[Stocks/chart] ${ticker} failed:`, err);
        charts[ticker] = [];
      }
    })
  );

  cache.set(key, { fetchedAt: Date.now(), charts });
  return NextResponse.json({ period, charts });
}
