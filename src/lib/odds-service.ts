// Fetches 1X2 match odds from an external JSON and caches them for 6 h.
//
// HOW IT WORKS:
// 1. A GitHub Actions cron (twice daily at 06:00 and 18:00 UTC) runs scripts/generate-odds.mjs,
//    fetches The Odds API, converts decimal odds → normalised probabilities,
//    writes odds-feed.json to the `odds-data` branch and pushes it.
// 2. This service fetches that JSON at runtime, caches it in localStorage for 6 h.
// 3. If the fetch fails (offline, no ODDS_API_KEY, no odds yet for upcoming matches),
//    it returns an empty feed — the UI simply hides the probability block.
// 4. Group odds typically appear a few days before kickoff (June 2026),
//    so the feed will be mostly empty until the tournament starts.

export interface MatchOdds {
  home: number;   // % probability team A wins (integer, sums to 100 with draw+away)
  draw: number;   // % probability draw
  away: number;   // % probability team B wins
  bookmakers: number; // number of bookmakers in the consensus
}

interface OddsFeed {
  updatedAt: string;
  matches: Record<string, MatchOdds>;
}

interface CacheEntry {
  data: OddsFeed;
  ts: number;
}

const FEED_URL =
  'https://raw.githubusercontent.com/jesusprodriguezUnir/bracketMundial/odds-data/odds-feed.json';

const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 h — aligns with twice-daily cron
const CACHE_KEY = 'odds:feed:v1';

const EMPTY_FEED: OddsFeed = { updatedAt: '', matches: {} };

let _inFlight: Promise<OddsFeed> | null = null;

function _fromCache(): OddsFeed | null {
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

function _toCache(feed: OddsFeed): void {
  try {
    const entry: CacheEntry = { data: feed, ts: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch { /* quota full */ }
}

async function _fetchFeed(): Promise<OddsFeed> {
  if (_inFlight) return _inFlight;

  const p = (async () => {
    try {
      const resp = await fetch(FEED_URL);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const feed = await resp.json() as OddsFeed;
      _toCache(feed);
      return feed;
    } catch {
      return EMPTY_FEED;
    } finally {
      _inFlight = null;
    }
  })();
  _inFlight = p;
  return p;
}

/** Returns all match odds (keyed by matchId). Empty object if unavailable. */
export async function getAllOdds(): Promise<Record<string, MatchOdds>> {
  const cached = _fromCache();
  const feed = cached ?? await _fetchFeed();
  return feed.matches;
}

/** Returns odds for a specific match, or null if not available. */
export async function getMatchOdds(matchId: string): Promise<MatchOdds | null> {
  const all = await getAllOdds();
  return all[matchId] ?? null;
}
