import { SeedSparkline } from "./SeedSparkline";
import { PERIOD_META, type SeedsChartPeriod } from "./SeedsPeriodHeading";

type StockQuote = {
  ticker: string;
  title: string;
  price: number;
  change: number;
  changePercent: string;
  direction: "up" | "down";
};

type StockNewsItem = {
  title: string;
  url: string;
  source: string;
};

type SeedsFeaturedVisualProps = {
  stock: StockQuote | null;
  chartValues: number[];
  period: SeedsChartPeriod;
  news?: StockNewsItem | null;
  chartsLoading?: boolean;
};

function formatPrice(price: number) {
  if (!Number.isFinite(price) || price <= 0) return "—";
  return `$${price.toFixed(2)}`;
}

export function SeedsFeaturedVisual({
  stock,
  chartValues,
  period,
  news,
  chartsLoading = false,
}: SeedsFeaturedVisualProps) {
  if (!stock) {
    return (
      <div className="flex min-h-[280px] items-center justify-center md:min-h-[360px]">
        <div className="h-48 w-36 animate-pulse rounded-[3rem] bg-white/10" aria-hidden />
      </div>
    );
  }

  const ticker = stock.ticker.toUpperCase();
  const isUp = stock.direction === "up";
  const displayPercent = stock.changePercent.replace(/^\+/, "");

  return (
    <div className="relative mx-auto flex min-h-[280px] w-full max-w-[22rem] flex-col items-center justify-center md:min-h-[360px] md:max-w-none">
      {/* Ticker callout — top left */}
      <div className="seeds-callout absolute left-0 top-0 hidden max-w-[11.5rem] md:block sm:max-w-[13rem]">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
          ticker
        </p>
        <p className="mt-1 font-display text-[15px] leading-snug text-white sm:text-[16px]">
          {ticker}
        </p>
        <p className="mt-0.5 line-clamp-2 font-sans text-[11px] leading-snug text-white/72 sm:text-[12px]">
          {stock.title}
        </p>
        <div className="seeds-callout-line mt-2.5 w-[min(100%,7rem)]" aria-hidden />
      </div>

      {/* Period chart callout — right */}
      <div className="seeds-callout absolute right-0 top-[38%] hidden max-w-[10.5rem] translate-y-[-10%] md:block sm:max-w-[11.5rem]">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
          {PERIOD_META[period].menuLabel}
        </p>
        <p className="mt-1 font-sans text-[11px] leading-snug text-white/78 sm:text-[12px]">
          Normalized trend for the selected window — live from yahoo finance.
        </p>
        <div className="seeds-callout-line seeds-callout-line--right mt-2.5 ml-auto w-[min(100%,5.5rem)]" aria-hidden />
      </div>

      {/* News callout — bottom */}
      <div className="seeds-callout absolute bottom-0 left-[8%] hidden max-w-[13rem] md:block sm:max-w-[14.5rem]">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
          latest headline
        </p>
        {news ? (
          <a
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block line-clamp-3 font-sans text-[11px] leading-snug text-white/82 underline decoration-white/25 underline-offset-2 transition-colors hover:text-white hover:decoration-white/50 sm:text-[12px]"
          >
            {news.title}
          </a>
        ) : (
          <p className="mt-1 font-sans text-[11px] leading-snug text-white/55 sm:text-[12px]">
            No recent headlines for this ticker.
          </p>
        )}
        <div className="seeds-callout-line mt-2.5 w-[min(100%,6rem)]" aria-hidden />
      </div>

      {/* Capsule-inspired chart visual */}
      <div className="seeds-capsule-visual relative z-[1] flex h-[15.5rem] w-[9.5rem] items-center justify-center sm:h-[17.5rem] sm:w-[10.5rem]">
        <svg
          viewBox="0 0 120 200"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <defs>
            <linearGradient id="seedsCapsuleOuter" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6f9f72" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#3f6b48" stopOpacity="0.98" />
            </linearGradient>
            <linearGradient id="seedsCapsuleInner" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f7f5f0" stopOpacity="0.98" />
              <stop offset="100%" stopColor="#e8e4dc" stopOpacity="0.95" />
            </linearGradient>
          </defs>
          <ellipse cx="60" cy="34" rx="34" ry="22" fill="url(#seedsCapsuleOuter)" />
          <ellipse cx="60" cy="166" rx="34" ry="22" fill="url(#seedsCapsuleOuter)" />
          <rect x="26" y="34" width="68" height="132" fill="url(#seedsCapsuleOuter)" opacity="0.92" />
          <ellipse cx="60" cy="100" rx="22" ry="34" fill="url(#seedsCapsuleInner)" />
          <ellipse
            cx="60"
            cy="100"
            rx="18"
            ry="28"
            fill="none"
            stroke="rgba(36,51,47,0.12)"
            strokeWidth="1"
          />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <circle
              key={i}
              cx={44 + (i % 3) * 16}
              cy={78 + Math.floor(i / 3) * 18}
              r="2.2"
              fill="#c8b89a"
              opacity="0.55"
            />
          ))}
        </svg>

        <div
          className={`relative z-[2] flex h-[5.75rem] w-[5.75rem] items-center justify-center rounded-full border border-white/25 bg-white/90 shadow-[0_8px_28px_rgba(0,0,0,0.18)] sm:h-[6.25rem] sm:w-[6.25rem] ${
            chartsLoading ? "opacity-60" : ""
          }`}
        >
          <SeedSparkline
            values={chartValues}
            direction={stock.direction}
            inCircle
            className="scale-[1.35] sm:scale-[1.45]"
          />
        </div>

        <p className="absolute -bottom-1 left-1/2 z-[2] -translate-x-1/2 whitespace-nowrap font-sans text-[11px] text-white/75 md:-bottom-1">
          {formatPrice(stock.price)}{" "}
          <span className={isUp ? "text-[#b8e0c0]" : "text-[#e0b8bc]"}>
            {isUp ? "↑" : "↓"} {displayPercent}
          </span>
        </p>
      </div>

      {/* Mobile summary below capsule */}
      <div className="mt-4 w-full text-center md:hidden">
        <p className="font-display text-[15px] uppercase text-white">{ticker}</p>
        <p className="mt-1 line-clamp-2 font-sans text-[12px] leading-snug text-white/72">
          {stock.title}
        </p>
        {news ? (
          <a
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block line-clamp-2 font-sans text-[11px] text-white/70 underline decoration-white/25 underline-offset-2"
          >
            {news.title}
          </a>
        ) : null}
      </div>
    </div>
  );
}
