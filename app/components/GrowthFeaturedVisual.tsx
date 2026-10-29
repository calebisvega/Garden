import Link from "next/link";
import type { GrowthGoal } from "../hooks/usePreferences";
import { GrowthProgressChart } from "./GrowthProgressChart";

type GrowthFeaturedVisualProps = {
  goal: GrowthGoal | null;
  displayName: string;
  totals: { saved: number; target: number; complete: number };
  goalCount: number;
  bankConnected: boolean;
};

function formatMoney(value: number) {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  })}`;
}

function goalPercent(goal: GrowthGoal) {
  if (goal.targetAmount <= 0) return 0;
  return Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
}

export function GrowthFeaturedVisual({
  goal,
  displayName,
  totals,
  goalCount,
  bankConnected,
}: GrowthFeaturedVisualProps) {
  if (!goal) {
    return (
      <div className="flex min-h-[280px] items-center justify-center md:min-h-[360px]">
        <div className="h-40 w-40 animate-pulse rounded-full bg-white/10" aria-hidden />
      </div>
    );
  }

  const percent = goalPercent(goal);
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const ringSize = 168;
  const stroke = 8;
  const radius = (ringSize - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative mx-auto flex min-h-[280px] w-full max-w-[22rem] flex-col items-center justify-center md:min-h-[360px] md:max-w-none">
      <div className="seeds-callout absolute left-0 top-0 hidden max-w-[11rem] md:block">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
          saved
        </p>
        <p className="mt-1 font-display text-[15px] text-white sm:text-[16px]">
          {formatMoney(goal.currentAmount)}
        </p>
        <div className="seeds-callout-line mt-2.5 w-[min(100%,5rem)]" aria-hidden />
      </div>

      <div className="seeds-callout absolute right-0 top-[34%] hidden max-w-[10.5rem] md:block">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
          target
        </p>
        <p className="mt-1 font-display text-[15px] text-white sm:text-[16px]">
          {formatMoney(goal.targetAmount)}
        </p>
        <div className="seeds-callout-line seeds-callout-line--right mt-2.5 ml-auto w-[min(100%,5rem)]" aria-hidden />
      </div>

      <div className="seeds-callout absolute bottom-0 left-[8%] hidden max-w-[13rem] md:block">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
          {bankConnected ? "accounts" : "profile"}
        </p>
        <p className="mt-1 font-sans text-[11px] leading-snug text-white/78 sm:text-[12px]">
          {bankConnected
            ? "Connected balances will sync here when Plaid ships."
            : `${displayName} · ${totals.complete} of ${goalCount} goals complete`}
        </p>
        <div className="seeds-callout-line mt-2.5 w-[min(100%,5.5rem)]" aria-hidden />
      </div>

      <div className="relative z-[1] flex h-[168px] w-[168px] items-center justify-center">
        <svg
          width={ringSize}
          height={ringSize}
          viewBox={`0 0 ${ringSize} ${ringSize}`}
          className="absolute inset-0 drop-shadow-[0_12px_32px_rgba(0,0,0,0.18)]"
          aria-hidden
        >
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="rgba(255,255,255,0.08)"
            stroke="rgba(255,255,255,0.16)"
            strokeWidth={stroke}
          />
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke="#4FAF6F"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
          />
        </svg>
        <p className="relative z-[1] flex flex-col items-center justify-center text-center">
          <span className="block font-display text-[clamp(2rem,4vw,2.75rem)] leading-none text-white">
            {percent}
          </span>
          <span className="mt-1 block font-sans text-[10px] uppercase tracking-[0.14em] text-white/55">
            percent
          </span>
        </p>
      </div>

      <div className="relative z-[1] mt-5 w-full max-w-[18rem] px-2">
        <GrowthProgressChart percent={percent} showRing={false} />
      </div>

      <p className="relative z-[1] mt-3 text-center font-sans text-[11px] text-white/65">
        {percent >= 100
          ? "target reached"
          : `${formatMoney(remaining)} left to ${formatMoney(goal.targetAmount)}`}
      </p>

      <Link
        href="/preferences"
        className="relative z-[1] mt-4 font-sans text-[11px] lowercase text-[#b8e0c0] underline decoration-[#b8e0c0]/35 underline-offset-2 hover:decoration-[#b8e0c0]/70"
      >
        edit goals in preferences
      </Link>
    </div>
  );
}
