#!/usr/bin/env node
/**
 * scripts/fetch-ucl-official-matches.mjs
 *
 * Ingesta oficial de partidos, resultados y goleadores de la UEFA Champions League
 * directamente desde la API oficial de UEFA (match.uefa.com/v5/matches).
 *
 * Uso:
 *   node scripts/fetch-ucl-official-matches.mjs
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'src', 'data');

const UEFA_API_KEY = 'ceeee1a5bb209502c6c438abd8f30aef179ce669bb9288f2d1cf2fa276de03f4';
const COMPETITION_ID = '1';
const SEASON_YEAR = '2027';

export const UEFA_CLUBS = {
  BVB: { id: 52758, slug: 'b-dortmund', name: 'Borussia Dortmund', country: 'Alemania', flag: '🇩🇪' },
  BAY: { id: 50037, slug: 'bayern-munchen', name: 'FC Bayern München', country: 'Alemania', flag: '🇩🇪' },
  VFB: { id: 50107, slug: 'stuttgart', name: 'VfB Stuttgart', country: 'Alemania', flag: '🇩🇪' },
  ARS: { id: 52280, slug: 'arsenal', name: 'Arsenal FC', country: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  AVL: { id: 52683, slug: 'aston-villa', name: 'Aston Villa FC', country: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  LIV: { id: 7889, slug: 'liverpool', name: 'Liverpool FC', country: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  MCI: { id: 52919, slug: 'man-city', name: 'Manchester City FC', country: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  MUN: { id: 52682, slug: 'man-utd', name: 'Manchester United FC', country: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  ATL: { id: 50124, slug: 'atleti', name: 'Club Atlético de Madrid', country: 'España', flag: '🇪🇸' },
  BAR: { id: 50080, slug: 'barcelona', name: 'FC Barcelona', country: 'España', flag: '🇪🇸' },
  RMA: { id: 50051, slug: 'real-madrid', name: 'Real Madrid CF', country: 'España', flag: '🇪🇸' },
  BET: { id: 52265, slug: 'real-betis', name: 'Real Betis Balompié', country: 'España', flag: '🇪🇸' },
  VIL: { id: 70691, slug: 'villarreal', name: 'Villarreal CF', country: 'España', flag: '🇪🇸' },
  ROM: { id: 50137, slug: 'roma', name: 'AS Roma', country: 'Italia', flag: '🇮🇹' },
  INT: { id: 50138, slug: 'inter', name: 'FC Internazionale Milano', country: 'Italia', flag: '🇮🇹' },
  NAP: { id: 50136, slug: 'napoli', name: 'SSC Napoli', country: 'Italia', flag: '🇮🇹' },
  SPO: { id: 50149, slug: 'sporting-cp', name: 'Sporting Clube de Portugal', country: 'Portugal', flag: '🇵🇹' },
  FCP: { id: 50064, slug: 'porto', name: 'FC Porto', country: 'Portugal', flag: '🇵🇹' },
  LIL: { id: 75797, slug: 'lille', name: 'Lille OSC', country: 'Francia', flag: '🇫🇷' },
  PSG: { id: 52747, slug: 'paris', name: 'Paris Saint-Germain FC', country: 'Francia', flag: '🇫🇷' },
  RCL: { id: 52277, slug: 'lens', name: 'Racing Club de Lens', country: 'Francia', flag: '🇫🇷' },
  GAL: { id: 50067, slug: 'galatasaray', name: 'Galatasaray SK', country: 'Turquía', flag: '🇹🇷' },
  FEN: { id: 52692, slug: 'fenerbahce', name: 'Fenerbahçe SK', country: 'Turquía', flag: '🇹🇷' },
  PSV: { id: 50062, slug: 'psv', name: 'PSV Eindhoven', country: 'Países Bajos', flag: '🇳🇱' },
  FEY: { id: 52749, slug: 'feyenoord', name: 'Feyenoord Rotterdam', country: 'Países Bajos', flag: '🇳🇱' },
  RBL: { id: 2603790, slug: 'leipzig', name: 'RB Leipzig', country: 'Alemania', flag: '🇩🇪' },
  BRU: { id: 50043, slug: 'club-brugge', name: 'Club Brugge KV', country: 'Bélgica', flag: '🇧🇪' },
  SLP: { id: 52498, slug: 'slavia-praha', name: 'SK Slavia Praha', country: 'República Checa', flag: '🇨🇿' },
  SHK: { id: 52707, slug: 'shakhtar', name: 'FK Shakhtar Donetsk', country: 'Ucrania', flag: '🇺🇦' },
  AEK: { id: 50129, slug: 'aek-athens', name: 'PAE AEK', country: 'Grecia', flag: '🇬🇷' },
  LSK: { id: 63405, slug: 'lask', name: 'LASK Linz', country: 'Austria', flag: '🇦🇹' },
  VIK: { id: 52319, slug: 'viking', name: 'Viking FK', country: 'Noruega', flag: '🇳🇴' },
  BOD: { id: 59333, slug: 'bodo-glimt', name: 'FK Bodø/Glimt', country: 'Noruega', flag: '🇳🇴' },
  COM: { id: 79946, slug: 'como', name: 'Como 1907', country: 'Italia', flag: '🇮🇹' },
  SLO: { id: 52797, slug: 's-bratislava', name: 'ŠK Slovan Bratislava', country: 'Eslovaquia', flag: '🇸🇰' },
  SAB: { id: 2609356, slug: 'sabah', name: 'Sabah FK', country: 'Azerbaiyán', flag: '🇦🇿' },
};

export const UEFA_TEAM_ID_TO_CODE = Object.fromEntries(
  Object.entries(UEFA_CLUBS).map(([code, club]) => [String(club.id), code])
);

function formatToSpainParts(isoDateStr) {
  const d = new Date(isoDateStr);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(d);
  const get = (type) => parts.find((p) => p.type === type)?.value ?? '';
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    timeSpain: `${get('hour')}:${get('minute')}`,
  };
}

async function fetchAllLeaguePhaseMatches() {
  const matches = [];
  for (let offset = 0; offset < 300; offset += 50) {
    const url = `https://match.uefa.com/v5/matches?competitionId=${COMPETITION_ID}&seasonYear=${SEASON_YEAR}&offset=${offset}&limit=50`;
    console.log(`Consultando UEFA match API seasonYear=${SEASON_YEAR} offset=${offset}...`);
    const resp = await fetch(url, {
      headers: {
        'x-api-key': UEFA_API_KEY,
        'Accept': 'application/json',
      },
    });
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status} al consultar ${url}`);
    }
    const data = await resp.json();
    if (!data || data.length === 0) break;

    const lp = data.filter((m) => m.round?.metaData?.name === 'League Phase');
    matches.push(...lp);
  }
  return matches;
}

function loadCanonicalGroupMatches() {
  const schedulePath = join(DATA_DIR, 'league-schedule.ts');
  const content = readFileSync(schedulePath, 'utf8');
  const arrayMatch = content.match(/export const GROUP_MATCHES:\s*GroupMatch\[\]\s*=\s*(\[[\s\S]*?\]);/);
  if (!arrayMatch) {
    throw new Error('No se pudo encontrar GROUP_MATCHES en league-schedule.ts');
  }
  return new Function(`return ${arrayMatch[1]}`)();
}

function processMatches(rawMatches) {
  const canonicalMatches = loadCanonicalGroupMatches();
  console.log(`Mapeando ${rawMatches.length} partidos de UEFA contra los ${canonicalMatches.length} partidos canónicos...`);

  const officialScorers = {};
  const officialResults = {};

  for (const gm of canonicalMatches) {
    const m = rawMatches.find((rm) => {
      const a = UEFA_TEAM_ID_TO_CODE[rm.homeTeam?.id] || rm.homeTeam?.teamCode;
      const b = UEFA_TEAM_ID_TO_CODE[rm.awayTeam?.id] || rm.awayTeam?.teamCode;
      return a === gm.teamA && b === gm.teamB;
    });

    if (!m) {
      console.warn(`⚠️ Partido no encontrado en UEFA: ${gm.matchId} (${gm.teamA} vs ${gm.teamB})`);
      continue;
    }

    const isPlayed = m.status === 'FINISHED';
    const scoreA = isPlayed && m.score?.total?.home !== undefined ? m.score.total.home : null;
    const scoreB = isPlayed && m.score?.total?.away !== undefined ? m.score.total.away : null;

    if (scoreA !== null && scoreB !== null) {
      officialResults[gm.matchId] = { scoreA, scoreB };
    }

    // Extraer goleadores reales si el partido tiene eventos
    const rawScorers = m.playerEvents?.scorers || [];
    if (rawScorers.length > 0) {
      const parsedScorers = rawScorers.map((s) => {
        const teamCode = UEFA_TEAM_ID_TO_CODE[s.teamId] || s.teamId;
        const name =
          s.player?.translations?.name?.ES ||
          s.player?.internationalName ||
          s.player?.translations?.shortName?.ES ||
          'Goleador';

        const num = parseInt(s.player?.clubJerseyNumber || '0', 10) || 0;
        const type =
          s.goalType === 'PENALTY'
            ? 'penalty'
            : s.goalType === 'OWN'
              ? 'own_goal'
              : 'normal';

        return {
          minute: s.time?.minute ?? 0,
          playerName: name,
          playerNumber: num,
          teamId: teamCode,
          type,
        };
      });

      parsedScorers.sort((a, b) => a.minute - b.minute);
      officialScorers[gm.matchId] = parsedScorers;
    }
  }

  return { officialScorers, officialResults };
}

export async function main() {
  try {
    const raw = await fetchAllLeaguePhaseMatches();
    console.log(`✅ Descargados ${raw.length} partidos oficiales de UEFA (${SEASON_YEAR}).`);

    const { officialScorers, officialResults } = processMatches(raw);

    // 1. Guardar mapa oficial de goleadores
    const scorersTs = `// Eventos de goles oficiales extraídos directamente de UEFA.com (match.uefa.com/v5/matches)
// Generado automáticamente por scripts/fetch-ucl-official-matches.mjs
import type { GoalEvent } from '../types';

export const OFFICIAL_GOAL_SCORERS: Record<string, GoalEvent[]> = ${JSON.stringify(officialScorers, null, 2)};
`;
    writeFileSync(join(DATA_DIR, 'official-goal-scorers.ts'), scorersTs, 'utf8');
    console.log(`✅ Goleadores oficiales guardados en: src/data/official-goal-scorers.ts (${Object.keys(officialScorers).length} partidos con goles)`);

    // 2. Guardar resultados oficiales reales (JSON y TS)
    writeFileSync(join(DATA_DIR, 'official-ucl-results.json'), JSON.stringify(officialResults, null, 2), 'utf8');
    const resultsTs = `// Resultados oficiales extraídos de UEFA.com
// Generado automáticamente por scripts/fetch-ucl-official-matches.mjs
export const OFFICIAL_UCL_RESULTS: Record<string, { scoreA: number; scoreB: number }> = ${JSON.stringify(officialResults, null, 2)};
`;
    writeFileSync(join(DATA_DIR, 'official-ucl-results.ts'), resultsTs, 'utf8');
    console.log(`✅ Resultados oficiales guardados en: src/data/official-ucl-results.json y .ts (${Object.keys(officialResults).length} partidos finalizados)`);

  } catch (err) {
    console.error('❌ Error al obtener datos de UEFA:', err);
    process.exit(1);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
