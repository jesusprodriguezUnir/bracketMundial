// Fetches 1X2 match odds from The Odds API for World Cup 2026 group stage.
// Run: npm run odds  (= npx tsx scripts/generate-odds.mjs)
// Requires: ODDS_API_KEY in .env or environment.
//
// NOTE: Group stage odds typically appear only days before kickoff (June 2026).
// The feed will be mostly empty until the tournament starts — this is expected.
// Output: odds-feed.json at repo root, published to the `odds-data` orphan branch by CI.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GROUP_MATCHES } from '../src/data/match-schedule.js';
import { TEAMS_2026 } from '../src/data/fifa-2026.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FEED_PATH = join(ROOT, 'odds-feed.json');

// --- Load .env ---
function loadEnv() {
  const envPath = join(ROOT, '.env');
  if (!existsSync(envPath)) return {};
  const out = {};
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([^#=\s][^=]*)=(.*)$/);
    if (m) out[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
  }
  return out;
}

const env = loadEnv();
const ODDS_API_KEY = process.env.ODDS_API_KEY ?? env.ODDS_API_KEY ?? '';

if (!ODDS_API_KEY) {
  console.warn('ODDS_API_KEY not set — writing empty feed.');
  writeFileSync(FEED_PATH, JSON.stringify({ updatedAt: new Date().toISOString(), matches: {} }, null, 2));
  process.exit(0);
}

// --- Name normaliser ---
function normalise(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// --- Name → team id dictionary ---
// Base: Spanish names + codes from TEAMS_2026
const NAME_TO_ID = new Map();
for (const team of TEAMS_2026) {
  NAME_TO_ID.set(normalise(team.name), team.id);
  NAME_TO_ID.set(normalise(team.shortName), team.id);
  NAME_TO_ID.set(normalise(team.id), team.id);
}
// English aliases used by The Odds API
const ALIASES = [
  ['Mexico', 'MEX'], ['South Africa', 'RSA'],
  ['South Korea', 'KOR'], ['Korea Republic', 'KOR'], ['Korea DPR', 'PRK'],
  ['Czech Republic', 'CZE'], ['Czechia', 'CZE'],
  ['Canada', 'CAN'],
  ['Bosnia and Herzegovina', 'BIH'], ['Bosnia & Herzegovina', 'BIH'], ['Bosnia-Herzegovina', 'BIH'],
  ['Qatar', 'QAT'], ['Switzerland', 'SUI'],
  ['United States', 'USA'], ['United States of America', 'USA'],
  ['Paraguay', 'PAR'],
  ['Haiti', 'HAI'], ['Scotland', 'SCO'],
  ['Australia', 'AUS'], ['Turkey', 'TUR'],
  ['Brazil', 'BRA'], ['Morocco', 'MAR'],
  ['Germany', 'GER'], ['Curacao', 'CUW'], ['Netherlands Antilles', 'CUW'],
  ['Netherlands', 'NED'], ['Japan', 'JPN'],
  ['Sweden', 'SWE'], ['Tunisia', 'TUN'],
  ['Spain', 'ESP'], ['Cape Verde', 'CPV'], ['Cabo Verde', 'CPV'],
  ['Saudi Arabia', 'KSA'], ['Uruguay', 'URU'],
  ['France', 'FRA'], ['Senegal', 'SEN'], ['Iraq', 'IRQ'], ['Norway', 'NOR'],
  ['Argentina', 'ARG'], ['Algeria', 'ALG'], ['Austria', 'AUT'], ['Jordan', 'JOR'],
  ['Portugal', 'POR'],
  ['DR Congo', 'COD'], ['Congo DR', 'COD'], ['Democratic Republic of Congo', 'COD'],
  ['Uzbekistan', 'UZB'], ['Colombia', 'COL'],
  ['England', 'ENG'], ['Croatia', 'CRO'], ['Ghana', 'GHA'], ['Panama', 'PAN'],
  ['Belgium', 'BEL'], ['Egypt', 'EGY'], ['Iran', 'IRN'], ['New Zealand', 'NZL'],
  ['Ecuador', 'ECU'],
  ['Ivory Coast', 'CIV'], ['Cote d\'Ivoire', 'CIV'], ['Cote dIvoire', 'CIV'],
  ['Belgium', 'BEL'],
];
for (const [alias, id] of ALIASES) {
  NAME_TO_ID.set(normalise(alias), id);
}

function nameToId(name) {
  return NAME_TO_ID.get(normalise(name)) ?? null;
}

// --- Build matchId index ---
// Key: 'teamA:teamB' (both orderings) → {matchId, date, homeIsA}
const MATCH_INDEX = new Map();
for (const m of GROUP_MATCHES) {
  MATCH_INDEX.set(`${m.teamA}:${m.teamB}`, { matchId: m.matchId, date: m.date, homeIsA: true });
  MATCH_INDEX.set(`${m.teamB}:${m.teamA}`, { matchId: m.matchId, date: m.date, homeIsA: false });
}

// --- Decimal odds → normalised probabilities (removes bookmaker overround) ---
function decimalToProb(home, draw, away) {
  const rawH = 1 / home, rawD = 1 / draw, rawA = 1 / away;
  const total = rawH + rawD + rawA;
  return { h: rawH / total, d: rawD / total, a: rawA / total };
}

// --- Largest-remainder rounding: ensures home + draw + away === 100 ---
function roundToHundred(h, d, a) {
  const raw = [h * 100, d * 100, a * 100];
  const floors = raw.map(Math.floor);
  const residual = 100 - floors.reduce((s, v) => s + v, 0);
  const fracs = raw.map((v, i) => ({ i, f: v - floors[i] })).sort((x, y) => y.f - x.f);
  for (let i = 0; i < residual; i++) floors[fracs[i].i]++;
  return floors; // [home%, draw%, away%]
}

// --- Fetch The Odds API ---
const SPORT_KEY = 'soccer_fifa_world_cup';
const apiUrl = `https://api.the-odds-api.com/v4/sports/${SPORT_KEY}/odds?regions=eu,uk&markets=h2h&oddsFormat=decimal&apiKey=${ODDS_API_KEY}`;

console.log(`Fetching odds (${SPORT_KEY}, h2h)…`);
let events;
try {
  const resp = await fetch(apiUrl, {
    headers: { 'User-Agent': 'bracketMundial-odds-generator/1.0' },
    signal: AbortSignal.timeout(20_000),
  });
  console.log(`Quota — used: ${resp.headers.get('x-requests-used')}, remaining: ${resp.headers.get('x-requests-remaining')}`);
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${body}`);
  }
  events = await resp.json();
  console.log(`Received ${events.length} events.`);
} catch (err) {
  console.error('Failed to fetch odds:', err.message);
  writeFileSync(FEED_PATH, JSON.stringify({ updatedAt: new Date().toISOString(), matches: {} }, null, 2));
  process.exit(0);
}

// --- Map events → matchIds and compute consensus probabilities ---
const matches = {};
const unresolved = [];

for (const event of events) {
  const homeId = nameToId(event.home_team);
  const awayId = nameToId(event.away_team);

  if (!homeId || !awayId) {
    unresolved.push(`Unresolved: "${event.home_team}" vs "${event.away_team}"`);
    continue;
  }

  const lookup = MATCH_INDEX.get(`${homeId}:${awayId}`);
  if (!lookup) {
    unresolved.push(`No matchId for: ${homeId} vs ${awayId}`);
    continue;
  }

  // Collect normalised probabilities from all bookmakers
  const probs = [];
  for (const bk of (event.bookmakers ?? [])) {
    const h2h = bk.markets?.find(mkt => mkt.key === 'h2h');
    if (!h2h) continue;
    const byName = {};
    for (const o of h2h.outcomes) byName[o.name] = o.price;
    const ho = byName[event.home_team];
    const dr = byName['Draw'];
    const ao = byName[event.away_team];
    if (!ho || !dr || !ao) continue;
    probs.push(decimalToProb(ho, dr, ao));
  }

  if (probs.length === 0) continue;

  const avgH = probs.reduce((s, p) => s + p.h, 0) / probs.length;
  const avgD = probs.reduce((s, p) => s + p.d, 0) / probs.length;
  const avgA = probs.reduce((s, p) => s + p.a, 0) / probs.length;
  const [rH, rD, rA] = roundToHundred(avgH, avgD, avgA);

  // The Odds API home/away → our teamA/teamB (may be inverted)
  const [home, draw, away] = lookup.homeIsA ? [rH, rD, rA] : [rA, rD, rH];

  matches[lookup.matchId] = { home, draw, away, bookmakers: probs.length };
}

if (unresolved.length > 0) console.warn(unresolved.join('\n'));
console.log(`Matched ${Object.keys(matches).length} / ${events.length} events.`);

writeFileSync(FEED_PATH, JSON.stringify({ updatedAt: new Date().toISOString(), matches }, null, 2));
console.log(`✅ odds-feed.json written (${Object.keys(matches).length} matches).`);
