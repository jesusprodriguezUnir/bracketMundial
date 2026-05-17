// Fetches 1X2 match odds from an external JSON and caches them for 6 h.
//
// HOW IT WORKS:
// 1. A GitHub Actions cron (twice daily at 06:00 and 18:00 UTC) runs scripts/generate-odds.mjs,
//    fetches The Odds API, fills in synthetic model estimates for matches without market odds,
//    writes odds-feed.json to the `odds-data` branch and pushes it.
// 2. This service fetches that JSON at runtime, caches it in localStorage for 6 h.
// 3. If the fetch fails (offline, first load) it falls back to the bundled ODDS_SEED.
// 4. Market odds typically appear days before kickoff (June 2026); until then the seed
//    contains model-derived estimates so the simulation and UI always have data.

import { ODDS_SEED } from '../data/odds/seed';
import { expectedProbabilities } from './odds-model';
import { TEAM_STRENGTH } from '../data/team-strength';

export interface MatchOdds {
  home: number;       // % probability team A wins (integer, sums to 100 with draw+away)
  draw: number;       // % probability draw
  away: number;       // % probability team B wins
  bookmakers: number; // number of bookmakers in the consensus (0 = synthetic estimate)
  source: 'market' | 'model'; // 'market' = real bookmaker data, 'model' = synthetic estimate
  bet365?: { home: number; draw: number; away: number }; // Bet365-specific 1X2 probabilities (available when market source)
}

export interface OddsFeed {
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
const CACHE_KEY = 'odds:feed:v2'; // v2 adds source field

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
      return ODDS_SEED; // offline or no feed yet — bundled seed always available
    } finally {
      _inFlight = null;
    }
  })();
  _inFlight = p;
  return p;
}

/** Returns all match odds (keyed by matchId). Falls back to bundled seed if unavailable. */
export async function getAllOdds(): Promise<Record<string, MatchOdds>> {
  const cached = _fromCache();
  const feed = cached ?? await _fetchFeed();
  return feed.matches;
}

/**
 * Returns odds for a specific match.
 * For group matches: uses feed/seed (market or model estimate).
 * For knockout matches (matchId not in feed): derives odds on-the-fly from team ratings.
 */
export async function getOddsForMatch(
  matchId: string,
  teamA: string | null | undefined,
  teamB: string | null | undefined,
): Promise<MatchOdds | null> {
  const all = await getAllOdds();
  if (all[matchId]) return all[matchId];
  // Knockout match — compute from team strengths if both teams are known
  if (!teamA || !teamB) return null;
  const rA = TEAM_STRENGTH[teamA as keyof typeof TEAM_STRENGTH] ?? 1500;
  const rB = TEAM_STRENGTH[teamB as keyof typeof TEAM_STRENGTH] ?? 1500;
  const prob = expectedProbabilities(rA, rB);
  return { ...prob, bookmakers: 0, source: 'model' };
}

/** @deprecated Use getOddsForMatch instead */
export async function getMatchOdds(matchId: string): Promise<MatchOdds | null> {
  const all = await getAllOdds();
  return all[matchId] ?? null;
}
