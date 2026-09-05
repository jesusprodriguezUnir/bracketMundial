/**
 * Fetch UEFA club competition 2026/27 league-phase teams + fixtures from
 * API-Football (league 2, season 2026) and write src/data modules.
 *
 * Usage:
 *   node scripts/fetch-ucl-fixtures.mjs            # write modules + crests
 *   node scripts/fetch-ucl-fixtures.mjs --probe    # print endpoint shape, no write
 *   node scripts/fetch-ucl-fixtures.mjs --no-crests
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CRESTS_DIR = join(ROOT, 'public', 'assets', 'crests');
const DATA_DIR = join(ROOT, 'src', 'data');
const SCRATCH = process.env.UCL_SCRATCH
  ?? join(process.env.TEMP || process.env.TMP || '/tmp', 'ucl-ingest');

const args = process.argv.slice(2);
const PROBE = args.includes('--probe');
const NO_CRESTS = args.includes('--no-crests');

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
const API_KEY = process.env.API_FOOTBALL_KEY ?? ENV.API_FOOTBALL_KEY;
const FD_KEY = process.env.FOOTBALL_DATA_KEY ?? ENV.FOOTBALL_DATA_KEY;
const LEAGUE = 2;
const SEASON = 2026;

const COUNTRY_FLAG = {
  Spain: '🇪🇸', England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', Italy: '🇮🇹', Germany: '🇩🇪', France: '🇫🇷',
  Portugal: '🇵🇹', Netherlands: '🇳🇱', Belgium: '🇧🇪', Scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  Turkey: '🇹🇷', Austria: '🇦🇹', Czechia: '🇨🇿', 'Czech Republic': '🇨🇿',
  Switzerland: '🇨🇭', Greece: '🇬🇷', Serbia: '🇷🇸', Croatia: '🇭🇷',
  Ukraine: '🇺🇦', Norway: '🇳🇴', Denmark: '🇩🇰', Sweden: '🇸🇪', Poland: '🇵🇱',
  Hungary: '🇭🇺', Romania: '🇷🇴', Slovakia: '🇸🇰', Cyprus: '🇨🇾',
  Azerbaijan: '🇦🇿', Kazakhstan: '🇰🇿', Israel: '🇮🇱', 'Bosnia': '🇧🇦',
  'Bosnia and Herzegovina': '🇧🇦', Moldova: '🇲🇩', Slovenia: '🇸🇮',
  Wales: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', Ireland: '🇮🇪', 'Republic of Ireland': '🇮🇪',
};

const CODE_FALLBACK = {
  'real madrid': 'RMA', 'barcelona': 'BAR', 'atletico madrid': 'ATL',
  'atletico de madrid': 'ATL', 'club atletico de madrid': 'ATL',
  'athletic club': 'ATH', 'villarreal': 'VIL', 'real betis': 'BET',
  'manchester city': 'MCI', 'manchester united': 'MUN', 'liverpool': 'LIV',
  'arsenal': 'ARS', 'chelsea': 'CHE', 'tottenham': 'TOT', 'newcastle': 'NEW',
  'aston villa': 'AVL', 'bayern': 'BAY', 'bayer leverkusen': 'LEV',
  'borussia dortmund': 'BVB', 'vfb stuttgart': 'VFB', 'rb leipzig': 'RBL',
  'inter': 'INT', 'internazionale': 'INT', 'ac milan': 'MIL', 'juventus': 'JUV',
  'napoli': 'NAP', 'as roma': 'ROM', 'atalanta': 'ATA', 'como 1907': 'COM',
  'paris saint germain': 'PSG', 'psg': 'PSG', 'lille': 'LIL', 'lens': 'RCL',
  'benfica': 'SLB', 'porto': 'FCP', 'sporting clube de portugal': 'SPO',
  'sporting cp': 'SPO', 'ajax': 'AJA', 'psv': 'PSV', 'feyenoord': 'FEY',
  'club brugge': 'BRU', 'celtic': 'CEL', 'rangers': 'RAN',
  'galatasaray': 'GAL', 'fenerbahce': 'FEN', 'olympiacos': 'OLY',
  'shakhtar': 'SHK', 'slavia praha': 'SLP', 'slavia prague': 'SLP',
  'slovan bratislava': 'SLO', 'lask': 'LSK', 'viking fk': 'VIK',
  'bodo glimt': 'BOD', 'bodo/glimt': 'BOD', 'aek': 'AEK', 'sabah': 'SAB',
};

async function apiSportsGet(path, params) {
  const u = new URL(`https://v3.football.api-sports.io/${path}`);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, String(v));
  const resp = await fetch(u, { headers: { 'x-apisports-key': API_KEY } });
  const json = await resp.json().catch(() => ({}));
  return { ok: resp.ok, status: resp.status, url: u.toString(), json };
}

async function footballDataGet(path) {
  const url = `https://api.football-data.org/v4/${path}`;
  const resp = await fetch(url, { headers: { 'X-Auth-Token': FD_KEY ?? '' } });
  const json = await resp.json().catch(() => ({}));
  return { ok: resp.ok, status: resp.status, url, json };
}

function slug(s) {
  return String(s || 'unknown')
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'unknown';
}

function toSpain(iso) {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(d);
  const get = (t) => parts.find(p => p.type === t)?.value ?? '';
  return { date: `${get('year')}-${get('month')}-${get('day')}`, timeSpain: `${get('hour')}:${get('minute')}` };
}

function isLeaguePhaseRound(round) {
  const r = String(round ?? '').toLowerCase();
  if (/qualif|play-?off|knockout|round of|1\/8|quarter|semi|final|preliminary/.test(r)) return false;
  return /league stage|league phase|regular season|matchday/.test(r) || /^\s*\d+\s*$/.test(r);
}

function parseMatchday(round) {
  const m = String(round ?? '').match(/(\d+)\s*$/);
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 1 && n <= 8 ? n : null;
}

function normalizeName(name) {
  return String(name || '')
    .replace(/[øØ]/g, 'o')
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function lookupCode(name) {
  const key = normalizeName(name);
  if (CODE_FALLBACK[key]) return CODE_FALLBACK[key];
  for (const [k, v] of Object.entries(CODE_FALLBACK)) {
    if (k.length >= 4 && (key.includes(k) || k.includes(key))) return v;
  }
  return null;
}

function uniqueCode(name, apiCode, used) {
  let code = lookupCode(name)
    ?? (apiCode && /^[A-Z0-9]{2,4}$/i.test(apiCode) ? apiCode.toUpperCase() : null)
    ?? normalizeName(name).replace(/[^a-z]/g, '').slice(0, 3).toUpperCase();
  if (code.length < 2) code = `C${String(used.size + 1).padStart(2, '0')}`;
  let out = code;
  let n = 2;
  while (used.has(out)) {
    out = `${code.slice(0, 3)}${n}`.slice(0, 4);
    n += 1;
  }
  used.add(out);
  return out;
}

function tsString(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function main() {
  mkdirSync(SCRATCH, { recursive: true });
  let ingestSource = 'api-football';
  if (!API_KEY && !FD_KEY) {
    const msg = 'blocking: unverifiable — missing API_FOOTBALL_KEY and FOOTBALL_DATA_KEY\n';
    writeFileSync(join(SCRATCH, 'fixture-contrast.log'), msg);
    console.error(msg.trim());
    process.exit(1);
  }

  console.log(`GET api-sports teams league=${LEAGUE} season=${SEASON}`);
  let teamsRes = API_KEY
    ? await apiSportsGet('teams', { league: LEAGUE, season: SEASON })
    : { ok: false, status: 0, url: '', json: { message: 'no API_FOOTBALL_KEY' } };
  writeFileSync(join(SCRATCH, 'api-teams.json'), JSON.stringify(teamsRes.json, null, 2));
  console.log(`teams HTTP ${teamsRes.status} results=${teamsRes.json?.results ?? 'n/a'} errors=${JSON.stringify(teamsRes.json?.errors ?? teamsRes.json?.message ?? {})}`);

  console.log(`GET api-sports fixtures league=${LEAGUE} season=${SEASON}`);
  let fxRes = API_KEY
    ? await apiSportsGet('fixtures', { league: LEAGUE, season: SEASON })
    : { ok: false, status: 0, url: '', json: { message: 'no API_FOOTBALL_KEY' } };
  writeFileSync(join(SCRATCH, 'api-fixtures.json'), JSON.stringify(fxRes.json, null, 2));
  console.log(`fixtures HTTP ${fxRes.status} results=${fxRes.json?.results ?? 'n/a'} errors=${JSON.stringify(fxRes.json?.errors ?? fxRes.json?.message ?? {})}`);

  const apiSportsEmpty = !Array.isArray(teamsRes.json?.response) || teamsRes.json.response.length === 0
    || !Array.isArray(fxRes.json?.response) || fxRes.json.response.length === 0;
  if (!teamsRes.ok || !fxRes.ok || apiSportsEmpty) {
    if (!FD_KEY) {
      const msg = `blocking: unverifiable — API-Football HTTP teams=${teamsRes.status} fixtures=${fxRes.status}; no FOOTBALL_DATA_KEY\n`;
      writeFileSync(join(SCRATCH, 'fixture-contrast.log'), msg);
      console.error(msg.trim());
      process.exit(1);
    }
    console.log('falling back to football-data.org competitions/CL season=2026');
    ingestSource = 'football-data.org';
    const fdTeams = await footballDataGet('competitions/CL/teams?season=2026');
    const fdMatches = await footballDataGet('competitions/CL/matches?season=2026');
    writeFileSync(join(SCRATCH, 'fd-teams.json'), JSON.stringify(fdTeams.json, null, 2));
    writeFileSync(join(SCRATCH, 'fd-matches.json'), JSON.stringify(fdMatches.json, null, 2));
    console.log(`fd teams HTTP ${fdTeams.status} count=${fdTeams.json?.teams?.length ?? 'n/a'}`);
    console.log(`fd matches HTTP ${fdMatches.status} count=${fdMatches.json?.matches?.length ?? 'n/a'}`);
    if (!fdTeams.ok || !fdMatches.ok) {
      const msg = `blocking: unverifiable — api-sports teams=${teamsRes.status} fixtures=${fxRes.status}; football-data teams=${fdTeams.status} matches=${fdMatches.status}\n`;
      writeFileSync(join(SCRATCH, 'fixture-contrast.log'), msg);
      console.error(msg.trim());
      process.exit(1);
    }
    teamsRes = {
      ok: true,
      status: 200,
      url: fdTeams.url,
      json: {
        response: (fdTeams.json.teams ?? []).map((t) => ({
          team: {
            id: t.id,
            name: t.name,
            code: t.tla,
            country: t.area?.name ?? '',
            logo: t.crest ?? null,
          },
          venue: { name: t.venue ?? '', city: '' },
        })),
      },
    };
    fxRes = {
      ok: true,
      status: 200,
      url: fdMatches.url,
      json: {
        response: (fdMatches.json.matches ?? []).map((m) => ({
          fixture: {
            id: m.id,
            date: m.utcDate,
            venue: { name: m.venue ?? '', city: '' },
          },
          league: { round: m.stage === 'LEAGUE_STAGE' || m.stage === 'GROUP_STAGE' || m.stage === 'REGULAR_SEASON'
            ? `League Stage - ${m.matchday ?? ''}`
            : String(m.stage ?? m.matchday ?? '') },
          teams: {
            home: { id: m.homeTeam?.id, name: m.homeTeam?.name },
            away: { id: m.awayTeam?.id, name: m.awayTeam?.name },
          },
        })),
      },
    };
  }

  const teamRows = Array.isArray(teamsRes.json?.response) ? teamsRes.json.response : [];
  const fixtureRows = Array.isArray(fxRes.json?.response) ? fxRes.json.response : [];
  const rounds = [...new Set(fixtureRows.map(r => r?.league?.round).filter(Boolean))];
  console.log('rounds:', rounds.join(' | ') || '(none)');

  if (PROBE) {
    console.log('probe team sample:', JSON.stringify(teamRows[0] ?? null, null, 2)?.slice(0, 1200));
    console.log('probe fixture sample:', JSON.stringify(fixtureRows[0] ?? null, null, 2)?.slice(0, 1200));
    return;
  }

  const used = new Set();
  const byApiId = new Map();
  const clubs = [];
  for (const row of teamRows) {
    const team = row.team ?? {};
    const venue = row.venue ?? {};
    const id = uniqueCode(team.name, team.code, used);
    const club = {
      apiId: team.id,
      id,
      name: team.name,
      shortName: id,
      group: 'LP',
      country: team.country ?? '',
      flag: COUNTRY_FLAG[team.country] ?? '⚽',
      flagUrl: `/assets/crests/${id}.png`,
      logo: team.logo ?? null,
      venue: venue.name ?? '',
      city: venue.city ?? '',
    };
    clubs.push(club);
    byApiId.set(team.id, club);
  }

  const leagueFixtures = [];
  for (const row of fixtureRows) {
    const round = row?.league?.round ?? '';
    if (!isLeaguePhaseRound(round)) continue;
    const matchDay = parseMatchday(round);
    if (matchDay == null) continue;
    const home = byApiId.get(row.teams?.home?.id);
    const away = byApiId.get(row.teams?.away?.id);
    if (!home || !away) continue;
    const spain = toSpain(row.fixture?.date);
    const venue = row.fixture?.venue?.name || home.venue || '';
    const rawCity = row.fixture?.venue?.city || home.city || '';
    const city = !rawCity || rawCity === '-' || rawCity === 'null' ? '' : rawCity;
    leagueFixtures.push({
      apiId: row.fixture?.id,
      round,
      matchDay,
      date: spain.date,
      timeSpain: spain.timeSpain,
      iso: row.fixture?.date,
      teamA: home.id,
      teamB: away.id,
      venue,
      city,
      venueId: slug(venue || 'tbd'),
    });
  }

  leagueFixtures.sort((a, b) => {
    if (a.matchDay !== b.matchDay) return a.matchDay - b.matchDay;
    if (a.iso !== b.iso) return String(a.iso).localeCompare(String(b.iso));
    return a.teamA.localeCompare(b.teamA);
  });
  leagueFixtures.forEach((fx, i) => { fx.matchId = `M${i + 1}`; });

  const mismatches = [];
  if (clubs.length !== 36) mismatches.push(`team-count: ${clubs.length} != 36`);
  if (leagueFixtures.length !== 144) mismatches.push(`fixture-count: ${leagueFixtures.length} != 144`);
  const byMd = new Map();
  for (const fx of leagueFixtures) byMd.set(fx.matchDay, (byMd.get(fx.matchDay) ?? 0) + 1);
  for (let d = 1; d <= 8; d++) {
    if (byMd.get(d) !== 18) mismatches.push(`matchday-${d}: ${byMd.get(d) ?? 0} != 18`);
  }
  const home = new Map();
  const away = new Map();
  for (const fx of leagueFixtures) {
    home.set(fx.teamA, (home.get(fx.teamA) ?? 0) + 1);
    away.set(fx.teamB, (away.get(fx.teamB) ?? 0) + 1);
  }
  for (const c of clubs) {
    const h = home.get(c.id) ?? 0;
    const a = away.get(c.id) ?? 0;
    if (h + a !== 8) mismatches.push(`${c.id} appearances: ${h + a} != 8`);
    if (h !== 4) mismatches.push(`${c.id} home: ${h} != 4`);
    if (a !== 4) mismatches.push(`${c.id} away: ${a} != 4`);
  }

  // Contrast shipped records vs the ingest dump (home, away, matchday).
  let dumpMismatches = 0;
  for (const fx of leagueFixtures) {
    const raw = fixtureRows.find(r => r.fixture?.id === fx.apiId);
    const homeCode = byApiId.get(raw?.teams?.home?.id)?.id;
    const awayCode = byApiId.get(raw?.teams?.away?.id)?.id;
    const md = parseMatchday(raw?.league?.round);
    if (homeCode !== fx.teamA || awayCode !== fx.teamB || md !== fx.matchDay) {
      dumpMismatches += 1;
      mismatches.push(`dump ${fx.matchId}: ${fx.teamA}-${fx.teamB} md${fx.matchDay} vs dump ${homeCode}-${awayCode} md${md}`);
    }
  }

  const contrast = [
    `source: ${ingestSource} league=${LEAGUE} season=${SEASON} competition=CL`,
    `fetchedAt: ${new Date().toISOString()}`,
    `teams: ${clubs.length}`,
    `leaguePhaseFixtures: ${leagueFixtures.length}`,
    `allFixturesReturned: ${fixtureRows.length}`,
    `rounds: ${rounds.join(', ') || '(none)'}`,
    `dumpMismatches: ${dumpMismatches}`,
    `shapeMismatches: ${mismatches.length}`,
    mismatches.length ? 'MISMATCHES:' : 'MISMATCHES: none',
    ...mismatches.map(m => `  - ${m}`),
  ].join('\n') + '\n';
  writeFileSync(join(SCRATCH, 'fixture-contrast.log'), contrast);
  console.log(contrast);

  const okShape = clubs.length === 36 && leagueFixtures.length === 144 && dumpMismatches === 0;
  if (!okShape) {
    console.error('ingest refused to write modules: shape/contrast failed');
    process.exit(2);
  }

  const teamsSrc = `import type { Team } from '../types';

/** UEFA club competition 2026/27 league-phase clubs. Generated by scripts/fetch-ucl-fixtures.mjs — do not hand-edit. */
export const TEAMS_2026: readonly Team[] = [
${clubs.map(c => `  { id: '${c.id}', name: '${tsString(c.name)}', shortName: '${c.shortName}', group: 'LP', flag: '${c.flag}', flagUrl: '${c.flagUrl}' },`).join('\n')}
] as const;

