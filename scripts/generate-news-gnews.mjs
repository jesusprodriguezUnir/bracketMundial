/**
 * generate-news-gnews.mjs
 *
 * Fetches team news using GNews API (primary) with Google News RSS as fallback.
 * Produces richer data: descriptions, images, and canonical URLs.
 *
 * Usage:
 *   node scripts/generate-news-gnews.mjs                  # all 48 teams
 *   node scripts/generate-news-gnews.mjs ARG MEX           # specific teams
 *   node scripts/generate-news-gnews.mjs --write-seed      # also regenerate seed
 *   node scripts/generate-news-gnews.mjs --no-fallback     # skip Google News fallback
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const NEWS_PER_TEAM = 4; // GNews gives richer results, show 1 more
const DELAY_MS = 500; // polite delay between API calls

// ─── .env parser ──────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = join(ROOT, '.env');
  if (!existsSync(envPath)) return {};
  const env = {};
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
  return env;
}

const ENV = loadEnv();
const GNEWS_API_KEY = process.env.GNEWS_DATA_KEY ?? ENV.GNEWS_DATA_KEY;
const GNEWS_BASE = 'https://gnews.io/api/v4/search';

// ─── Arguments ───────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const writeSeed = args.includes('--write-seed');
const noFallback = args.includes('--no-fallback');
const teamFilter = args.filter(a => !a.startsWith('-')).map(t => t.toUpperCase());

// ─── Reliable source whitelist (for Google News RSS fallback) ─────────────────
const WHITELIST = [
  'fifa.com', 'uefa.com', 'conmebol.com', 'concacaf.com', 'cafonline.com', 'the-afc.com',
  'espn.com', 'espn.co.uk', 'espndeportes.espn.com',
  'marca.com', 'as.com', 'sport.es', 'mundodeportivo.com',
  'bbc.com', 'bbc.co.uk', 'bbc.co.uk/sport',
  'reuters.com', 'apnews.com',
  'theguardian.com', 'skysports.com',
  'goal.com', 'lequipe.fr',
  'olympics.com', 'cbssports.com', 'theathletic.com', 'nytimes.com/athletic',
  'transfermarkt', 'sofoot.com', 'sportal',
  'infobae.com', 'tudn.com', 'bolavip.com',
  'gazzetta.it', 'kicker.de', 'francefootball.fr',
  'ole.com.ar', 'clarin.com', 'tycsports.com',
  'globoesporte.globo.com', 'uol.com.br',
  'rpc.com.py', 'elcomercio.pe',
  'dazn.com', 'football-espana.net', 'sportsmole.co.uk',
  'aljazeera.com', 'moroccoworldnews.com',
];

// ─── Federation official RSS feeds (complement, not replace, GNews) ─────────────
// Populate with real URLs as they are verified. Blank entries are ignored.
const FEDERATION_RSS = {
  FIFA:    ['https://www.fifa.com/fifaplus/es/articles/rss.xml'],
  UEFA:    ['https://www.uefa.com/rss'],
  CONMEBOL: ['https://www.conmebol.com/rss'],
  CONCACAF: ['https://www.concacaf.com/rss'],
  MEX:     [],
  RSA:     ['https://www.safa.net/rss'],
  KOR:     [],
  CZE:     [],
  CAN:     ['https://canadasoccer.com/feed'],
  SUI:     [],
  QAT:     [],
  BIH:     [],
  BRA:     ['https://www.cbf.com.br/rss'],
  MAR:     [],
  SCO:     ['https://www.scottishfa.co.uk/rss'],
  HAI:     [],
  USA:     ['https://www.ussoccer.com/rss'],
  PAR:     [],
  AUS:     ['https://www.footballaustralia.com.au/rss'],
  TUR:     [],
  GER:     ['https://www.dfb.de/rss'],
  CUW:     [],
  CIV:     [],
  ECU:     ['https://www.fef.ec/rss'],
  NED:     ['https://www.knvb.nl/rss'],
  JPN:     ['https://www.jfa.jp/rss'],
  TUN:     [],
  SWE:     ['https://www.svenskfotboll.se/rss'],
  BEL:     ['https://www.rbfa.be/rss'],
  EGY:     [],
  IRN:     [],
  NZL:     ['https://www.nzfootball.co.nz/rss'],
  ESP:     ['https://rfef.es/es/rss/noticias'],
  URU:     ['https://www.auf.org.uy/rss'],
  KSA:     [],
  CPV:     [],
  FRA:     ['https://www.fff.fr/rss'],
  SEN:     [],
  NOR:     ['https://www.fotball.no/rss'],
  IRQ:     [],
  ARG:     ['https://www.afa.com.ar/rss'],
  AUT:     ['https://www.oefb.at/rss'],
  ALG:     [],
  JOR:     [],
  POR:     ['https://www.fpf.pt/rss'],
  COL:     ['https://fcf.com.co/rss'],
  UZB:     [],
  COD:     [],
  ENG:     ['https://www.thefa.com/rss'],
  CRO:     ['https://hns-cff.hr/rss'],
  GHA:     [],
  PAN:     [],
};

// ─── URL resolution cache for Google News redirects ────────────────────────────
const URL_CACHE_PATH = join(ROOT, 'scripts', '.url-cache.json');
function loadUrlCache() {
  try {
    if (existsSync(URL_CACHE_PATH)) return JSON.parse(readFileSync(URL_CACHE_PATH, 'utf8'));
  } catch { /* corrupt cache */ }
  return {};
}
function saveUrlCache(cache) {
  writeFileSync(URL_CACHE_PATH, JSON.stringify(cache, null, 2), 'utf8');
}
const _urlCache = loadUrlCache();
const _newResolved = new Set();

