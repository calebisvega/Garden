"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { GrowthGoal } from "../hooks/usePreferences";
import { GrowthFeaturedVisual } from "./GrowthFeaturedVisual";
import { GrowthGoalRow } from "./GrowthGoalRow";
import { GrowthStageBackground } from "./GrowthStageBackground";

type GrowthSectionProps = {
  sectionRef: (el: HTMLElement | null) => void;
  goals: GrowthGoal[];
  displayName: string;
  videoSrc?: string;
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

function pickFeaturedGoalIndex(goals: GrowthGoal[]) {
  if (!goals.length) return 0;
  let index = 0;
  let best = goalPercent(goals[0]);
  for (let i = 1; i < goals.length; i++) {
    const value = goalPercent(goals[i]);
    if (value > best) {
      best = value;
      index = i;
    }
  }
  return index;
}

export function GrowthSection({
  sectionRef,
  goals,
  displayName,
  videoSrc = "/garden/dew.mov",
}: GrowthSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [bankConnected, setBankConnected] = useState(false);

  useEffect(() => {
    fetch("/api/growth")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: { connected?: boolean }) => {
        setBankConnected(Boolean(data.connected));
      })
      .catch(() => setBankConnected(false));
  }, []);

  useEffect(() => {
    if (!goals.length) return;
    setActiveIndex((current) =>
      current >= goals.length ? pickFeaturedGoalIndex(goals) : current
    );
  }, [goals]);

  const activeGoal = goals[activeIndex] ?? null;

  const totals = useMemo(() => {
    const saved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const target = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const complete = goals.filter(
      (goal) => goal.targetAmount > 0 && goal.currentAmount >= goal.targetAmount
    ).length;
    return { saved, target, complete };
  }, [goals]);

  const leaderGoal = useMemo(() => {
    if (!goals.length) return null;
    return goals.reduce((best, goal) =>
      goalPercent(goal) > goalPercent(best) ? goal : best
    );
  }, [goals]);

  const leaderPercent = leaderGoal ? goalPercent(leaderGoal) : 0;

  return (
    <div
      id="growth"
      ref={sectionRef}
      className="snap-panel flex h-dvh min-h-dvh scroll-mt-0 p-3 md:p-5"
    >
      <div className="stream-card relative h-[min(88dvh,900px)] w-full overflow-hidden bg-[#1a3328]">
        <GrowthStageBackground videoSrc={videoSrc} />
        <div className="absolute inset-0 bg-[#1a3328]/25" aria-hidden />

        <div className="absolute inset-0 z-10 flex items-center justify-center p-4 sm:p-5 md:p-7">
          <div className="seeds-glass-panel flex h-full max-h-[min(760px,92%)] w-full max-w-[1120px] flex-col overflow-hidden">
            {goals.length > 0 && activeGoal ? (
              <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto p-5 sm:p-6 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:gap-8 md:p-8 lg:p-10">
                <div className="order-2 flex min-h-0 flex-col md:order-1">
                  <p className="flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-white/72 sm:text-[12px]">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/85" aria-hidden />
                    growth · {bankConnected ? "connected accounts" : "your goals"}
                  </p>

                  <h2 className="mt-4 max-w-[min(100%,52rem)] font-display text-[clamp(1.85rem,4.2vw,2.75rem)] leading-[1.02] text-white md:mt-5">
                    your growth at a glance.
                  </h2>

                  {leaderGoal ? (
                    <div className="seeds-stat-box mt-5 shrink-0 rounded-[1.15rem] border border-white/30 px-4 py-3.5 sm:mt-6 sm:px-5 sm:py-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="max-w-[14rem] font-sans text-[13px] leading-snug text-white/88 sm:text-[14px]">
                          <span className="font-display lowercase tracking-[0.02em]">
                            {leaderGoal.name.toLowerCase()}
                          </span>{" "}
                          leads your goals
                          <span className="text-white/55">°</span>
                        </p>
                        <div className="flex shrink-0 items-center gap-2.5">
                          <span
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#b8e0c0]/50 bg-[#4a7356]/30 text-[#dff3e4]"
                            aria-hidden
                          >
                            ↗
                          </span>
                          <p className="font-display text-[clamp(1.65rem,4vw,2.35rem)] leading-none text-white">
                            {leaderPercent}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <p className="mt-3 shrink-0 font-sans text-[10px] text-white/45">
                    ° {formatMoney(totals.saved)} saved · {formatMoney(totals.target)} target
                  </p>

                  <ul className="mt-4 min-h-0 flex-1 space-y-1 overflow-y-auto pb-2 pr-0.5 sm:mt-5">
                    {goals.map((goal, index) => (
                      <GrowthGoalRow
                        key={goal.id}
                        name={goal.name}
                        currentAmount={goal.currentAmount}
                        targetAmount={goal.targetAmount}
                        percent={goalPercent(goal)}
                        active={index === activeIndex}
                        onSelect={() => setActiveIndex(index)}
                      />
                    ))}
                  </ul>
                </div>

                <div className="order-1 flex min-h-[280px] items-center md:order-2 md:min-h-0">
                  <GrowthFeaturedVisual
                    goal={activeGoal}
                    displayName={displayName}
                    totals={totals}
                    goalCount={goals.length}
                    bankConnected={bankConnected}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center p-6 sm:p-8">
                <div className="max-w-md text-center">
                  <p className="font-display text-[clamp(1.5rem,3vw,2rem)] leading-tight text-white">
                    no goals yet
                  </p>
                  <p className="mt-3 font-sans text-[13px] leading-relaxed lowercase text-white/60">
                    add savings targets in preferences to track your growth here.
                  </p>
                  <Link
                    href="/preferences"
                    className="mt-6 inline-flex min-h-[2.15rem] items-center justify-center rounded-full border border-[#4FAF6F]/45 bg-[#4FAF6F]/28 px-4 font-sans text-[11px] lowercase tracking-wide text-white"
                  >
                    add your first goal
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
