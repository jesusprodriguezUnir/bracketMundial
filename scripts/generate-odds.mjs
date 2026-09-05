// Fetches 1X2 match odds from The Odds API for World Cup 2026 group stage.
// Run: npm run odds  (= npx tsx scripts/generate-odds.mjs)
// Requires: ODDS_API_KEY in .env or environment.
//
// Flags:
//   --write-seed   Also regenerate src/data/odds/seed.ts with the full 72-match result.
//
// Synthetic fallback: for any group match without market odds, the model derives
// probabilities from TEAM_STRENGTH ratings (odds-model.ts). Matches get
// source:'market' (bookmakers) or source:'model' (synthetic estimate).
//
// NOTE: Group stage odds typically appear only days before kickoff (June 2026).
// Until then, --write-seed generates a fully populated seed with model estimates.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GROUP_MATCHES } from '../src/data/match-schedule.js';
import { TEAMS_2026 } from '../src/data/fifa-2026.js';
import { TEAM_STRENGTH } from '../src/data/team-strength.js';
import { expectedProbabilities } from '../src/lib/odds-model.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FEED_PATH = join(ROOT, 'odds-feed.json');
const UCL_FEED_PATH = join(ROOT, 'ucl-odds-feed.json');
const SEED_PATH = join(ROOT, 'src', 'data', 'odds', 'seed.ts');

const WRITE_SEED = process.argv.includes('--write-seed');

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
const NAME_TO_ID = new Map();
for (const team of TEAMS_2026) {
  NAME_TO_ID.set(normalise(team.name), team.id);
  NAME_TO_ID.set(normalise(team.shortName), team.id);
  NAME_TO_ID.set(normalise(team.id), team.id);
}
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
  // UCL Clubs aliases
  ['Real Madrid', 'RMA'], ['Real Madrid CF', 'RMA'],
  ['Barcelona', 'BAR'], ['FC Barcelona', 'BAR'],
  ['Manchester City', 'MCI'], ['Man City', 'MCI'],
  ['Arsenal', 'ARS'], ['Arsenal FC', 'ARS'],
  ['Liverpool', 'LIV'], ['Liverpool FC', 'LIV'],
  ['Bayern Munich', 'BAY'], ['Bayern Munchen', 'BAY'], ['FC Bayern München', 'BAY'], ['Bayern', 'BAY'],
  ['Paris Saint-Germain', 'PSG'], ['Paris SG', 'PSG'], ['PSG', 'PSG'],
  ['Inter Milan', 'INT'], ['Inter', 'INT'], ['FC Internazionale Milano', 'INT'],
  ['Atletico Madrid', 'ATL'], ['Club Atlético de Madrid', 'ATL'], ['Atletico de Madrid', 'ATL'],
  ['Borussia Dortmund', 'BVB'], ['Dortmund', 'BVB'],
  ['Napoli', 'NAP'], ['SSC Napoli', 'NAP'],
  ['Aston Villa', 'AVL'], ['Aston Villa FC', 'AVL'],
  ['Manchester United', 'MUN'], ['Man United', 'MUN'], ['Man Utd', 'MUN'],
  ['RB Leipzig', 'RBL'], ['Leipzig', 'RBL'],
  ['Sporting CP', 'SPO'], ['Sporting Lisbon', 'SPO'], ['Sporting Clube de Portugal', 'SPO'],
  ['AS Roma', 'ROM'], ['Roma', 'ROM'],
  ['Villarreal', 'VIL'], ['Villarreal CF', 'VIL'],
  ['PSV Eindhoven', 'PSV'], ['PSV', 'PSV'],
  ['Real Betis', 'BET'], ['Betis', 'BET'],
  ['Feyenoord', 'FEY'], ['Feyenoord Rotterdam', 'FEY'],
  ['FC Porto', 'FCP'], ['Porto', 'FCP'],
  ['VfB Stuttgart', 'VFB'], ['Stuttgart', 'VFB'],
  ['Lille', 'LIL'], ['Lille OSC', 'LIL'],
  ['Galatasaray', 'GAL'], ['Galatasaray SK', 'GAL'],
  ['Fenerbahce', 'FEN'], ['Fenerbahce SK', 'FEN'],
  ['Club Brugge', 'BRU'], ['Brugge', 'BRU'], ['Club Brugge KV', 'BRU'],
  ['Lens', 'RCL'], ['RC Lens', 'RCL'], ['Racing Club de Lens', 'RCL'],
  ['Shakhtar Donetsk', 'SHK'], ['Shakhtar', 'SHK'],
  ['Slavia Prague', 'SLP'], ['Slavia Praha', 'SLP'], ['SK Slavia Praha', 'SLP'],
  ['Bodo/Glimt', 'BOD'], ['Bodoe/Glimt', 'BOD'], ['FK Bodø/Glimt', 'BOD'],
  ['Como', 'COM'], ['Como 1907', 'COM'],
  ['LASK', 'LSK'], ['LASK Linz', 'LSK'],
  ['AEK Athens', 'AEK'], ['AEK', 'AEK'], ['PAE AEK', 'AEK'],
  ['Viking', 'VIK'], ['Viking FK', 'VIK'],
  ['Slovan Bratislava', 'SLO'], ['SK Slovan Bratislava', 'SLO'],
  ['Sabah', 'SAB'], ['Sabah FK', 'SAB'],
];
for (const [alias, id] of ALIASES) {
  NAME_TO_ID.set(normalise(alias), id);
}