/** Resolve a Google News redirect URL to its canonical destination. Non-Google URLs pass through. */
async function resolveCanonicalUrl(url) {
  if (!url || !url.includes('news.google.com')) return url;
  if (_urlCache[url]) return _urlCache[url];
  try {
    const resp = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; bracketMundial-news-bot/1.0)' },
      signal: AbortSignal.timeout(5000),
    });
    const final = resp.url;
    if (final && final !== url && !final.includes('news.google.com')) {
      _urlCache[url] = final;
      _newResolved.add(url);
      return final;
    }
  } catch { /* timeout or network error, keep Google URL */ }
  return url;
}

/** Persist URL cache at the end of the run (only if new entries were added) */
function flushUrlCache() {
  if (_newResolved.size > 0) saveUrlCache(_urlCache);
}

// ─── 48 teams ───────────────────────────────────────────────────────────────
const TEAMS = [
  { id: 'MEX', es: 'Selección México', en: 'Mexico national football team' },
  { id: 'RSA', es: 'Selección Sudáfrica', en: 'South Africa national football team' },
  { id: 'KOR', es: 'Selección Corea del Sur', en: 'South Korea national football team' },
  { id: 'CZE', es: 'Selección República Checa', en: 'Czech Republic national football team' },
  { id: 'CAN', es: 'Selección Canadá', en: 'Canada national football team' },
  { id: 'SUI', es: 'Selección Suiza', en: 'Switzerland national football team' },
  { id: 'QAT', es: 'Selección Catar', en: 'Qatar national football team' },
  { id: 'BIH', es: 'Selección Bosnia Herzegovina', en: 'Bosnia and Herzegovina national football team' },
  { id: 'BRA', es: 'Selección Brasil', en: 'Brazil national football team' },
  { id: 'MAR', es: 'Selección Marruecos', en: 'Morocco national football team' },
  { id: 'SCO', es: 'Selección Escocia', en: 'Scotland national football team' },
  { id: 'HAI', es: 'Selección Haití', en: 'Haiti national football team' },
  { id: 'USA', es: 'Selección Estados Unidos', en: 'United States national soccer team' },
  { id: 'PAR', es: 'Selección Paraguay', en: 'Paraguay national football team' },
  { id: 'AUS', es: 'Selección Australia', en: 'Australia national football team Socceroos' },
  { id: 'TUR', es: 'Selección Turquía', en: 'Turkey national football team' },
  { id: 'GER', es: 'Selección Alemania', en: 'Germany national football team' },
  { id: 'CUW', es: 'Selección Curazao', en: 'Curaçao national football team' },
  { id: 'CIV', es: 'Selección Costa de Marfil', en: 'Ivory Coast national football team' },
  { id: 'ECU', es: 'Selección Ecuador', en: 'Ecuador national football team' },
  { id: 'NED', es: 'Selección Países Bajos', en: 'Netherlands national football team' },
  { id: 'JPN', es: 'Selección Japón', en: 'Japan national football team' },
  { id: 'TUN', es: 'Selección Túnez', en: 'Tunisia national football team' },
  { id: 'SWE', es: 'Selección Suecia', en: 'Sweden national football team' },
  { id: 'BEL', es: 'Selección Bélgica', en: 'Belgium national football team' },
  { id: 'EGY', es: 'Selección Egipto', en: 'Egypt national football team' },
  { id: 'IRN', es: 'Selección Irán', en: 'Iran national football team' },
  { id: 'NZL', es: 'Selección Nueva Zelanda', en: 'New Zealand national football team' },
  { id: 'ESP', es: 'Selección España', en: 'Spain national football team' },
  { id: 'URU', es: 'Selección Uruguay', en: 'Uruguay national football team' },
  { id: 'KSA', es: 'Selección Arabia Saudita', en: 'Saudi Arabia national football team' },
  { id: 'CPV', es: 'Selección Cabo Verde', en: 'Cape Verde national football team' },
  { id: 'FRA', es: 'Selección Francia', en: 'France national football team' },
  { id: 'SEN', es: 'Selección Senegal', en: 'Senegal national football team' },
  { id: 'NOR', es: 'Selección Noruega', en: 'Norway national football team' },
  { id: 'IRQ', es: 'Selección Irak', en: 'Iraq national football team' },
  { id: 'ARG', es: 'Selección Argentina', en: 'Argentina national football team' },
  { id: 'AUT', es: 'Selección Austria', en: 'Austria national football team' },
  { id: 'ALG', es: 'Selección Argelia', en: 'Algeria national football team' },
  { id: 'JOR', es: 'Selección Jordania', en: 'Jordan national football team' },
  { id: 'POR', es: 'Selección Portugal', en: 'Portugal national football team' },
  { id: 'COL', es: 'Selección Colombia', en: 'Colombia national football team' },
  { id: 'UZB', es: 'Selección Uzbekistán', en: 'Uzbekistan national football team' },
  { id: 'COD', es: 'Selección RD Congo', en: 'DR Congo national football team' },
  { id: 'ENG', es: 'Selección Inglaterra', en: 'England national football team' },
  { id: 'CRO', es: 'Selección Croacia', en: 'Croatia national football team' },
  { id: 'GHA', es: 'Selección Ghana', en: 'Ghana national football team' },
  { id: 'PAN', es: 'Selección Panamá', en: 'Panama national football team' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function isSpanishText(text) {
  const esWords = ['selección', 'seleccion', 'mundial', 'futbol', 'fútbol', 'méxico', 'méxico', 'españa', 'argentina', 'brasil', 'del', 'para', 'por', 'con', 'los', 'las', 'una', 'más', 'tras', 'según'];
  const enWords = ['world cup', 'team', 'squad', 'coach', 'manager', 'player', 'match', 'against', 'final', 'group'];
  const lower = text.toLowerCase();
  let esScore = 0, enScore = 0;
  for (const w of esWords) if (lower.includes(w)) esScore++;
  for (const w of enWords) if (lower.includes(w)) enScore++;
  return esScore > enScore;
}

// ─── Source 1: GNews API ─────────────────────────────────────────────────────

async function fetchGNews(searchQuery, lang, max) {
  if (!GNEWS_API_KEY) return { articles: [] };

  const params = new URLSearchParams({
    q: searchQuery,
    lang,
    max: String(max),
    apikey: GNEWS_API_KEY,
  });

  try {
    const url = `${GNEWS_BASE}?${params}`;
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'bracketMundial/1.0' },
      signal: AbortSignal.timeout(15_000),
    });
    if (!resp.ok) {
      console.warn(`    ⚠ GNews HTTP ${resp.status}: ${resp.statusText}`);
      return { articles: [] };
    }
    const json = await resp.json();
    if (json.errors) {
      console.warn(`    ⚠ GNews: ${json.errors.join(', ')}`);
      return { articles: [] };
    }
    return json;
  } catch (err) {
    console.warn(`    ⚠ GNews fetch failed: ${err.message}`);
    return { articles: [] };
  }
}

