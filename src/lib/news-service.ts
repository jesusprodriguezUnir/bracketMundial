// Fetches the World Cup news feed from an external JSON and caches it for 24 h.
//
// HOW IT WORKS:
// 1. A GitHub Actions cron (daily at 05:00 UTC) runs scripts/generate-news.mjs,
//    writes news-feed.json to the `news-data` branch and pushes it.
// 2. This service fetches that JSON at runtime, caches it in localStorage for 24 h,
//    and falls back to the bundled seed if the fetch fails (offline, first load, etc.).
// 3. Each team has separate arrays for ES and EN so headlines are always native.

import { NEWS_SEED } from '../data/news/seed';

export interface NewsItem {
  title: string;
  description?: string;
  url: string;
  image?: string;
  source: string;
  sourceUrl?: string;
  date: string; // YYYY-MM-DD
}

type LocalizedItems = { es: NewsItem[]; en: NewsItem[] };

interface NewsFeed {
  updatedAt: string;
  items: Record<string, LocalizedItems>;
}

interface CacheEntry {
  data: NewsFeed;
  ts: number;
}

const FEED_URL =
  'https://raw.githubusercontent.com/jesusprodriguezUnir/bracketMundial/news-data/news-feed.json';

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 h — aligns with daily cron
const CACHE_KEY = 'news:feed:v2'; // v2 invalidates old { title:{es,en} } entries

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

  const p = (async () => {
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
  _inFlight = p;
  return p;
}

/** Returns cached or fetched news items for a given team code and locale (e.g. 'ESP', 'es'). */
export async function getTeamNews(teamId: string, locale: 'es' | 'en'): Promise<NewsItem[]> {
  const cached = _fromCache();
  const feed = cached ?? await _fetchFeed();
  return feed.items[teamId]?.[locale] ?? [];
}
