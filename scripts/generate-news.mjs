/**
 * generate-news.mjs
 *
 * Fetches the latest 3 news items per team per locale from Google News RSS
 * and writes news-feed.json at the repo root.
 *
 * Usage:
 *   node scripts/generate-news.mjs               # writes news-feed.json
 *   node scripts/generate-news.mjs --write-seed  # also regenerates src/data/news/seed.ts
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const NEWS_PER_TEAM = 3;
const DELAY_MS = 300; // polite delay between Google News requests

// ─── Reliable source whitelist ────────────────────────────────────────────────
const WHITELIST = [
  'fifa.com', 'uefa.com', 'conmebol.com',
  'espn.com', 'espn.co.uk', 'espndeportes.espn.com',
  'marca.com', 'as.com', 'sport.es', 'mundodeportivo.com',
  'bbc.com', 'bbc.co.uk',
  'reuters.com', 'apnews.com',
  'theguardian.com', 'skysports.com',
  'goal.com', 'lequipe.fr',
  'olympics.com', 'cbssports.com', 'theathletic.com',
  'transfermarkt', 'sofoot.com', 'sportal',
];

// ─── 48 teams: FIFA ID, Spanish name, English name ───────────────────────────
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

/** Extract text content of the first occurrence of <tag>...</tag> */
function extractTag(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return m ? decodeEntities(m[1].trim()) : '';
}

/** Extract attribute from a self-closing or opening tag */
function extractAttr(xml, tag, attr) {
  const m = xml.match(new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"`, 'i'));
  return m ? decodeEntities(m[1]) : '';
}

/** "Headline Title - Source Name" → { title, source } */
function splitTitleSource(raw) {
  const idx = raw.lastIndexOf(' - ');
  if (idx === -1) return { title: raw, source: '' };
  return { title: raw.slice(0, idx).trim(), source: raw.slice(idx + 3).trim() };
}

/** Parse pubDate string to YYYY-MM-DD */
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

/** Fetch Google News RSS and return up to NEWS_PER_TEAM items, whitelist-first */
async function fetchTeamNews(query, hl, gl, ceid) {
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
    console.warn(`  ⚠ fetch failed: ${err.message}`);
    return [];
  }

  // Extract all <item> blocks
  const itemBlocks = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map(m => m[1]);

  const parsed = itemBlocks.map(block => {
    const rawTitle = extractTag(block, 'title');
    const { title, source: titleSource } = splitTitleSource(rawTitle);
    const link = extractTag(block, 'link') || extractAttr(block, 'link', 'href');
    const pubDate = extractTag(block, 'pubDate');
    const sourceTag = extractTag(block, 'source');
    const source = sourceTag || titleSource || 'Google News';
    return { title, url: link, source, date: parseDate(pubDate) };
  }).filter(item => item.title && item.url);

  // Prioritize whitelisted sources, fill with the rest up to NEWS_PER_TEAM
  const preferred = parsed.filter(i => isWhitelisted(i.source));
  const rest = parsed.filter(i => !isWhitelisted(i.source));
  const combined = [...preferred, ...rest];
  return combined.slice(0, NEWS_PER_TEAM);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const writeSeed = process.argv.includes('--write-seed');
  const today = new Date().toISOString().slice(0, 10);
  const filter = process.argv.filter(a => !a.startsWith('-')).slice(2).map(t => t.toUpperCase());
  const teamsToProcess = filter.length > 0 
    ? TEAMS.filter(t => filter.includes(t.id)) 
    : TEAMS;

  console.log(`📰 Generating news feed for ${teamsToProcess.length} teams (${today})`);

  // Load existing feed if it exists, to preserve news for teams we are not updating
  let items = {};
  const feedPath = join(ROOT, 'news-feed.json');
  try {
    if (existsSync(feedPath)) {
      const existing = JSON.parse(readFileSync(feedPath, 'utf8'));
      items = existing.items || {};
    }
  } catch (err) {
    console.warn('  ⚠ Could not read existing news-feed.json, starting fresh.');
  }

  for (const team of teamsToProcess) {
    process.stdout.write(`  ${team.id} ...`);

    const esQuery = `"${team.es}" Mundial 2026`;
    const enQuery = `"${team.en}" "World Cup 2026"`;

    const [esNews, enNews] = await Promise.all([
      fetchTeamNews(esQuery, 'es', 'ES', 'ES:es'),
      fetchTeamNews(enQuery, 'en-US', 'US', 'US:en'),
    ]);

    // Sort by date descending (newest first)
    const sortByDate = (a, b) => b.date.localeCompare(a.date);
    esNews.sort(sortByDate);
    enNews.sort(sortByDate);

    items[team.id] = { es: esNews, en: enNews };
    console.log(` es:${esNews.length} en:${enNews.length}`);
    await sleep(DELAY_MS);
  }

  // ─── Write news-feed.json ──────────────────────────────────────────────────
  const feed = { updatedAt: today, items };
  writeFileSync(feedPath, JSON.stringify(feed, null, 2) + '\n', 'utf8');
  console.log(`\n✅ news-feed.json updated (${feedPath})`);

  // ─── Optionally regenerate seed.ts ────────────────────────────────────────
  if (writeSeed) {
    const seedEntries = Object.entries(items)
      .map(([id, { es, en }]) => {
        const esLines = es.map(i =>
          `        { title: ${JSON.stringify(i.title)}, url: ${JSON.stringify(i.url)}, source: ${JSON.stringify(i.source)}, date: ${JSON.stringify(i.date)} },`
        ).join('\n');
        const enLines = en.map(i =>
          `        { title: ${JSON.stringify(i.title)}, url: ${JSON.stringify(i.url)}, source: ${JSON.stringify(i.source)}, date: ${JSON.stringify(i.date)} },`
        ).join('\n');
        return `    ${id}: {\n      es: [\n${esLines}\n      ],\n      en: [\n${enLines}\n      ],\n    },`;
      })
      .join('\n');

    const seedContent =
`// Bundled fallback — shown when the external feed is unavailable (offline, unconfigured URL).
// Regenerated by: node scripts/generate-news.mjs --write-seed

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
