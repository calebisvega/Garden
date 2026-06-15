"use client";

import { useState } from "react";
import Link from "next/link";
import { usePreferences, type SubstackFeed, type NewsFeed, type GrowthGoal } from "../hooks/usePreferences";

export default function PreferencesPage() {
  const { preferences, updatePreferences, loaded } = usePreferences();
  const [saved, setSaved] = useState(false);

  // Ticker management
  const [newTicker, setNewTicker] = useState("");
  const addTicker = () => {
    const t = newTicker.trim().toUpperCase();
    if (t && !preferences.tickers.includes(t)) {
      updatePreferences({ tickers: [...preferences.tickers, t] });
      setNewTicker("");
      flashSaved();
    }
  };
  const removeTicker = (ticker: string) => {
    updatePreferences({ tickers: preferences.tickers.filter((t) => t !== ticker) });
    flashSaved();
  };

  // Substack feed management
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [newFeedName, setNewFeedName] = useState("");
  const addFeed = () => {
    const url = newFeedUrl.trim();
    const name = newFeedName.trim() || url;
    if (url && !preferences.substackFeeds.some((f) => f.url === url)) {
      updatePreferences({ substackFeeds: [...preferences.substackFeeds, { url, name }] });
      setNewFeedUrl("");
      setNewFeedName("");
      flashSaved();
    }
  };
  const removeFeed = (url: string) => {
    updatePreferences({ substackFeeds: preferences.substackFeeds.filter((f) => f.url !== url) });
    flashSaved();
  };

  // News feed management
  const [newNewsUrl, setNewNewsUrl] = useState("");
  const [newNewsName, setNewNewsName] = useState("");
  const addNewsFeed = () => {
    const url = newNewsUrl.trim();
    const name = newNewsName.trim() || url;
    if (url && !preferences.newsFeeds.some((f) => f.url === url)) {
      updatePreferences({ newsFeeds: [...preferences.newsFeeds, { url, name }] });
      setNewNewsUrl("");
      setNewNewsName("");
      flashSaved();
    }
  };
  const removeNewsFeed = (url: string) => {
    updatePreferences({ newsFeeds: preferences.newsFeeds.filter((f) => f.url !== url) });
    flashSaved();
  };

  // Growth goal management
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [newGoalCurrent, setNewGoalCurrent] = useState("");
  const addGoal = () => {
    const name = newGoalName.trim();
    const target = parseFloat(newGoalTarget) || 10000;
    const current = parseFloat(newGoalCurrent) || 0;
    if (name) {
      const id = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
      updatePreferences({
        growthGoals: [...preferences.growthGoals, { id, name, targetAmount: target, currentAmount: current }],
      });
      setNewGoalName("");
      setNewGoalTarget("");
      setNewGoalCurrent("");
      flashSaved();
    }
  };
  const removeGoal = (id: string) => {
    updatePreferences({ growthGoals: preferences.growthGoals.filter((g) => g.id !== id) });
    flashSaved();
  };
  const updateGoal = (id: string, updates: Partial<GrowthGoal>) => {
    updatePreferences({
      growthGoals: preferences.growthGoals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    });
    flashSaved();
  };

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!loaded) {
    return (
      <main className="min-h-dvh bg-[#ECECE8] flex items-center justify-center">
        <p className="font-body text-neutral-600 animate-pulse">loading preferences...</p>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#ECECE8] text-neutral-900">
      <div className="mx-auto max-w-[800px] px-6 py-12 md:px-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <Link
              href="/"
              className="font-body text-[12px] text-neutral-600 hover:text-neutral-900 transition-colors underline underline-offset-4"
            >
              ← back to garden
            </Link>
            <h1 className="font-display text-[3rem] leading-none tracking-tight text-black mt-4 md:text-[4rem]">
              preferences
            </h1>
            <p className="font-body text-[13px] text-neutral-600 mt-2">
              customize your garden experience
            </p>
          </div>
          <div
            className={`font-body text-[12px] transition-opacity duration-300 ${
              saved ? "opacity-100 text-[#4FAF6F]" : "opacity-0"
            }`}
          >
            saved ✓
          </div>
        </div>

        {/* Display Name */}
        <Section title="display name" description="how your garden greets you each day">
          <input
            type="text"
            value={preferences.displayName}
            onChange={(e) => {
              updatePreferences({ displayName: e.target.value });
              flashSaved();
            }}
            className="w-full max-w-xs bg-transparent border-b-2 border-[#2B4937]/30 focus:border-[#2B4937] outline-none py-2 font-body text-[16px] text-neutral-900 transition-colors"
            placeholder="your name"
          />
        </Section>

        {/* Stock Tickers */}
        <Section title="seeds — stock tickers" description="tickers displayed in your seeds section (yahoo finance)">
          <div className="flex flex-wrap gap-2 mb-4">
            {preferences.tickers.map((ticker) => (
              <span
                key={ticker}
                className="inline-flex items-center gap-2 bg-[#2B4937] text-[#F7F5F0] px-3 py-1.5 rounded-sm font-display text-[14px]"
              >
                {ticker}
                <button
                  onClick={() => removeTicker(ticker)}
                  className="text-[#F7F5F0]/60 hover:text-white transition-colors text-[12px]"
                  aria-label={`Remove ${ticker}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTicker()}
              className="bg-transparent border-b-2 border-[#2B4937]/30 focus:border-[#2B4937] outline-none py-2 font-body text-[14px] w-32 transition-colors"
              placeholder="AAPL"
            />
            <button
              onClick={addTicker}
              className="font-body text-[12px] text-[#2B4937] underline underline-offset-4 hover:text-black transition-colors"
            >
              add ticker
            </button>
          </div>
        </Section>

        {/* Substack Feeds */}
        <Section title="stream — substack feeds" description="rss feeds for your reading stream">
          <div className="space-y-2 mb-4">
            {preferences.substackFeeds.map((feed) => (
              <div key={feed.url} className="flex items-center justify-between py-2 border-b border-neutral-200">
                <div>
                  <p className="text-[14px] font-medium text-neutral-900">{feed.name}</p>
                  <p className="text-[11px] text-neutral-500 truncate max-w-[400px]">{feed.url}</p>
                </div>
                <button
                  onClick={() => removeFeed(feed.url)}
                  className="text-[12px] text-neutral-400 hover:text-red-600 transition-colors"
                  aria-label={`Remove ${feed.name}`}
                >
                  remove
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <input
              type="text"
              value={newFeedName}
              onChange={(e) => setNewFeedName(e.target.value)}
              className="bg-transparent border-b-2 border-[#2B4937]/30 focus:border-[#2B4937] outline-none py-2 font-body text-[14px] w-40 transition-colors"
              placeholder="Feed name"
            />
            <input
              type="url"
              value={newFeedUrl}
              onChange={(e) => setNewFeedUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addFeed()}
              className="bg-transparent border-b-2 border-[#2B4937]/30 focus:border-[#2B4937] outline-none py-2 font-body text-[14px] flex-1 transition-colors"
              placeholder="https://example.substack.com/feed"
            />
            <button
              onClick={addFeed}
              className="font-body text-[12px] text-[#2B4937] underline underline-offset-4 hover:text-black transition-colors whitespace-nowrap"
            >
              add feed
            </button>
          </div>
        </Section>

        {/* News Feeds */}
        <Section title="winds — news sources" description="rss feeds for your news headlines">
          <div className="space-y-2 mb-4">
            {preferences.newsFeeds.map((feed) => (
              <div key={feed.url} className="flex items-center justify-between py-2 border-b border-neutral-200">
                <div>
                  <p className="text-[14px] font-medium text-neutral-900">{feed.name}</p>
                  <p className="text-[11px] text-neutral-500 truncate max-w-[400px]">{feed.url}</p>
                </div>
                <button
                  onClick={() => removeNewsFeed(feed.url)}
                  className="text-[12px] text-neutral-400 hover:text-red-600 transition-colors"
                  aria-label={`Remove ${feed.name}`}
                >
                  remove
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <input
              type="text"
              value={newNewsName}
              onChange={(e) => setNewNewsName(e.target.value)}
              className="bg-transparent border-b-2 border-[#2B4937]/30 focus:border-[#2B4937] outline-none py-2 font-body text-[14px] w-40 transition-colors"
              placeholder="Source name"
            />
            <input
              type="url"
              value={newNewsUrl}
              onChange={(e) => setNewNewsUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addNewsFeed()}
              className="bg-transparent border-b-2 border-[#2B4937]/30 focus:border-[#2B4937] outline-none py-2 font-body text-[14px] flex-1 transition-colors"
              placeholder="https://rss.example.com/feed.xml"
            />
            <button
              onClick={addNewsFeed}
              className="font-body text-[12px] text-[#2B4937] underline underline-offset-4 hover:text-black transition-colors whitespace-nowrap"
            >
              add source
            </button>
          </div>
        </Section>

        {/* Growth Goals */}
        <Section title="growth — financial goals" description="track your savings goals (data stored locally)">
          <div className="space-y-4 mb-6">
            {preferences.growthGoals.map((goal) => (
              <div key={goal.id} className="bg-[#2B4937]/5 rounded-sm p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={goal.name}
                    onChange={(e) => updateGoal(goal.id, { name: e.target.value })}
                    className="bg-transparent font-display text-[18px] text-neutral-900 outline-none border-b border-transparent focus:border-[#2B4937]/30 transition-colors"
                  />
                  <button
                    onClick={() => removeGoal(goal.id)}
                    className="text-[12px] text-neutral-400 hover:text-red-600 transition-colors"
                  >
                    remove
                  </button>
                </div>
                <div className="flex gap-6">
                  <div>
                    <label className="text-[11px] text-neutral-500 block mb-1">current ($)</label>
                    <input
                      type="number"
                      value={goal.currentAmount}
                      onChange={(e) => updateGoal(goal.id, { currentAmount: parseFloat(e.target.value) || 0 })}
                      className="bg-transparent border-b-2 border-[#2B4937]/30 focus:border-[#2B4937] outline-none py-1 font-body text-[14px] w-28 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-500 block mb-1">goal ($)</label>
                    <input
                      type="number"
                      value={goal.targetAmount}
                      onChange={(e) => updateGoal(goal.id, { targetAmount: parseFloat(e.target.value) || 0 })}
                      className="bg-transparent border-b-2 border-[#2B4937]/30 focus:border-[#2B4937] outline-none py-1 font-body text-[14px] w-28 transition-colors"
                    />
                  </div>
                  <div className="flex items-end">
                    <span className="font-display text-[20px] text-[#4FAF6F]">
                      {goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0}%
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-2 w-full bg-[#2B4937]/10 rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-[#4FAF6F] rounded-full transition-[width] duration-500"
                    style={{ width: `${Math.min(100, goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <input
              type="text"
              value={newGoalName}
              onChange={(e) => setNewGoalName(e.target.value)}
              className="bg-transparent border-b-2 border-[#2B4937]/30 focus:border-[#2B4937] outline-none py-2 font-body text-[14px] w-40 transition-colors"
              placeholder="Goal name"
            />
            <input
              type="number"
              value={newGoalTarget}
              onChange={(e) => setNewGoalTarget(e.target.value)}
              className="bg-transparent border-b-2 border-[#2B4937]/30 focus:border-[#2B4937] outline-none py-2 font-body text-[14px] w-28 transition-colors"
              placeholder="Target $"
            />
            <input
              type="number"
              value={newGoalCurrent}
              onChange={(e) => setNewGoalCurrent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGoal()}
              className="bg-transparent border-b-2 border-[#2B4937]/30 focus:border-[#2B4937] outline-none py-2 font-body text-[14px] w-28 transition-colors"
              placeholder="Current $"
            />
            <button
              onClick={addGoal}
              className="font-body text-[12px] text-[#2B4937] underline underline-offset-4 hover:text-black transition-colors whitespace-nowrap"
            >
              add goal
            </button>
          </div>
        </Section>

        {/* Plaid Integration Note */}
        <div className="mt-12 p-6 bg-[#2B4937]/5 rounded-sm border border-[#2B4937]/10">
          <p className="font-display text-[16px] text-[#2B4937] mb-2">future: connect your bank</p>
          <p className="font-body text-[13px] text-neutral-600 leading-relaxed">
            In a future update, you&apos;ll be able to connect your bank accounts via Plaid to automatically
            sync your savings balances. For now, update your goal amounts manually here.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-neutral-200 text-center">
          <Link
            href="/"
            className="font-body text-[13px] text-neutral-600 hover:text-neutral-900 transition-colors underline underline-offset-4"
          >
            return to your garden
          </Link>
        </div>
      </div>
    </main>
  );
}

/* ─── Section wrapper ─── */
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <h2 className="font-display text-[22px] text-[#2B4937] mb-1">{title}</h2>
      <p className="font-body text-[12px] text-neutral-500 mb-4">{description}</p>
      {children}
    </section>
  );
}