export const UCL_API_TEAMS: Readonly<Record<string, number>> = {
${clubs.map(c => `  ${c.id}: ${c.apiId},`).join('\n')}
};

export const MATCH_DAYS = [
  { id: 1, date: '2026-09-08', label: 'Jornada 1' },
  { id: 2, date: '2026-10-13', label: 'Jornada 2' },
  { id: 3, date: '2026-10-20', label: 'Jornada 3' },
  { id: 4, date: '2026-11-03', label: 'Jornada 4' },
  { id: 5, date: '2026-11-24', label: 'Jornada 5' },
  { id: 6, date: '2026-12-08', label: 'Jornada 6' },
  { id: 7, date: '2027-01-19', label: 'Jornada 7' },
  { id: 8, date: '2027-01-27', label: 'Jornada 8' },
];

import { GROUP_MATCHES } from './league-schedule';

export function generateGroupMatches() {
  return GROUP_MATCHES.map(m => ({
    id: m.matchId,
    matchId: m.matchId,
    group: m.group,
    teamA: m.teamA,
    teamB: m.teamB,
    matchDay: m.matchDay,
    date: m.date,
    timeSpain: m.timeSpain,
    venue: m.venue,
    city: m.city,
    scoreA: null as number | null,
    scoreB: null as number | null,
  }));
}
`;

  const schedSrc = `export interface GroupMatch {
  matchId: string;
  group: string;
  teamA: string;
  teamB: string;
  matchDay: number;
  date: string;
  timeSpain: string;
  venueId: string;
  venue: string;
  city: string;
}

