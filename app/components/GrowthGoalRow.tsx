type GrowthGoalRowProps = {
  name: string;
  currentAmount: number;
  targetAmount: number;
  percent: number;
  active: boolean;
  onSelect: () => void;
};

function formatMoney(value: number) {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  })}`;
}

export function GrowthGoalRow({
  name,
  currentAmount,
  targetAmount,
  percent,
  active,
  onSelect,
}: GrowthGoalRowProps) {
  const complete = percent >= 100;

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
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-display ${
            complete
              ? "border-[#b8e0c0]/45 bg-[#4a7356]/35 text-[#dff3e4]"
              : "border-garden-light/35 bg-white/8 text-garden-light/85"
          }`}
          aria-hidden
        >
          {Math.min(100, percent)}
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-display text-[15px] lowercase leading-none tracking-[0.02em] text-white sm:text-[16px]">
            {name.toLowerCase()}
          </p>
          <p className="mt-1 font-sans text-[11px] leading-none text-white/55 sm:text-[12px]">
            {formatMoney(currentAmount)} / {formatMoney(targetAmount)}
          </p>
        </div>

        <p
          className={`shrink-0 font-sans text-[13px] font-medium leading-none sm:text-[14px] ${
            complete ? "text-[#b8e0c0]" : "text-white/75"
          }`}
        >
          {percent}%
        </p>
      </button>
    </li>
  );
}
