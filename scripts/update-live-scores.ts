import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Importar datos y lógica del torneo
import { TEAMS_2026, KNOCKOUT_BRACKET } from '../src/data/fifa-2026';
import { KNOCKOUT_SCHEDULE } from '../src/data/match-schedule';
import { decodeBracket, encodeBracket } from '../src/lib/bracket-codec';
import { syncKnockoutBracket } from '../src/lib/bracket-logic';
import { recalculateStandings, getWinnerId, getKnockoutMatchOrder, initialGroupMatches } from '../src/store/tournament-store';

// ── .env parser simple ────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = join(ROOT, '.env');
  if (!existsSync(envPath)) return {};
  const env: Record<string, string> = {};
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
  return env;
}

const ENV = loadEnv();
const API_FOOTBALL_KEY = ENV.API_FOOTBALL_KEY;
const SUPABASE_URL = ENV.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = ENV.SUPABASE_SERVICE_ROLE_KEY;

if (!API_FOOTBALL_KEY) {
  console.error("❌ ERROR: Falta API_FOOTBALL_KEY en .env");
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ ERROR: Faltan VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env");
  process.exit(1);
}

// ── name normalization + Levenshtein similarity ────────────────────────────────
function normalizeStr(s: string) {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
}

function levenshtein(a: string, b: string) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function nameSimilarity(a: string, b: string) {
  const na = normalizeStr(a), nb = normalizeStr(b);
  if (na === nb) return 1;
  const maxLen = Math.max(na.length, nb.length);
  return maxLen === 0 ? 1 : 1 - levenshtein(na, nb) / maxLen;
}

function getTeamIdByApiName(apiName: string): string | null {
  const matches = TEAMS_2026.map(t => {
    // Check Spanish name, short name, or common variations
    const scoreES = nameSimilarity(t.name, apiName);
    const scoreShort = nameSimilarity(t.shortName, apiName);
    return { id: t.id, score: Math.max(scoreES, scoreShort) };
  }).sort((a, b) => b.score - a.score);

  if (matches[0].score > 0.6) {
    return matches[0].id;
  }
  return null;
}

async function fetchWorldCupFixtures() {
  const url = `https://v3.football.api-sports.io/fixtures?league=1&season=2026`;
  const resp = await fetch(url, {
    headers: {
      'x-rapidapi-key': API_FOOTBALL_KEY,
      'x-apisports-key': API_FOOTBALL_KEY, // API-Football allows both
    },
  });
  if (!resp.ok) {
    throw new Error(`HTTP Error: ${resp.status} - ${await resp.text()}`);
  }
  const json = await resp.json();
  return json.response; // array of fixtures
}