/** League-phase fixtures 2026/27. Generated by scripts/fetch-ucl-fixtures.mjs — do not hand-edit. */
export const GROUP_MATCHES: GroupMatch[] = [
${leagueFixtures.map(m => `  { matchId: '${m.matchId}', group: 'LP', teamA: '${m.teamA}', teamB: '${m.teamB}', matchDay: ${m.matchDay}, date: '${m.date}', timeSpain: '${m.timeSpain}', venueId: '${tsString(m.venueId)}', venue: '${tsString(m.venue)}', city: '${tsString(m.city)}' },`).join('\n')}
];
`;

  const metaSrc = `export const UCL_INGEST_META = {
  source: '${ingestSource}',
  league: ${LEAGUE},
  season: ${SEASON},
  fetchedAt: '${new Date().toISOString()}',
  teams: ${clubs.length},
  fixtures: ${leagueFixtures.length},
  dumpMismatches: ${dumpMismatches},
  official: '${ingestSource}-dump',
};
`;

  writeFileSync(join(DATA_DIR, 'ucl-2027.ts'), teamsSrc);
  writeFileSync(join(DATA_DIR, 'league-schedule.ts'), schedSrc);
  writeFileSync(join(DATA_DIR, 'ucl-ingest-meta.ts'), metaSrc);
  console.log('wrote src/data/ucl-2027.ts, league-schedule.ts, ucl-ingest-meta.ts');

  if (!NO_CRESTS) {
    mkdirSync(CRESTS_DIR, { recursive: true });
    for (const c of clubs) {
      if (!c.logo) continue;
      const dest = join(CRESTS_DIR, `${c.id}.png`);
      try {
        const resp = await fetch(c.logo);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        writeFileSync(dest, Buffer.from(await resp.arrayBuffer()));
        console.log('crest', c.id);
      } catch (err) {
        console.warn('crest fail', c.id, err instanceof Error ? err.message : err);
      }
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
