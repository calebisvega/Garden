"use client";

import { useCallback, useEffect, useState } from "react";

const PREFS_STORAGE_KEY = "garden:preferences:v1" as const;

export type SubstackFeed = {
  url: string;
  name: string;
};

export type NewsFeed = {
  url: string;
  name: string;
};

export type GrowthGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
};

export type GardenPreferences = {
  displayName: string;
  tickers: string[];
  substackFeeds: SubstackFeed[];
  newsFeeds: NewsFeed[];
  growthGoals: GrowthGoal[];
};

const DEFAULT_PREFERENCES: GardenPreferences = {
  displayName: "caleb",
  tickers: ["NVDA", "AVGO", "GOOGL", "RVI", "SPY"],
  substackFeeds: [
    { url: "https://www.platformer.news/rss", name: "Platformer" },
    { url: "https://www.lennysnewsletter.com/feed", name: "Lenny's Newsletter" },
    { url: "https://stratechery.com/feed/", name: "Stratechery" },
    { url: "https://thegeneralist.substack.com/feed", name: "The Generalist" },
  ],
  newsFeeds: [
    { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", name: "NYT" },
    { url: "https://feeds.bbci.co.uk/news/world/rss.xml", name: "BBC" },
    { url: "http://rss.cnn.com/rss/edition_world.rss", name: "CNN" },
    { url: "https://www.wired.com/feed/rss", name: "Wired" },
  ],
  growthGoals: [
    { id: "house", name: "House Fund", targetAmount: 10000, currentAmount: 2790.8 },
    { id: "tax", name: "Tax Fund", targetAmount: 6000, currentAmount: 720 },
    { id: "safety", name: "Safety Fund", targetAmount: 2000, currentAmount: 2000 },
    { id: "blank", name: "Blank Fund", targetAmount: 10000, currentAmount: 1500 },
  ],
};

export function usePreferences() {
  const [preferences, setPreferences] = useState<GardenPreferences>(DEFAULT_PREFERENCES);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(PREFS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<GardenPreferences>;
        setPreferences({
          ...DEFAULT_PREFERENCES,
          ...parsed,
          tickers: Array.isArray(parsed.tickers) ? parsed.tickers : DEFAULT_PREFERENCES.tickers,
          substackFeeds: Array.isArray(parsed.substackFeeds)
            ? parsed.substackFeeds
            : DEFAULT_PREFERENCES.substackFeeds,
          newsFeeds: Array.isArray(parsed.newsFeeds)
            ? parsed.newsFeeds
            : DEFAULT_PREFERENCES.newsFeeds,
          growthGoals: Array.isArray(parsed.growthGoals)
            ? parsed.growthGoals
            : DEFAULT_PREFERENCES.growthGoals,
        });
      }
    } catch {
      // ignore parse errors, use defaults
    }
    setLoaded(true);
  }, []);

  // Save to localStorage whenever preferences change (after initial load)
  const updatePreferences = useCallback((updates: Partial<GardenPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updates };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  return { preferences, updatePreferences, loaded, DEFAULT_PREFERENCES };
}
