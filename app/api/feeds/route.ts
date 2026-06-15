import { NextResponse } from "next/server";
import RssParser from "rss-parser";

const rssParser = new RssParser({
  timeout: 10000,
  headers: {
    "User-Agent": "Garden/2.0",
  },
});

/**
 * Article type — from Substack RSS feeds
 */
export type Article = {
  id: string;
  title: string;
  author: string;
  duration: string;
  url: string;
  publishedAt: string;
  source: string;
};

/**
 * News headline type — from major news outlets
 */
export type NewsHeadline = {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
};

/**
 * Feed source shape (matches preferences)
 */
type FeedSource = { url: string; name: string };

/**
 * Estimate reading time from content length
 */
function estimateReadingTime(content?: string): string {
  if (!content) return "around 5 min.";
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.max(3, Math.round(wordCount / 200));
  return `around ${minutes} min.`;
}

/**
 * Default Substack / newsletter feeds (used when no custom feeds provided)
 */
const DEFAULT_SUBSTACK_FEEDS: FeedSource[] = [
  { url: "https://www.platformer.news/rss", name: "Platformer" },
  { url: "https://www.lennysnewsletter.com/feed", name: "Lenny's Newsletter" },
  { url: "https://stratechery.com/feed/", name: "Stratechery" },
  { url: "https://thegeneralist.substack.com/feed", name: "The Generalist" },
];

/**
 * Default news outlet RSS feeds (used when no custom feeds provided)
 */
const DEFAULT_NEWS_FEEDS: FeedSource[] = [
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", name: "NYT" },
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", name: "BBC" },
  { url: "http://rss.cnn.com/rss/edition_world.rss", name: "CNN" },
  { url: "https://www.wired.com/feed/rss", name: "Wired" },
];

/**
 * GET /api/feeds?type=articles&limit=8
 * GET /api/feeds?type=news&limit=6
 *
 * Uses default feeds. For custom feeds, use POST.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "articles";
  const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") ?? "8", 10)));

  if (type === "news") {
    return NextResponse.json(await fetchNews(DEFAULT_NEWS_FEEDS, limit));
  }

  return NextResponse.json(await fetchArticles(DEFAULT_SUBSTACK_FEEDS, limit));
}

/**
 * POST /api/feeds
 * Body: { type: "articles" | "news", limit?: number, feeds: { url: string, name: string }[] }
 *
 * Accepts custom feed sources from user preferences.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const type = body.type ?? "articles";
    const limit = Math.min(20, Math.max(1, body.limit ?? 8));
    const feeds: FeedSource[] = Array.isArray(body.feeds) && body.feeds.length > 0
      ? body.feeds
      : type === "news"
        ? DEFAULT_NEWS_FEEDS
        : DEFAULT_SUBSTACK_FEEDS;

    if (type === "news") {
      return NextResponse.json(await fetchNews(feeds, limit));
    }

    return NextResponse.json(await fetchArticles(feeds, limit));
  } catch (err) {
    console.error("[Feeds] POST error:", err);
    return NextResponse.json([], { status: 400 });
  }
}

/**
 * Fetch articles from Substack / newsletter RSS feeds
 */
async function fetchArticles(feeds: FeedSource[], limit: number): Promise<Article[]> {
  const articles: Article[] = [];

  for (const feed of feeds) {
    try {
      const parsed = await rssParser.parseURL(feed.url);
      const items = (parsed.items ?? []).slice(0, 3);

      for (const item of items) {
        articles.push({
          id: item.guid ?? item.link ?? `${feed.name}-${item.title}`,
          title: (item.title ?? "Untitled").replace(/,\s*$/, ""),
          author: item.creator ?? item["dc:creator"] ?? parsed.title ?? feed.name,
          duration: estimateReadingTime(item.contentSnippet ?? item.content),
          url: item.link ?? "#",
          publishedAt: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
          source: "substack",
        });
      }
    } catch (err) {
      console.warn(`[Feeds] Failed to fetch ${feed.name}:`, err);
    }
  }

  // Sort by date descending, take the requested limit
  articles.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return articles.slice(0, limit);
}

/**
 * Fetch news headlines from major outlets
 */
async function fetchNews(feeds: FeedSource[], limit: number): Promise<NewsHeadline[]> {
  const headlines: NewsHeadline[] = [];

  for (const feed of feeds) {
    try {
      const parsed = await rssParser.parseURL(feed.url);
      const items = (parsed.items ?? []).slice(0, 3);

      for (const item of items) {
        headlines.push({
          id: item.guid ?? item.link ?? `${feed.name}-${item.title}`,
          title: item.title ?? "Untitled",
          summary: (item.contentSnippet ?? item.content ?? "").slice(0, 200),
          source: feed.name,
          url: item.link ?? "#",
          publishedAt: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn(`[Feeds] Failed to fetch news from ${feed.name}:`, err);
    }
  }

  // Sort by date descending
  headlines.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return headlines.slice(0, limit);
}
