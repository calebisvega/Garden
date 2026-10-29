import { SeedSparkline } from "./SeedSparkline";

type StockQuote = {
  ticker: string;
  title: string;
  price: number;
  change: number;
  changePercent: string;
  direction: "up" | "down";
};

type SeedsGlassTickerProps = {
  seed: StockQuote;
  active: boolean;
  chartValues: number[];
  chartsLoading?: boolean;
  onSelect: () => void;
};

function formatPrice(price: number) {
  if (!Number.isFinite(price) || price <= 0) return "—";
  return `$${price.toFixed(2)}`;
}

export function SeedsGlassTicker({
  seed,
  active,
  chartValues,
  chartsLoading = false,
  onSelect,
}: SeedsGlassTickerProps) {
  const ticker = seed.ticker.toUpperCase();
  const isUp = seed.direction === "up";
  const displayPercent = seed.changePercent.replace(/^\+/, "");

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={`seeds-glass-ticker flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors sm:gap-3.5 sm:px-2.5 sm:py-3 ${
          active ? "bg-white/14 ring-1 ring-white/25" : "hover:bg-white/[0.07]"
        }`}
        aria-pressed={active}
      >
        <span
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[13px] ${
            isUp
              ? "border-[#b8e0c0]/45 bg-[#4a7356]/35 text-[#dff3e4]"
              : "border-[#e0b8bc]/45 bg-[#805d5d]/35 text-[#f3dfe1]"
          }`}
          aria-hidden
        >
          {isUp ? "↗" : "↘"}
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-display text-[15px] uppercase leading-none tracking-[0.04em] text-white sm:text-[16px]">
            {ticker}
          </p>
          <p className="mt-1 font-sans text-[11px] leading-none text-white/55 sm:text-[12px]">
            {formatPrice(seed.price)}
          </p>
        </div>

        <p
          className={`shrink-0 font-sans text-[13px] font-medium leading-none sm:text-[14px] ${
            isUp ? "text-[#b8e0c0]" : "text-[#e0b8bc]"
          }`}
        >
          {displayPercent}
        </p>

        <div className="hidden shrink-0 sm:block">
          <SeedSparkline
            values={chartValues}
            direction={seed.direction}
            inCircle
            className={`scale-90 ${chartsLoading ? "opacity-40" : ""}`}
          />
        </div>
      </button>
    </li>
  );
}
