// Fetches the World Cup news feed from an external JSON and caches it for 7 days.
//
// HOW TO UPDATE NEWS WEEKLY WITHOUT REDEPLOYING:
// 1. Host a JSON file matching the NewsFeed shape at a public URL with CORS headers.
//    Recommended: a file in a public GitHub repo (raw.githubusercontent.com allows CORS).
//    Example: https://raw.githubusercontent.com/YOUR_USER/YOUR_REPO/main/news-feed.json
// 2. Set FEED_URL below to that URL.
// 3. Edit and commit the JSON file each week — the app picks it up automatically
//    within 7 days (or when the user clears localStorage / opens an incognito window).
//
// FALLBACK: if the fetch fails (network offline, URL not configured), the app shows
// the bundled seed data from src/data/news/seed.ts so the tab is never empty.

import { NEWS_SEED } from '../data/news/seed';

export interface NewsItem {
  title: { es: string; en: string };
  url: string;
  source: string;
  date: string; // YYYY-MM-DD
}

interface NewsFeed {
  updatedAt: string;
  items: Record<string, NewsItem[]>;
}

interface CacheEntry {
  data: NewsFeed;
  ts: number;
}

// ─── Configure this URL to your external news feed JSON ───────────────────────
const FEED_URL = 'https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/news-feed.json';
// ──────────────────────────────────────────────────────────────────────────────

const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
const CACHE_KEY = 'news:feed';

let _inFlight: Promise<NewsFeed> | null = null;

function _fromCache(): NewsFeed | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    if (Date.now() - entry.ts > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function _toCache(feed: NewsFeed): void {
  try {
    const entry: CacheEntry = { data: feed, ts: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch { /* quota full */ }
}

async function _fetchFeed(): Promise<NewsFeed> {
  if (_inFlight) return _inFlight;

  _inFlight = (async () => {
    try {
      const resp = await fetch(FEED_URL);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const feed = await resp.json() as NewsFeed;
      _toCache(feed);
      return feed;
    } catch {
      return NEWS_SEED;
    } finally {
      _inFlight = null;
    }
  })();

  return _inFlight;
}

/** Returns cached or fetched news items for a given team code (e.g. 'ESP'). */
export async function getTeamNews(teamId: string): Promise<NewsItem[]> {
  const cached = _fromCache();
  const feed = cached ?? await _fetchFeed();
  return feed.items[teamId] ?? [];
}