function gnewsToNewsItem(article) {
  return {
    title: article.title || '',
    description: article.description || '',
    url: article.url || '',
    image: article.image || '',
    source: article.source?.name || '',
    sourceUrl: article.source?.url || '',
    date: (article.publishedAt || '').slice(0, 10),
  };
}

// ─── Source 2: Google News RSS (fallback, from original script) ──────────────

function extractTag(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return m ? decodeEntities(m[1].trim()) : '';
}

function extractAttr(xml, tag, attr) {
  const m = xml.match(new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"`, 'i'));
  return m ? decodeEntities(m[1]) : '';
}

function splitTitleSource(raw) {
  const idx = raw.lastIndexOf(' - ');
  if (idx === -1) return { title: raw, source: '' };
  return { title: raw.slice(0, idx).trim(), source: raw.slice(idx + 3).trim() };
}

function parseDate(pubDate) {
  try {
    const d = new Date(pubDate);
    if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
    return d.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function isWhitelisted(source) {
  const s = source.toLowerCase();
  return WHITELIST.some(w => s.includes(w.toLowerCase()));
}

async function fetchGoogleNews(query, hl, gl, ceid) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${hl}&gl=${gl}&ceid=${ceid}`;
  let xml;
  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; bracketMundial-news-bot/1.0)' },
      signal: AbortSignal.timeout(15_000),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    xml = await resp.text();
  } catch (err) {
    console.warn(`    ⚠ RSS fetch failed: ${err.message}`);
    return [];
  }

  const itemBlocks = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map(m => m[1]);

  const parsed = itemBlocks.map(block => {
    const rawTitle = extractTag(block, 'title');
    const { title, source: titleSource } = splitTitleSource(rawTitle);
    const link = extractTag(block, 'link') || extractAttr(block, 'link', 'href');
    const pubDate = extractTag(block, 'pubDate');
    const sourceTag = extractTag(block, 'source');
    const source = sourceTag || titleSource || 'Google News';
    return { title, description: '', url: link, image: '', source, sourceUrl: '', date: parseDate(pubDate) };
  }).filter(item => item.title && item.url);

  const preferred = parsed.filter(i => isWhitelisted(i.source));
  const rest = parsed.filter(i => !isWhitelisted(i.source));
  return [...preferred, ...rest];
}

// ─── Source 3: Federation RSS feeds ─────────────────────────────────────────

async function fetchFederationRSS(teamId) {
  const urls = FEDERATION_RSS[teamId] || [];
  if (urls.length === 0) return [];
  const results = [];
  for (const feedUrl of urls) {
    try {
      const resp = await fetch(feedUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; bracketMundial-news-bot/1.0)' },
        signal: AbortSignal.timeout(10_000),
      });
      if (!resp.ok) continue;
      const xml = await resp.text();
      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map(m => m[1]);
      for (const block of items) {
        const rawTitle = extractTag(block, 'title');
        const { title, source: titleSource } = splitTitleSource(rawTitle);
        const link = extractTag(block, 'link') || extractAttr(block, 'link', 'href');
        const pubDate = extractTag(block, 'pubDate');
        const desc = extractTag(block, 'description') || '';
        const imageUrl = extractAttr(block, 'enclosure', 'url') || '';
        results.push({
          title: title || rawTitle,
          description: stripHtml(desc).slice(0, 200),
          url: link,
          image: imageUrl,
          source: titleSource || `Federación ${teamId}`,
          sourceUrl: feedUrl,
          date: parseDate(pubDate),
        });
      }
    } catch { /* skip broken feeds */ }
  }
  return results;
}

function stripHtml(str) {
  return str.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

// ─── Resolve canonical URLs for all news items ──────────────────────────────

async function resolveNewsItems(items) {
  const resolved = [];
  for (const item of items) {
    if (item.url && item.url.includes('news.google.com')) {
      const canonical = await resolveCanonicalUrl(item.url);
      item.url = canonical;
    }
    resolved.push(item);
    await sleep(100);
  }
  return resolved;
}

// ─── Tournament news (general, not team-specific) ────────────────────────────

async function fetchTournamentNews(lang) {
  const query = lang === 'es'
    ? '("Mundial 2026" OR "Copa Mundial 2026")'
    : '("World Cup 2026" OR "FIFA World Cup 2026")';
  const gl = lang === 'es' ? 'ES' : 'US';
  const hl = lang === 'es' ? 'es' : 'en';
  const ceid = lang === 'es' ? 'ES:es' : 'US:en';

  let results = [];
  if (GNEWS_API_KEY) {
    const gnews = await fetchGNews(query, hl, NEWS_PER_TEAM * 2);
    for (const a of (gnews.articles || [])) {
      results.push(gnewsToNewsItem(a));
    }
    await sleep(DELAY_MS);
  }

  if (results.length < NEWS_PER_TEAM) {
    const rssResults = await fetchGoogleNews(query, hl, gl, ceid);
    for (const item of rssResults) {
      if (!results.some(r => r.url === item.url)) results.push(item);
    }
  }

  const sortByDate = (a, b) => b.date.localeCompare(a.date);
  results.sort(sortByDate);
  return results.slice(0, 8); // more items for general tourney news
}

// ─── Main team news fetcher (1 GNews call per team, combined query) ──────────

async function fetchTeamNewsCombined(team) {
  const gnewsResults = [];

  if (GNEWS_API_KEY) {
    const combinedQuery = `("${team.es}" Mundial 2026) OR ("${team.en}" "World Cup 2026")`;
    const gnews = await fetchGNews(combinedQuery, 'en', NEWS_PER_TEAM * 2);
    for (const a of (gnews.articles || [])) {
      gnewsResults.push(gnewsToNewsItem(a));
    }
    await sleep(DELAY_MS);
  }

  // Split GNews results by language detection
  const esFromGNews = gnewsResults.filter(r => isSpanishText(r.title + ' ' + r.description)).slice(0, NEWS_PER_TEAM);
  const enFromGNews = gnewsResults.filter(r => !isSpanishText(r.title + ' ' + r.description)).slice(0, NEWS_PER_TEAM);

  // Federation RSS — highest priority, merge first
  let fedResults = [];
  try {
    fedResults = await fetchFederationRSS(team.id);
    await sleep(DELAY_MS);
  } catch { /* skip if fed RSS fails */ }
  const fedES = fedResults.filter(r => isSpanishText(r.title + ' ' + r.description));
  const fedEN = fedResults.filter(r => !isSpanishText(r.title + ' ' + r.description));

  // Fallback to Google News RSS for gaps
  let esFallback = [], enFallback = [];
  if (!noFallback) {
    if (esFromGNews.length + fedES.length < NEWS_PER_TEAM) {
      const esQuery = `"${team.es}" Mundial 2026`;
      esFallback = await fetchGoogleNews(esQuery, 'es', 'ES', 'ES:es');
      await sleep(DELAY_MS);
    }

    if (enFromGNews.length + fedEN.length < NEWS_PER_TEAM) {
      const enQuery = `"${team.en}" "World Cup 2026"`;
      enFallback = await fetchGoogleNews(enQuery, 'en-US', 'US', 'US:en');
    }
  }

  // Merge: Federation first (official), then GNews, then RSS fallback
  const sortByDate = (a, b) => b.date.localeCompare(a.date);

  let finalES = [...fedES];
  for (const item of esFromGNews) {
    if (finalES.length >= NEWS_PER_TEAM) break;
    if (!finalES.some(e => e.url === item.url)) finalES.push(item);
  }
  for (const item of esFallback) {
    if (finalES.length >= NEWS_PER_TEAM) break;
    if (!finalES.some(e => e.url === item.url)) finalES.push(item);
  }
  finalES.sort(sortByDate);

  let finalEN = [...fedEN];
  for (const item of enFromGNews) {
    if (finalEN.length >= NEWS_PER_TEAM) break;
    if (!finalEN.some(e => e.url === item.url)) finalEN.push(item);
  }
  for (const item of enFallback) {
    if (finalEN.length >= NEWS_PER_TEAM) break;
    if (!finalEN.some(e => e.url === item.url)) finalEN.push(item);
  }
  finalEN.sort(sortByDate);

  // Resolve Google News URLs to canonical URLs
  finalES = await resolveNewsItems(finalES);
  finalEN = await resolveNewsItems(finalEN);

  return {
    es: finalES.slice(0, NEWS_PER_TEAM),
    en: finalEN.slice(0, NEWS_PER_TEAM),
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  const teamsToProcess = teamFilter.length > 0
    ? TEAMS.filter(t => teamFilter.includes(t.id))
    : TEAMS;

  const sourceLabel = GNEWS_API_KEY
    ? `GNews API + Google News RSS fallback`
    : `Google News RSS only (add GNEWS_DATA_KEY in .env for richer data)`;
  console.log(`📰 Generating news feed for ${teamsToProcess.length} teams (${today})`);
  console.log(`   Source: ${sourceLabel}`);

  // Load existing feed to preserve teams we are not updating
  let items = {};
  const feedPath = join(ROOT, 'news-feed.json');
  try {
    if (existsSync(feedPath)) {
      const existing = JSON.parse(readFileSync(feedPath, 'utf8'));
      items = existing.items || {};
    }
  } catch {
    console.warn('  ⚠ Could not read existing news-feed.json, starting fresh.');
  }

  // ── Tournament news (general, not team-specific) ─────────────────────────
  process.stdout.write('  TOURNAMENT ...');
  const [tournamentES, tournamentEN] = await Promise.all([
    fetchTournamentNews('es'),
    fetchTournamentNews('en'),
  ]);
  const resolvedES = await resolveNewsItems(tournamentES);
  const resolvedEN = await resolveNewsItems(tournamentEN);
  items['_tournament'] = { es: resolvedES, en: resolvedEN };
  const tGES = resolvedES.filter(i => i.image).length;
  const tGEN = resolvedEN.filter(i => i.image).length;
  console.log(` es:${resolvedES.length}(${tGES}📷) en:${resolvedEN.length}(${tGEN}📷)`);

  for (const team of teamsToProcess) {
    process.stdout.write(`  ${team.id} ...`);
    const news = await fetchTeamNewsCombined(team);
    items[team.id] = news;
    const gES = news.es.filter(i => i.image).length;
    const gEN = news.en.filter(i => i.image).length;
    console.log(` es:${news.es.length}(${gES}📷) en:${news.en.length}(${gEN}📷)`);
  }

  // ─── Write news-feed.json ──────────────────────────────────────────────────
  const feed = { updatedAt: today, items };
  writeFileSync(feedPath, JSON.stringify(feed, null, 2) + '\n', 'utf8');
  console.log(`\n✅ news-feed.json updated (${feedPath})`);
  flushUrlCache();

  // ─── Optionally regenerate seed.ts ─────────────────────────────────────────
  if (writeSeed) {
    const seedEntries = Object.entries(items)
      .map(([id, { es, en }]) => {
        const esLines = es.map(i => {
          const parts = [
            `title: ${JSON.stringify(i.title)}`,
            i.description ? `description: ${JSON.stringify(i.description)}` : null,
            `url: ${JSON.stringify(i.url)}`,
            i.image ? `image: ${JSON.stringify(i.image)}` : null,
            `source: ${JSON.stringify(i.source)}`,
            i.sourceUrl ? `sourceUrl: ${JSON.stringify(i.sourceUrl)}` : null,
            `date: ${JSON.stringify(i.date)}`,
          ].filter(Boolean);
          return `        { ${parts.join(', ')} },`;
        }).join('\n');
        const enLines = en.map(i => {
          const parts = [
            `title: ${JSON.stringify(i.title)}`,
            i.description ? `description: ${JSON.stringify(i.description)}` : null,
            `url: ${JSON.stringify(i.url)}`,
            i.image ? `image: ${JSON.stringify(i.image)}` : null,
            `source: ${JSON.stringify(i.source)}`,
            i.sourceUrl ? `sourceUrl: ${JSON.stringify(i.sourceUrl)}` : null,
            `date: ${JSON.stringify(i.date)}`,
          ].filter(Boolean);
          return `        { ${parts.join(', ')} },`;
        }).join('\n');
        return `    ${id}: {\n      es: [\n${esLines}\n      ],\n      en: [\n${enLines}\n      ],\n    },`;
      })
      .join('\n');

    const seedContent =
`// Bundled fallback — shown when the external feed is unavailable (offline, unconfigured URL).
// Regenerated by: node scripts/generate-news-gnews.mjs --write-seed

import type { NewsItem } from '../../lib/news-service';

interface NewsFeed {
  updatedAt: string;
  items: Record<string, { es: NewsItem[]; en: NewsItem[] }>;
}

export const NEWS_SEED: NewsFeed = {
  updatedAt: '${today}',
  items: {
${seedEntries}
  },
};
`;

    const seedPath = join(ROOT, 'src', 'data', 'news', 'seed.ts');
    writeFileSync(seedPath, seedContent, 'utf8');
    console.log(`✅ seed.ts regenerated (${seedPath})`);
  }
}

main().catch(err => {
  console.error('❌', err);
  process.exit(1);
});