function nameToId(name) {
  return NAME_TO_ID.get(normalise(name)) ?? null;
}

// --- Build matchId index ---
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

// --- Fetch market odds (skip if no API key) ---
const matches = {};

if (ODDS_API_KEY) {
  const SPORT_KEY = 'soccer_uefa_champs_league';
  const apiUrl = `https://api.the-odds-api.com/v4/sports/${SPORT_KEY}/odds?regions=eu,uk&markets=h2h&oddsFormat=decimal&apiKey=${ODDS_API_KEY}`;

  console.log(`Fetching market odds (${SPORT_KEY}, h2h)…`);
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
    console.warn('Failed to fetch market odds:', err.message);
    events = [];
  }

  const unresolved = [];
  for (const event of events) {
    const homeId = nameToId(event.home_team);
    const awayId = nameToId(event.away_team);
    if (!homeId || !awayId) { unresolved.push(`Unresolved: "${event.home_team}" vs "${event.away_team}"`); continue; }
    const lookup = MATCH_INDEX.get(`${homeId}:${awayId}`);
    if (!lookup) { unresolved.push(`No matchId for: ${homeId} vs ${awayId}`); continue; }

    const probs = [];
    let bet365Probs = null;
    for (const bk of (event.bookmakers ?? [])) {
      const h2h = bk.markets?.find(mkt => mkt.key === 'h2h');
      if (!h2h) continue;
      const byName = {};
      for (const o of h2h.outcomes) byName[o.name] = o.price;
      const ho = byName[event.home_team], dr = byName['Draw'], ao = byName[event.away_team];
      if (!ho || !dr || !ao) continue;
      const prob = decimalToProb(ho, dr, ao);
      probs.push(prob);
      if (bk.key === 'bet365') bet365Probs = prob;
    }
    if (probs.length === 0) continue;

    const avgH = probs.reduce((s, p) => s + p.h, 0) / probs.length;
    const avgD = probs.reduce((s, p) => s + p.d, 0) / probs.length;
    const avgA = probs.reduce((s, p) => s + p.a, 0) / probs.length;
    const [rH, rD, rA] = roundToHundred(avgH, avgD, avgA);
    const [home, draw, away] = lookup.homeIsA ? [rH, rD, rA] : [rA, rD, rH];
    const entry = { home, draw, away, bookmakers: probs.length, source: 'market' };
    if (bet365Probs) {
      const [bH, bD, bA] = roundToHundred(bet365Probs.h, bet365Probs.d, bet365Probs.a);
      const [bHome, bDraw, bAway] = lookup.homeIsA ? [bH, bD, bA] : [bA, bD, bH];
      entry.bet365 = { home: bHome, draw: bDraw, away: bAway };
    }
    matches[lookup.matchId] = entry;
  }

  if (unresolved.length > 0) console.warn(unresolved.join('\n'));
  console.log(`Market odds matched: ${Object.keys(matches).length} / ${events.length} events.`);
} else {
  console.warn('ODDS_API_KEY not set — skipping market fetch, using synthetic model only.');
}

// --- Synthetic fallback: fill remaining matches with model estimates ---
let syntheticCount = 0;
for (const m of GROUP_MATCHES) {
  if (matches[m.matchId]) continue;
  const rA = TEAM_STRENGTH[m.teamA] ?? 1500;
  const rB = TEAM_STRENGTH[m.teamB] ?? 1500;
  const prob = expectedProbabilities(rA, rB);
  matches[m.matchId] = { home: prob.home, draw: prob.draw, away: prob.away, bookmakers: 0, source: 'model' };
  syntheticCount++;
}
console.log(`Synthetic model odds added: ${syntheticCount} matches.`);
console.log(`Total: ${Object.keys(matches).length} / ${GROUP_MATCHES.length} group matches.`);

const feed = { updatedAt: new Date().toISOString(), matches };
writeFileSync(FEED_PATH, JSON.stringify(feed, null, 2));
writeFileSync(UCL_FEED_PATH, JSON.stringify(feed, null, 2));
console.log(`✅ odds-feed.json + ucl-odds-feed.json written (${Object.keys(matches).length} matches).`);

// --- Optional: write bundled seed ---
if (WRITE_SEED) {
  const seedDir = join(ROOT, 'src', 'data', 'odds');
  if (!existsSync(seedDir)) mkdirSync(seedDir, { recursive: true });

  const matchEntries = Object.entries(matches)
    .map(([id, o]) => {
      const base = `  ${JSON.stringify(id)}: { home: ${o.home}, draw: ${o.draw}, away: ${o.away}, bookmakers: ${o.bookmakers}, source: '${o.source}' as const`;
      const bet365 = o.bet365
        ? `, bet365: { home: ${o.bet365.home}, draw: ${o.bet365.draw}, away: ${o.bet365.away} }`
        : '';
      return base + bet365 + ' },';
    })
    .join('\n');

  const ts = `// AUTO-GENERATED by scripts/generate-odds.mjs --write-seed
// Do not edit manually. Regenerate with: npm run odds -- --write-seed
import type { OddsFeed } from '../../lib/odds-service';

export const ODDS_SEED: OddsFeed = {
  updatedAt: ${JSON.stringify(feed.updatedAt)},
  matches: {
${matchEntries}
  },
};
`;

  writeFileSync(SEED_PATH, ts, 'utf8');
  console.log(`✅ src/data/odds/seed.ts written.`);
}
