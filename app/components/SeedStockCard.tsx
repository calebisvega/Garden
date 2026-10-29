import { SeedSparkline } from "./SeedSparkline";

type StockQuote = {
  ticker: string;
  title: string;
  price: number;
  change: number;
  changePercent: string;
  direction: "up" | "down";
  source: string;
};

type StockNewsItem = {
  title: string;
  url: string;
  source: string;
};

type SeedStockCardProps = {
  seed: StockQuote;
  chartValues: number[];
  chartsLoading?: boolean;
  previewing?: boolean;
  news?: StockNewsItem | null;
};

function formatPrice(price: number) {
  if (!Number.isFinite(price) || price <= 0) return "—";
  return `$${price.toFixed(2)}`;
}

export function SeedStockCard({
  seed,
  chartValues,
  chartsLoading = false,
  previewing = false,
  news,
}: SeedStockCardProps) {
  const ticker = seed.ticker.toUpperCase();
  const displayPercent = seed.changePercent.replace(/^\+/, "");
  const isUp = seed.direction === "up";

  return (
    <li className={`seed-organic-card ${previewing ? "is-previewing" : ""}`}>
      <div className="seed-organic-shape" aria-hidden>
        <svg viewBox="0 0 100 22" preserveAspectRatio="none" className="h-full w-full">
          <path
            fill="currentColor"
            d="M 11 2 H 66 C 70 2 72.5 3.5 73.8 6 C 74.8 8 76 8.5 77.8 8.5 C 79 8.5 79.8 9.2 80.4 10.5 A 9.5 9.5 0 1 1 80.4 11.5 C 79.8 12.8 79 13.5 77.8 13.5 C 76 13.5 74.8 14 73.8 16 C 72.5 18.5 70 20 66 20 H 11 A 9 9 0 1 1 11 2 Z"
          />
        </svg>
      </div>

      <div className="seed-organic-inner">
        <span
          className={`seed-organic-arrow ${isUp ? "is-up" : "is-down"}`}
          aria-hidden
        >
          {isUp ? "↗" : "↘"}
        </span>

        <div className="seed-organic-meta">
          <div className="flex min-w-0 items-baseline gap-2">
            <p className="font-display text-[16px] uppercase leading-none tracking-[0.04em] text-[#1e2e2a] sm:text-[18px]">
              {ticker}
            </p>
            {news ? (
              <a
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                className="seed-organic-news-badge shrink-0"
                title={news.title}
                aria-label={`News: ${news.title}`}
              >
                +1
              </a>
            ) : null}
          </div>
          <p
            className={`font-sans text-[13px] font-medium leading-none sm:text-[14px] ${
              isUp ? "text-[#3d6b4a]" : "text-[#8a6368]"
            }`}
          >
            {displayPercent}
          </p>
          <p className="font-sans text-[11px] leading-none text-[#24332F]/50 sm:text-[12px]">
            {formatPrice(seed.price)}
          </p>
        </div>

        <div className={`seed-organic-chart-zone ${isUp ? "is-up" : "is-down"}`}>
          <SeedSparkline
            values={chartValues}
            direction={seed.direction}
            inCircle
            className={`transition-opacity duration-200 ${chartsLoading ? "opacity-40" : ""}`}
          />
        </div>
      </div>
    </li>
  );
}