async function run() {
  console.log("🌐 Conectando a Supabase...");
  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // 1. Obtener resultados oficiales actuales
  const { data: resultsRow, error: sbError } = await sb
    .from('official_results')
    .select('payload')
    .eq('id', 1)
    .maybeSingle();

  if (sbError) {
    console.error("❌ Error conectando a Supabase:", sbError.message);
    process.exit(1);
  }

  let groupMatches = [...initialGroupMatches];
  let knockoutMatches = {};

  if (resultsRow?.payload) {
    console.log("📥 Bracket oficial actual descargado.");
    const decoded = decodeBracket(resultsRow.payload);
    if (decoded) {
      groupMatches = decoded.groupMatches;
      knockoutMatches = decoded.knockoutMatches;
    }
  } else {
    console.log("ℹ️ No hay resultados oficiales previos. Empezando de cero.");
  }

  // 2. Fetch de la API
  console.log("⚽ Consultando API-Football para World Cup 2026...");
  let fixtures;
  try {
    fixtures = await fetchWorldCupFixtures();
    console.log(`✅ Obtenidos ${fixtures.length} partidos desde la API.`);
  } catch (e: any) {
    console.error("❌ Error en la API:", e.message);
    process.exit(1);
  }

  if (!fixtures || fixtures.length === 0) {
    console.log("ℹ️ No hay partidos en la API para la liga 1 y temporada 2026 todavía.");
    // No error, we just end gracefully
    process.exit(0);
  }

  let updatedCount = 0;

  // 3. Mapeo y actualización
  for (const f of fixtures) {
    // Only care about matches that are Finished (FT, AET, PEN) or Live (1H, 2H, HT, ET, P)
    // Actually, maybe only Finished or in-progress if they have a score
    const status = f.fixture.status.short;
    if (['NS', 'TBD', 'PST'].includes(status)) continue; // Not started or postponed
    
    const homeName = f.teams.home.name;
    const awayName = f.teams.away.name;

    const teamA_id = getTeamIdByApiName(homeName);
    const teamB_id = getTeamIdByApiName(awayName);

    if (!teamA_id || !teamB_id) {
      // It's possible the teams are not set yet (e.g. TBD vs TBD)
      continue;
    }

    // Determine the scores
    // For finished matches, we use fulltime (which is 90 mins). 
    // API-Sports structure: 
    // goals.home / goals.away (includes ET?)
    // score.fulltime, score.extratime, score.penalty
    let scoreA = f.goals.home ?? 0;
    let scoreB = f.goals.away ?? 0;
    
    let penA: number | null = null;
    let penB: number | null = null;

    if (f.score.penalty.home !== null && f.score.penalty.away !== null) {
      penA = f.score.penalty.home;
      penB = f.score.penalty.away;
    }

    // Find the match in group phase
    const groupMatch = groupMatches.find(m => 
      (m.teamA === teamA_id && m.teamB === teamB_id) || 
      (m.teamA === teamB_id && m.teamB === teamA_id)
    );

    if (groupMatch) {
      // Ensure correct sides
      const isHomeA = groupMatch.teamA === teamA_id;
      groupMatch.scoreA = isHomeA ? scoreA : scoreB;
      groupMatch.scoreB = isHomeA ? scoreB : scoreA;
      updatedCount++;
    } else {
      // It must be a knockout match
      // Knockout matches need the teams to be resolved first!
      // But we can search the entire knockout matches object for matching teams
      const koMatches = Object.values(knockoutMatches) as any[];
      const koMatch = koMatches.find(m => 
        (m.teamA === teamA_id && m.teamB === teamB_id) || 
        (m.teamA === teamB_id && m.teamB === teamA_id)
      );

      if (koMatch) {
        const isHomeA = koMatch.teamA === teamA_id;
        koMatch.scoreA = isHomeA ? scoreA : scoreB;
        koMatch.scoreB = isHomeA ? scoreB : scoreA;
        if (penA !== null && penB !== null) {
          koMatch.penaltyScoreA = isHomeA ? penA : penB;
          koMatch.penaltyScoreB = isHomeA ? penB : penA;
        }
        koMatch.winnerId = getWinnerId(koMatch.teamA, koMatch.teamB, koMatch.scoreA, koMatch.scoreB, koMatch.penaltyScoreA, koMatch.penaltyScoreB);
        koMatch.isPlayed = koMatch.winnerId !== null;
        updatedCount++;
      }
    }
  }

  if (updatedCount > 0) {
    console.log(`🔄 Se actualizaron ${updatedCount} partidos locales con datos de la API.`);
    // 4. Recalcular standings y resolver knockout
    const standings = recalculateStandings(groupMatches);
    let finalKnockout = syncKnockoutBracket(standings, knockoutMatches as any, KNOCKOUT_BRACKET, KNOCKOUT_SCHEDULE);
    
    // We also need to re-apply knockout logic (winners bubble up)
    for (const matchId of getKnockoutMatchOrder()) {
      const match = finalKnockout[matchId];
      if (match?.teamA && match?.teamB && match.scoreA !== null && match.scoreB !== null) {
        match.winnerId = getWinnerId(match.teamA, match.teamB, match.scoreA, match.scoreB, match.penaltyScoreA ?? null, match.penaltyScoreB ?? null);
        match.isPlayed = match.winnerId !== null;
        finalKnockout = syncKnockoutBracket(standings, finalKnockout, KNOCKOUT_BRACKET, KNOCKOUT_SCHEDULE);
      }
    }

    // 5. Guardar en Supabase
    const payload = encodeBracket(groupMatches, finalKnockout);
    const { error: upsertErr } = await sb.from('official_results').upsert(
      { id: 1, payload, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    );

    if (upsertErr) {
      console.error("❌ Error guardando en Supabase:", upsertErr.message);
      process.exit(1);
    }
    console.log("✅ Resultados oficiales publicados en Supabase correctamente.");
  } else {
    console.log("ℹ️ No hubo cambios que actualizar.");
  }
}

run().catch(console.error);
